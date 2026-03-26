import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/firebase.init";
import axios from "axios";

const provider = new GoogleAuthProvider();
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getFirebaseAuthMessage = (code) => {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/invalid-email":
      return "Invalid email format.";
    case "auth/too-many-requests":
      return "Too many requests. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection and try again.";
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is disabled in Firebase project settings.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    default:
      return "Login failed. Please try again.";
  }
};

// Token management
const storeToken = (token) => localStorage.setItem("accessToken", token);
const removeToken = () => localStorage.removeItem("accessToken");

const fetchToken = async (email) => {
  try {
    const { data } = await axios.post(`${API_URL}/jwt`, { email });
    storeToken(data.token);
    return data.token;
  } catch (error) {
    console.error("Error fetching token:", error);
    throw error;
  }
};

//sign up user
export const signUpUser = createAsyncThunk(
  "auth/signUpUser",
  async ({ email, password, name, photo }, { rejectWithValue }) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      const user = userCredential.user;

      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photo,
      });

      const token = await fetchToken(normalizedEmail);
      return { user: { ...user, displayName: name, photoURL: photo } };
    } catch (error) {
      return rejectWithValue(getFirebaseAuthMessage(error?.code));
    }
  }
);

//sign in user
export const signInUser = createAsyncThunk(
  "auth/signInUser",
  async ({ email, password }, { rejectWithValue }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const signInWithFirebase = async () => {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      await fetchToken(normalizedEmail);
      return { user: userCredential.user };
    };

    // Primary path: Firebase sign-in first.
    // This avoids a noisy sign-up API request on every successful login.
    try {
      return await signInWithFirebase();
    } catch (authError) {
      const canTryLegacySync = [
        "auth/invalid-credential",
        "auth/user-not-found",
        "auth/wrong-password",
      ].includes(authError?.code);

      if (!canTryLegacySync) {
        return rejectWithValue(getFirebaseAuthMessage(authError?.code));
      }
    }

    // Fallback path: legacy MongoDB credential sync.
    try {
      const { data: legacyUser } = await axios.get(
        `${API_URL}/user/${normalizedEmail}`
      );

      const isLegacyPasswordMatch =
        legacyUser?.email && legacyUser?.password === password;

      if (!isLegacyPasswordMatch) {
        return rejectWithValue(getFirebaseAuthMessage("auth/invalid-credential"));
      }

      try {
        const createdUserCredential = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );
        await fetchToken(normalizedEmail);
        return { user: createdUserCredential.user };
      } catch (createError) {
        if (createError?.code === "auth/email-already-in-use") {
          return await signInWithFirebase();
        }

        return rejectWithValue(getFirebaseAuthMessage(createError?.code));
      }
    } catch {
      return rejectWithValue(getFirebaseAuthMessage("auth/invalid-credential"));
    }
  }
);

//google login
export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (_, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      await fetchToken(user.email);
      return { user: user };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//user logout
export const logOut = createAsyncThunk(
  "auth/logOut",
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      removeToken();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//update profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async ({ name, photo }, { rejectWithValue }) => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photo,
      });
      return { displayName: name, photoURL: photo };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (email, { rejectWithValue }) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { message: "password reset email sent successfully" };
    } catch (error) {
      let errorMessage = "Failed to sent reset email";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No user found with this email address";
          break;
        case "auth/invalid-email":
          errorMessage = "The email address is invalid";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many requests. Please try again later";
          break;
        default:
          errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

//observer
export const InitializeAuthListener = createAsyncThunk(
  "auth/InitializeAuthListener",
  async (_, { dispatch }) => {
    return new Promise((resolve) => {
      const unSub = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          await currentUser.reload();
          const token = localStorage.getItem("accessToken");
          if (!token) await fetchToken(currentUser.email);
          dispatch(setUser({ user: currentUser }));
        } else {
          dispatch(setUser(null));
        }
        dispatch(setLoading(false));
        resolve();
      });
      return () => unSub();
    });
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload?.user ?? action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(signInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user.displayName = action.payload.displayName;
          state.user.photoURL = action.payload.photoURL;
        }
      })
      .addCase(InitializeAuthListener.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(logOut.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.resetPasswordMessage = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, setLoading, clearError } = authSlice.actions;
export default authSlice.reducer;
