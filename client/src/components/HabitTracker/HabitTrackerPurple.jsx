import { useState, useEffect } from 'react';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getCurrentWeekKey = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((now.getDay() + 1 + days) / 7);
  return `${now.getFullYear()}-W${weekNum}`;
};

export default function HabitTrackerPurple() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [weekKey, setWeekKey] = useState(getCurrentWeekKey());

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('weeklyHabits')) || {};
    setHabits(data[weekKey] || []);
  }, [weekKey]);

  useEffect(() => {
    const allData = JSON.parse(localStorage.getItem('weeklyHabits')) || {};
    allData[weekKey] = habits;
    localStorage.setItem('weeklyHabits', JSON.stringify(allData));
  }, [habits, weekKey]);

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setHabits([...habits, { name: newHabit.trim(), days: Array(7).fill(false) }]);
    setNewHabit('');
  };

  const toggleDay = (habitIndex, dayIndex) => {
    const updated = [...habits];
    updated[habitIndex].days[dayIndex] = !updated[habitIndex].days[dayIndex];
    setHabits(updated);
  };

  return (
    <div className="p-4 rounded-2xl bg-white shadow-md space-y-4">
      <h2 className="text-lg font-semibold text-purple-600">Weekly Habits</h2>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New habit"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          className="flex-1 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 focus:outline-none text-sm"
        />
        <button
          onClick={addHabit}
          className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-600"
        >
          Add
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-purple-400">
              <th className="text-left p-2">Habit</th>
              {daysOfWeek.map((day) => (
                <th key={day} className="p-2 text-center">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, habitIndex) => (
              <tr key={habitIndex} className="even:bg-purple-50">
                <td className="p-2 text-purple-700">{habit.name}</td>
                {habit.days.map((done, dayIndex) => (
                  <td key={dayIndex} className="p-2 text-center">
                    <button
                      onClick={() => toggleDay(habitIndex, dayIndex)}
                      className={`w-6 h-6 rounded-full border transition ${
                        done ? 'bg-purple-500 border-purple-500' : 'border-purple-300'
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
