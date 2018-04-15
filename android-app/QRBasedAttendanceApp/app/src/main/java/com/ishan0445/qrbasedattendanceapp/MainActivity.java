package com.ishan0445.qrbasedattendanceapp;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.provider.Settings;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.net.ssl.HttpsURLConnection;

public class MainActivity extends AppCompatActivity {

    Button btnScan;

    int REQUEST_TAKE_PICTURE = 12112;
    String POST_FIELD = "name";
    Uri mLastPhoto;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        startQRCodeScanning();

//        btnScan = (Button) findViewById(R.id.btnScanQR);
//
//        btnScan.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
//
////                startFaceScanning();
////                startQRCodeScanning();
//            }
//        });
    }

    private void startFaceScanning() {
        startPhotoTaker();
    }

    void startPhotoTaker() {

        // create Intent to take a picture and return control to the calling application
        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        File photo = new File(getExternalFilesDir(Environment.DIRECTORY_DCIM), "cs_" + new Date().getTime() + ".jpg");
        mLastPhoto = Uri.fromFile(photo);
        intent.putExtra(MediaStore.EXTRA_OUTPUT,
                mLastPhoto);

        // start the image capture Intent
        startActivityForResult(intent, REQUEST_TAKE_PICTURE);
    }


    private String uploadFile(Uri resourceUri) {
        HttpURLConnection conn = null;
        DataOutputStream dos = null;
        String lineEnd = "\r\n";
        String twoHyphens = "--";
        String boundary = "*****";
        int bytesRead, bytesAvailable, bufferSize;
        byte[] buffer;
        int maxBufferSize = 1 * 1024 * 1024;
        final File sourceFile = new File(getRealPathFromURI(resourceUri));
        String serverResponseMessage = null;
        String responce = null;
        if (!sourceFile.isFile()) {

//            dialog.dismiss();

            runOnUiThread(new Runnable() {
                public void run() {
                    Toast.makeText(getApplicationContext(), "File not found !", Toast.LENGTH_LONG).show();
                }
            });

            return "no file";
        } else {
            try {
                FileInputStream fileInputStream = new FileInputStream(sourceFile.getPath());
                URL url = new URL(Constants.POST_FACE_IMAGE);
                conn = (HttpURLConnection) url.openConnection();
                conn.setDoInput(true); // Allow Inputs
                conn.setDoOutput(true); // Allow Outputs
                conn.setUseCaches(false); // Don't use a Cached Copy
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Connection", "Keep-Alive");
                conn.setRequestProperty("ENCTYPE", "multipart/form-data");
                conn.setRequestProperty("Content-Type", "multipart/form-data;boundary=" + boundary);
                conn.setRequestProperty(POST_FIELD, sourceFile.getName());
                dos = new DataOutputStream(conn.getOutputStream());
                dos.writeBytes(twoHyphens + boundary + lineEnd);
                dos.writeBytes("Content-Disposition: form-data; name=\"" + POST_FIELD + "\";filename="
                        + sourceFile.getName() + lineEnd);
                dos.writeBytes(lineEnd);
                bytesAvailable = fileInputStream.available();
                bufferSize = Math.min(bytesAvailable, maxBufferSize);
                buffer = new byte[bufferSize];
                bytesRead = fileInputStream.read(buffer, 0, bufferSize);
                while (bytesRead > 0) {

                    dos.write(buffer, 0, bufferSize);
                    bytesAvailable = fileInputStream.available();
                    bufferSize = Math.min(bytesAvailable, maxBufferSize);
                    bytesRead = fileInputStream.read(buffer, 0, bufferSize);

                }
                dos.writeBytes(lineEnd);
                dos.writeBytes(twoHyphens + boundary + twoHyphens + lineEnd);
                int serverResponseCode = conn.getResponseCode();
                serverResponseMessage = conn.getResponseMessage();
                Log.i("uploadFile", "HTTP Response is : "
                        + serverResponseMessage + ": " + serverResponseCode);
                if (serverResponseCode <= 200) {

                    runOnUiThread(new Runnable() {
                        public void run() {

                            Toast.makeText(MainActivity.this, "File Upload Complete.",
                                    Toast.LENGTH_SHORT).show();
                        }
                    });
                }
                fileInputStream.close();
                dos.flush();
                dos.close();
            } catch (FileNotFoundException e) {
                e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
            } catch (MalformedURLException ex) {
//                dialog.dismiss();
                ex.printStackTrace();

                runOnUiThread(new Runnable() {
                    public void run() {

                        Toast.makeText(MainActivity.this, "MalformedURLException",
                                Toast.LENGTH_SHORT).show();
                    }
                });
            } catch (IOException e) {
//                dialog.dismiss();
                e.printStackTrace();

                runOnUiThread(new Runnable() {
                    public void run() {
                        Toast.makeText(MainActivity.this, "Got Exception : see logcat ",
                                Toast.LENGTH_SHORT).show();
                    }
                });
                Log.e("FileUpload Exception", "Exception : "
                        + e.getMessage(), e);
            }
        }
//        dialog.dismiss();
        return responce;
    }

    private void startQRCodeScanning() {
        try {

            Intent intent = new Intent("com.google.zxing.client.android.SCAN");
            intent.putExtra("SCAN_MODE", "QR_CODE_MODE"); // "PRODUCT_MODE for bar codes

            startActivityForResult(intent, 0);

        } catch (Exception e) {

            Uri marketUri = Uri.parse("market://details?id=com.google.zxing.client.android");
            Intent marketIntent = new Intent(Intent.ACTION_VIEW, marketUri);
            startActivity(marketIntent);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 0) {

            if (resultCode == RESULT_OK) {

                final String qrCode = data.getStringExtra("SCAN_RESULT");
                String url = Constants.POST_ATTENDANCE_URL;
                TelephonyManager telephonyManager = (TelephonyManager) getSystemService(Context.TELEPHONY_SERVICE);
//                final String imeiCode = telephonyManager.getDeviceId();
                final String imeiCode = "123434567812345";
                Log.d("SCANNED", qrCode);


//                // Getting GPS Coordinates ------------------------------------------
//                LocationManager locationManager = null;

//                Location loc = null;
//
//                boolean flag = displayGpsStatus();
//                if (flag) {
//
//                    if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
//                        // TODO: Consider calling
//                        //    ActivityCompat#requestPermissions
//                        // here to request the missing permissions, and then overriding
//                        //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
//                        //                                          int[] grantResults)
//                        // to handle the case where the user grants the permission. See the documentation
//                        // for ActivityCompat#requestPermissions for more details.
//                        return;
//                    }
////                    locationManager.requestLocationUpdates(LocationManager
////                            .GPS_PROVIDER, 5000, 10, locationListener);
////
//                    loc = locationManager.getLastKnownLocation(LocationManager
//                            .GPS_PROVIDER);
//
//
//
//                } else {
//                    Toast.makeText(getApplicationContext(),"Your GPS is: OFF",Toast.LENGTH_LONG).show();
//                }

                // -----------------------------------------------------------------


//                final Location finalLoc = loc;
                StringRequest postRequest = new StringRequest(Request.Method.POST, url,
                        new Response.Listener<String>() {
                            @Override
                            public void onResponse(String response) {
                                try {

                                    Toast.makeText(getApplicationContext(), response, Toast.LENGTH_LONG).show();
                                    Log.d("SENT", response);


                                    Intent in = new Intent(MainActivity.this, FingerprintActivity.class);
                                    startActivity(in);

                                    finish();

                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                            }
                        },
                        new Response.ErrorListener() {
                            @Override
                            public void onErrorResponse(VolleyError error) {
                                error.printStackTrace();
                                System.out.println("Here Comes the error!!!");
                            }
                        }
                ) {
                    @Override
                    protected Map<String, String> getParams()
                    {
                        Map<String, String> params = new HashMap<>();
                        // the POST parameters:
                        params.put("rollNo", "20162115");
                        params.put("imei", imeiCode);
                        params.put("QRCode", qrCode);
                        params.put("lat", "17.444928");
                        params.put("lon", "78.350505");
                        Log.e("params",params.toString());

                        return params;
                    }
                };

                Log.d("SENDING", postRequest.toString());
                Volley.newRequestQueue(this).add(postRequest);
            }

            if(resultCode == RESULT_CANCELED){
                Toast.makeText(getApplicationContext(),"Cancelled", Toast.LENGTH_LONG).show();
            }

            if (requestCode == REQUEST_TAKE_PICTURE) {

                File file = new File(getRealPathFromURI(mLastPhoto));
                final Handler handler = new Handler();
                MediaScannerConnection.scanFile(
                        this, new String[]{file.toString()}, null,
                        new MediaScannerConnection.OnScanCompletedListener() {
                            public void onScanCompleted(String path, final Uri uri) {

                                handler.post(new Runnable() {
                                    @Override
                                    public void run() {
                                        uploadFile(mLastPhoto);
                                    }
                                });
                            }
                        });
            }
        }
    }




    // Location Listener--------------------------------------------------------

    Boolean displayGpsStatus() {
        ContentResolver contentResolver = getBaseContext()
                .getContentResolver();
        boolean gpsStatus = Settings.Secure
                .isLocationProviderEnabled(contentResolver,
                        LocationManager.GPS_PROVIDER);
        if (gpsStatus) {
            return true;

        } else {
            return false;
        }
    }


    private class MyLocationListener implements LocationListener {
        @Override
        public void onLocationChanged(Location loc) {
            Toast.makeText(getBaseContext(),"Got Location: Lat: " +
                            loc.getLatitude()+ " Lng: " + loc.getLongitude(),
                    Toast.LENGTH_SHORT).show();
            String longitude = "Longitude: " +loc.getLongitude();
            Log.v("Lat", longitude);
            String latitude = "Latitude: " +loc.getLatitude();
            Log.v("Lon", latitude);
        }

        @Override
        public void onProviderDisabled(String provider) {
            // TODO Auto-generated method stub
        }

        @Override
        public void onProviderEnabled(String provider) {
            // TODO Auto-generated method stub
        }

        @Override
        public void onStatusChanged(String provider,
                                    int status, Bundle extras) {
            // TODO Auto-generated method stub
        }
    }


    // ----------------------------------------------------------------------------------


    public String getRealPathFromURI (Uri contentUri) {
        String path = null;
        String[] proj = { MediaStore.MediaColumns.DATA };
        Cursor cursor = getContentResolver().query(contentUri, proj, null, null, null);
        if (cursor.moveToFirst()) {
            int column_index = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DATA);
            path = cursor.getString(column_index);
        }
        cursor.close();
        return path;
    }
}
