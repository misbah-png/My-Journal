import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import styles from './HabitTracker.module.css';

const getTodayKey = () => new Date().toISOString().split('T')[0];

const getWeekDates = (weekOffset = 0) => {
  const today = new Date();
  const current = new Date();
  current.setDate(today.getDate() + weekOffset * 7);

  const dayIndex = current.getDay(); // 0 (Sun) - 6 (Sat)
  const start = new Date(current);
  start.setDate(current.getDate() - dayIndex);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return {
      key: date.toISOString().split('T')[0],
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      fullLabel: date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
    };
  });
};

const generateMonthCompletion = (habits, offset = 0) => {
  const today = new Date();
  const baseDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const key = date.toISOString().split('T')[0];
    const allCompleted = habits.length > 0 && habits.every(habit => habit.history?.[key]);
    return {
      key,
      completed: allCompleted,
      label: date.getDate(),
    };
  });
};



export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  const weekDates = getWeekDates(weekOffset);
  const habitsCollection = collection(db, 'habits');

  const fetchHabits = async () => {
    setLoading(true);
    setError('');
    try {
      const snapshot = await getDocs(habitsCollection);
      const loaded = [];
      snapshot.forEach((doc) => {
        loaded.push({ id: doc.id, ...doc.data() });
      });
      setHabits(loaded);
    } catch (err) {
      setError('Failed to load habits.');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHabits();
    // eslint-disable-next-line
  }, []);

  const addHabit = async () => {
    if (!newHabitName.trim()) return;
    try {
      await addDoc(habitsCollection, {
        name: newHabitName.trim(),
        history: {},
      });
      setNewHabitName('');
      fetchHabits();
    } catch (err) {
      setError('Failed to add habit.');
      console.error(err);
    }
  };

  const toggleHabitDay = async (habit, dayKey) => {
    try {
      const habitRef = doc(db, 'habits', habit.id);
      const updatedHistory = { ...(habit.history || {}) };
      updatedHistory[dayKey] = !updatedHistory[dayKey];
      await updateDoc(habitRef, { history: updatedHistory });
      fetchHabits();
    } catch (err) {
      setError('Failed to update habit.');
      console.error(err);
    }
  };

  const deleteHabit = async (habitId) => {
    try {
      const habitRef = doc(db, 'habits', habitId);
      await deleteDoc(habitRef);
      fetchHabits();
    } catch (err) {
      setError('Failed to delete habit.');
      console.error(err);
    }
  };

  // Helper to generate month grid for a habit
  const getMonthDays = (habit, offset = 0) => {
    const today = new Date();
    const baseDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);

    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      const key = date.toISOString().split('T')[0];
      const done = habit.history?.[key];
      return {
        key,
        done,
        label: date.toLocaleDateString(undefined, { day: 'numeric' }),
      };
    });
  };

  const generateMonthGrid = (habit) => {
    return getMonthDays(habit, monthOffset).map(({ key, done, label }) => (
      <div
        key={key}
        title={key}
        className={styles.heatbox}
        style={{
          backgroundColor: done ? '#7C3AED' : '#E0E7FF',
        }}
        onClick={() => toggleHabitDay(habit, key)}
      >
        {label}
      </div>
    ));
  };

  if (loading) return <div className={styles.container}>Loading habits...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Habit Developer</h2>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.habitInput}>
        <input
          type="text"
          placeholder="New habit"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addHabit()}
        />
        <button onClick={addHabit}>Add Habit</button>
      </div>

      <div className={styles.toggleButtons}>
        <button onClick={() => setView('week')}>Week View</button>
        <button onClick={() => setView('month')}>Month View</button>
      </div>

      {view === 'week' && (
        <div className={styles.weekNav}>
          <button onClick={() => setWeekOffset((prev) => prev - 1)}>← Previous</button>
          <span className={styles.weekLabel}>Week of {weekDates[0].key}</span>
          <button onClick={() => setWeekOffset((prev) => prev + 1)}>Next →</button>
        </div>
      )}

      {view === 'month' && (
  <>
    <div className={styles.monthNav}>
      <button onClick={() => setMonthOffset((prev) => prev - 1)}>← Previous Month</button>
      <span className={styles.monthLabel}>
        {new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset)
          .toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
      </span>
      <button onClick={() => setMonthOffset((prev) => prev + 1)}>Next Month →</button>
    </div>

    <div className={styles.monthGrid}>
      {generateMonthCompletion(habits, monthOffset).map(({ key, completed, label }) => (
        <div
          key={key}
          title={key}
          className={styles.heatbox}
          style={{
            backgroundColor: completed ? '#7C3AED' : '#E0E7FF',
          }}
        >
          {label}
        </div>
      ))}
    </div>
  </>
)}


      <ul className={styles.habitList}>
        {habits.map((habit) => (
          <li key={habit.id} className={styles.habitItem}>
            <div className={styles.habitHeader}>
              <strong>{habit.name}</strong>
              <button className={styles.deleteBtn} onClick={() => deleteHabit(habit.id)}>Delete</button>
            </div>

            {view === 'week' ? (
              <div className={styles.dayBoxes}>
                {weekDates.map(({ key, fullLabel }) => {
                  const isDone = habit.history?.[key];
                  return (
                    <div key={key} className={styles.dayColumn}>
                      <div className={styles.dayLabel}>{fullLabel}</div>
                      <div
                        className={`${styles.dayBox} ${isDone ? styles.completed : styles.incomplete}`}
                        onClick={() => toggleHabitDay(habit, key)}
                        title={key}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.monthGrid}>
                {generateMonthGrid(habit)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}