package com.submission.facerecognition;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.util.Log;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public final class BitmapHandler {

    private static final String TAG = "BitmapHandler";

    private static final float maxImageWidth = 720.0F;
    private static final float maxImageHeight = 1280.0F;

    private static final Dimensions calculateDimensions(BitmapFactory.Options options) {

        float imageWidth = (float) options.outWidth;
        float imageHeight = (float) options.outHeight;
        float idealAspectRatio = maxImageWidth / maxImageHeight;
        float imageAspectRatio = imageWidth / imageHeight;
        int newWidth;
        int newHeight;
        if (imageWidth <= maxImageWidth && imageHeight <= maxImageHeight) {
            newWidth = (int) imageWidth;
            newHeight = (int) imageHeight;
        } else if (imageAspectRatio > idealAspectRatio) {
            newWidth = (int) maxImageWidth;
            newHeight = (int) ((float) newWidth / imageAspectRatio);
        } else if (imageAspectRatio < idealAspectRatio) {
            newHeight = (int) maxImageHeight;
            newWidth = (int) (imageAspectRatio * (float) newHeight);
        } else {
            newWidth = (int) maxImageWidth;
            newHeight = (int) maxImageHeight;
        }

        return new Dimensions(newWidth, newHeight);
    }

    public static final void resizeImage(Uri uri) {

        Bitmap bitmap = null;

        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;

        InputStream inputStream = null;

        try {
            inputStream = FaceRecognitionApplication.getContext().getContentResolver().openInputStream(uri);
            BitmapFactory.decodeStream(inputStream, null, options);
        } catch (Throwable throwable) {
            Log.e(TAG, "Unable to decode stream!");
            return;
        } finally {
            try {
                if (inputStream != null) {
                    inputStream.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        Dimensions dimensions = calculateDimensions(options);
        options.inJustDecodeBounds = false;
        options.inSampleSize = calculateInSampleSize(options, dimensions);

        InputStream bitmapStream = null;
        try {
            bitmapStream = FaceRecognitionApplication.getContext().getContentResolver().openInputStream(uri);
            bitmap = BitmapFactory.decodeStream(bitmapStream, null, options);
        } catch (Throwable throwable) {
            Log.e(TAG, "Unable to resize bitmap!");
        } finally {
            try {
                if (bitmapStream != null)
                    bitmapStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        if (bitmap == null) {
            Log.e(TAG, "Empty bitmap");
            return;
        }

        OutputStream outputStream;
        try {
            outputStream = FaceRecognitionApplication.getContext().getContentResolver().openOutputStream(uri);
            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream);
        } catch (FileNotFoundException e) {
            Log.e(TAG, "Failed to open output stream");
        }
    }

    private static int calculateInSampleSize(
            BitmapFactory.Options options, Dimensions dimensions) {
        // Raw height and width of image
        final int height = options.outHeight;
        final int width = options.outWidth;
        final int reqHeight = dimensions.height;
        final int reqWidth = dimensions.width;

        int inSampleSize = 1;

        if (height > reqHeight || width > reqWidth) {

            // Calculate the largest inSampleSize value that is a power of 2 and keeps both
            // height and width within the requested height and width.
            while ((height / inSampleSize) > reqHeight
                    || (width / inSampleSize) > reqWidth) {
                inSampleSize *= 2;
            }
        }

        return inSampleSize;
    }

    public static final class Dimensions {
        private final int width;
        private final int height;

        final int getWidth() {
            return this.width;
        }

        final int getHeight() {
            return this.height;
        }

        Dimensions(int width, int height) {
            this.width = width;
            this.height = height;
        }
    }
}
