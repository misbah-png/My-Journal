import { useState, useEffect } from 'react';
import styles from './HabitTracker.module.css';

const getCurrentWeekKey = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((now.getDay() + 1 + days) / 7);
  return `${now.getFullYear()}-W${weekNum}`;
};

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [weekKey, setWeekKey] = useState(getCurrentWeekKey());

  // Load habits for the current week
  useEffect(() => {
    const allData = JSON.parse(localStorage.getItem('weeklyHabits')) || {};
    const currentHabits = allData[weekKey] || [];
    setHabits(currentHabits);
  }, [weekKey]);

  // Save to localStorage every time habits change
  useEffect(() => {
    const allData = JSON.parse(localStorage.getItem('weeklyHabits')) || {};
    allData[weekKey] = habits;
    localStorage.setItem('weeklyHabits', JSON.stringify(allData));
  }, [habits, weekKey]);

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const updated = [...habits, { name: newHabit.trim(), days: Array(7).fill(false) }];
    setHabits(updated);
    setNewHabit('');
  };

  const toggleDay = (habitIndex, dayIndex) => {
    const updated = [...habits];
    updated[habitIndex].days[dayIndex] = !updated[habitIndex].days[dayIndex];
    setHabits(updated);
  };

  return (
    <div className={styles.container}>
      <h2>Weekly Habit Tracker</h2>

      <div className={styles.add}>
        <input
          type="text"
          placeholder="New habit"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
        />
        <button onClick={addHabit}>Add</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Habit</th>
            {daysOfWeek.map((day, i) => (
              <th key={i}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {habits.map((habit, habitIndex) => (
            <tr key={habitIndex}>
              <td>{habit.name}</td>
              {habit.days.map((done, dayIndex) => (
                <td key={dayIndex}>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleDay(habitIndex, dayIndex)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
