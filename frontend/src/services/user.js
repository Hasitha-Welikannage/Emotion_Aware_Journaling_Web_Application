const API_BASE_URL = "http://127.0.0.1:5000";

export const getUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "GET",
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
    });

    return response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};
