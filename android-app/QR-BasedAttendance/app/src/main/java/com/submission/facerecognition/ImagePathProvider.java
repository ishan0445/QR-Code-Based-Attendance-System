package com.submission.facerecognition;


import android.content.Intent;
import android.net.Uri;
import android.support.v4.content.FileProvider;

import java.io.File;

public class ImagePathProvider {

    private static final String IMAGE_NAME = "image.jpg";
    private static final String FILE_PROVIDER_AUTHORITY = BuildConfig.APPLICATION_ID + ".fileprovider";

    public static File getImageFile() {
        return new File(FaceRecognitionApplication.getContext().getFilesDir().getAbsolutePath(), IMAGE_NAME);
    }

    public static Uri getImagePathUri() {
        File file = getImageFile();
        File parentFile = file.getParentFile();
        parentFile.mkdirs();
        if (!parentFile.exists()) return null;

        Uri uri = FileProvider.getUriForFile(FaceRecognitionApplication.getContext(),
                FILE_PROVIDER_AUTHORITY, file);
        FaceRecognitionApplication.getContext().grantUriPermission(BuildConfig.APPLICATION_ID, uri,
                Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        return uri;
    }
}
