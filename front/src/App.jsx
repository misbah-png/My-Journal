import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from './components/Navbar/Navbar';
import Home from './components/pages/Home';
import TasksAndHabits from './components/pages/TasksAndHabits';
import CalendarPage from './components/pages/CalendarPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import RoutinePlanner from './components/RoutinePlanner/RoutinePlanner';
import './App.css';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Track login state with Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className={isDarkMode ? 'dark-theme app-container' : 'app-container'}>
      <Router>
        {isLoggedIn && <Navbar />}
        <div className="app-content">
          <Routes>
            <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!isLoggedIn ? <Register /> : <Navigate to="/" />} />
            <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
            <Route path="/tasks-habits" element={isLoggedIn ? <TasksAndHabits /> : <Navigate to="/login" />} />
            <Route path="/calendar" element={isLoggedIn ? <CalendarPage /> : <Navigate to="/login" />} />
            <Route path="/routine" element={isLoggedIn ? <RoutinePlanner /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}
