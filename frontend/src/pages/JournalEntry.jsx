import { useNavigate } from "react-router-dom";
// --- Mock Data for a Finished Entry ---
const mockEntryData = {
    id: 1,
    title: "My Entry Title",
    content: "Today I felt really good after finishing that project. It was tough, but the feeling of accomplishment has given me a real boost of energy and motivation. It makes all the hard work worth it. I celebrated with a long walk and noticed how bright the sun was, which just amplified the feeling of joy. I hope tomorrow brings the same positive energy. \n\nI should remember to schedule more time for these kinds of projects because the struggle and the resulting success are incredibly rewarding.",
    date: "October 24, 2025",
    analysis: [
        { emotion: "Joy", score: 45.2, color: "text-green-700", bg: "bg-green-500" },
        { emotion: "Sadness", score: 28.1, color: "text-blue-700", bg: "bg-blue-500" },
        { emotion: "Contempt", score: 10.5, color: "text-purple-700", bg: "bg-purple-500" },
    ],
};
// Helper function
const formatScore = (score) => `${score.toFixed(1)}%`;

function JournalEntry() {
    const entry = mockEntryData;

    // We replace newlines (\n) with <br/> for proper paragraph formatting
    const formattedContent = entry.content.split('\n').map((line, index) => (
        <span key={index}>
            {line}
            <br />
        </span>
    ));

    return (
        <div className=" py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header and Actions */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {entry.title}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Written on {entry.date}
                        </p>
                    </div>
                    <button onClick={() => navigate(`/edit/${entry.id}`)} className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Entry
                    </button>
                </div>

                {/* Content and Analysis Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* COLUMN 1: Read-Only Content (2/3 width) */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-md border border-orange-100 p-6 text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                            {formattedContent}
                        </div>
                    </div>

                    {/* COLUMN 2: Analysis Panel (1/3 width) - Reused structure */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg border-2 border-orange-300 p-6 md:sticky md:top-8">
                            <h3 className="text-xl font-bold text-orange-900 mb-4 border-b border-orange-100 pb-3">
                                Final Analysis
                            </h3>
                            
                            {/* Dominant Emotion Highlight */}
                            <div className="pb-2">
                                <p className="text-sm font-medium text-gray-600 mb-1">Dominant Emotion</p>
                                <div className="text-3xl font-extrabold flex items-baseline gap-2">
                                    <span className={entry.analysis[0].color}>
                                        {entry.analysis[0].emotion}
                                    </span>
                                    <span className="text-xl text-gray-500">{formatScore(entry.analysis[0].score)}</span>
                                </div>
                            </div>

                            {/* Full Emotion Breakdown List */}
                            <div className="pt-4 border-t border-orange-100 mt-2">
                                <p className="text-sm font-medium text-gray-800 mb-3">Breakdown:</p>
                                {entry.analysis.map((result, index) => (
                                    <div key={index} className="flex flex-col mb-3">
                                        <div className="flex justify-between mb-1">
                                            <span className={`font-medium ${result.color} text-sm`}>
                                                {result.emotion}
                                            </span>
                                            <span className={`text-sm font-semibold ${result.color}`}>
                                                {formatScore(result.score)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${result.bg}`}
                                                style={{ width: `${result.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JournalEntry;