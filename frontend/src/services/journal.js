// Use Vite dev server proxy during development so requests are same-origin
const API_BASE_URL = "/api";

export const getJournalEntries = async () => {
  const response = await fetch(`${API_BASE_URL}/journals/`, {
    method: "GET",
    credentials: "include",
  });
  return await response.json();
};

export const getJournalEntryById = async (entryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/journals/${entryId}`, {
      method: "GET",
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching journal entry by ID:", error);
  }
};

export const createJournalEntry = async (entryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/journals/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entryData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating journal entry:", error);
  }
};

export const updateJournalEntry = async (entryId, updatedData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/journals/${entryId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating journal entry:", error);
  }
};

export const deleteJournalEntry = async (entryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/journals/${entryId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting journal entry:", error);
  }
};
