import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addDays from 'date-fns/addDays';
import addWeeks from 'date-fns/addWeeks';
import addMonths from 'date-fns/addMonths';
import isBefore from 'date-fns/isBefore';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from './Calendar.module.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
  const [showForm, setShowForm] = useState(false);
  const [editingEventIndex, setEditingEventIndex] = useState(null);
  const [formEvent, setFormEvent] = useState({
    title: '',
    start: null,
    end: null,
    color: '#8a2be2',
    emoji: '',
    repeat: 'none',
  });

  useEffect(() => {
    const saved = localStorage.getItem('calendarEvents');
    if (saved) {
      setEvents(JSON.parse(saved).map(e => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const handleSelectSlot = ({ start, end }) => {
    setFormEvent({ title: '', start, end, color: '#8a2be2', emoji: '', repeat: 'none' });
    setEditingEventIndex(null);
    setShowForm(true);
  };

  const handleSelectEvent = (event) => {
    const index = events.findIndex((e) => e === event);
    setFormEvent({
      ...event,
      emoji: event.title.startsWith('🎉') ? '🎉' : '',
      title: event.title.replace(/^.\s*/, ''),
    });
    setEditingEventIndex(index);
    setShowForm(true);
  };

  const generateRepeatingEvents = (event) => {
    const occurrences = [];
    const repeatUntil = addMonths(new Date(), 3);
    let start = new Date(event.start);
    let end = new Date(event.end);

    while (isBefore(start, repeatUntil)) {
      occurrences.push({ ...event, start: new Date(start), end: new Date(end) });

      switch (event.repeat) {
        case 'daily': start = addDays(start, 1); end = addDays(end, 1); break;
        case 'weekly': start = addWeeks(start, 1); end = addWeeks(end, 1); break;
        case 'monthly': start = addMonths(start, 1); end = addMonths(end, 1); break;
        default: return occurrences;
      }
    }

    return occurrences;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formEvent.title || !formEvent.start || !formEvent.end) {
      alert('Please fill in all required fields');
      return;
    }

    const newEvent = {
      ...formEvent,
      title: `${formEvent.emoji ? formEvent.emoji + ' ' : ''}${formEvent.title}`,
    };

    if (editingEventIndex !== null) {
      const updated = [...events];
      updated[editingEventIndex] = newEvent;
      setEvents(updated);
    } else {
      const newEvents = formEvent.repeat === 'none'
        ? [newEvent]
        : generateRepeatingEvents(newEvent);
      setEvents([...events, ...newEvents]);
    }

    setFormEvent({ title: '', start: null, end: null, color: '#8a2be2', emoji: '', repeat: 'none' });
    setEditingEventIndex(null);
    setShowForm(false);
  };

  const handleDelete = () => {
    if (editingEventIndex !== null && window.confirm('Delete this event?')) {
      const updated = [...events];
      updated.splice(editingEventIndex, 1);
      setEvents(updated);
      setFormEvent({ title: '', start: null, end: null, color: '#8a2be2', emoji: '', repeat: 'none' });
      setEditingEventIndex(null);
      setShowForm(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <h2>My Calendar</h2>
        <div className={styles.viewToggle}>
          <button className={view === 'month' ? styles.active : ''} onClick={() => setView('month')}>Month</button>
          <button className={view === 'week' ? styles.active : ''} onClick={() => setView('week')}>Week</button>
        </div>
      </aside>

      <main className={styles.container}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          defaultView={view}
          view={view}
          onView={(v) => setView(v)}
          views={['month', 'week']}
          style={{ height: '100vh' }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color || '#8a2be2',
              borderRadius: '8px',
              color: 'white',
              border: 'none',
              paddingLeft: '6px',
            },
          })}
        />


        {showForm && (
          <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3>{editingEventIndex !== null ? 'Edit Event' : 'Add Event'}</h3>
              <form onSubmit={handleSave}>
                <input
                  type="text"
                  placeholder="Event Title"
                  value={formEvent.title}
                  onChange={(e) => setFormEvent(prev => ({ ...prev, title: e.target.value }))}
                  required
                />

                <label>
                  Start:
                  <input
                    type="datetime-local"
                    value={formEvent.start ? new Date(formEvent.start).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, start: new Date(e.target.value) }))}
                    required
                  />
                </label>

                <label>
                  End:
                  <input
                    type="datetime-local"
                    value={formEvent.end ? new Date(formEvent.end).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, end: new Date(e.target.value) }))}
                    required
                  />
                </label>

                <label>
                  Color:
                  <input
                    type="color"
                    value={formEvent.color}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, color: e.target.value }))}
                  />
                </label>

                <label>
                  Emoji:
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="e.g. 🎉"
                    value={formEvent.emoji}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, emoji: e.target.value }))}
                  />
                </label>

                <label>
                  Repeat:
                  <select
                    value={formEvent.repeat}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, repeat: e.target.value }))}
                  >
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>

                <div className={styles.buttonRow}>
                  <button type="submit" style={{ backgroundColor: '#8a2be2', color: 'white' }}>
                    {editingEventIndex !== null ? 'Update' : 'Add'}
                  </button>
                  {editingEventIndex !== null && (
                    <button type="button" onClick={handleDelete} style={{ backgroundColor: '#ccc' }}>
                      Delete
                    </button>
                  )}
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CalendarPage;
