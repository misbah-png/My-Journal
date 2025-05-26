import React, { useState, useEffect, useCallback } from 'react';
import styles from './Calendar.module.css';

// === Constants ===
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
const numberToTime = (num) => {
  const hour = Math.floor(num);
  const min = (num % 1) * 60;
  return `${hour.toString().padStart(2, '0')}:${min === 0 ? '00' : '30'}`;
};

// === Components ===
function ScheduledBlock({ event, hourHeight, onEdit, onDragStart, onDrop, onDragOver }) {
  const start = timeToNumber(event.start);
  const end = timeToNumber(event.end);
  const top = (start - 8) * hourHeight * 2;
  const height = (end - start) * hourHeight * 2;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, event)}
      onDrop={(e) => onDrop(e, event.day)}
      onDragOver={onDragOver}
      onClick={() => onEdit(event)}
      className={styles.scheduledBlock}
      style={{
        top,
        height,
        backgroundColor: event.color || '#89CFF0',
        position: 'absolute',
        left: '5%',
        width: '90%',
        cursor: 'pointer',
        borderRadius: 4,
        padding: '2px 4px',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
      title={`${event.title} (${event.start} - ${event.end})`}
    >
      {event.title}
    </div>
  );
}

function DayColumn({ day, events, onEdit, onDragStart, onDrop, onDragOver }) {
  const hourHeight = 20;

  return (
    <div className={styles.dayColumn} onDrop={(e) => onDrop(e, day)} onDragOver={onDragOver}>
      <div className={styles.dayHeader}>{day}</div>
      <div className={styles.eventsContainer} style={{ position: 'relative', minHeight: hourHeight * 2 * 21 }}>
        {events.map((event) => (
          <ScheduledBlock
            key={event.id}
            event={event}
            hourHeight={hourHeight}
            onEdit={onEdit}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onDragOver={onDragOver}
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
        <div key={time} className={styles.timeSlot}>
          {time}
        </div>
      ))}
    </div>
  );
}

// === WeeklyPlanner Main Component ===
export default function WeeklyPlanner() {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // For drag and drop
  const [draggedEvent, setDraggedEvent] = useState(null);

  // Save or update task
  const handleSave = (task) => {
    setEvents((prev) =>
      prev.some((e) => e.id === task.id)
        ? prev.map((e) => (e.id === task.id ? task : e))
        : [...prev, task]
    );
  };

  // Delete task
  const handleDelete = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Open modal to edit existing task
  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  // Open modal to add new task
  const handleAddClick = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  // Drag start handler
  const onDragStart = (e, event) => {
    e.dataTransfer.setData('text/plain', event.id);
    setDraggedEvent(event);
  };

  // Allow drop handler
  const onDragOver = (e) => {
    e.preventDefault();
  };

  // Drop handler to move event to new day
  const onDrop = (e, newDay) => {
    e.preventDefault();
    if (!draggedEvent) return;

    // Calculate approximate new start/end times based on drop position
    // We'll use the mouse position relative to the day column to set the start time.
    // For simplicity, drop event can only change day, not time.

    // But we can get mouse Y coordinate relative to the eventsContainer div

    // We'll do a simple approach: keep the same times but change the day
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === draggedEvent.id
          ? {
              ...ev,
              day: newDay,
            }
          : ev
      )
    );
    setDraggedEvent(null);
  };

  // Close modal on Esc key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        setModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modalOpen]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <TimeColumn />
        {days.map((day) => (
          <DayColumn
            key={day}
            day={day}
            events={events.filter((e) => e.day === day)}
            onEdit={handleEdit}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onDragOver={onDragOver}
          />
        ))}
      </div>

      <button className={styles.addButton} onClick={handleAddClick} title="Add Task">
        +
      </button>

      {modalOpen && (
        <>
          <div
            className={styles.modalOverlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalOpen(false);
            }}
          />
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>{editingTask ? 'Edit Task' : 'Add Task'}</h3>
            <AddEditForm
              task={editingTask}
              onSave={handleSave}
              onClose={() => setModalOpen(false)}
              onDelete={handleDelete}
            />
          </div>
        </>
      )}
    </div>
  );
}

// === Form Component ===
function AddEditForm({ task, onSave, onClose, onDelete }) {
  const [title, setTitle] = useState(task?.title || '');
  const [day, setDay] = useState(task?.day || 'Monday');
  const [start, setStart] = useState(task?.start || '09:00');
  const [end, setEnd] = useState(task?.end || '10:00');
  const [color, setColor] = useState(task?.color || '#89CFF0');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDay(task.day);
      setStart(task.start);
      setEnd(task.end);
      setColor(task.color);
    } else {
      // reset form when adding new
      setTitle('');
      setDay('Monday');
      setStart('09:00');
      setEnd('10:00');
      setColor('#89CFF0');
    }
    setError('');
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (start >= end) {
      setError('End time must be after start time.');
      return;
    }

    onSave({
      id: task?.id ?? Date.now(),
      title: title.trim(),
      day,
      start,
      end,
      color,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.modalForm}>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        autoFocus
      />
      <select value={day} onChange={(e) => setDay(e.target.value)}>
        {days.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <input type="time" value={start} onChange={(e) => setStart(e.target.value)} required />
      <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required />
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

      <div className={styles.buttonRow} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button type="submit">Save</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        {task && (
          <button
            type="button"
            onClick={() => {
              onDelete(task.id);
              onClose();
            }}
            style={{ marginLeft: 'auto', backgroundColor: '#e74c3c', color: 'white' }}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
