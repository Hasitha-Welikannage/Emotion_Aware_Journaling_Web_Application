import EmotionBadge from '../components/EmotionBadge.jsx';
import { useNavigate } from 'react-router-dom';

// --- Mock Data (Simulating backend response) ---
const recentEntries = [
  {
    id: 1,
    title: "Morning Reflections",
    date: "Oct 24, 2025", // Future date for your app context
    preview: "The sun came through the window differently today. It felt like a fresh start after a long week...",
    emotion: "Joy",
    score: 88
  },
  {
    id: 2,
    title: "Meeting Anxiety",
    date: "Oct 23, 2025",
    preview: "I stuttered during the presentation. I feel like everyone noticed my shaking hands...",
    emotion: "Fear",
    score: 72
  },
  {
    id: 3,
    title: "A Quiet Walk",
    date: "Oct 21, 2025",
    preview: "Walking through the park helped clear my mind. The noise of the city faded away...",
    emotion: "Neutral",
    score: 95
  }
];

// --- Main Home Component ---
function Home() {
  const navigate = useNavigate();

  return (
    <section className="bg-white lg:py-8 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome Home
          </h1>
          <p className="mt-2 text-gray-600">
            Your emotional landscape at a glance.
          </p>
        </div>

        {/* 2. Hero Action: Create New Entry */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold text-gray-800">How are you feeling right now?</h2>
            <p className="text-gray-500 text-sm mt-1">Write a new entry to get an AI analysis of your emotions.</p>
          </div>
          <button 
            // This needs to link to your Create Entry page later
            className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 hover:cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Write New Journal
          </button>
        </div>

        {/* 3. Recent Entries Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Recent Entries</h3>
            <button className="text-sm font-medium text-orange-600 hover:text-orange-800 hover:cursor-pointer" onClick={() => navigate('/app/journals')}>View all journals &rarr;</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentEntries.map((entry) => (
              <div 
                key={entry.id} 
                className="group bg-white rounded-xl shadow-sm border border-orange-100 hover:shadow-md hover:border-orange-300 transition-all duration-200 flex flex-col h-full hover:cursor-pointer"
              >
                {/* Card Content */}
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{entry.date}</span>
                    <EmotionBadge emotion={entry.emotion} score={entry.score} />
                  </div>
                  
                  <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                    {entry.title}
                  </h4>
                  {/* line-clamp-3 automatically truncates text after 3 lines */}
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {entry.preview}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="bg-orange-50/50 px-5 py-3 border-t border-orange-100 flex justify-between items-center rounded-b-xl">
                  <span className="text-xs text-orange-800 font-medium opacity-80">
                    Confidence: {entry.score}%
                  </span>
                  <button className="text-gray-400 hover:text-orange-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            {/* "Add New" Placeholder Card (Optional visual cue) */}
            <button className="border-2 border-dashed border-orange-200 rounded-xl flex flex-col items-center justify-center p-8 text-center text-gray-400 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 transition-all cursor-pointer h-full min-h-[200px]">
               <div className="w-10 h-10 mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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