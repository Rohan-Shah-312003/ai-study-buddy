"use client"

import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Plus } from 'lucide-react';
import AIIntegration from './components/AIIntegration';
import Timer from './components/Timer';
import Flashcards from './components/Flashcards';
import Quiz from './components/Quiz';
import NavigationTabs from './components/NavigationTabs';
import Stats from './components/Stats';

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

  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  // Multiple AI provider support
  const callAI = async (prompt) => {
    if (apiKey && apiKey.startsWith('gsk_')) {
      return await callGroq(prompt);
    }
    else {
      throw new Error('Invalid API key format');
    }
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

                      DO NOT RETURN ANYTHING ELSE EVEN "Here's 5 multiple choice quiz questions..." TEXT
                      Make sure options are shuffled and realistic distractors.`;

      const response = await callAI(prompt);
      console.log(response);
      
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

        <AIIntegration
          studyTopic={studyTopic}
          setStudyTopic={setStudyTopic}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          generateFlashcardsWithAI={generateFlashcardsWithAI}
          getStudyTips={getStudyTips}
          isGenerating={isGenerating}
        />

        <NavigationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {activeTab === 'flashcards' && (
          <Flashcards
            flashcards={flashcards}
            currentCard={currentCard}
            setCurrentCard={setCurrentCard}
            showAnswer={showAnswer}
            setShowAnswer={setShowAnswer}
            studyStats={studyStats}
            setStudyStats={setStudyStats}
            handleCardAnswer={handleCardAnswer}
            addFlashcard={addFlashcard}
            newCard={newCard}
            setNewCard={setNewCard}
            showAddCard={showAddCard}
            setShowAddCard={setShowAddCard}
            getDifficultyColor={getDifficultyColor}
          />
        )}

        {activeTab === 'timer' && (
          <Timer
            timerMode={timerMode}
            timeLeft={timeLeft}
            isTimerActive={isTimerActive}
            setIsTimerActive={setIsTimerActive}
            setTimeLeft={setTimeLeft}
            timerCompleted={timerCompleted}
            setTimerCompleted={setTimerCompleted}
            formatTime={formatTime}
          />
        )}

        {activeTab === 'quiz' && (
          <Quiz
            quizQuestions={quizQuestions}
            currentQuiz={currentQuiz}
            setCurrentQuiz={setCurrentQuiz}
            quizStarted={quizStarted}
            setQuizStarted={setQuizStarted}
            quizResults={quizResults}
            setQuizResults={setQuizResults}
            generateQuizWithAI={generateQuizWithAI}
            generateBasicQuiz={generateBasicQuiz}
            handleQuizAnswer={handleQuizAnswer}
            isGenerating={isGenerating}
            apiKey={apiKey}
            flashcards={flashcards}
          />
        )}

        {activeTab === 'stats' && (
          <Stats
            studyStats={studyStats}
            flashcards={flashcards}
            timerCompleted={timerCompleted}
            getDifficultyColor={getDifficultyColor}
          />
        )}
      </div>
    </div>
  );
};

export default StudyBuddy;