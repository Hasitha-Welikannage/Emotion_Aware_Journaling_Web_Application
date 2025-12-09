import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Assuming your service functions are available
import {
  getJournalEntryById,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "../services/journal.js";

// --- Constants ---
const ANALYSIS_COLOR_CLASS = {
  text: "text-orange-700",
  bg: "bg-orange-100", // Using a lighter background for the compact chips
  border: "border-orange-300",
};

const formatScore = (score) => `${score.toFixed(1)}%`;

function JournalEntry() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [mode, setMode] = useState(null); // 'view' or 'edit'
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [entryData, setEntryData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const isExistingEntry = !!id;

  const initialMode = isExistingEntry ? "view" : "edit";
  useEffect(() => {
    setMode(initialMode);
    setLoading(isExistingEntry);
  }, [initialMode, isExistingEntry]);

  // --- Data Fetching Effect (Load entry for View or Edit) ---
  useEffect(() => {
    if (isExistingEntry) {
      const fetchEntry = async () => {
        setLoading(true);
        try {
          const response = await getJournalEntryById(id);

          if (response.success && response.data) {
            const entry = response.data;
            setTitle(entry.title);
            setContent(entry.content);
            setCreatedAt(entry.created_at);
            setEntryData(entry.emotions);
            setIsAnalyzed(true);
          } else {
            setError(response.message || "Failed to fetch entry.");
          }
        } catch (err) {
          setError("Failed to load journal entry.");
        } finally {
          setLoading(false);
        }
      };
      fetchEntry();
    }
  }, [id, isExistingEntry]);

  // --- Data Processing ---
  const processedEmotions = entryData
    ? entryData
        .sort((a, b) => b.confidence - a.confidence)
        .map((emotion) => ({
          name: emotion.name,
          confidence: emotion.confidence,
          score: emotion.confidence,
          bg: ANALYSIS_COLOR_CLASS.bg,
          text: ANALYSIS_COLOR_CLASS.text,
        }))
    : [];

  const dominantEmotion = processedEmotions[0];

  // --- Handlers (Unchanged) ---
  const handleSave = async () => {
    const payload = { title, content };

    if (mode === "edit" && isExistingEntry) {
      // Update existing entry
      try {
        const response = await updateJournalEntry(id, payload);
        if (response.success) {
          setIsAnalyzed(true);
          setMode("view");
        } else {
          setError(response.message || "Failed to update entry.");
          console.error("Failed to update entry:", response.message);
        }
      } catch (err) {
        console.error("Error updating entry:", err);
      }
    }

    if (mode === "edit" && !isExistingEntry) {
      // Create new entry
      try {
        const response = await createJournalEntry(payload);
        if (response.success) {
          navigate(`/app/entry/${response.data.id}`);
        } else {
          setError(response.message || "Failed to create entry.");
          console.error("Failed to create entry:", response.message);
        }
      } catch (err) {
        console.error("Error creating entry:", err);
      }
    }

  };

  const handleDelete = () => {

    if(mode == "edit" && isExistingEntry){
      console.log("Deleted");
    }

    if (window.confirm("Are you sure you want to delete this entry?")) {
      console.log(`Deleting entry ${id}`);
      navigate("/app/journals");
    }
  };

  // --- CONTENT RENDERING HELPERS (Unchanged) ---
  const renderContent = () => {
    if (mode === "edit") {
      return (
        <div className="bg-white rounded-xl shadow-md border border-orange-100 p-5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind today? Write your entry here..."
            rows={15}
            className="w-full text-gray-700 resize-none focus:outline-none"
            style={{ minHeight: "400px" }}
          />
        </div>
      );
    } else {
      const formattedContent = content.split("\n").map((line, index) => (
        <span key={index}>
          {line}
          <br />
        </span>
      ));
      return (
        <div className="bg-white rounded-xl shadow-md border border-orange-100 p-6 text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
          {formattedContent}
        </div>
      );
    }
  };

  const renderTitleInput = () => {
    if (mode === "edit") {
      return (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your entry a title..."
          className="w-full text-3xl font-bold border-b border-gray-200 focus:outline-none focus:border-orange-500 pb-2 text-gray-800 bg-transparent"
        />
      );
    } else {
      return (
        <h1 className="text-3xl font-bold text-gray-900">
          {title.toUpperCase()}
        </h1>
      );
    }
  };

  // --- RENDERING HANDLERS FOR ACTIONS (Unchanged) ---
  const renderEditButtonsTop = () => (
    <button
      onClick={() => setMode("edit")}
      className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors flex items-center gap-2 cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      Edit Entry
    </button>
  );

  const renderEditSaveActionsBottom = () => (
    <div className="flex justify-end gap-3 mt-6">
      <button
        onClick={() =>
          isExistingEntry ? setMode("view") : navigate("/app/journals")
        }
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-xl transition-colors"
      >
        Cancel
      </button>
      {isExistingEntry && (
        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-xl transition-colors"
        >
          Delete
        </button>
      )}
      <button
        onClick={handleSave}
        className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-colors flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        {isExistingEntry ? "Update & Re-Analyze" : "Save & Analyze"}
      </button>
    </div>
  );

  // --- LOADING AND ERROR STATES (Unchanged) ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-orange-50">
        <p className="text-gray-500 text-lg">Loading journal entry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-orange-50">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  // --- FINAL RENDER ---
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: Title, Date, and Edit Button */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div
            className={`flex-1 ${
              mode === "edit"
                ? "bg-white rounded-xl shadow-md border border-orange-100 p-5"
                : ""
            }`}
          >
            {renderTitleInput()}
            {isExistingEntry && mode === "view" && (
              <p className="text-gray-500 text-sm mt-1">
                Written on {createdAt}
              </p>
            )}
          </div>

          {/* Top Right Action: ONLY SHOW EDIT BUTTON IN VIEW MODE */}
          {mode === "view" && renderEditButtonsTop()}
        </div>

        {/* Content and Analysis Layout: Single Column */}
        <div className="space-y-8">
          {/* Main Content Area */}
          {renderContent()}

          {/* Action Buttons: ONLY SHOW CANCEL/SAVE/DELETE IN EDIT MODE */}
          {mode === "edit" && renderEditSaveActionsBottom()}

          {/* Analysis Panel (Updated for compactness) */}
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-lg border-2 border-orange-300 p-6">
              <div className="flex items-center justify-between mb-4 border-b border-orange-100 pb-3">
                <h3 className="text-xl font-bold text-orange-900">
                  Emotion Analysis
                </h3>
                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                  {isAnalyzed ? "Last update: Now" : "Save to analyze"}
                </span>
              </div>

              {isAnalyzed && processedEmotions.length > 0 ? (
                <div className="space-y-4">
                  {/* Dominant Emotion Highlight (Larger, more prominent) */}
                  <div
                    className={`p-4 rounded-xl ${ANALYSIS_COLOR_CLASS.bg} shadow-sm border ${ANALYSIS_COLOR_CLASS.border}`}
                  >
                    <p
                      className={`text-sm font-medium ${ANALYSIS_COLOR_CLASS.text} mb-1`}
                    >
                      **PRIMARY FEELING**
                    </p>
                    <div className="text-4xl font-extrabold flex items-baseline gap-3">
                      <span className="text-orange-900 capitalize">
                        {dominantEmotion.name}
                      </span>
                      <span className="text-xl text-orange-600">
                        {formatScore(dominantEmotion.confidence)}
                      </span>
                    </div>
                  </div>

                  {/* Other Emotions as Compact Chips */}
                  {processedEmotions.length > 1 && (
                    <div className="pt-2">
                      <p className="text-sm font-medium text-gray-800 mb-2">
                        Other detected emotions:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {processedEmotions.slice(1).map((emotion, index) => (
                          <div
                            key={index}
                            className={`px-3 py-1 text-sm rounded-full ${ANALYSIS_COLOR_CLASS.bg} ${ANALYSIS_COLOR_CLASS.text} border border-orange-200 font-medium`}
                            title={`Confidence: ${formatScore(
                              emotion.confidence
                            )}`}
                          >
                            {emotion.name} ({Math.round(emotion.confidence)}%)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 mx-auto mb-3 text-orange-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  <p className="text-sm">
                    Save your entry to run the AI emotion analysis.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JournalEntry;
