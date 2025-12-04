// Use Vite dev server proxy during development so requests are same-origin
const API_BASE_URL = "/api";

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return await response.json();
  } catch (error) {
    console.error("Error during login:", error);
  }
};

export const logoutUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    return await response.json();
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error during registration:", error);
  }
};

export const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/current_user`, {
    method: "GET",
    credentials: "include",
  });
  return await response.json();
};
