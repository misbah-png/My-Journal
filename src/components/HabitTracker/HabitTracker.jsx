import { useState, useEffect } from 'react';
import styles from './HabitTracker.module.css';

const getWeekNumber = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
  return Math.ceil((now.getDay() + 1 + days) / 7);
};

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [week, setWeek] = useState(getWeekNumber());

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('weeklyHabits')) || {};
    const currentWeek = getWeekNumber();

    if (stored.week === currentWeek) {
      setHabits(stored.habits || []);
    } else {
      const resetHabits = stored.habits?.map(habit => ({
        name: habit.name,
        days: Array(7).fill(false),
      })) || [];
      setHabits(resetHabits);
    }
    setWeek(currentWeek);
  }, []);

  useEffect(() => {
    localStorage.setItem('weeklyHabits', JSON.stringify({ week, habits }));
  }, [habits, week]);

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
