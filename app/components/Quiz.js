"use client"

import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const Quiz = ({ 
  quizQuestions, 
  currentQuiz, 
  setCurrentQuiz, 
  quizStarted, 
  setQuizStarted, 
  quizResults, 
  setQuizResults, 
  generateQuizWithAI, 
  generateBasicQuiz, 
  isGenerating, 
  apiKey,
  flashcards
}) => {
  const handleQuizAnswer = (selectedAnswer) => {
    const isCorrect = selectedAnswer === quizQuestions[currentQuiz].correct;
    setQuizResults(prev => [...prev, { question: currentQuiz, correct: isCorrect }]);

    if (currentQuiz < quizQuestions.length - 1) {
      setCurrentQuiz(prev => prev + 1);
    } else {
      setQuizStarted(false);
    }
  };

  return (
    <div className="space-y-6">
      {!quizStarted && quizResults.length === 0 ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quiz Mode</h2>
          <p className="text-gray-600 mb-6">Test your knowledge with AI-generated quizzes</p>
          <div className="flex justify-center gap-3">
            {apiKey && (
              <button
                onClick={generateQuizWithAI}
                disabled={flashcards.length === 0 || isGenerating}
                className="bg-blue-600 text-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                AI Quiz
              </button>
            )}
            <button
              onClick={generateBasicQuiz}
              disabled={flashcards.length === 0}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Basic Quiz
            </button>
          </div>
        </div>
      ) : quizStarted ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg text-gray-600 font-semibold">Question {currentQuiz + 1} of {quizQuestions.length}</h3>
            <div className="bg-gray-200 text-gray-600 rounded-full h-2 w-32">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuiz + 1) / quizQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h4 className="text-xl text-gray-600 font-medium mb-4">{quizQuestions[currentQuiz]?.question}</h4>
            <div className="grid text-gray-600 gap-3">
              {quizQuestions[currentQuiz]?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(option)}
                  className="text-left text-gray-600 p-3 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Quiz Complete!</h3>
          <div className="bg-green-100 p-6 rounded-lg mb-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {quizResults.filter(r => r.correct).length}/{quizResults.length}
            </div>
            <div className="text-gray-700">Correct Answers</div>
          </div>
          <div className="flex justify-center gap-3">
            {apiKey && (
              <button
                onClick={() => {
                  setQuizResults([]);
                  generateQuizWithAI();
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Sparkles size={16} />
                New AI Quiz
              </button>
            )}
            <button
              onClick={generateBasicQuiz}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              New Basic Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
