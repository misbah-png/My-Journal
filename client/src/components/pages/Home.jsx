import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function StatCard({ title, value, color }) {
  return (
    <div className="stat-card" style={{ backgroundColor: color }}>
      <p className="stat-value">{value}</p>
      <p className="stat-title">{title}</p>
    </div>
  );
}

export function HomeStats() {
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    habitsTracked: 0,
    currentStreak: 0,
    longestStreak: 0,
  });

  useEffect(() => {
    const tasks = JSON.parse(localStorage.getItem('weeklyEvents') || '[]');
    const habits = JSON.parse(localStorage.getItem('habitData') || '[]');
    const streak = JSON.parse(localStorage.getItem('habitStreak') || '{}');

    setStats({
      tasksCompleted: tasks.length,
      habitsTracked: habits.length,
      currentStreak: streak.current || 0,
      longestStreak: streak.longest || 0,
    });
  }, []);

  const cards = [
    { title: 'Tasks Completed', value: stats.tasksCompleted, color: '#fde68a' },
    { title: 'Habits Tracked', value: stats.habitsTracked, color: '#d8b4fe' },
    { title: 'Current Streak', value: stats.currentStreak, color: '#f9a8d4' },
    { title: 'Longest Streak', value: stats.longestStreak, color: '#c4b5fd' },
  ];

  return (
    <div className="main-content">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}

export default function Home() {
  const [routineGroups, setRoutineGroups] = useState({});
  const [groupName, setGroupName] = useState('');
  const [newRoutine, setNewRoutine] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

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
          <img src="/assistant-illustration.png" alt="Assistant" />
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
