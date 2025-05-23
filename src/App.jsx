import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Home from './components/pages/Home';
import TasksAndHabits from './components/pages/TasksAndHabits';
import CalendarPage from './components/pages/CalendarPage';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('loggedIn') === 'true');

  // Listen for login/logout updates
  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(localStorage.getItem('loggedIn') === 'true');
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <Router>
      {isLoggedIn && <Navbar />}
      <div className="app-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />

          {/* Protected Routes */}
          <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
          <Route path="/tasks-habits" element={isLoggedIn ? <TasksAndHabits /> : <Navigate to="/login" />} />
          <Route path="/calendar" element={isLoggedIn ? <CalendarPage /> : <Navigate to="/login" />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


