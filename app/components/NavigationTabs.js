"use client"

import React from 'react';
import { BookOpen, Clock, Target, TrendingUp } from 'lucide-react';

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
    { id: 'timer', label: 'Study Timer', icon: Clock },
    { id: 'quiz', label: 'Quiz Mode', icon: Target },
    { id: 'stats', label: 'Progress', icon: TrendingUp }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6 border-b">
      {tabs.map(tab => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <Icon size={18} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default NavigationTabs;
