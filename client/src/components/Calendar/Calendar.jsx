import React, { useState, useEffect } from 'react';

// === Utility ===
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = Array.from({ length: 21 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const min = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${min}`;
});

const timeToNumber = (time) => {
  const [hour, min] = time.split(':').map(Number);
  return hour + min / 60;
};

// === Scheduled Block ===
function ScheduledBlock({ event, hourHeight, onEdit }) {
  const start = timeToNumber(event.start);
  const end = timeToNumber(event.end);
  const top = (start - 8) * hourHeight * 2;
  const height = (end - start) * hourHeight * 2;

  return (
    <div
      onClick={() => onEdit(event)}
      style={{
        position: 'absolute',
        top,
        height,
        left: '5px',
        right: '5px',
        backgroundColor: event.color || '#89CFF0',
        borderRadius: '4px',
        padding: '2px 5px',
        fontSize: '0.8rem',
        color: '#000',
        cursor: 'pointer',
      }}
      title={`${event.title} (${event.start} - ${event.end})`}
    >
      {event.title}
    </div>
  );
}

// === Day Column ===
function DayColumn({ day, events, onEdit }) {
  const hourHeight = 20;
  return (
    <div style={{ flex: 1, position: 'relative', borderLeft: '1px solid #ccc' }}>
      <div style={{ textAlign: 'center', borderBottom: '1px solid #ccc', padding: '5px 0' }}>
        {day}
      </div>
      <div style={{ position: 'relative', height: hourHeight * 42 }}>
        {events.map((event) => (
          <ScheduledBlock key={event.id} event={event} hourHeight={hourHeight} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}

// === Time Column ===
function TimeColumn() {
  const hourHeight = 20;
  return (
    <div style={{ width: '60px', borderRight: '1px solid #ccc' }}>
      <div style={{ height: '30px' }} />
      {timeSlots.map((time) => (
        <div
          key={time}
          style={{
            height: hourHeight,
            fontSize: '0.75rem',
            textAlign: 'right',
            paddingRight: '5px',
            color: '#666',
          }}
        >
          {time}
        </div>
      ))}
    </div>
  );
}

// === Add/Edit Modal ===
function AddEditTaskModal({ open, onClose, onSave, task }) {
  const [title, setTitle] = useState(task?.title || '');
  const [day, setDay] = useState(task?.day || 'Monday');
  const [start, setStart] = useState(task?.start || '09:00');
  const [end, setEnd] = useState(task?.end || '10:00');
  const [color, setColor] = useState(task?.color || '#89CFF0');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDay(task.day);
      setStart(task.start);
      setEnd(task.end);
      setColor(task.color);
    } else {
      setTitle('');
      setDay('Monday');
      setStart('09:00');
      setEnd('10:00');
      setColor('#89CFF0');
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: task?.id ?? Date.now(),
      title,
      day,
      start,
      end,
      color,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 100,
        left: '30%',
        width: '300px',
        background: '#fff',
        padding: 20,
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
        zIndex: 1000,
      }}
    >
      <h3>{task ? 'Edit Task' : 'Add Task'}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <select value={day} onChange={(e) => setDay(e.target.value)}>
            {days.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} required />
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required />
        </div>
        <div>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
        <div style={{ marginTop: 10 }}>
          <button type="submit">Save</button>
          <button onClick={onClose} type="button" style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// === Main Weekly Planner ===
export default function WeeklyPlanner() {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleSave = (task) => {
    setEvents((prev) =>
      prev.some((e) => e.id === task.id)
        ? prev.map((e) => (e.id === task.id ? task : e))
        : [...prev, task]
    );
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', border: '1px solid #ccc', fontFamily: 'Arial' }}>
        <TimeColumn />
        {days.map((day) => (
          <DayColumn
            key={day}
            day={day}
            events={events.filter((e) => e.day === day)}
            onEdit={handleEdit}
          />
        ))}
      </div>
      <button
  onClick={handleAddClick}
  style={{
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 16px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
  }}
  title="Add Task"
>
  +
</button>


      <AddEditTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        task={editingTask}
      />
    </div>
  );
}
