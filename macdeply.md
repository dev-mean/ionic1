# Android Deployment Instructions for Mac OS X

## Deployment on Android device
* Run: "sudo npm install -g cordova"
* Run: "sudo npm install -g ionic"
* Run: "brew install android-sdk"
* Run: “android” then install the following packages
  * Tools: Andoird SDK Tools, Android SDK Platform-tools, Android SDK Build-tools
  * Android 4.4.2 (API 19)
  * Extras: Android Support Library
* Run: "ionic platform android"
* Run: "brew install ant"
* Run: "ionic build android”
* Plug in Android device
* Run: “adb devices -l” to verify device detected
* Run: "ionic run android"
* Debugging:
* ensure the following line is added to the file platforms/android/AndroidManifest.xml
to allow location services: <br> 
`<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>`
* if running into issues with plug-ins not being recognized run the following commands:<br>
cordova platform rm android<br>
cordova platform add android

## Deployment on Android emulator using Genymotion
* Register for Genymotion account
* Install Genymotion software
* Run: "sudo npm install -g cordova"
* Run: "sudo npm install -g ionic"
* Run: "brew install android-sdk"
* Run: “android” then install the following packages
  * Tools: Andoird SDK Tools, Android SDK Platform-tools, Android SDK Build-tools
  * Android 4.4.2 (API 19)
  * Extras: Android Support Library
* Run: "ionic platform android"
* Run: "brew install ant"
* Run: "ionic build android”
* Launch Genymotion
* Create Android virtual device profile
* LaunchAndroid virtual device
* Run: “adb devices -l” to verify virtual device detected
* Run: "ionic run android"
* Debugging:
* ensure to turn on GPS and set current location within bounds of the app
* can also inspect with chrome://inspect/#devices to get console notifications

## Debug on Android phone using Chrome
* plug in android phone with data cable
* go to: chrome://inspect/#devices
* your device will show up, click "inspect"
* now you can debug the app in your phone
* you can even change the CSS in the DevTools and it will update on your phone