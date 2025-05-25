"use client"

import React from 'react';

const Stats = ({ studyStats }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Study Progress</h2>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-blue-100 p-6 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{studyStats.correct}</div>
          <div className="text-sm text-gray-600">Correct Answers</div>
        </div>
        <div className="bg-red-100 p-6 rounded-lg">
          <div className="text-3xl font-bold text-red-600">{studyStats.incorrect}</div>
          <div className="text-sm text-gray-600">Incorrect Answers</div>
        </div>
        <div className="bg-green-100 p-6 rounded-lg">
          <div className="text-3xl font-bold text-green-600">{studyStats.streak}</div>
          <div className="text-sm text-gray-600">Current Streak</div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
