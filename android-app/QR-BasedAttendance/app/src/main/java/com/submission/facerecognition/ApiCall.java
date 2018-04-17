package com.submission.facerecognition;


import android.util.Log;

import java.io.File;
import java.io.IOException;
import java.lang.ref.WeakReference;
import java.util.concurrent.TimeUnit;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;

public class ApiCall {

    private static final String TAG = "ApiCall";

    private static final MediaType MEDIA_TYPE_JPEG = MediaType.parse("image/jpeg");

    private static OkHttpClient client = null;

    private static final String IMAGE_API_URL =
            Constants.RECOGNIZE_FACE_URL;

    private static OkHttpClient getOkHttpClient() {
        if (client == null) {
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);
            client = new OkHttpClient()
                    .newBuilder()
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .writeTimeout(60, TimeUnit.SECONDS)
                    .readTimeout(60, TimeUnit.SECONDS)
                    .addInterceptor(logging)
                    .build();
        }
        return client;
    }

    public static void uploadImage(String rollNo, File file, ApiCallback callback) throws
            Exception {

        final WeakReference<ApiCallback> weakCallback = new WeakReference<>(callback);

        RequestBody requestBody = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("rollNo", rollNo)
                .addFormDataPart("faceImg", "image.jpg",
                        RequestBody.create(MEDIA_TYPE_JPEG, file))
                .build();

        Request request = new Request.Builder()
                .url(IMAGE_API_URL)
                .post(requestBody)
                .build();

        getOkHttpClient().newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, final IOException ex) {
                Utility.postOnMainThread(new Runnable() {
                    @Override
                    public void run() {
                        ApiCallback apiCallback = weakCallback.get();
                        if (apiCallback != null) {
                            apiCallback.onApiFailure(ex);
                        }
                        Log.e(TAG, ex.toString());
                    }
                });
            }

            @Override
            public void onResponse(Call call, final Response response) throws IOException {
                Utility.postOnMainThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            ApiCallback apiCallback = weakCallback.get();
                            if (apiCallback != null) {
                                if (!response.isSuccessful()) {
                                    apiCallback.onApiFailure(new IOException("Unexpected code " + response));
                                    return;
                                }
                                apiCallback.onApiSuccess(response.body().string());
                            }
                        } catch (IOException e) {
                            Log.e(TAG, e.toString());
                        } finally {
                            response.close();
                        }
                    }
                });
            }
        });
    }

    interface ApiCallback {
        void onApiSuccess(String response);

        void onApiFailure(Exception ex);
    }
}
