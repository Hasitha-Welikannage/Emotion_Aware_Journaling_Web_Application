import { useEffect, useState } from "react";
import EntryCard from "../components/EntryCard.jsx";
import { getJournalEntries } from "../services/journal.js";
import { FiSearch, FiAlertTriangle, FiLoader, FiFilter } from "react-icons/fi"; 

function JournalEntries() {
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const response = await getJournalEntries();
        if (response.success) {
          setEntries(response.data);
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

  // Filtering Logic (simplified)
  const filteredEntries = entries
    .filter(
      (entry) =>
        filter === "All" || entry.emotions[0].name.toLowerCase() === filter.toLowerCase()
    )
    .filter(
      (entry) =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const emotionFilters = ["All", "Joy", "Sadness", "Anger", "Fear", "Neutral"];

  // Consistent Loading State
  if (loading) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="col-span-full text-center py-20 text-gray-500 bg-white rounded-xl shadow-lg border border-gray-100">
                <FiLoader className="h-8 w-8 animate-spin mx-auto text-orange-500" />
                <p className="mt-3 font-medium">Fetching all journal entries...</p>
            </div>
        </div>
      </section>
    );
  }

  // Consistent Error State
  if (error) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="col-span-full text-center py-10 text-red-700 bg-red-50 border border-red-200 rounded-xl">
                <FiAlertTriangle className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">Error: {error}</p>
            </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-10">
          Your Journal Timeline
        </h1>
        {/* Search and Filter Controls (Consistent Card Style) */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            
            {/* Search Bar */}
            <div className="relative w-full md:w-3/5 lg:w-2/5">
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow text-base"
              />
              <FiSearch 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-start md:justify-end">
              <FiFilter className="h-5 w-5 text-orange-600 shrink-0" />
              <select
                id="emotion-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg text-base bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full md:w-48 appearance-none"
              >
                {emotionFilters.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Journal Entries Grid/List */}
        {filteredEntries.length === 0 ? (
          // Consistent Empty State Styling
          <div className="col-span-full text-center py-20 text-gray-500 bg-white rounded-xl shadow-lg border border-gray-100">
            <FiAlertTriangle className="h-8 w-8 mx-auto mb-3 text-orange-400" />
            <p className="text-lg font-semibold text-gray-700">
              No journal entries match your criteria.
            </p>
            <p className="mt-2 text-sm">
              Clear the search or try a different emotion filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default JournalEntries;