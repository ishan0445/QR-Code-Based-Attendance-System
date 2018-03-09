package com.ishan0445.qrbasedattendanceapp;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.telephony.TelephonyManager;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class MainActivity extends AppCompatActivity {

    Button btnScan;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        btnScan = (Button) findViewById(R.id.btnScanQR);

        btnScan.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                try {

                    Intent intent = new Intent("com.google.zxing.client.android.SCAN");
                    intent.putExtra("SCAN_MODE", "QR_CODE_MODE"); // "PRODUCT_MODE for bar codes

                    startActivityForResult(intent, 0);

                } catch (Exception e) {

                    Uri marketUri = Uri.parse("market://details?id=com.google.zxing.client.android");
                    Intent marketIntent = new Intent(Intent.ACTION_VIEW,marketUri);
                    startActivity(marketIntent);
                }
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 0) {

            if (resultCode == RESULT_OK) {

                final String qrCode = data.getStringExtra("SCAN_RESULT");
                String url = Constants.POST_ATTENDANCE_URL;
                TelephonyManager telephonyManager = (TelephonyManager)getSystemService(Context.TELEPHONY_SERVICE);
//                final String imeiCode = telephonyManager.getDeviceId();
                final String imeiCode = "123434567812345";


                StringRequest postRequest = new StringRequest(Request.Method.POST, url,
                        new Response.Listener<String>() {
                            @Override
                            public void onResponse(String response) {
                                try {
//                                    JSONObject jsonResponse = new JSONObject(response).getJSONObject("form");
//                                    String site = jsonResponse.getString("site"),
//                                            network = jsonResponse.getString("network");
//                                    System.out.println("Site: "+site+"\nNetwork: "+network);

                                    Toast.makeText(getApplicationContext(), response, Toast.LENGTH_LONG).show();


                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                            }
                        },
                        new Response.ErrorListener() {
                            @Override
                            public void onErrorResponse(VolleyError error) {
                                error.printStackTrace();
                            }
                        }
                ) {
                    @Override
                    protected Map<String, String> getParams()
                    {
                        Map<String, String> params = new HashMap<>();
                        // the POST parameters:
                        params.put("roll", "20162115");
                        params.put("imei", imeiCode);
                        params.put("qrCode", qrCode);
                        return params;
                    }
                };
                Volley.newRequestQueue(this).add(postRequest);




            }
            if(resultCode == RESULT_CANCELED){
                Toast.makeText(getApplicationContext(),"Cancelled", Toast.LENGTH_LONG).show();
            }
        }
    }
}
