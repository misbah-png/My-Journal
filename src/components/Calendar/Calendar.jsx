import { useState } from 'react';
import styles from './Calendar.module.css';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendar = [];
  let week = new Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      calendar.push(week);
      week = [];
    }
  }

  if (week.length) {
    while (week.length < 7) week.push(null);
    calendar.push(week);
  }

  return calendar;
}

export default function Calendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const calendar = generateCalendar(year, month);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={prevMonth}>&lt;</button>
        <h2>
          {new Date(year, month).toLocaleString('default', {
            month: 'long',
          })}{' '}
          {year}
        </h2>
        <button onClick={nextMonth}>&gt;</button>
      </div>
      <div className={styles.grid}>
        {daysOfWeek.map((day) => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}
        {calendar.flat().map((date, i) => (
          <div key={i} className={styles.day}>
            {date || ''}
          </div>
        ))}
      </div>
    </div>
  );
}

