import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './Home.css';
import RoutinePlanner from '../RoutinePlanner/RoutinePlanner'; 

function getGreeting(hour) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function StatRing({ title, value, max = 100, color, to }) {
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDashoffset = 282 - (282 * percentage) / 100; 

  return (
    <Link to={to} className="stat-ring">
      <svg viewBox="0 0 100 100">
        <circle className="bg" cx="50" cy="50" r="45" />
        <circle
          className="progress"
          cx="50"
          cy="50"
          r="45"
          style={{
            stroke: color,
            strokeDashoffset,
          }}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">
          {value}
        </text>
      </svg>
      <p className="stat-label">{title}</p>
    </Link>
  );
}

export function HomeStats() {
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    totalTasks: 0,
    habitsCompletedToday: 0,
    totalHabitsToday: 0,
  });

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setStats({
          tasksCompleted: 0,
          totalTasks: 0,
          habitsCompletedToday: 0,
          totalHabitsToday: 0,
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      setLoading(true);
      const todayKey = new Date().toISOString().split('T')[0];

      try {
        // Tasks filtered by userId
        const tasksQuery = query(collection(db, 'todoTasks'), where('userId', '==', userId));
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasks = tasksSnapshot.docs.map(doc => doc.data());
        const completedTasks = tasks.filter(t => t.completed).length;

        // Habits filtered by userId
        const habitsQuery = query(collection(db, 'habits'), where('userId', '==', userId));
        const habitsSnapshot = await getDocs(habitsQuery);
        const habits = habitsSnapshot.docs.map(doc => doc.data());
        const habitsCompletedToday = habits.reduce(
          (count, habit) => count + (habit.completedDates?.includes(todayKey) ? 1 : 0),
          0
        );

        setStats({
          tasksCompleted: completedTasks,
          totalTasks: tasks.length,
          habitsCompletedToday,
          totalHabitsToday: habits.length,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) return <p>Loading stats...</p>;

  

  return (
    <div className="stats-ring-grid">
      {cards.map((card) => (
        <StatRing key={card.title} {...card} />
      ))}
    </div>
  );
}

export default function Home() {
  const [profilePic, setProfilePic] = useState(null);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [editingName, setEditingName] = useState(!userName);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storedImage = localStorage.getItem('profilePic');
    if (storedImage) {
      setProfilePic(storedImage);
    }
  }, []);

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem('profilePic', reader.result);
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="home-container">
      <div className="main-content">
        <div className="greeting-card">
          <div className="greeting-container">
            {editingName ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  localStorage.setItem('userName', userName.trim());
                  setEditingName(false);
                }}
              >
                <input
                  className="name-input"
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
                <button className="save-name-btn" type="submit">
                  Save
                </button>
              </form>
            ) : (
              <h2 onClick={() => setEditingName(true)}>
                {getGreeting(currentTime.getHours())}, {userName}!
              </h2>
            )}
            <p className="current-datetime">
              {currentTime.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
              ,{' '}
              {currentTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
          </div>

          <div className="profile-upload">
            <label htmlFor="profilePicInput">
              <img
                src={profilePic || '/assistant-illustration.png'}
                alt="Profile"
                className="profile-pic"
              />
            </label>
            <input
              id="profilePicInput"
              type="file"
              accept="image/*"
              onChange={handleProfileUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>

     

        
        <RoutinePlanner />
      </div>
    </div>
  );
}
