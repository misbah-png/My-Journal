import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell } from 'recharts';

const getTodayKey = () => new Date().toISOString().split('T')[0];

const COLORS = ['#7C3AED', '#E0E7FF']; // Purple for done, light background

export default function StatRing() {
  const [stats, setStats] = useState({ done: 0, total: 0 });

  const calculateStats = () => {
    const dayKey = getTodayKey();

    // ----- To-Do Stats -----
    const todo = JSON.parse(localStorage.getItem('todoTasks')) || [];
    const todoTotal = todo.length;
    const todoDone = todo.filter((t) => t.completed).length;

    // ----- Habit Stats -----
    const habits = JSON.parse(localStorage.getItem(`habits-${dayKey}`)) || [];
    const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    let habitTotal = 0;
    let habitDone = 0;

    habits.forEach((h) => {
      if (h.days?.length === 7) {
        habitTotal += 1;
        if (h.days[todayIndex]) habitDone += 1;
      }
    });

    // Combine
    const done = todoDone + habitDone;
    const total = todoTotal + habitTotal;

    setStats({ done, total });
  };

  useEffect(() => {
    calculateStats(); // Initial load

    // Listen to localStorage updates
    const handleStorage = () => {
      calculateStats();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const percent = stats.total === 0 ? 0 : (stats.done / stats.total) * 100;

  const data = [
    { name: 'Completed', value: stats.done },
    { name: 'Remaining', value: stats.total - stats.done },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <PieChart width={120} height={120}>
        <Pie
          data={data}
          cx={60}
          cy={60}
          innerRadius={40}
          outerRadius={55}
          startAngle={90}
          endAngle={-270}
          paddingAngle={0}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
      <div className="text-center text-sm text-purple-600 font-semibold mt-[-20px]">
        {stats.done} / {stats.total} done
      </div>
    </div>
  );
}
