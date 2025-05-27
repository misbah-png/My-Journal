// MoodTracker.jsx
import React, { useState } from 'react';

const moods = [
  { emoji: '😊', label: 'Happy', color: '#ffd700' },
  { emoji: '😐', label: 'Neutral', color: '#cccccc' },
  { emoji: '😢', label: 'Sad', color: '#87ceeb' },
  { emoji: '😡', label: 'Angry', color: '#ff6b6b' },
  { emoji: '😴', label: 'Tired', color: '#b19cd9' },
];

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');

  return (
    <div className="p-4 rounded-2xl shadow bg-white w-full max-w-md">
      <h3 className="text-xl font-semibold mb-2">Mood Tracker</h3>
      <div className="flex justify-around mb-3">
        {moods.map((mood) => (
          <button
            key={mood.label}
            className={`text-2xl transition transform hover:scale-110 ${
              selectedMood === mood.label ? 'ring-2 ring-offset-2 ring-' + mood.color : ''
            }`}
            onClick={() => setSelectedMood(mood.label)}
          >
            {mood.emoji}
          </button>
        ))}
      </div>
      <input
        type="text"
        className="w-full border border-gray-300 rounded px-3 py-1"
        placeholder="Why do you feel this way?"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
    </div>
  );
}


// MiniCalendar.jsx
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';

export default function MiniCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const dateFormat = 'd';

  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = '';

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      days.push(
        <div
          className={`text-center p-2 cursor-pointer rounded transition-all text-sm ${
            !isSameMonth(day, monthStart) ? 'text-gray-300' :
            isSameDay(day, new Date()) ? 'bg-blue-200' :
            isSameDay(day, selectedDate) ? 'bg-blue-100' : ''
          }`}
          key={day}
          onClick={() => setSelectedDate(cloneDay)}
        >
          {formattedDate}
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(<div className="grid grid-cols-7 gap-1" key={day}>{days}</div>);
    days = [];
  }

  return (
    <div className="p-4 rounded-2xl shadow bg-white w-full max-w-md">
      <h3 className="text-xl font-semibold mb-2">Mini Calendar</h3>
      <div className="grid grid-cols-7 text-center text-sm text-gray-600 mb-2">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      {rows}
      <p className="mt-2 text-sm text-gray-500 text-center">Today: {format(new Date(), 'PPP')}</p>
    </div>
  );
}
