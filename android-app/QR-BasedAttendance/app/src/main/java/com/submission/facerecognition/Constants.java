package com.submission.facerecognition;

public class Constants {

    // Urls
    private static final String BASE_URL = "http://10.2.129.214:3000/";
    public static final String REGISTRATION_URL = BASE_URL+"register";
    public static final String RECOGNIZE_FACE_URL = BASE_URL+"recognizeFace";
    public static final String SEND_QR_URL = BASE_URL+"submitQRResponse";


    // Shared Preferences Variables
    public static final String SHARED_PREF_KEY = "QR-BasedSharedAppPreferences";
    public static final String SHARED_PREF_IS_REGISTERED = "isRegistered";
    public static final String SHARED_PREF_NAME = "name";
    public static final String SHARED_PREF_ROLL = "rollNo";
    public static final String SHARED_PREF_DEVICE_ID = "deviceID";

}
