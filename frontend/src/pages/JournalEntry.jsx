import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getJournalEntryById } from "../services/journal.js";

const emotionColors = {
  sadness: "bg-blue-500",
  disappointment: "bg-yellow-500",
  neutral: "bg-gray-400",
  approval: "bg-green-500",
  realization: "bg-indigo-500",
  grief: "bg-purple-500",
  annoyance: "bg-orange-500",
  joy: "bg-yellow-400",
  caring: "bg-pink-400",
  remorse: "bg-red-400",
  fear: "bg-indigo-600",
  admiration: "bg-purple-400",
  curiosity: "bg-teal-400",
  love: "bg-pink-500",
  confusion: "bg-amber-500",
  desire: "bg-red-500",
  anger: "bg-red-600",
  relief: "bg-green-400",
  amusement: "bg-orange-400",
  disgust: "bg-lime-600",
  gratitude: "bg-emerald-500",
  embarrassment: "bg-rose-400",
  surprise: "bg-violet-500",
  pride: "bg-purple-700",
  excitement: "bg-red-400",
};

function JournalEntry() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the journal entry
  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await getJournalEntryById(id);
        if (response.success) {
          setEntry(response.data);
        } else {
          setError(response.message || "Failed to fetch entry");
        }
      } catch (err) {
        setError("Failed to load journal entry.");
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading journal entry...</p>
      </div>
    );
  }

  // Show error state
  if (error || !entry) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">{error || "Journal entry not found."}</p>
      </div>
    );
  }

  // Safe now: entry exists
  const formattedContent = entry.content.split("\n").map((line, index) => (
    <span key={index}>
      {line}
      <br />
    </span>
  ));

  const processedEmotions = entry.emotions
    .sort((a, b) => b.confidence - a.confidence)
    .map((emotion) => ({
      ...emotion,
      score: emotion.confidence,
      bg: emotionColors[emotion.name] || "bg-gray-300",
    }));

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header and Actions */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{entry.title.toUpperCase()}</h1>
            <p className="text-gray-500 text-sm mt-1">
              Written on {entry.created_at}
            </p>
          </div>
          <button
            onClick={() => navigate(`/edit/${entry.id}`)}
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Entry
          </button>
        </div>

        {/* Content and Analysis Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* COLUMN 1: Read-Only Content (2/3 width) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-orange-100 p-6 text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
              {formattedContent}
            </div>
          </div>

          {/* COLUMN 2: Analysis Panel (1/3 width) */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border-2 border-orange-300 p-6 md:sticky md:top-8">
              <h3 className="text-xl font-bold text-orange-900 mb-4 border-b border-orange-100 pb-3">
                Final Analysis
              </h3>

              {/* Dominant Emotion */}
              <div className="pb-2">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Dominant Emotion
                </p>
                {processedEmotions.length > 0 && (
                  <div className="text-3xl font-extrabold flex items-baseline gap-2">
                    <span
                      className={`capitalize text-gray-700 px-2 py-1 rounded`}
                    >
                      {processedEmotions[0].name}
                    </span>
                    <span className="text-xl text-gray-500">
                      {processedEmotions[0].confidence.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Full Emotion Breakdown */}
              <div className="pt-4 border-t border-orange-100 mt-2">
                <p className="text-sm font-medium text-gray-800 mb-3">
                  Breakdown:
                </p>
                {processedEmotions.map((emotion, i) => (
                  <div key={i} className="flex flex-col mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-sm capitalize">
                        {emotion.name}
                      </span>
                      <span className="text-sm font-semibold">
                        {emotion.confidence.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${emotion.bg} transition-all duration-500`}
                        style={{ width: `${emotion.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JournalEntry;
