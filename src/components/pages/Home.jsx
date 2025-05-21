import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
 

function StatCard({ title, value, color }) {
  return (
    <div className="p-4 rounded-lg text-center" style={{ backgroundColor: color }}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm text-gray-700">{title}</p>
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
    <div className="flex h-screen">
      

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        {/* Greeting */}
        <div className="bg-purple-100 p-6 rounded-xl flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Hi there 👋</h2>
            <p className="text-gray-700">Set up your day and track your productivity!</p>
          </div>
          <img src="/assistant-illustration.png" alt="Assistant" className="h-24" />
        </div>

        <div>
            <HomeStats />
        </div>
  



        {/* Routine Planner */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Your Daily Routine</h3>

          {/* Add Group */}
          <div className="flex mb-4 gap-2">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="flex-1 border px-3 py-2 rounded-md"
              placeholder="Add routine group (e.g., Morning, Workout)..."
            />
            <button
              onClick={handleAddGroup}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Add Group
            </button>
          </div>

          {/* Select Group */}
          <div className="mb-4">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="">Select a group</option>
              {Object.keys(routineGroups).map((group, i) => (
                <option key={i} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Add Routine */}
          <div className="flex mb-4 gap-2">
            <input
              type="text"
              value={newRoutine}
              onChange={(e) => setNewRoutine(e.target.value)}
              className="flex-1 border px-3 py-2 rounded-md"
              placeholder={`Add new routine to ${selectedGroup || 'selected group'}...`}
            />
            <button
              onClick={handleAddRoutine}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              disabled={!selectedGroup}
            >
              Add Routine
            </button>
          </div>

          {/* Routine Lists */}
          {Object.keys(routineGroups).map((group, i) => (
            <div key={i} className="mb-6">
              <h4 className="text-md font-semibold text-purple-700 mb-2">{group}</h4>
              <ul className="space-y-2">
                {routineGroups[group].map((routine, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center bg-gray-100 p-3 rounded-md"
                  >
                    <span>{routine}</span>
                    <button
                      onClick={() => handleDeleteRoutine(group, idx)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
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

