import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getJournalEntries } from "../services/journal.js";
import EntryCard from "../components/EntryCard.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

// --- Main Home Component ---
function Home() {
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await getJournalEntries();
        console.log("Fetched journal entries:", response);
        if (response.success) {
          setRecentEntries(response.data.slice(0, 3)); // Get the 3 most recent entries
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("Failed to load journal entries.");
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  return (
    <section className="bg-white lg:py-8 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Home</h1>
          <p className="mt-2 text-gray-600">
            Your emotional landscape at a glance.
          </p>
        </div>

        {/* 2. Hero Action: Create New Entry */}
        <div className="bg-white rounded-b-lg shadow-sm border border-orange-100 p-6 mb-10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold text-gray-800">
              How are you feeling right now?
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Write a new entry to get an AI analysis of your emotions.
            </p>
          </div>
          <button
            onClick={() => navigate("/app/create")}
            className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 hover:cursor-pointer"
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
            Write New Journal
          </button>
        </div>

        {/* 3. Recent Entries Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Recent Entries</h3>
            <button
              className="text-sm font-medium text-orange-600 hover:text-orange-800 hover:cursor-pointer"
              onClick={() => navigate("/app/journals")}
            >
              View all journals &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
            <button
              onClick={() => navigate("/app/create")}
              className="border-2 border-dashed border-orange-200 rounded-lg flex flex-col items-center justify-center p-8 text-center text-gray-400 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 transition-all cursor-pointer h-full min-h-[200px]"
            >
              <div className="w-10 h-10 mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="font-medium">Create New</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
