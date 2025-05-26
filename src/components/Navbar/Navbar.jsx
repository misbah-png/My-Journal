import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaTasks, FaCalendarAlt, FaBars } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const isActive = (path) => pathname === path ? 'nav-link active' : 'nav-link';

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    window.location.href = '/login';
  };

  return (
    <>
      {/* ===== Mobile Header ===== */}
      {isMobile && (
        <>
          <header className="top-header">
            <img src="/logo.png" alt="Logo" className="logo-img" />
            <button className="menu-toggle" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
              <FaBars />
            </button>
          </header>

          <nav className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`}>
            <Link to="/" className={isActive('/')} onClick={() => setIsDrawerOpen(false)}>
              <FaHome /> <span>Home</span>
            </Link>
            <Link to="/tasks-habits" className={isActive('/tasks-habits')} onClick={() => setIsDrawerOpen(false)}>
              <FaTasks /> <span>Tasks & Habits</span>
            </Link>
            <Link to="/calendar" className={isActive('/calendar')} onClick={() => setIsDrawerOpen(false)}>
              <FaCalendarAlt /> <span>Calendar</span>
            </Link>
            <label className="dark-toggle">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <span className="slider" />
            </label>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </nav>

          {isDrawerOpen && <div className="overlay" onClick={() => setIsDrawerOpen(false)} />}
        </>
      )}

      {/* ===== Desktop Sidebar ===== */}
      {!isMobile && (
        <nav className={`sidebar-desktop ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="brand" onClick={() => setIsCollapsed(!isCollapsed)}>
            <img src="/logo.png" alt="Logo" className="logo-img" />
            {!isCollapsed && <h1>My Journal</h1>}
          </div>

          <div className="nav-links">
            <Link to="/" className={isActive('/')}>
              <FaHome />
              {!isCollapsed && <span>Home</span>}
            </Link>
            <Link to="/tasks-habits" className={isActive('/tasks-habits')}>
              <FaTasks />
              {!isCollapsed && <span>Tasks & Habits</span>}
            </Link>
            <Link to="/calendar" className={isActive('/calendar')}>
              <FaCalendarAlt />
              {!isCollapsed && <span>Calendar</span>}
            </Link>
          </div>

          <div className="sidebar-bottom">
            <label className="dark-toggle">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <span className="slider" />
            </label>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </nav>
      )}
    </>
  );
}
