package com.submission.facerecognition;


import android.os.Handler;
import android.os.Looper;

public class Utility {

    public static void postOnMainThread(Runnable runnable) {
        new Handler(Looper.getMainLooper()).post(runnable);
    }
}
