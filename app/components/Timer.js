"use client"

import React from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

const Timer = ({ 
  timerMode, 
  timeLeft, 
  isTimerActive, 
  setIsTimerActive, 
  setTimeLeft, 
  timerCompleted, 
  setTimerCompleted 
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Pomodoro Timer</h2>

      <div className="bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl p-8">
        <div className="mb-4">
          <span className="text-sm opacity-90 uppercase tracking-wide">
            {timerMode === 'pomodoro' ? 'Focus Time' : 'Break Time'}
          </span>
        </div>

        <div className="text-6xl font-bold mb-6 font-mono">
          {formatTime(timeLeft)}
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => setIsTimerActive(!isTimerActive)}
            className="flex items-center gap-2 bg-white text-red-500 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            {isTimerActive ? <Pause size={20} /> : <Play size={20} />}
            {isTimerActive ? 'Pause' : 'Start'}
          </button>

          <button
            onClick={() => {
              setIsTimerActive(false);
              setTimeLeft(timerMode === 'pomodoro' ? 25 * 60 : 5 * 60);
            }}
            className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-30 transition-colors"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-100 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{timerCompleted}</div>
          <div className="text-sm text-gray-600">Sessions Completed</div>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{0}</div>
          <div className="text-sm text-gray-600">Current Streak</div>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{Math.round((timerCompleted * 25) / 60)}h</div>
          <div className="text-sm text-gray-600">Total Study Time</div>
        </div>
      </div>
    </div>
  );
};

export default Timer;
