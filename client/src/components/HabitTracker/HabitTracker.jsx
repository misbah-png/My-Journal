import { useState, useEffect } from 'react';
import styles from './HabitTracker.module.css';

const getTodayKey = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Helper to get the start of week (Monday) date for a given selectedDate
const getWeekDates = (selectedDate) => {
  const date = new Date(selectedDate);
  const day = date.getDay();
  const isoDay = day === 0 ? 7 : day; // Sunday = 7
  const monday = new Date(date);
  monday.setDate(date.getDate() - (isoDay - 1));

  return [...Array(7)].map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
};

// New: ProgressRing component for circular analytics visualization
function ProgressRing({ radius, stroke, progress }) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle
        stroke="#ddd"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#7e22ce"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ transition: 'stroke-dashoffset 0.35s ease' }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="1.25rem"
        fill="#7e22ce"
        fontWeight="bold"
      >
        {progress}%
      </text>
    </svg>
  );
}

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [analytics, setAnalytics] = useState({ completed: 0, total: 0 });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('habits')) || [];
    setHabits(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
    updateAnalytics();
  }, [habits, selectedDate]);

  const updateAnalytics = () => {
    const total = habits.length;
    if (total === 0) {
      setAnalytics({ completed: 0, total: 0 });
      return;
    }
    const completed = habits.reduce((count, habit) => {
      return count + (habit.completedDates.includes(selectedDate) ? 1 : 0);
    }, 0);
    setAnalytics({ completed, total });
  };


  const addHabit = () => {
    if (!newHabit.trim()) return;
    const newEntry = {
      name: newHabit.trim(),
      difficulty: 'medium',
      priority: 'normal',
      completedDates: [],
    };
    setHabits([...habits, newEntry]);
    setNewHabit('');
  };

  const deleteHabit = (habitIndex) => {
    const updated = [...habits];
    updated.splice(habitIndex, 1);
    setHabits(updated);
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingName(habits[index].name);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingName('');
  };

  const saveEditing = () => {
    if (!editingName.trim()) return; // prevent empty names
    const updated = [...habits];
    updated[editingIndex].name = editingName.trim();
    setHabits(updated);
    cancelEditing();
  };

  const handleEditingKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const toggleDay = (habitIndex, dateStr) => {
    const updated = [...habits];
    const habit = updated[habitIndex];
    const idx = habit.completedDates.indexOf(dateStr);
    if (idx >= 0) {
      habit.completedDates.splice(idx, 1);
    } else {
      habit.completedDates.push(dateStr);
    }
    setHabits(updated);
  };

  const handleDifficultyChange = (habitIndex, newDifficulty) => {
    const updated = [...habits];
    updated[habitIndex].difficulty = newDifficulty;
    setHabits(updated);
  };

  const handlePriorityChange = (habitIndex, newPriority) => {
    const updated = [...habits];
    updated[habitIndex].priority = newPriority;
    setHabits(updated);
  };

  const weekDates = getWeekDates(selectedDate);

  // Calculate percentage for ring safely
  const completionPercent =
    analytics.total > 0
      ? Math.round((analytics.completed / analytics.total) * 100)
      : 0;

   return (
    <div className={styles.container}>
      <h2>Weekly Habit Tracker</h2>

      <div className={styles.controls}>
        <label>
          Select Date:{' '}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>

        <div className={styles.add}>
          <input
            type="text"
            placeholder="New habit"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
          />
          <button onClick={addHabit}>Add</button>
        </div>
      </div>

      {habits.length === 0 ? (
        <p>No habits added yet.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Habit</th>
                <th>Difficulty</th>
                <th>Priority</th>
                {daysOfWeek.map((day, i) => (
                  <th key={i}>{day}</th>
                ))}
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit, habitIndex) => (
                <tr key={habitIndex}>
                  <td>
                    {editingIndex === habitIndex ? (
                      <input
                        type="text"
                        value={editingName}
                        autoFocus
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={saveEditing}
                        onKeyDown={handleEditingKeyDown}
                        className={styles.editInput}
                      />
                    ) : (
                      <span
                        onClick={() => startEditing(habitIndex)}
                        style={{ cursor: 'pointer' }}
                        title="Click to edit"
                      >
                        {habit.name}
                      </span>
                    )}
                  </td>
                  <td>
                    <select
                      value={habit.difficulty}
                      onChange={(e) =>
                        handleDifficultyChange(habitIndex, e.target.value)
                      }
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={habit.priority}
                      onChange={(e) =>
                        handlePriorityChange(habitIndex, e.target.value)
                      }
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </td>
                  {weekDates.map((dateStr, dayIndex) => (
                    <td key={dayIndex}>
                      <input
                        type="checkbox"
                        checked={habit.completedDates.includes(dateStr)}
                        onChange={() => toggleDay(habitIndex, dateStr)}
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      onClick={() => deleteHabit(habitIndex)}
                      style={{ color: 'red' }}
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.analytics}>
        <h4>Today's Habit Completion</h4>
        <ProgressRing
          radius={60}
          stroke={8}
          progress={
            analytics.total > 0
              ? Math.round((analytics.completed / analytics.total) * 100)
              : 0
          }
        />
      </div>
    </div>
  );
}