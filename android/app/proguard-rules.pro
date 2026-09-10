# Project-specific ProGuard / R8 rules
# R8 Full Mode + Repackage Classes + Resource Shrinking

# -------------------------------------------------------------
# 1. Repackage Classes & Access Modification
# -------------------------------------------------------------
# Moves all obfuscated classes to the root (default) package to minimize DEX size
-repackageclasses ''
-allowaccessmodification

# -------------------------------------------------------------
# 2. General Attributes Preservation
# -------------------------------------------------------------
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod,Exceptions
-keepattributes JavascriptInterface
-dontwarn javax.annotation.**

# -------------------------------------------------------------
# 3. React Native Core & JNI Bindings
# -------------------------------------------------------------
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.soloader.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.yoga.** { *; }

# Keep native methods and classes containing them
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep annotated methods and classes
-keep @com.facebook.proguard.annotations.DoNotStrip class * { *; }
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keep @androidx.annotation.Keep class * { *; }
-keepclassmembers class * {
    @androidx.annotation.Keep *;
}

# React Native TurboModules, Native Modules, ViewManagers, and Packages
-keep class com.facebook.react.turbomodule.** { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keep class * implements com.facebook.react.ReactPackage { *; }
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }

# -------------------------------------------------------------
# 4. Expo Modules Architecture
# -------------------------------------------------------------
-keep class expo.modules.** { *; }
-keep class * extends expo.modules.kotlin.modules.Module { *; }
-keep class * extends expo.modules.core.BasePackage { *; }
-keep class * implements expo.modules.core.interfaces.Package { *; }
-dontwarn expo.modules.notifications.**
-keep class expo.modules.notifications.** { *; }

# -------------------------------------------------------------
# 5. Third-Party Libraries
# -------------------------------------------------------------
# Software Mansion (Screens, Gesture Handler, Reanimated)
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.reanimated.** { *; }

# Firebase (Core, Auth)
-keep class com.google.firebase.** { *; }
-keep class io.invertase.firebase.** { *; }
-dontwarn io.invertase.firebase.**

# Google Mobile Ads (AdMob)
-keep class com.google.android.gms.ads.** { *; }
-keep interface com.google.android.gms.ads.** { *; }
-keep class io.invertase.googlemobileads.** { *; }
-dontwarn io.invertase.googlemobileads.**

# Google Sign-In
-keep class com.google.android.gms.auth.api.signin.** { *; }
-keep class com.reactnativegooglesignin.** { *; }

# Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Lottie
-keep class com.airbnb.lottie.** { *; }

# Fresco
-keep class com.facebook.fresco.** { *; }
-keep class com.facebook.imagepipeline.** { *; }
-keep class com.facebook.drawee.** { *; }
