import axios from "axios";
import api from "./api";

const API_URL = "http://localhost:8000/api/";

const login = async (email, password) => {
  const response = await axios.post(API_URL + "login/", { email, password });
  if (response.data.access) {
    localStorage.setItem("user", JSON.stringify(response.data));
    setRefreshTokenInterval();
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem("user");
  clearRefreshTokenInterval();
};

const register = async (
  first_name,
  last_name,
  email,
  password1,
  password2,
  user_type,
  phone
) => {
  return axios.post(API_URL + "register/", {
    first_name,
    last_name,
    email,
    password1,
    password2,
    user_type,
    phone,
  });
};

const verifyEmail = async (email, otp) => {
  try {
    const response = await axios.post(API_URL + "verify-email/", {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Verification failed" };
  }
};

const sendPhoneOTP = async (phone, email) => {
  try {
    console.log("Sending OTP request:", { phone, email });
    const response = await axios.post(API_URL + "send-phone-otp/", {
      phone,
      email,
    });
    console.log("OTP Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Phone OTP Error:", error.response?.data || error);
    throw error.response?.data || { error: "Failed to send OTP" };
  }
};

const verifyPhone = async (phone, otp) => {
  try {
    const response = await axios.post(API_URL + "verify-phone/", {
      phone,
      otp,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Phone verification failed" };
  }
};

const uploadProfilePicture = async (formData) => {
  try {
    // Set proper headers for multipart form data without auth requirement
    const response = await axios.post(
      API_URL + "upload-profile-picture/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Profile picture upload error:", error);
    throw error.response?.data || { error: "Failed to upload profile picture" };
  }
};

const getCurrentUser = async () => {
  try {
    const response = await api.get("/user/");
    return response;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    throw error;
  }
};

const updateUser = async (data) => {
  try {
    const response = await api.put("/user/", data);
    return response.data;
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error;
  }
};

const refreshToken = async () => {
  const user = getCurrentUser();
  if (user && user.refresh) {
    const response = await axios.post(API_URL + "refresh/", {
      refresh: user.refresh,
    });
    if (response.data.access) {
      user.access = response.data.access;
      localStorage.setItem("user", JSON.stringify(user));
    }
    return response.data.access;
  }
  return null;
};

let refreshTokenInterval;

const setRefreshTokenInterval = () => {
  clearRefreshTokenInterval();
  refreshTokenInterval = setInterval(async () => {
    await refreshToken();
  }, 4 * 60 * 1000); // Refresh token every 4 minutes
};

const clearRefreshTokenInterval = () => {
  if (refreshTokenInterval) {
    clearInterval(refreshTokenInterval);
  }
};

const sendPasswordChangeEmail = async (email) => {
  try {
    const response = await api.post("/send-password-change-email/", { email });
    return response.data;
  } catch (error) {
    console.error("Failed to send password change email:", error);
    throw error;
  }
};

export default {
  login,
  logout,
  getCurrentUser,
  refreshToken,
  register,
  verifyEmail,
  sendPhoneOTP,
  verifyPhone,
  uploadProfilePicture,
  updateUser,
  sendPasswordChangeEmail,
};
