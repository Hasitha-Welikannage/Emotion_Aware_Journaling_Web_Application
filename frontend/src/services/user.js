// Use Vite dev server proxy during development so requests are same-origin
const API_BASE_URL = "/api";

export const getUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "GET",
      credentials: "include",
    });

    return response.json();
  } catch (error) {
    console.error("Error fetching user by ID:", error);
  }
};

export const updateUser = async (userId, updatedData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    return response.json();
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });

    return response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};
