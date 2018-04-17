package com.submission.facerecognition;


import java.lang.ref.WeakReference;

public class JobScheduler {

    public static void doInBackground(final Runnable runnable, final int requestCode,
                                      BackgroundJobCallback callback) {

        final WeakReference<BackgroundJobCallback> callbackWrapper = new
                WeakReference<>(callback);

        new Thread(new Runnable() {
            @Override
            public void run() {
                runnable.run();
                Utility.postOnMainThread(new Runnable() {
                    @Override
                    public void run() {
                        BackgroundJobCallback jobCallback = callbackWrapper.get();
                        if (jobCallback != null) {
                            jobCallback.onBackgroundTaskFinished(requestCode);
                        }
                    }
                });
            }
        }).start();
    }

    interface BackgroundJobCallback {
        void onBackgroundTaskFinished(int requestCode);
    }
}
