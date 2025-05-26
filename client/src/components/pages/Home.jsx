import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';


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
    currentStreak: 0,
    longestStreak: 0,
  });

  useEffect(() => {
    const tasks = JSON.parse(localStorage.getItem('todoTasks') || '[]');
    const completedTasks = tasks.filter(t => t.completed).length;

    const habitData = JSON.parse(localStorage.getItem('weeklyHabits') || '{}');
    const habits = habitData.habits || [];

    const todayIndex = new Date().getDay();
    const correctedDayIndex = todayIndex === 0 ? 6 : todayIndex - 1;

    const habitsCompletedToday = habits.reduce(
      (count, habit) => count + (habit.days?.[correctedDayIndex] ? 1 : 0),
      0
    );

    const streak = JSON.parse(localStorage.getItem('habitStreak') || '{}');

    setStats({
      tasksCompleted: completedTasks,
      totalTasks: tasks.length,
      habitsCompletedToday,
      totalHabitsToday: habits.length,
      currentStreak: streak.current || 0,
      longestStreak: streak.longest || 0,
    });
  }, []);

  const cards = [
    {
      title: 'Tasks Done',
      value: stats.tasksCompleted,
      max: stats.totalTasks || 1,
      color: '#facc15',
      to: '/tasks-and-habits',
    },
    {
      title: 'Habits Today',
      value: stats.habitsCompletedToday,
      max: stats.totalHabitsToday || 1,
      color: '#34d399',
      to: '/habit-tracker',
    },
    {
      title: 'Current Streak',
      value: stats.currentStreak,
      color: '#ec4899',
      to: '/habit-tracker',
    },
    {
      title: 'Longest Streak',
      value: stats.longestStreak,
      color: '#8b5cf6',
      to: '/habit-tracker',
    },
  ];

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
  const [routineGroups, setRoutineGroups] = useState({});
  const [groupName, setGroupName] = useState('');
  const [newRoutine, setNewRoutine] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

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

  const handleAddGroup = () => {
    if (groupName.trim() && !routineGroups[groupName.trim()]) {
      setRoutineGroups({ ...routineGroups, [groupName.trim()]: [] });
      setGroupName('');
      setSelectedGroup(groupName.trim());
    }
  };

  const handleAddRoutine = () => {
    if (selectedGroup && newRoutine.trim()) {
      const updatedGroup = [...(routineGroups[selectedGroup] || []), newRoutine.trim()];
      setRoutineGroups({ ...routineGroups, [selectedGroup]: updatedGroup });
      setNewRoutine('');
    }
  };

  const handleDeleteRoutine = (group, index) => {
    const updated = routineGroups[group].filter((_, i) => i !== index);
    setRoutineGroups({ ...routineGroups, [group]: updated });
  };

  return (
    <div className="home-container">
      <div className="main-content">
        <div className="greeting-card">
          <div>
            <h2>Hi there 👋</h2>
            <p>Set up your day and track your productivity!</p>
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

        <HomeStats />

        <div className="routine-planner">
          <h3>Your Daily Routine</h3>

          <div className="form-row">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Add routine group (e.g., Morning, Workout)..."
            />
            <button onClick={handleAddGroup}>Add Group</button>
          </div>

          <div className="form-select">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="">Select a group</option>
              {Object.keys(routineGroups).map((group, i) => (
                <option key={i} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <input
              type="text"
              value={newRoutine}
              onChange={(e) => setNewRoutine(e.target.value)}
              placeholder={`Add new routine to ${selectedGroup || 'selected group'}...`}
            />
            <button onClick={handleAddRoutine} disabled={!selectedGroup}>
              Add Routine
            </button>
          </div>

          {Object.keys(routineGroups).map((group, i) => (
            <div key={i} className="routine-group">
              <h4>{group}</h4>
              <ul>
                {routineGroups[group].map((routine, idx) => (
                  <li key={idx}>
                    <span>{routine}</span>
                    <button onClick={() => handleDeleteRoutine(group, idx)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
