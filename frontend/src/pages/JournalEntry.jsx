import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getJournalEntryById,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "../services/journal.js";
import {
  FiEdit,
  FiSave,
  FiTrash2,
  FiX,
  FiLoader,
  FiAlertTriangle,
  FiActivity,
} from "react-icons/fi";

// --- Constants ---
const ANALYSIS_COLOR_CLASS = {
  text: "text-orange-900",
  bg: "bg-orange-50",
  border: "border-orange-300",
};

const formatScore = (score) => `${score.toFixed(1)}%`;

function JournalEntry() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [mode, setMode] = useState(null);
  const [title, setTitle] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [content, setContent] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [entryData, setEntryData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isExistingEntry = !!id;
  const initialMode = isExistingEntry ? "view" : "edit";

  // Mode Initialization Effect
  useEffect(() => {
    setMode(initialMode);
    setLoading(isExistingEntry);
  }, [initialMode, isExistingEntry]);

  // Data Fetching Effect
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
            setInitialContent(entry.content);
            setCreatedAt(
              new Date(entry.created_at).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            );
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
  }, [id, isExistingEntry, initialContent]);

  // Emotions Processing
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

  // Journal Entry Save
  const handleSave = async () => {
    setIsSaving(true);
    const payload = {
      title,
      content: initialContent === content ? null : content,
    };
    try {
      if (mode === "edit" && isExistingEntry) {
        const response = await updateJournalEntry(id, payload);
        if (response.success) {
          setInitialContent(content);
          setIsAnalyzed(true);
          setMode("view");
          navigate(`/app/journals/view/${response.data.id}`);
        } else {
          setError(response.message || "Failed to update entry.");
        }
      } else if (mode === "edit" && !isExistingEntry) {
        const response = await createJournalEntry(payload);
        if (response.success) {
          navigate(`/app/journals/view/${response.data.id}`);
        } else {
          setError(response.message || "Failed to create entry.");
        }
      }
    } catch (err) {
      setError(`Error during save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Journal Entry Delete
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this journal entry? This action cannot be undone."
      )
    )
      return;

    setLoading(true);
    try {
      const response = await deleteJournalEntry(id);
      if (response.success) {
        navigate("/app/journals");
      } else {
        setError(response.message || "Failed to delete entry.");
      }
    } catch (err) {
      setError("Failed to delete journal entry.");
    } finally {
      if (error) setLoading(false);
    }
  };

  // CONTENT RENDERING HELPERS
  const renderContent = () => {
    if (mode === "edit") {
      return (
        <div className="bg-gray-50 rounded-md shadow-md border border-gray-200">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind today? Write your entry here..."
            rows={15}
            className="w-full text-gray-700 resize-none focus:outline-none p-5 text-base text-justify leading-relaxed rounded-md"
            style={{ minHeight: "500px" }}
          />
        </div>
      );
    } else {
      return (
        <div className="bg-gray-50 rounded-md shadow-md border border-gray-200 p-6 text-gray-700 leading-relaxed text-md text-justify whitespace-pre-wrap">
          {content}
        </div>
      );
    }
  };

  const renderTitleInput = () => {
    if (mode === "edit") {
      return (
        // Title input uses its own card style
        <div className="bg-gray-50 rounded-md shadow-md border border-gray-200 p-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your entry a title..."
            className="w-full text-3xl font-semibold focus:outline-none text-gray-600 bg-transparent"
          />
        </div>
      );
    } else {
      return (
        <h1 className="text-3xl font-semibold text-gray-600 leading-tight">
          {title}
        </h1>
      );
    }
  };

  // Top edit button
  const renderEditButtonsTop = () => (
    <button
      onClick={() => setMode("edit")}
      className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-md transition-colors flex justify-center items-center gap-2 cursor-pointer transform hover:scale-[1.02]"
    >
      <FiEdit className="h-5 w-5" />
      Edit Entry
    </button>
  );

  // Bottom action buttons in edit mode
  const renderEditSaveActionsBottom = () => (
    <div className="flex flex-col justify-end items-stretch gap-3 md:flex-row mt-7">
      {/* Cancel Button */}
      <button
        onClick={() =>
          isExistingEntry ? setMode("view") : navigate("/app/journals")
        }
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
      >
        Cancel
      </button>

      {/* Delete Button */}
      {isExistingEntry && (
        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          disabled={isSaving}
        >
          Delete
        </button>
      )}

      {/* Save Button (Primary Action) */}
      <button
        onClick={handleSave}
        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <FiLoader className="h-5 w-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>{isExistingEntry ? "Update & Re-Analyze" : "Save & Analyze"}</>
        )}
      </button>
    </div>
  );

  // --- LOADING AND ERROR STATES (Unchanged) ---
  if (loading) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-lg border border-gray-100">
            <FiLoader className="h-8 w-8 animate-spin mx-auto text-orange-500" />
            <p className="mt-3 font-medium">Fetching journal entry...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-10 text-red-700 bg-red-50 border border-red-200 rounded-xl">
            <FiAlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <p className="font-medium">Error: {error}</p>
            <button
              onClick={() => navigate("/app/home")}
              className="mt-4 text-sm text-red-700 underline hover:text-red-900 cursor-pointer"
            >
              Go to Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  // --- FINAL RENDER ---
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: Title, Date, and Edit Button */}
        <div className="flex flex-col justify-between items-stretch mb-6 gap-4 md:flex-row md:items-center">
          <div className="flex-1 min-w-0">
            {renderTitleInput()}
            {/* Metadata (Date) */}
            {isExistingEntry && mode === "view" && (
              <p className="text-gray-500 text-sm mt-2">{createdAt}</p>
            )}
          </div>

          {/* Top Right Action: ONLY SHOW EDIT BUTTON IN VIEW MODE */}
          {mode === "view" && isExistingEntry && renderEditButtonsTop()}
        </div>

        {/* Layout for Content and Analysis */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
          {/* Main Content Area (Prioritized on mobile) */}
          <div
            className={`${mode === "view" ? "lg:col-span-2" : "lg:col-span-3"}`}
          >
            {renderContent()}
            {mode === "edit" && renderEditSaveActionsBottom()}
          </div>

          {/* Analysis Panel (Flows beneath content on mobile) */}
          {(mode === "view" || (mode === "edit" && isExistingEntry)) && (
            <div
              className={`${
                mode === "view" ? "lg:col-span-1" : "lg:col-span-3"
              }`}
            >
              <div className="w-full lg:sticky lg:top-4">
                <div className="bg-white rounded-xl shadow-lg border border-orange-300 p-6">
                  <div className="flex items-center justify-between mb-4 border-b border-orange-100 pb-3">
                    <h3 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                      <FiActivity className="h-6 w-6 text-orange-600" />
                      Emotion Analysis
                    </h3>
                  </div>

                  {isAnalyzed && processedEmotions.length > 0 ? (
                    <div className="space-y-4">
                      {/* Dominant Emotion Highlight */}
                      <div
                        className={`p-4 rounded-xl ${ANALYSIS_COLOR_CLASS.bg} shadow-md border ${ANALYSIS_COLOR_CLASS.border}`}
                      >
                        <p
                          className={`text-sm font-semibold ${ANALYSIS_COLOR_CLASS.text} mb-1`}
                        >
                          PRIMARY FEELING
                        </p>
                        <div className="text-3xl font-extrabold flex items-baseline gap-2">
                          <span className="text-orange-900 capitalize">
                            {dominantEmotion.name}
                          </span>
                          <span className="text-lg text-orange-600">
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
                            {processedEmotions
                              .slice(1)
                              .map((emotion, index) => (
                                <div
                                  key={index}
                                  className={`px-3 py-1 text-sm rounded-full ${ANALYSIS_COLOR_CLASS.bg} ${ANALYSIS_COLOR_CLASS.text} border border-orange-200 font-medium`}
                                  title={`Confidence: ${formatScore(
                                    emotion.confidence
                                  )}`}
                                >
                                  {emotion.name} (
                                  {Math.round(emotion.confidence)}%)
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Placeholder when no analysis is available
                    <div className="text-center py-10 text-gray-500">
                      <FiAlertTriangle className="h-8 w-8 mx-auto mb-3 text-orange-400" />
                      <p className="text-sm">
                        Save or update your entry to run the AI emotion
                        analysis.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default JournalEntry;
