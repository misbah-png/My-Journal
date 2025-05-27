import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaTasks, FaCalendarAlt, FaBars } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import logo from '../../assets/images/logo.png';
import './Navbar.css';

export default function Navbar({ isDarkMode, setIsDarkMode }) {
  const { pathname } = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    let timeoutId;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const mobile = window.innerWidth <= 768;
        setIsMobile(mobile);
        if (!mobile) setIsDrawerOpen(false); // close drawer on desktop
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isActive = (path) => (pathname === path ? 'nav-link active' : 'nav-link');

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    window.location.href = '/login';
  };

  return (
    <>
      {/* ===== Mobile Header & Drawer ===== */}
      {isMobile && (
        <>
          <header className="top-header">
            <img
              src={logo}
              alt="Logo"
              className="logo-img"
              style={{ height: '40px' }}
            />
            <button
              className="menu-toggle"
              aria-label="Toggle menu"
              onClick={() => setIsDrawerOpen((prev) => !prev)}
            >
              <FaBars />
            </button>
          </header>

          <nav className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`}>
            <Link to="/" className={isActive('/')} onClick={() => setIsDrawerOpen(false)}>
              <FaHome /> <span>Home</span>
            </Link>
            <Link
              to="/tasks-habits"
              className={isActive('/tasks-habits')}
              onClick={() => setIsDrawerOpen(false)}
            >
              <FaTasks /> <span>Tasks & Habits</span>
            </Link>
            <Link
              to="/calendar"
              className={isActive('/calendar')}
              onClick={() => setIsDrawerOpen(false)}
            >
              <FaCalendarAlt /> <span>Calendar</span>
            </Link>

            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </nav>

          {/* Overlay to close drawer when clicking outside */}
          {isDrawerOpen && (
            <div
              className="overlay"
              onClick={() => setIsDrawerOpen(false)}
              aria-hidden="true"
            />
          )}
        </>
      )}

      {/* ===== Desktop Sidebar ===== */}
      {!isMobile && (
        <nav className="sidebar-desktop">
          <div className="brand">
            <img
              src={logo}
              alt="Logo"
              className="logo-img"
              style={{ height: '40px' }}
            />

            <h1 className="brand-name">Task Manager</h1>
            
          </div>

          <div className="nav-links">
            <Link to="/" className={isActive('/')}>
              <FaHome />
              <span>Home</span>
            </Link>
            <Link to="/tasks-habits" className={isActive('/tasks-habits')}>
              <FaTasks />
              <span>Tasks & Habits</span>
            </Link>
            <Link to="/calendar" className={isActive('/calendar')}>
              <FaCalendarAlt />
              <span>Calendar</span>
            </Link>
          </div>

          <div className="sidebar-bottom">
            <label className="dark-toggle">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={() => setIsDarkMode(!isDarkMode)}
              />
              <span className="slider" />
            </label>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </nav>
      )}
    </>
  );
}
