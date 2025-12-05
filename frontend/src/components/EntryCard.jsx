import EmotionBadge from "./EmotionBadge";
import { useNavigate } from "react-router-dom";

function EntryCard({ entry }) {

  const navigate = useNavigate();

  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-lg border border-orange-100 hover:border-orange-300 transition-all duration-200 p-5 flex flex-col h-full">
      {/* Top Row: Date & Emotion */}
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {new Date(entry.created_at).toLocaleDateString()}
        </span>
        <EmotionBadge
          emotion={entry.emotions[0].name}
          score={entry.emotions[0].confidence}
        />
      </div>

      {/* Title and Preview */}
      <div className="flex-1 min-w-0 mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-orange-700 transition-colors">
          {entry.title}
        </h2>
        <p className="text-gray-600 text-sm line-clamp-3">{entry.content}</p>
      </div>

      {/* Action Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-orange-50/50">
        <span className="text-xs font-medium text-orange-800 opacity-90">
          Top Score: {entry.emotions[0].confidence}%
        </span>
        <button 
        onClick={() => navigate(`/app/entry/${entry.id}`)}
        className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-800 transition-colors font-medium cursor-pointer">
          View Details
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
export default EntryCard;
