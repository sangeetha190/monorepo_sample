import axiosInstance from "./axiosConfig";

// getAuthType API Call
export const getAuthType = async () => {
  const response = await axiosInstance.get(`/authentication-type`);
  // console.log(response.data);
  return response.data;
};

// Login API Call
export const loginUser = async (mobile, password) => {
  const response = await axiosInstance.post(`/login`, {
    mobile,
    password,
  });
  return response.data;
};

// check the player name should be unique when register
export const checkPlayerName = async (player_name) => {
  const response = await axiosInstance.get(`/check-player-name`, {
    params: { player_name },
  });
  return response.data; // expected: { status: "success" } or { status: "error", msg: "Already exists" }
};
// register with mobile and password
export const registerUser = async (name, mobile, password) => {
  try {
    const response = await axiosInstance.post(
      `/register`,
      { player_name: name, mobile, password },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; // ✅ Return the full API response
  } catch (error) {
    console.error("Register API error:", error.response?.data); // ✅ Log full API error
    throw error; // ✅ Throw the full error object
  }
};

// OTP verification API
export const verifyOTP = async ({ otp, mobile, type, authType }) => {
  try {
    const response = await axiosInstance.post(`/authentication-otp-verify`, {
      otp,
      mobile,
      type,
    });

    return response.data;
  } catch (error) {
    console.error("OTP Verify Error:", error.response?.data);
    throw error;
  }
};

// ✅ Get User Profile
export const getUserProfile = async (token) => {
  try {
    const response = await axiosInstance.get("/player/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status === "success") {
      // console.log(response.data);

      return response.data.player; // ✅ Return only player data
    } else {
      throw new Error(response.data.msg || "Failed to load profile");
    }
  } catch (error) {
    console.error("Profile API Error:", error);
    throw new Error("Something went wrong. Please try again.");
  }
};
// Logout API Call
export const logoutUser = async () => {
  const response = await axiosInstance.post("/player/logout");
  return response.data;
};


export const verifyToken = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token not found in localStorage");
  }

  const response = await axiosInstance.get("/player/verify-token", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

