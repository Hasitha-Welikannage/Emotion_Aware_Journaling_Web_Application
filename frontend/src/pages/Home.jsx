import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getJournalEntries } from "../services/journal.js";
import EntryCard from "../components/EntryCard.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import {
  FiEdit,
  FiPlus,
  FiAlertTriangle,
  FiLoader,
  FiChevronRight,
} from "react-icons/fi";

function Home() {
  const navigate = useNavigate();
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const userName = user?.first_name || "User";

  useEffect(() => {
    (async () => {
      try {
        const response = await getJournalEntries();
        if (response.success) {
          setRecentEntries(
            response.data
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 3)
          );
        } else {
          setError(response.message || "Failed to load journal entries.");
        }
      } catch (err) {
        setError("Failed to load journal entries.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- UI Components for States ---
  const LoadingState = () => (
    <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
      <FiLoader className="h-8 w-8 animate-spin mx-auto text-orange-400" />
      <p className="mt-3 font-medium">Loading your recent reflections...</p>
    </div>
  );

  const ErrorState = () => (
    <div className="col-span-full text-center py-6 text-red-700 bg-red-50 border border-red-200 rounded-xl">
      <FiAlertTriangle className="h-6 w-6 mx-auto mb-2" />
      <p className="font-medium">{error}</p>
    </div>
  );

  return (
    <section className="py-8 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                Welcome back,{" "}
                <span className="text-orange-600">{userName}!</span>
              </h1>
              <h2 className="text-xl font-semibold text-gray-700 mt-1">
                Ready to reflect?
              </h2>
              <p className="text-gray-500 text-base mt-2">
                Write a new entry to get an instant AI analysis of your current
                emotional state.
              </p>
            </div>
            <div className="w-full md:w-auto md:max-w-xs shrink-0 mt-2 md:mt-0">
              <button
                onClick={() => navigate("/app/journals/create")}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer transform hover:scale-[1.02] active:scale-100"
              >
                <FiEdit className="h-5 w-5" />
                {recentEntries.length > 0
                  ? "Write a New Journal Entry"
                  : "Write Your First Entry"}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Recent Entries Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-md font-semibold text-gray-800">
              Recent Activity
            </h3>
            <Link
              to="/app/journals"
              className="text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors flex items-center gap-1"
            >
              View All Journals
              <FiChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Conditional Rendering of Data/States */}
          {error && <ErrorState />}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LoadingState />
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Display Entries */}
              {recentEntries.length > 0 ? (
                recentEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))
              ) : (
                // Empty State when no entries exist
                <div className="col-span-full text-center py-16 px-5 bg-white rounded-md border border-gray-100 shadow-sm">
                  <FiAlertTriangle className="h-8 w-8 mx-auto mb-3 text-orange-400" />
                  <p className="text-lg font-semibold text-gray-700">
                    No recent entries found.
                  </p>
                  <p className="text-gray-500 mt-1 mb-4">
                    Start your emotional journey by creating your first entry!
                  </p>
                </div>
              )}

              {/* Create New Card (Always visible if space permits) */}

              {recentEntries.length > 0 && (
                <button
                  onClick={() => navigate("/app/journals/create")}
                  className="border-2 border-dashed border-orange-300 rounded-xl flex flex-col items-center justify-center p-8 text-center text-gray-500 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-700 transition-all duration-300 cursor-pointer h-full min-h-[250px]"
                >
                  <div className="w-12 h-12 mb-3 rounded-full bg-orange-100 flex items-center justify-center shadow-md">
                    <FiPlus className="h-7 w-7 text-orange-600" />
                  </div>
                  <span className="font-semibold text-lg">
                    Create New Entry
                  </span>
                  <p className="text-sm mt-1">
                    Start tracking your emotions now.
                  </p>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Home;
