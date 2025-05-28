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
import styles from './ToDoList.module.css';

const defaultCategories = ['Work', 'Personal', 'Shopping', 'Other'];
const defaultTags = ['Urgent', 'Important', 'Optional'];

export default function ToDoList() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const [reminderInput, setReminderInput] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Firestore collection reference
  const tasksCollection = collection(db, 'todoTasks');

  // Fetch tasks from Firestore
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(tasksCollection);
      const loadedTasks = [];
      const loadedCategories = new Set(defaultCategories);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedTasks.push({ id: doc.id, ...data });
        if (data.category) loadedCategories.add(data.category);
      });
      setTasks(loadedTasks);
      setCategories([...loadedCategories]);
      setError('');
    } catch (err) {
      setError('Failed to load tasks.');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add new task
  const addTask = async () => {
    if (!input.trim()) {
      setError('Task text cannot be empty.');
      return;
    }
    setError('');
    try {
      const newCategory = categoryInput.trim();
      // Add category if new
      if (newCategory && !categories.includes(newCategory)) {
        setCategories((prev) => [...prev, newCategory]);
      }
      const newTask = {
        text: input.trim(),
        completed: false,
        subtasks: [],
        tags: tagInput ? tagInput.split(',').map((t) => t.trim()) : [],
        category: newCategory || 'Other',
        dueDate: dueDateInput || null,
        reminder: reminderInput || null,
        topTask: false,
      };
      await addDoc(tasksCollection, newTask);
      // Reset inputs and hide form
      setInput('');
      setCategoryInput('');
      setTagInput('');
      setDueDateInput('');
      setReminderInput('');
      setShowAdd(false);
      fetchTasks();
    } catch (err) {
      setError('Failed to add task.');
      console.error(err);
    }
  };

  // Toggle task completed
  const toggleTask = async (task) => {
    try {
      const taskRef = doc(db, 'todoTasks', task.id);
      await updateDoc(taskRef, { completed: !task.completed });
      fetchTasks();
    } catch (err) {
      setError('Failed to update task.');
      console.error(err);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      const taskRef = doc(db, 'todoTasks', taskId);
      await deleteDoc(taskRef);
      fetchTasks();
    } catch (err) {
      setError('Failed to delete task.');
      console.error(err);
    }
  };

  // Toggle Top Task
  const toggleTopTask = async (task) => {
    try {
      const taskRef = doc(db, 'todoTasks', task.id);
      await updateDoc(taskRef, { topTask: !task.topTask });
      fetchTasks();
    } catch (err) {
      setError('Failed to update task.');
      console.error(err);
    }
  };

  // Subtask handlers

  const addSubtask = async (task, subtaskText) => {
    if (!subtaskText.trim()) return;
    try {
      const taskRef = doc(db, 'todoTasks', task.id);
      const newSubtasks = [...task.subtasks, { id: Date.now(), text: subtaskText.trim(), completed: false }];
      await updateDoc(taskRef, { subtasks: newSubtasks });
      fetchTasks();
    } catch (err) {
      setError('Failed to add subtask.');
      console.error(err);
    }
  };

  const toggleSubtask = async (task, subtaskId) => {
    try {
      const taskRef = doc(db, 'todoTasks', task.id);
      const newSubtasks = task.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      await updateDoc(taskRef, { subtasks: newSubtasks });
      fetchTasks();
    } catch (err) {
      setError('Failed to update subtask.');
      console.error(err);
    }
  };

  const deleteSubtask = async (task, subtaskId) => {
    try {
      const taskRef = doc(db, 'todoTasks', task.id);
      const newSubtasks = task.subtasks.filter((st) => st.id !== subtaskId);
      await updateDoc(taskRef, { subtasks: newSubtasks });
      fetchTasks();
    } catch (err) {
      setError('Failed to delete subtask.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading tasks...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>To-Do List</h2>

      {error && <div className={styles.error}>{error}</div>}

      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className={styles.addButton}
          aria-label="Add task"
        >
          +
        </button>
      )}

      {showAdd && (
        <div className={styles.formSection}>
          <input
            type="text"
            placeholder="New task"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={styles.input}
          />

          <div className={styles.formRow}>
            <input
              type="text"
              placeholder="Category (type or pick)"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className={styles.input}
              list="categories"
              autoComplete="off"
            />
            <datalist id="categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>

            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className={styles.input}
              list="tags"
            />
            <datalist id="tags">
              {defaultTags.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div className={styles.formRow}>
            <label>
              Due date:
              <input
                type="date"
                value={dueDateInput}
                onChange={(e) => setDueDateInput(e.target.value)}
                className={styles.input}
                style={{ marginLeft: '0.5rem', minWidth: '150px' }}
              />
            </label>

            <label>
              Reminder:
              <input
                type="datetime-local"
                value={reminderInput}
                onChange={(e) => setReminderInput(e.target.value)}
                className={styles.input}
                style={{ marginLeft: '0.5rem', minWidth: '220px' }}
              />
            </label>
          </div>

          <div className={styles.formRow} style={{ justifyContent: 'flex-start' }}>
            <button onClick={addTask} className={styles.addButton}>
              Add Task
            </button>
            <button onClick={() => setShowAdd(false)} className={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <ul className={styles.taskList}>
        {tasks
          .sort((a, b) => b.topTask - a.topTask)
          .map((task) => (
            <li
              key={task.id}
              className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
            >
              <div className={styles.taskHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task)}
                    className={styles.iconButton}
                  />
                  <span className={styles.taskTitle} onClick={() => toggleTopTask(task)} title="Toggle Top Task">
                    {task.text}
                    {task.topTask && <span className={styles.topTaskBadge}>★</span>}
                  </span>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  aria-label="Delete task"
                  className={styles.deleteButton}
                >
                  ✕
                </button>
              </div>

              {/* Category & Tags */}
              <div className={styles.metaInfo}>
                <span className={styles.category}>{task.category}</span>
                {task.tags?.map((tag, i) => (
                  <span key={i} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Due date & reminder */}
              <div className={styles.metaInfo}>
                {task.dueDate && <span>Due: {task.dueDate}</span>}
                {task.reminder && <span>Reminder: {new Date(task.reminder).toLocaleString()}</span>}
              </div>

              {/* Subtasks */}
              <Subtasks task={task} addSubtask={addSubtask} toggleSubtask={toggleSubtask} deleteSubtask={deleteSubtask} />
            </li>
          ))}
      </ul>
    </div>
  );
}

// Subtasks component
function Subtasks({ task, addSubtask, toggleSubtask, deleteSubtask }) {
  const [newSubtask, setNewSubtask] = useState('');
  const [showSubtasks, setShowSubtasks] = useState(false);

  const handleAddSubtask = () => {
    addSubtask(task, newSubtask);
    setNewSubtask('');
  };

  return (
    <div className="subtasks">
      <button
        onClick={() => setShowSubtasks((prev) => !prev)}
        className="toggle-subtasks-btn"
      >
        {showSubtasks ? 'Hide Subtasks' : `Show Subtasks (${task.subtasks?.length || 0})`}
      </button>

      {showSubtasks && (
        <div className="subtasks-list">
          <ul>
            {(task.subtasks || []).map((sub) => (
              <li key={sub.id} className={sub.completed ? 'subtask-completed' : ''}>
                <input
                  type="checkbox"
                  checked={sub.completed}
                  onChange={() => toggleSubtask(task, sub.id)}
                />
                <span>{sub.text}</span>
                <button onClick={() => deleteSubtask(task, sub.id)}>✕</button>
              </li>
            ))}
          </ul>

          <input
            type="text"
            placeholder="New subtask"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSubtask();
            }}
          />
          <button onClick={handleAddSubtask}>Add Subtask</button>
        </div>
      )}
    </div>
  );
}
