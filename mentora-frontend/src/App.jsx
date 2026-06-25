import React from 'react';
import {BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './pages/Dashboard/DashboardPage';
import DocumentListPage from './pages/Documents/DocumentListPage';

import FlashcardListPage from './pages/Flashcards/FlashcardListPage';
import ProfilePage from './pages/Profile/ProfilePage';
import { useAuth } from './context/AuthContext';
import DocumentLayout from './pages/Documents/DocumentLayout';
import ChatTab from './components/documents/ChatTab';
import AiActionsTab from './components/documents/AiActionsTab';
import FlashcardsTab from './components/flashcards/FlashcardsTab';
import QuizTab from './components/quizzes/QuizTab';
import DocumentContent from './components/documents/DocumentContent';

const app = () => {
  const {isAuthenticated, loading} = useAuth(); 

  if(loading){
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}

        <Route element={<ProtectedRoute />} >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentListPage />} />
          <Route
            path="/documents/:id"
            element={<DocumentLayout />}
          >
            <Route
              index
              element={
                <Navigate
                  to="content"
                  replace
                />
              }
            />

            <Route
              path="content"
              element={<DocumentContent />}
            />

            <Route
              path="chat"
              element={<ChatTab />}
            />

            <Route
              path="ai-actions"
              element={<AiActionsTab />}
            />

            <Route
              path="flashcards"
              element={<FlashcardsTab />}
            />

            <Route
              path="quizzes"
              element={<QuizTab />}
            />
          </Route>
          <Route path="/flashcards" element={<FlashcardListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default app;