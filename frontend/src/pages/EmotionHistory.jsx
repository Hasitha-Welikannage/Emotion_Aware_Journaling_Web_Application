import { useEffect, useState } from "react";
import { getJournalEntries } from "../services/journal.js";
import {
  FiTrendingUp,
  FiCalendar,
  FiBarChart2,
  FiLoader,
  FiAlertTriangle,
  FiSmile,
  FiActivity,
} from "react-icons/fi";

function EmotionHistory() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("all"); // all, week, month

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const response = await getJournalEntries();
        if (response.success) {
          setEntries(response.data);
        } else {
          setError(response.message || "Failed to load journal entries.");
        }
      } catch (err) {
        setError("Failed to load journal entries.");
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  // Filter entries based on time range
  const getFilteredEntries = () => {
    const now = new Date();
    return entries.filter((entry) => {
      const entryDate = new Date(entry.created_at);
      if (timeRange === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entryDate >= weekAgo;
      } else if (timeRange === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return entryDate >= monthAgo;
      }
      return true; // all
    });
  };

  const filteredEntries = getFilteredEntries();

  // Calculate emotion statistics
  const calculateEmotionStats = () => {
    const emotionCounts = {};
    const emotionScores = {};
    let totalEmotions = 0;

    filteredEntries.forEach((entry) => {
      entry.emotions.forEach((emotion) => {
        const name = emotion.name;
        emotionCounts[name] = (emotionCounts[name] || 0) + 1;
        emotionScores[name] = (emotionScores[name] || 0) + emotion.confidence;
        totalEmotions++;
      });
    });

    // Calculate percentages and averages
    const emotionStats = Object.entries(emotionCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / totalEmotions) * 100).toFixed(1),
        avgConfidence: (emotionScores[name] / count).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);

    return emotionStats;
  };

  const emotionStats = calculateEmotionStats();
  const topEmotion = emotionStats[0];

  // Calculate timeline data (group by date)
  const getTimelineData = () => {
    const timeline = {};

    filteredEntries.forEach((entry) => {
      const date = new Date(entry.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (!timeline[date]) {
        timeline[date] = {};
      }

      entry.emotions.forEach((emotion) => {
        timeline[date][emotion.name] =
          (timeline[date][emotion.name] || 0) + 1;
      });
    });

    return Object.entries(timeline)
      .slice(-7) // Last 7 dates
      .map(([date, emotions]) => ({
        date,
        emotions,
      }));
  };

  const timelineData = getTimelineData();

  // Get emotion color
  const getEmotionColor = (index) => {
    const colors = [
      "bg-orange-500",
      "bg-yellow-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-red-500",
      "bg-indigo-500",
    ];
    return colors[index % colors.length];
  };

  // Loading State
  if (loading) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            <FiLoader className="h-8 w-8 animate-spin mx-auto text-orange-500" />
            <p className="mt-3 font-medium">
              Loading your emotion history...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Error State
  if (error) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-10 text-red-700 bg-red-50 border border-red-200 rounded-xl">
            <FiAlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <p className="font-medium">Error: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty State
  if (filteredEntries.length === 0) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Emotion <span className="text-orange-600">History</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Track your emotional journey over time.
            </p>
          </div>
          <div className="text-center py-20 px-5 bg-white rounded-md shadow-sm border border-gray-100">
            <FiAlertTriangle className="h-8 w-8 mx-auto mb-3 text-orange-400" />
            <p className="text-lg font-semibold text-gray-700">
              No journal entries found
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Start journaling to see your emotion history and insights!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Emotion <span className="text-orange-600">History</span>
              </h1>
              <p className="text-gray-500 mt-2">
                Track your emotional journey over time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FiCalendar className="h-5 w-5 text-orange-600" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Time</option>
                <option value="month">Last 30 Days</option>
                <option value="week">Last 7 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Entries Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Entries
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {filteredEntries.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FiActivity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Most Common Emotion Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Most Common
                </p>
                {topEmotion ? (
                  <p className="text-2xl font-bold text-orange-600 mt-2 capitalize">
                    {topEmotion.name}
                  </p>
                ) : (
                  <p className="text-2xl font-bold text-gray-400 mt-2">N/A</p>
                )}
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FiSmile className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Unique Emotions Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Unique Emotions
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {emotionStats.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FiBarChart2 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Emotion Distribution */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiBarChart2 className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Emotion Distribution
              </h2>
            </div>
            <div className="space-y-4">
              {emotionStats.slice(0, 8).map((stat, index) => (
                <div key={stat.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {stat.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {stat.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${getEmotionColor(
                        index
                      )}`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Emotions List */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiTrendingUp className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Top Emotions
              </h2>
            </div>
            <div className="space-y-3">
              {emotionStats.slice(0, 8).map((stat, index) => (
                <div
                  key={stat.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 ${getEmotionColor(
                        index
                      )} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                    >
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800 capitalize">
                      {stat.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {stat.count} times
                    </p>
                    <p className="text-xs text-gray-500">
                      Avg: {stat.avgConfidence}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline View */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <FiCalendar className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Timeline
            </h2>
          </div>
          <div className="space-y-4">
            {timelineData.length > 0 ? (
              timelineData.map((day, index) => (
                <div
                  key={index}
                  className="border-l-4 border-orange-500 pl-4 py-2"
                >
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    {day.date}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(day.emotions).map(
                      ([emotion, count], idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200"
                        >
                          {emotion} ({count})
                        </span>
                      )
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No timeline data available for the selected period.
              </p>
            )}
          </div>
        </div>

        {/* Insights Section */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-md shadow-sm border border-orange-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Insights & Patterns
            </h2>
          </div>
          <div className="space-y-3">
            {topEmotion && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  <span className="font-semibold capitalize">
                    {topEmotion.name}
                  </span>{" "}
                  appears most frequently in your journals (
                  {topEmotion.percentage}% of all emotions detected).
                </p>
              </div>
            )}
            {emotionStats.length >= 3 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  Your emotional range includes{" "}
                  <span className="font-semibold">
                    {emotionStats.length} different emotions
                  </span>
                  , showing a diverse emotional experience.
                </p>
              </div>
            )}
            {filteredEntries.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <p className="text-gray-700">
                  You've created{" "}
                  <span className="font-semibold">
                    {filteredEntries.length} journal{" "}
                    {filteredEntries.length === 1 ? "entry" : "entries"}
                  </span>{" "}
                  {timeRange === "week"
                    ? "in the last 7 days"
                    : timeRange === "month"
                    ? "in the last 30 days"
                    : "in total"}
                  . Keep up the great work!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EmotionHistory;
