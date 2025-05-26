import React, { useState, useEffect } from 'react';
import styles from './Calendar.module.css';

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
const formatTime = (num) => {
  const rounded = Math.round(num * 2) / 2; // snap to 30-min
  const hour = Math.floor(rounded);
  const min = (rounded % 1) * 60;
  return `${hour.toString().padStart(2, '0')}:${min === 0 ? '00' : '30'}`;
};

function ScheduledBlock({ event, hourHeight, onEdit, onResize, onDelete, onDrag }) {
  const start = timeToNumber(event.start);
  const end = timeToNumber(event.end);
  const top = (start - 8) * hourHeight * 2;
  const height = (end - start) * hourHeight * 2;

  const handleResize = (e) => {
    e.stopPropagation();
    const startY = e.clientY;
    const onMouseMove = (moveEvent) => {
      const diff = moveEvent.clientY - startY;
      const minutes = Math.round(diff / (hourHeight * 2) * 60);
      const newEnd = timeToNumber(event.start) + minutes / 60;
      if (newEnd > timeToNumber(event.start)) {
        onResize(event.id, formatTime(newEnd));
      }
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onEdit(event)}
      className={styles.scheduledBlock}
      style={{ top, height: Math.max(height, 20), backgroundColor: event.color || '#89CFF0' }}
      title={`${event.title} (${event.start} - ${event.end})`}
    >
      <div className={styles.eventTitle}>{event.title}</div>
      <button className={styles.deleteButton} onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}>✕</button>
      <div className={styles.resizeHandle} onMouseDown={handleResize} />
    </div>
  );
}

function DayColumn({ day, events, onEdit, onResize, onDelete, onDropTask }) {
  const hourHeight = 20;

  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hour = 8 + y / (hourHeight * 2);
    onDropTask(id, day, formatTime(hour));
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className={styles.dayColumn} onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className={styles.dayHeader}>{day}</div>
      <div className={styles.eventsContainer}>
        {events.map((event) => (
          <ScheduledBlock
            key={event.id}
            event={event}
            hourHeight={hourHeight}
            onEdit={onEdit}
            onResize={onResize}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function TimeColumn() {
  return (
    <div className={styles.timeColumn}>
      <div style={{ height: '30px' }} />
      {timeSlots.map((time) => (
        <div key={time} className={styles.timeSlot}>{time}</div>
      ))}
    </div>
  );
}

export default function WeeklyPlanner() {
  const [events, setEvents] = useState(() => {
    const stored = localStorage.getItem('weeklyPlannerEvents');
    return stored ? JSON.parse(stored) : [];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    localStorage.setItem('weeklyPlannerEvents', JSON.stringify(events));
  }, [events]);

  const handleSave = (task) => {
    setEvents((prev) =>
      prev.some((e) => e.id === task.id)
        ? prev.map((e) => (e.id === task.id ? task : e))
        : [...prev, task]
    );
  };

  const handleResize = (id, newEnd) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, end: newEnd } : e))
    );
  };

  const handleDelete = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleDropTask = (id, newDay, newStart) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === parseInt(id)) {
          const duration = timeToNumber(e.end) - timeToNumber(e.start);
          const newEnd = timeToNumber(newStart) + duration;
          return {
            ...e,
            day: newDay,
            start: newStart,
            end: formatTime(newEnd),
          };
        }
        return e;
      })
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
    <div className={styles.wrapper}>
      <div className={styles.legend}>
        <span style={{ backgroundColor: '#89CFF0' }} /> Work
        <span style={{ backgroundColor: '#FFC75F' }} /> Exercise
        <span style={{ backgroundColor: '#FF6F91' }} /> Study
      </div>

      <div className={styles.container}>
        <TimeColumn />
        {days.map((day) => (
          <DayColumn
            key={day}
            day={day}
            events={events.filter((e) => e.day === day)}
            onEdit={handleEdit}
            onResize={handleResize}
            onDelete={handleDelete}
            onDropTask={handleDropTask}
          />
        ))}
      </div>

      <button className={styles.addButton} onClick={handleAddClick} title="Add Task">+</button>

      {modalOpen && (
        <>
          <div className={styles.modalOverlay} onClick={() => setModalOpen(false)} />
          <div className={styles.modalContent}>
            <h3>{editingTask ? 'Edit Task' : 'Add Task'}</h3>
            <AddEditForm
              task={editingTask}
              onSave={handleSave}
              onClose={() => setModalOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

function AddEditForm({ task, onSave, onClose }) {
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
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (timeToNumber(end) <= timeToNumber(start)) return alert('End must be after start');

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

  return (
    <form onSubmit={handleSubmit} className={styles.modalForm}>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <select value={day} onChange={(e) => setDay(e.target.value)}>
        {days.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
      <input type="time" value={start} onChange={(e) => setStart(e.target.value)} required />
      <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required />
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      <div className={styles.buttonRow}>
        <button type="submit">Save</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}
