import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const googleSignIn = createAsyncThunk(
  "auth/googleSignIn",
  async (_, { rejectWithValue }) => {
    try {
      if (!GoogleSignin || typeof GoogleSignin.hasPlayServices !== "function") {
        return rejectWithValue(
          "Google Sign-In native memerlukan Development Build (APK). Silakan pilih 'Mode Tamu' untuk mencoba di Expo Go!",
        );
      }

      // Periksa dukungan Google Play Services
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Ambil respons login Google (kompatibel v13 dan versi sebelumnya)
      const userInfo: any = await GoogleSignin.signIn();

      if (userInfo?.type === "cancelled") {
        return rejectWithValue("Login dibatalkan oleh pengguna.");
      }

      const idToken = userInfo?.data?.idToken || userInfo?.idToken;

      if (!idToken) {
        return rejectWithValue("Gagal mendapatkan ID token dari akun Google.");
      }

      // Buat credential Google untuk Firebase
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Masuk ke Firebase menggunakan credential
      const userCredential =
        await auth().signInWithCredential(googleCredential);

      const { user } = userCredential;

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "Pemain Cerdas",
        photoURL: user.photoURL,
      };
    } catch (error: any) {
      console.log("Kesalahan Google Sign-In:", error);
      const errMsg = error?.message || "";
      if (errMsg.includes("DEVELOPER_ERROR") || error?.code === "10" || errMsg.includes("10")) {
        return rejectWithValue(
          "Google Sign-In Native tidak dapat berjalan di Expo Go (Perbedaan Package Name host.exp.exponent vs com.arkgnan.tebakangka & SHA-1). Silakan klik 'Coba Mode Tamu' di bawah untuk langsung mencoba aplikasi, atau buat Development Build (APK)!"
        );
      }
      return rejectWithValue(
        errMsg || "Terjadi kendala saat login dengan akun Google."
      );
    }
  },
);

export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      } catch (e) {
        // Abaikan jika user bukan login Google asli
      }
      try {
        await auth().signOut();
      } catch (e) {
        // Abaikan jika user firebase tidak ada
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setGuestLogin: (state) => {
      state.user = {
        uid: "tamu-" + Date.now(),
        email: "tamu@simulasi-edukasi.id",
        displayName: "Pemain Tamu (Simulasi)",
        photoURL: null,
      };
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(googleSignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setGuestLogin, clearError } = authSlice.actions;
export default authSlice.reducer;
