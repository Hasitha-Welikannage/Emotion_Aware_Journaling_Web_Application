import EmotionBadge from "./EmotionBadge";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiClock } from "react-icons/fi"; // Added FiClock for the timestamp

function EntryCard({ entry }) {
  const navigate = useNavigate();

  // Unified options for date and time formatting
  const dateTimeOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const date = new Date(entry.created_at);

  // Use toLocaleString for combined, cleaner output
  const formattedDateTime = date.toLocaleString("en-US", dateTimeOptions);

  // Destructure the top emotion
  const topEmotion = entry.emotions[0];

  return (
    <div
      onClick={() => navigate(`/app/journals/view/${entry.id}`)}
      className="group bg-white rounded-md shadow-sm border border-gray-200 py-5 px-4
                 transition-all duration-300 cursor-pointer 
                 hover:shadow-md hover:border-orange-300 transform hover:-translate-y-0.3"
    >
      {/* Header: Emotion Badge and Timestamp */}
      <div className="flex justify-between items-center mb-4">
        <EmotionBadge emotion={topEmotion.name} score={topEmotion.confidence} />
        <div className="flex items-center text-xs font-medium text-gray-400">
          <FiClock className="h-3 w-3 mr-1" />
          <span>{formattedDateTime}</span>
        </div>
      </div>

      {/* Title and Preview */}
      <div className="flex-1 min-w-0 mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2 leading-snug group-hover:text-orange-700 transition-colors">
          {entry.title}
        </h2>
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
          {entry.content}
        </p>
      </div>

      {/* Action Footer: Now a unified 'view' link */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <span className="text-sm text-orange-800">
          Confidence: {topEmotion.confidence}%
        </span>

        {/* View Details Link */}
        <div className="flex items-center gap-1 text-sm text-orange-600 group-hover:text-orange-800 transition-colors ">
          Read Full Entry
          <FiChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}

export default EntryCard;
