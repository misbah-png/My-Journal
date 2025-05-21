import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaTasks, FaCalendarAlt } from 'react-icons/fa';

export default function Navbar() {
  const { pathname } = useLocation();

  const isActive = (path) =>
    pathname === path
      ? 'flex items-center space-x-2 text-blue-500 font-bold bg-blue-50 rounded-md px-3 py-2'
      : 'flex items-center space-x-2 text-gray-600 hover:bg-gray-100 rounded-md px-3 py-2';

  return (
    <nav
      className="fixed left-6 top-6 bottom-6 bg-blue-400 shadow-md rounded-[15px] flex flex-col items-start px-6 py-8"
      style={{ width: 220 }}
    >
      <h1 className="text-xl font-semibold text-gray-800 mb-10">name</h1>
      <div className="flex flex-col space-y-4 w-full">
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
    </nav>
  );
}
