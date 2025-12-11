import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getJournalEntries } from "../services/journal.js";
import EntryCard from "../components/EntryCard.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { FiEdit, FiPlus } from "react-icons/fi";

function Home() {
  const navigate = useNavigate();
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const response = await getJournalEntries();
        if (response.success) {
          setRecentEntries(response.data.slice(0, 3)); // Get the 3 most recent entries
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

  return (
    <section className="bg-white lg:py-8 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 md:p-8 mb-10">
          {/* Main Flex Container: Column on mobile, Row on desktop */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back,{" "}
                <span className="text-orange-600">
                  {user?.first_name || "User"}!
                </span>
              </h1>
              <h2 className="text-xl font-semibold text-gray-800 mt-2">
                Ready to reflect?
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Write a new entry to get an instant AI analysis of your current
                emotional state.
              </p>
            </div>
            <div className="w-full md:w-auto md:max-w-xs shrink-0 mt-2 md:mt-0">
              <button
                onClick={() => navigate("/app/journals/create")}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg shadow-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiEdit className="h-5 w-5" />
                Write New Journal Entry
              </button>
            </div>
          </div>
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
              onClick={() => navigate("/app/journals/create")}
              className="border-2 border-dashed border-orange-200 rounded-lg flex flex-col items-center justify-center p-8 text-center text-gray-400 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 transition-all cursor-pointer h-full min-h-[200px]"
            >
              <div className="w-10 h-10 mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                <FiPlus className="h-6 w-6 text-orange-500" />
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
