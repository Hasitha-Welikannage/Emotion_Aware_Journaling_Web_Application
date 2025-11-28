import React, { useState } from 'react';
import EmotionBadge from '../components/EmotionBadge';

// --- Expanded Mock Data for the List Page ---
const allJournalEntries = [
  { id: 1, title: "Morning Reflections", date: "Oct 24, 2025", preview: "The sun came through the window differently today. It felt like a fresh start after a long week and I was excited about the plans ahead.", emotion: "Joy", score: 88 },
  { id: 2, title: "Meeting Anxiety", date: "Oct 23, 2025", preview: "I stuttered during the presentation. I feel like everyone noticed my shaking hands and racing heart. It was a really stressful moment.", emotion: "Fear", score: 72 },
  { id: 3, title: "A Quiet Walk", date: "Oct 21, 2025", preview: "Walking through the park helped clear my mind. The noise of the city faded away, leaving only the sound of the leaves rustling.", emotion: "Neutral", score: 95 },
  { id: 4, title: "The Argument", date: "Oct 19, 2025", preview: "I couldn't believe the tone he used. It made me feel completely dismissed and misunderstood, leading to a long confrontation.", emotion: "Anger", score: 78 },
  { id: 5, title: "Weekend Trip Success", date: "Oct 15, 2025", preview: "Everything went perfectly on the trip. The weather, the company, the food, all combined for a memorable and happy experience.", emotion: "Joy", score: 92 },
  { id: 6, title: "A Rainy Afternoon", date: "Oct 12, 2025", preview: "I found myself staring out the window for hours, feeling heavy and unfocused, unsure of what to do next with my afternoon.", emotion: "Sadness", score: 55 },
];

// NOTE: You must ensure the EmotionBadge component is available and defined correctly.

function JournalEntries() {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering Logic (simplified)
  const filteredEntries = allJournalEntries
    .filter(entry => filter === 'All' || entry.emotion === filter)
    .filter(entry => entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || entry.preview.toLowerCase().includes(searchTerm.toLowerCase()));

  const emotionFilters = ['All', 'Joy', 'Sadness', 'Anger', 'Fear', 'Neutral'];

  return (
    <div className=" py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Journal Timeline</h1>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8 border border-orange-100">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                
                {/* Search Bar */}
                <div className="relative w-full md:w-2/5">
                    <input
                        type="text"
                        placeholder="Search by title or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Filter Dropdown */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <label htmlFor="emotion-filter" className="text-sm font-medium text-gray-600 whitespace-nowrap">Filter by Emotion:</label>
                    <select
                        id="emotion-filter"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full md:w-auto"
                    >
                        {emotionFilters.map(e => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>


        {/* Journal Entries Grid/List */}
        {/* CHANGED: grid-cols-1 on mobile, lg:grid-cols-3 for desktop view */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              // Individual Entry Card 
              <div 
                key={entry.id} 
                className="group bg-white rounded-xl shadow-md hover:shadow-lg border border-orange-100 hover:border-orange-300 transition-all duration-200 cursor-pointer p-5 flex flex-col h-full"
              >
                {/* Top Row: Date & Emotion */}
                <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {entry.date}
                    </span>
                    <EmotionBadge emotion={entry.emotion} score={entry.score} />
                </div>

                {/* Title and Preview */}
                <div className="flex-1 min-w-0 mb-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-orange-700 transition-colors">
                    {entry.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {entry.preview}
                  </p>
                </div>

                {/* Action Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-orange-50/50">
                    <span className="text-xs font-medium text-orange-800 opacity-90">
                        Top Score: {entry.score}%
                    </span>
                    <button className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-800 transition-colors font-medium">
                        View Details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

              </div>
            ))
          ) : (
            // No results state
            <div className="lg:col-span-3 text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-orange-100">
                <p className="text-lg font-medium">No journal entries match your criteria.</p>
                <p className="mt-2 text-sm">Clear the search or try a different emotion filter.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default JournalEntries;