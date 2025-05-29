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
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../../firebase';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from './Calendar.module.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS }
});

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [formEvent, setFormEvent] = useState({
    title: '',
    start: null,
    end: null,
    color: '#8a2be2',
    emoji: '',
    repeat: 'none'
  });

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const loadEvents = async () => {
      const userEventsRef = collection(db, 'users', user.uid, 'calendarEvents');
      const snapshot = await getDocs(userEventsRef);
      const loadedEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        start: new Date(doc.data().start),
        end: new Date(doc.data().end)
      }));
      setEvents(loadedEvents);
    };

    loadEvents();
  }, [user]);

  const handleSelectSlot = ({ start, end }) => {
    setFormEvent({ title: '', start, end, color: '#8a2be2', emoji: '', repeat: 'none' });
    setEditingEventId(null);
    setShowForm(true);
  };

  const handleSelectEvent = (event) => {
    setFormEvent({
      ...event,
      emoji: event.title.startsWith('🎉') ? '🎉' : '',
      title: event.title.replace(/^.\s*/, '')
    });
    setEditingEventId(event.id);
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formEvent.title || !formEvent.start || !formEvent.end || !user) {
      alert('Please fill in all required fields');
      return;
    }

    const newEvent = {
      ...formEvent,
      title: `${formEvent.emoji ? formEvent.emoji + ' ' : ''}${formEvent.title}`,
      start: formEvent.start.toISOString(),
      end: formEvent.end.toISOString()
    };

    const userEventsRef = collection(db, 'users', user.uid, 'calendarEvents');

    if (editingEventId) {
      const docRef = doc(userEventsRef, editingEventId);
      await setDoc(docRef, newEvent);
      setEvents(events.map(e => (e.id === editingEventId ? { ...newEvent, id: editingEventId } : e)));
    } else {
      const newEvents = formEvent.repeat === 'none'
        ? [newEvent]
        : generateRepeatingEvents(formEvent).map(e => ({
            ...e,
            title: `${formEvent.emoji ? formEvent.emoji + ' ' : ''}${formEvent.title}`,
            start: e.start.toISOString(),
            end: e.end.toISOString()
          }));

      const savedEvents = [];
      for (const event of newEvents) {
        const id = crypto.randomUUID();
        await setDoc(doc(userEventsRef, id), event);
        savedEvents.push({ ...event, id });
      }
      setEvents([...events, ...savedEvents]);
    }

    setFormEvent({ title: '', start: null, end: null, color: '#8a2be2', emoji: '', repeat: 'none' });
    setEditingEventId(null);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!user || !editingEventId) return;
    if (!window.confirm('Delete this event?')) return;

    const userEventRef = doc(db, 'users', user.uid, 'calendarEvents', editingEventId);
    await deleteDoc(userEventRef);
    setEvents(events.filter(e => e.id !== editingEventId));
    setFormEvent({ title: '', start: null, end: null, color: '#8a2be2', emoji: '', repeat: 'none' });
    setEditingEventId(null);
    setShowForm(false);
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
          onView={setView}
          views={['month', 'week']}
          style={{ height: '100vh' }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color || '#8a2be2',
              borderRadius: '6px',
              color: 'white',
              padding: '4px',
              fontSize: '0.85rem'
            }
          })}
        />

        {showForm && (
          <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3>{editingEventId ? 'Edit Event' : 'Add Event'}</h3>
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
                    {editingEventId ? 'Update' : 'Add'}
                  </button>
                  {editingEventId && (
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
