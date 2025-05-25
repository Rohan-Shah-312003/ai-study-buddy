"use client"

import React, { useState } from 'react';
import { Sparkles, Target, BookmarkPlus, Loader2 } from 'lucide-react';

const AIIntegration = ({ 
  studyTopic, 
  setStudyTopic, 
  difficulty, 
  setDifficulty, 
  generateFlashcardsWithAI, 
  getStudyTips, 
  isGenerating 
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 mb-6">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Sparkles size={20} />
        AI-Powered Study Generation
      </h3>
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Enter study topic (e.g., 'Photosynthesis', 'World War 2', 'JavaScript')"
          value={studyTopic}
          onChange={(e) => setStudyTopic(e.target.value)}
          className="flex-1 p-2 rounded text-gray-800 min-w-64"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="p-2 rounded text-gray-800"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button
          onClick={generateFlashcardsWithAI}
          disabled={isGenerating}
          className="bg-white text-purple-600 px-4 py-2 rounded font-medium hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <BookmarkPlus size={16} />}
          Generate Cards
        </button>
        <button
          onClick={getStudyTips}
          disabled={isGenerating}
          className="bg-white bg-opacity-20 text-white px-4 py-2 rounded font-medium hover:bg-opacity-30 disabled:opacity-50 flex items-center gap-2"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Target size={16} />}
          Get Tips
        </button>
      </div>
    </div>
  );
};

export default AIIntegration;
