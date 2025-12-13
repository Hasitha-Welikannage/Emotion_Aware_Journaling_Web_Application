import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getJournalEntryById } from "../services/journal.js";
import { FiEdit, FiLoader, FiAlertTriangle, FiActivity } from "react-icons/fi";
import Header from "../components/Header.jsx";

const formatScore = (score) => `${score.toFixed(1)}%`;

function JournalEntryView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [entryData, setEntryData] = useState(null);

  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  // Data Fetching Effect
  useEffect(() => {
    const fetchEntry = async () => {
      setLoading(true);
      try {
        const response = await getJournalEntryById(id);
        if (response.success && response.data) {
          const entry = response.data;
          setTitle(entry.title);
          setContent(entry.content);
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
  }, [id]);

  // Emotions Processing
  const processedEmotions = entryData
    ? entryData
        .sort((a, b) => b.confidence - a.confidence)
        .map((emotion) => ({
          name: emotion.name,
          score: formatScore(emotion.confidence),
        }))
    : [];

  const dominantEmotion = processedEmotions[0];

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

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header
          title="View Journal Entry"
          discription="Reflect on your thoughts and emotions."
          callToActionText="Edit Entry"
          callToActionIcon={<FiEdit className="h-5 w-5" />}
          onClick={() => navigate(`/app/journals/edit/${id}`)}
        />
        {/* Header: Title, Date, and Edit Button */}
        <div className="flex flex-col justify-between items-stretch p-5 mb-6 bg-gray-50 border border-gray-200 rounded-md shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-700 leading-tight">
            {title}
          </h1>
          <p className="text-gray-500 text-sm mt-2">{createdAt}</p>
        </div>

        {/* Layout for Content and Analysis */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
          {/* Main Content Area (Prioritized on mobile) */}
          <div className={`lg:col-span-2`}>
            <div className="bg-gray-50 rounded-md shadow-sm border border-gray-200 p-5 text-gray-700 leading-relaxed text-justify whitespace-pre-wrap">
              {content}
            </div>
          </div>

          {/* Analysis Panel (Flows beneath content on mobile) */}
          <div className={`lg:col-span-1`}>
            <div className="w-full lg:sticky lg:top-4">
              <div className="bg-white rounded-md shadow-sm border border-orange-300 p-5">
                <div className="flex items-center justify-between mb-1 pb-2">
                  <h3 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                    <FiActivity className="h-5 w-5 text-orange-600" />
                    Emotion Analysis
                  </h3>
                </div>

                {processedEmotions.length > 0 ? (
                  <div className="space-y-4">
                    {/* Dominant Emotion Highlight */}
                    <div className="p-4 mb-3 rounded-md bg-orange-50/50 shadow-sm border border-orange-300">
                      <p className="text-sm font-semibold text-orange-900 mb-1">
                        PRIMARY FEELING
                      </p>
                      <div className="text-2xl font-extrabold flex items-baseline gap-2">
                        <span className="text-orange-900 capitalize">
                          {dominantEmotion.name}
                        </span>
                        <span className="text-lg text-orange-600">
                          {dominantEmotion.score}
                        </span>
                      </div>
                    </div>

                    {/* Other Emotions as Compact Chips */}
                    {processedEmotions.length > 1 && (
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-800 mb-2">
                          Other detected emotions:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {processedEmotions.slice(1).map((emotion, index) => (
                            <div
                              key={index}
                              className={`px-3 py-2 text-sm rounded-full bg-orange-50/50 text-orange-900 border border-orange-300 capitalize`}
                              title={`Score: ${emotion.score}`}
                            >
                              {emotion.name} ({emotion.score})
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
                      Save or update your entry to run the AI emotion analysis.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JournalEntryView;
