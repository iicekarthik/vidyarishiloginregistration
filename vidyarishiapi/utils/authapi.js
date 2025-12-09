// utils/authapi.js

// Helper: Universal POST fetch wrapper
const postAPI = async (url, body, includeAuth = false) => {
  try {
    const headers = { "Content-Type": "application/json" };

    // Include token if requested
    if (includeAuth) {
      const token = typeof window !== "undefined" ? localStorage.getItem("vr_token") : null;
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    return await res.json();
  } catch (err) {
    console.error(`API Error (${url}):`, err);
    return { error: true, message: "Network error" };
  }
};

/**
 * ➤ Check if user exists & send OTP
 * @param {string} phone
 */
export const checkUserAPI = async (phone) => {
  return await postAPI("/api/auth/check-user", { phone });
};

/**
 * ➤ Verify OTP
 * Saves JWT token automatically if user exists
 *
 * @param {string} phone
 * @param {string} otp
 */

export const verifyOtpAPI = async (phone, otp) => {
  const res = await postAPI("/api/auth/verify-otp", { phone, otp });

  if (res?.accessToken) {
    localStorage.setItem("vr_access_token", res.accessToken);
    localStorage.setItem("vr_refresh_token", res.refreshToken);
  }

  return res;
};

export const refreshTokenAPI = async () => {
  const refreshToken = localStorage.getItem("vr_refresh_token");
  if (!refreshToken) return null;

  const res = await postAPI("/api/auth/refresh-token", { refreshToken });
  if (res?.accessToken) {
    localStorage.setItem("vr_access_token", res.accessToken);
  }
  return res;
};

/**
 * ➤ Logout user
 */
export const logoutUserAPI = async () => {
  const refreshToken = localStorage.getItem("vr_refresh_token");

  await postAPI("/api/auth/logout", { refreshToken });

  localStorage.removeItem("vr_access_token");
  localStorage.removeItem("vr_refresh_token");
};

/**
 * ➤ Register user
 * Saves JWT token automatically after successful registration
 *
 * @param {object} data
 */
export const registerUserAPI = async (data) => {
  const res = await postAPI("/api/auth/register", data);

  // Save token after registration
  if (res?.token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("vr_token", res.token);
    }
  }

  return res;
};

/**
 * ➤ Get logged-in user token
 */
export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vr_token");
};
