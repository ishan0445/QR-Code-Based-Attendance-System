package com.submission.facerecognition;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class MainActivity extends AppCompatActivity implements View.OnClickListener, JobScheduler.BackgroundJobCallback, ApiCall.ApiCallback {

    private static final String TAG = "MainActivity";

    private static final int RC_OPEN_CAMERA = 101;
    private static final int RC_IMAGE_RESIZE = 201;
    private static final int RC_GET_QR = 301;

    private ProgressDialog progressDialog;
    private TextView textView;
    private Context context;
    private Activity activity;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        context = getApplicationContext();
        activity = this;
        SharedPreferences sharedPref = context.getSharedPreferences(
                Constants.SHARED_PREF_KEY, Context.MODE_PRIVATE);
        if(!sharedPref.getBoolean(Constants.SHARED_PREF_IS_REGISTERED,false)){
            Intent in = new Intent(MainActivity.this, RegistrationActivity.class);
            startActivity(in);
            finish();
        }

        initViews();
    }

    private void initViews() {
        findViewById(R.id.cameraButton).setOnClickListener(this);
        textView = findViewById(R.id.textView);
    }

    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.cameraButton: {
                openCamera();
            }
        }
    }

    private void openCamera() {
        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        intent.putExtra("android.intent.extras.CAMERA_FACING", android.hardware.Camera.CameraInfo.CAMERA_FACING_FRONT);
        intent.putExtra("android.intent.extras.LENS_FACING_FRONT", 1);
        intent.putExtra("android.intent.extra.USE_FRONT_CAMERA", true);

        Uri photoUri = ImagePathProvider.getImagePathUri();
        intent.putExtra(MediaStore.EXTRA_OUTPUT, photoUri);

        if (intent.resolveActivity(getPackageManager()) != null) {
            startActivityForResult(intent, RC_OPEN_CAMERA);
        } else {
            showToast("Camera not supported");
        }
    }

    private void showToast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == RC_OPEN_CAMERA && resultCode == RESULT_OK) {
            JobScheduler.doInBackground(new Runnable() {

                @Override
                public void run() {
                    BitmapHandler.resizeImage(ImagePathProvider.getImagePathUri());
                }
            }, RC_IMAGE_RESIZE, this);
        }else if (requestCode == RC_GET_QR && resultCode == RESULT_OK){
            String qrCode = data.getStringExtra("SCAN_RESULT");
            // getting Shared Prefs
            final Context context = getApplicationContext();
            SharedPreferences sharedPref = context.getSharedPreferences(
                    Constants.SHARED_PREF_KEY, Context.MODE_PRIVATE);



            Map<String,String> mp = new HashMap<>();
            mp.put("rollNo",sharedPref.getString(Constants.SHARED_PREF_ROLL,""));
            mp.put("QRCode",qrCode);
            mp.put("imei",sharedPref.getString(Constants.SHARED_PREF_DEVICE_ID,""));

            JSONObject jo = new JSONObject(mp);

            // Make QR-API Post request
            postQRCode(Constants.SEND_QR_URL, jo.toString(), new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    e.printStackTrace();
                }

                @Override
                public void onResponse(Call call, final Response response) throws IOException {

                    activity.runOnUiThread(new Runnable() {
                        public void run() {
                            String msg = "";
                            try {
                                JSONObject jo = new JSONObject(response.body().string());
                                msg = jo.getString("msg");
                            } catch (JSONException e) {
                                e.printStackTrace();
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                            Toast.makeText(activity,msg, Toast.LENGTH_SHORT).show();
                        }
                    });


                }
            });

        }
    }


    public static final MediaType JSON
            = MediaType.parse("application/json; charset=utf-8");

    OkHttpClient client = new OkHttpClient();

    Call postQRCode(String url, String json, Callback callback) {
        RequestBody body = RequestBody.create(JSON, json);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();
        Call call = client.newCall(request);
        call.enqueue(callback);
        return call;
    }


    private void showProgress() {
        progressDialog = ProgressDialog.show(this, "Loading", "Please wait...", true, false);
    }

    private void hideProgress() {
        if (progressDialog != null && progressDialog.isShowing()) {
            progressDialog.dismiss();
        }
    }

    @Override
    public void onBackgroundTaskFinished(int requestCode) {
        if (requestCode == RC_IMAGE_RESIZE) {
            showProgress();
            Log.i(TAG, "image resized successfully");
            try {
                Context context = getApplicationContext();
                SharedPreferences sharedPref = context.getSharedPreferences(
                        Constants.SHARED_PREF_KEY, Context.MODE_PRIVATE);

                ApiCall.uploadImage(sharedPref.getString(Constants.SHARED_PREF_ROLL,""), ImagePathProvider.getImageFile(), this);
            } catch (Exception e) {
                hideProgress();
                Log.e(TAG, e.toString());
            }
        }
    }


    @Override
    public void onApiSuccess(String response) {
        hideProgress();

        try {
            JSONObject jo = new JSONObject(response);
            String status = jo.getString("status");

            if(status.equals("SUCCESS")){
                Toast.makeText(getApplicationContext(),"Face Recognised", Toast.LENGTH_LONG).show();

                startQRCodeScanning();
            }else{
                textView.setText(jo.getString("msg"));
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }

    private void startQRCodeScanning() {

        try {

            Intent intent = new Intent("com.google.zxing.client.android.SCAN");
            intent.putExtra("SCAN_MODE", "QR_CODE_MODE"); // "PRODUCT_MODE for bar codes

            startActivityForResult(intent, RC_GET_QR);

        } catch (Exception e) {

            Uri marketUri = Uri.parse("market://details?id=com.google.zxing.client.android");
            Intent marketIntent = new Intent(Intent.ACTION_VIEW, marketUri);
            startActivity(marketIntent);
        }
    }

    @Override
    public void onApiFailure(Exception ex) {
        hideProgress();
        Toast.makeText(this, "Api error, check logs!", Toast.LENGTH_SHORT).show();
    }
}
