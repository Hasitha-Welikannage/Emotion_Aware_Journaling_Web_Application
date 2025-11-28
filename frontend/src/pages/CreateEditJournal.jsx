import React, { useState } from 'react';

// --- Mock Analysis Data ---
const analysisResults = [
  { emotion: "Joy", score: 45.2, color: "text-green-700", bg: "bg-green-500" },
  { emotion: "Sadness", score: 28.1, color: "text-blue-700", bg: "bg-blue-500" },
  { emotion: "Contempt", score: 10.5, color: "text-purple-700", bg: "bg-purple-500" },
];
// Helper function
const formatScore = (score) => `${score.toFixed(1)}%`;

function CreateEditJournal({ entryId }) {
  // Use state or load data based on entryId
  const isEditing = !!entryId; 
  
  const [title, setTitle] = useState(isEditing ? 'My Entry Title' : '');
  const [content, setContent] = useState(isEditing ? 'Today I felt really good after finishing that project...' : '');
  const [isAnalyzed, setIsAnalyzed] = useState(isEditing); 

  const pageTitle = isEditing ? 'Edit Journal Entry' : 'Create New Entry';

  return (
    <div className=" py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{pageTitle}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* COLUMN 1: Editor/Input Area (2/3 width) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Title Input */}
            <div className="bg-white rounded-xl shadow-md border border-orange-100 p-5">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your entry a title..."
                className="w-full text-2xl font-semibold border-b border-gray-200 focus:outline-none focus:border-orange-500 pb-2 text-gray-800"
              />
            </div>
            
            {/* Content Textarea */}
            <div className="bg-white rounded-xl shadow-md border border-orange-100 p-5">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind today? Write your entry here..."
                rows={15}
                className="w-full text-gray-700 resize-none focus:outline-none"
                style={{ minHeight: '400px' }}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-xl transition-colors">
                Cancel
              </button>
              {isEditing && (
                <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-xl transition-colors">
                  Delete
                </button>
              )}
              <button 
                onClick={() => setIsAnalyzed(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isEditing ? 'Update & Re-Analyze' : 'Save & Analyze'}
              </button>
            </div>

          </div>

          {/* COLUMN 2: Analysis Panel (1/3 width) */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border-2 border-orange-300 p-6 md:sticky md:top-8">
              <div className="flex items-center justify-between mb-4 border-b border-orange-100 pb-3">
                  <h3 className="text-xl font-bold text-orange-900">Emotion Analysis</h3>
                  <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                    {isAnalyzed ? 'Last update: Now' : 'Save to analyze'}
                  </span>
              </div>
              
              {isAnalyzed ? (
                <div className="space-y-4">
                  {/* ... (Analysis Display structure remains the same) ... */}
                  {/* Dominant Emotion Highlight */}
                  <div className="pb-2">
                    <p className="text-sm font-medium text-gray-600 mb-1">Dominant Emotion</p>
                    <div className="text-3xl font-extrabold flex items-baseline gap-2">
                        <span className={analysisResults[0].color}>
                            {analysisResults[0].emotion}
                        </span>
                        <span className="text-xl text-gray-500">{formatScore(analysisResults[0].score)}</span>
                    </div>
                  </div>

                  {/* Full Emotion Breakdown List */}
                  <div className="pt-2 border-t border-orange-100">
                    <p className="text-sm font-medium text-gray-800 mb-3">Breakdown:</p>
                    
                    {analysisResults.map((result, index) => (
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
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <p className="text-sm">Save your entry to run the AI emotion analysis.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CreateEditJournal;