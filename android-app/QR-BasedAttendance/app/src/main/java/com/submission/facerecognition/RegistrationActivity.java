package com.submission.facerecognition;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.provider.Settings;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
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


public class RegistrationActivity extends AppCompatActivity {
    EditText etName, etRollNumber, etPhoneNumber, etSecretKey;
    Button btRegisterSubmit;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_registration);

        initUI();
        initListeners();
    }

    private void initListeners() {
        btRegisterSubmit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                final String name = etName.getText().toString().trim();
                final String rollNumber = etRollNumber.getText().toString().trim();
                final String phoneNumber = etPhoneNumber.getText().toString().trim();
                final String secretKey = etSecretKey.getText().toString().trim();
                String URL = Constants.REGISTRATION_URL;


                String android_id = "";
                android_id = Settings.Secure.getString(getApplicationContext().getContentResolver(),
                        Settings.Secure.ANDROID_ID);

                Map<String, String> jo = new HashMap<>();
                jo.put("name",name);
                jo.put("rollNo",rollNumber);
                jo.put("imei",android_id);
                jo.put("phnNumber",phoneNumber);
                jo.put("secretRegistrationKey",secretKey);
                JSONObject json = new JSONObject(jo);


                final String finalAndroid_id = android_id;
                post(URL, json.toString(), new Callback() {
                    @Override
                    public void onFailure(Call call, IOException e) {
                        e.printStackTrace();
                    }

                    @Override
                    public void onResponse(Call call, Response response) throws IOException {
                        JSONObject jo = null;
                        try {
                            jo = new JSONObject(response.body().string());


                            if(jo.getString("status").equals("SUCCESS")){

                                Context context = getApplicationContext();
                                SharedPreferences sharedPref = context.getSharedPreferences(
                                        Constants.SHARED_PREF_KEY, Context.MODE_PRIVATE);
                                SharedPreferences.Editor editor = sharedPref.edit();
                                editor.putBoolean(Constants.SHARED_PREF_IS_REGISTERED, true);
                                editor.putString(Constants.SHARED_PREF_NAME, name);
                                editor.putString(Constants.SHARED_PREF_DEVICE_ID, finalAndroid_id);
                                editor.putString(Constants.SHARED_PREF_ROLL, rollNumber);
                                editor.apply();

                                Toast.makeText(getApplicationContext(),jo.getString("msg"),Toast.LENGTH_LONG).show();

                                Intent in = new Intent(RegistrationActivity.this, MainActivity.class);
                                startActivity(in);
                                finish();
                            }else{
                                Toast.makeText(getApplicationContext(),jo.getString("msg"),Toast.LENGTH_LONG).show();
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                });
            }

        });
    }

    public static final MediaType JSON
            = MediaType.parse("application/json; charset=utf-8");

    OkHttpClient client = new OkHttpClient();

    Call post(String url, String json, Callback callback) {
        RequestBody body = RequestBody.create(JSON, json);
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();
        Call call = client.newCall(request);
        call.enqueue(callback);
        return call;
    }

    private void initUI() {
        etName = findViewById(R.id.etName);
        etPhoneNumber = findViewById(R.id.etPhoneNumber);
        etRollNumber = findViewById(R.id.etRollNo);
        etSecretKey = findViewById(R.id.etSecretKey);

        btRegisterSubmit = findViewById(R.id.btRegister);
    }
}
