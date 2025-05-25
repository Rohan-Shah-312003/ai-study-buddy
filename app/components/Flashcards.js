"use client"

import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Plus, CheckCircle, XCircle, Sparkles } from 'lucide-react';

const Flashcards = ({ 
  flashcards, 
  currentCard, 
  setCurrentCard, 
  showAnswer, 
  setShowAnswer, 
  studyStats, 
  setStudyStats 
}) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '', difficulty: 'medium' });

  const addFlashcard = () => {
    if (newCard.front && newCard.back) {
      const card = {
        id: Date.now(),
        ...newCard,
        mastered: false,
        aiGenerated: false
      };
      flashcards.push(card);
      setNewCard({ front: '', back: '', difficulty: 'medium' });
      setShowAddCard(false);
    }
  };

  const handleCardAnswer = (correct) => {
    setStudyStats(prev => ({
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: !correct ? prev.incorrect + 1 : prev.incorrect,
      streak: correct ? prev.streak + 1 : 0
    }));

    if (correct) {
      flashcards[currentCard] = { ...flashcards[currentCard], mastered: true };
    }

    setShowAnswer(false);
    setCurrentCard((currentCard + 1) % flashcards.length);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Flashcard Study</h2>
        <button
          onClick={() => setShowAddCard(!showAddCard)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          Add Manual Card
        </button>
      </div>

      {showAddCard && (
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Front of card (question)"
              value={newCard.front}
              onChange={(e) => setNewCard(prev => ({ ...prev, front: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Back of card (answer)"
              value={newCard.back}
              onChange={(e) => setNewCard(prev => ({ ...prev, back: e.target.value }))}
              className="w-full p-3 border rounded-lg h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-3">
              <select
                value={newCard.difficulty}
                onChange={(e) => setNewCard(prev => ({ ...prev, difficulty: e.target.value }))}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button
                onClick={addFlashcard}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}

      {flashcards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No flashcards yet!</p>
          <p className="text-sm">Generate AI flashcards above or add manual cards to get started.</p>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm opacity-90">
              Card {currentCard + 1} of {flashcards.length}
            </span>
            <div className="flex items-center gap-2">
              {flashcards[currentCard]?.aiGenerated && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white bg-opacity-20">
                  <Sparkles size={12} />
                  AI
                </span>
              )}
              <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(flashcards[currentCard]?.difficulty)} text-gray-700 bg-white`}>
                {flashcards[currentCard]?.difficulty}
              </span>
            </div>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 min-h-32 flex items-center justify-center text-center">
            <div>
              <h3 className="text-lg font-medium mb-4">
                {showAnswer ? 'Answer:' : 'Question:'}
              </h3>
              <p className="text-xl">
                {showAnswer ? flashcards[currentCard]?.back : flashcards[currentCard]?.front}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-6">
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Show Answer
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleCardAnswer(false)}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <XCircle size={18} />
                  Incorrect
                </button>
                <button
                  onClick={() => handleCardAnswer(true)}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckCircle size={18} />
                  Correct
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
