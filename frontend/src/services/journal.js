const API_BASE_URL = "http://127.0.0.1:5000";

export const getJournalEntries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/journals`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching journal entries:", error);
  }
};

export const getJournalEntryById = async (entryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/journals/${entryId}`, {
      method: "GET",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching journal entry by ID:", error);
  }
};

export const createJournalEntry = async (entryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/journals`, {
      method: "POST",
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
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting journal entry:", error);
  }
};
