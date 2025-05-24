"use client"

import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Brain, Target, Plus, Play, Pause, RotateCcw, CheckCircle, XCircle, Star, TrendingUp, Sparkles, BookmarkPlus, Loader2 } from 'lucide-react';

const StudyBuddy = () => {
  const [activeTab, setActiveTab] = useState('flashcards');
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyStats, setStudyStats] = useState({ correct: 0, incorrect: 0, streak: 0 });

  // AI Integration states
  const [studyTopic, setStudyTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  // const [apiKey, setApiKey] = useState('');
  const [showApiSetup, setShowApiSetup] = useState(false);

  // Timer states
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(0);

  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizResults, setQuizResults] = useState([]);

  // New flashcard form
  const [newCard, setNewCard] = useState({ front: '', back: '', difficulty: 'medium' });
  const [showAddCard, setShowAddCard] = useState(false);

  const apiKey = process.env.GROQ_API_KEY;

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      setTimerCompleted(prev => prev + 1);
      if (timerMode === 'pomodoro') {
        setTimerMode('break');
        setTimeLeft(5 * 60);
      } else {
        setTimerMode('pomodoro');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, timerMode]);

  // AI Integration Functions
  const generateFlashcardsWithAI = async () => {
    if (!studyTopic.trim()) {
      alert('Please enter a study topic first!');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate 8 educational flashcards for the topic: "${studyTopic}". 
      Difficulty level: ${difficulty}.
      
      Return ONLY a JSON array with this exact format:
      [
        {
          "front": "Question here?",
          "back": "Clear, concise answer here",
          "difficulty": "${difficulty}"
        }
      ]
      
      Dont give ANY OTHER SORT OF TEXT INCLUDING "Here are 8 educational flashcards for the topic "xxx" at an easy difficulty level:"
      Make questions educational, clear, and appropriate for ${difficulty} level study.`;

      const response = await callAI(prompt);
      const aiFlashcards = JSON.parse(response);

      const newFlashcards = aiFlashcards.map((card, index) => ({
        id: Date.now() + index,
        front: card.front,
        back: card.back,
        difficulty: card.difficulty || difficulty,
        mastered: false,
        aiGenerated: true
      }));

      setFlashcards(prev => [...prev, ...newFlashcards]);
      setCurrentCard(0);
      alert(`Generated ${newFlashcards.length} flashcards successfully!`);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Failed to generate flashcards. Please check your API key and try again.');
    }
    setIsGenerating(false);
  };

  const generateQuizWithAI = async () => {
    if (flashcards.length === 0) {
      alert('Please add some flashcards first!');
      return;
    }

    setIsGenerating(true);
    try {
      const cardContent = flashcards.slice(0, 5).map(card =>
        `Q: ${card.front}\nA: ${card.back}`
      ).join('\n\n');

      const prompt = `Based on these study materials, create 5 multiple choice quiz questions:

${cardContent}

Return ONLY a JSON array with this exact format:
[
  {
    "question": "Question text here?",
    "correct": "Correct answer",
    "options": ["Correct answer", "Wrong option 1", "Wrong option 2", "Wrong option 3"]
  }
]

Make sure options are shuffled and realistic distractors.`;

      const response = await callAI(prompt);
      const aiQuestions = JSON.parse(response);

      setQuizQuestions(aiQuestions);
      setCurrentQuiz(0);
      setQuizStarted(true);
      setQuizResults([]);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Using flashcard content instead.');
      generateBasicQuiz();
    }
    setIsGenerating(false);
  };

  const getStudyTips = async () => {
    if (!studyTopic.trim()) {
      alert('Please enter a study topic to get personalized tips!');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Provide 3 specific, actionable study tips for learning about "${studyTopic}". 
      Make them practical and evidence-based. Keep each tip to 1-2 sentences.
      
      Format as a simple numbered list:
      1. [Tip]
      2. [Tip]  
      3. [Tip]`;

      const tips = await callAI(prompt);
      alert(`Study Tips for ${studyTopic}:\n\n${tips}`);
    } catch (error) {
      console.error('Error getting study tips:', error);
      alert('Failed to get study tips. Please check your API key.');
    }
    setIsGenerating(false);
  };

  // Multiple AI provider support
  const callAI = async (prompt) => {
    // Try Hugging Face first (free tier available)
    // if (apiKey.startsWith('hf_')) {
    //   return await callHuggingFace(prompt);
    // }
    // Fallback to OpenAI
    // else if (apiKey.startsWith('sk-')) {
    //   return await callOpenAI(prompt);
    // }
    // Try Groq (free tier)
    // else
     if (apiKey.startsWith('gsk_')) {
      return await callGroq(prompt);
    }
    else {
      throw new Error('Invalid API key format');
    }
  };

  const callHuggingFace = async (prompt) => {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) throw new Error('Hugging Face API error');
    const data = await response.json();
    return data[0]?.generated_text || '';
  };

  const callOpenAI = async (prompt) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      })
    });

    if (!response.ok) throw new Error('OpenAI API error');
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };

  const callGroq = async (prompt) => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      })
    });

    if (!response.ok) throw new Error('Groq API error');
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };

  // Fallback quiz generation
  const generateBasicQuiz = () => {
    const questions = flashcards.slice(0, 5).map(card => ({
      question: card.front,
      correct: card.back,
      options: [card.back, 'Alternative answer A', 'Alternative answer B', 'Alternative answer C'].sort(() => Math.random() - 0.5)
    }));
    setQuizQuestions(questions);
    setCurrentQuiz(0);
    setQuizStarted(true);
    setQuizResults([]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCardAnswer = (correct) => {
    setStudyStats(prev => ({
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: !correct ? prev.incorrect + 1 : prev.incorrect,
      streak: correct ? prev.streak + 1 : 0
    }));

    if (correct) {
      setFlashcards(prev => prev.map(card =>
        card.id === flashcards[currentCard].id
          ? { ...card, mastered: true }
          : card
      ));
    }

    setShowAnswer(false);
    setCurrentCard(prev => (prev + 1) % flashcards.length);
  };

  const addFlashcard = () => {
    if (newCard.front && newCard.back) {
      const card = {
        id: Date.now(),
        ...newCard,
        mastered: false,
        aiGenerated: false
      };
      setFlashcards(prev => [...prev, card]);
      setNewCard({ front: '', back: '', difficulty: 'medium' });
      setShowAddCard(false);
    }
  };

  const handleQuizAnswer = (selectedAnswer) => {
    const isCorrect = selectedAnswer === quizQuestions[currentQuiz].correct;
    setQuizResults(prev => [...prev, { question: currentQuiz, correct: isCorrect }]);

    if (currentQuiz < quizQuestions.length - 1) {
      setCurrentQuiz(prev => prev + 1);
    } else {
      setQuizStarted(false);
    }
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
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2 flex items-center justify-center gap-2">
          <Brain className="text-blue-600" />
          AI Study Buddy
          <Sparkles className="text-yellow-500" />
        </h1>
        <p className="text-gray-600 text-center mb-6">Your intelligent AI-powered companion for effective learning</p>

        {/* API Setup */}
        {!apiKey && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">🔑 Setup AI Integration</h3>
            <p className="text-yellow-700 text-sm mb-3">To use AI features, add your API key from one of these free providers:</p>
            <div className="space-y-2 text-sm text-yellow-700 mb-3">
              <div>• <strong>Groq (Recommended):</strong> Free tier available - get key at console.groq.com</div>
              <div>• <strong>Hugging Face:</strong> Free tier - get key at huggingface.co/settings/tokens</div>
              <div>• <strong>OpenAI:</strong> Paid service - get key at platform.openai.com</div>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter your API key (e.g., gsk_... for Groq)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setApiKey(apiKey)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* AI Topic Input */}
        {apiKey && (
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
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 border-b">
          {[
            { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
            { id: 'timer', label: 'Study Timer', icon: Clock },
            { id: 'quiz', label: 'Quiz Mode', icon: Target },
            { id: 'stats', label: 'Progress', icon: TrendingUp }
          ].map(tab => {
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

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
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
        )}

        {/* Timer Tab */}
        {activeTab === 'timer' && (
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
                <div className="text-2xl font-bold text-green-600">{studyStats.streak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Math.round((timerCompleted * 25) / 60)}h</div>
                <div className="text-sm text-gray-600">Total Study Time</div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="space-y-6">
            {!quizStarted && quizResults.length === 0 ? (
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quiz Mode</h2>
                <p className="text-gray-600 mb-6">Test your knowledge with AI-generated quizzes</p>
                <div className="flex justify-center gap-3">
                  {apiKey ? (
                    <button
                      onClick={generateQuizWithAI}
                      disabled={flashcards.length === 0 || isGenerating}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                      AI Quiz
                    </button>
                  ) : null}
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
                  <h3 className="text-lg font-semibold">Question {currentQuiz + 1} of {quizQuestions.length}</h3>
                  <div className="bg-gray-200 rounded-full h-2 w-32">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${((currentQuiz + 1) / quizQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h4 className="text-xl font-medium mb-4">{quizQuestions[currentQuiz]?.question}</h4>
                  <div className="grid gap-3">
                    {quizQuestions[currentQuiz]?.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuizAnswer(option)}
                        className="text-left p-3 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
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
                    onClick={() => {
                      setQuizResults([]);
                      generateBasicQuiz();
                    }}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setQuizResults([])}
                    className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                  >
                    Back to Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 text-center">Study Progress</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{flashcards.length}</div>
                <div className="text-sm text-gray-600">Total Cards</div>
              </div>

              <div className="bg-green-100 p-4 rounded-lg text-center">
                <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{flashcards.filter(c => c.mastered).length}</div>
                <div className="text-sm text-gray-600">Mastered</div>
              </div>

              <div className="bg-yellow-100 p-4 rounded-lg text-center">
                <Target className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">
                  {studyStats.correct + studyStats.incorrect > 0
                    ? Math.round((studyStats.correct / (studyStats.correct + studyStats.incorrect)) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>

              <div className="bg-purple-100 p-4 rounded-lg text-center">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{timerCompleted}</div>
                <div className="text-sm text-gray-600">Study Sessions</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Card Difficulty Distribution</h3>
                <div className="space-y-2">
                  {['easy', 'medium', 'hard'].map(difficulty => {
                    const count = flashcards.filter(c => c.difficulty === difficulty).length;
                    const percentage = flashcards.length ? (count / flashcards.length) * 100 : 0;
                    return (
                      <div key={difficulty} className="flex items-center gap-3">
                        <span className={`w-16 text-sm capitalize ${getDifficultyColor(difficulty)} px-2 py-1 rounded`}>
                          {difficulty}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full ${difficulty === 'easy' ? 'bg-green-500' :
                                difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">AI vs Manual Cards</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <span className="text-sm">AI Generated</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {flashcards.filter(c => c.aiGenerated).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Manual</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {flashcards.filter(c => !c.aiGenerated).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {flashcards.length > 0 && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Study Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Focus Area:</strong>
                    {flashcards.filter(c => !c.mastered).length > 0
                      ? ` ${flashcards.filter(c => !c.mastered).length} cards need review`
                      : ' Great job! All cards mastered!'}
                  </div>
                  <div>
                    <strong>Next Session:</strong>
                    {studyStats.streak >= 5
                      ? ' Take a break, you\'re on fire! 🔥'
                      : ' Keep going to build your streak!'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with API Info */}
      {apiKey && (
        <div className="bg-white rounded-lg shadow p-4 text-center text-sm text-gray-600">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="font-medium">AI Integration Active</span>
          </div>
          <p>
            Using {apiKey.startsWith('gsk_') ? 'Groq' : apiKey.startsWith('hf_') ? 'Hugging Face' : 'OpenAI'} API
            {apiKey && (
              <button
                onClick={() => setApiKey('')}
                className="ml-2 text-red-500 hover:text-red-700 underline"
              >
                Disconnect
              </button>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default StudyBuddy;