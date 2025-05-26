import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Home from './components/pages/Home';
import TasksAndHabits from './components/pages/TasksAndHabits';
import CalendarPage from './components/pages/CalendarPage';
import Login from './components/SignUp/Login';
import Register from './components/SignUp/Register';
import RoutinePlanner from './components/RoutinePlanner/RoutinePlanner';
import './App.css';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('loggedIn') === 'true');

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Listen for login/logout in other tabs
  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(localStorage.getItem('loggedIn') === 'true');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className={isDarkMode ? 'dark-theme app-container' : 'app-container'}>
      

      <Router>
        {isLoggedIn && <Navbar />}
        <div className="app-content">
          <Routes>
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
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
