import { useState, useEffect } from 'react';
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

  // Store categories dynamically, initialized from localStorage or default
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('todoCategories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  // Save tasks & categories to localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('todoCategories', JSON.stringify(categories));
  }, [categories]);

  // Add task
  const addTask = () => {
    if (!input.trim()) return;

    // Add new category if not already in list and non-empty
    if (categoryInput.trim() && !categories.includes(categoryInput.trim())) {
      setCategories([...categories, categoryInput.trim()]);
    }

    const newTask = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
      subtasks: [],
      tags: tagInput ? tagInput.split(',').map(t => t.trim()) : [],
      category: categoryInput.trim() || 'Other',
      dueDate: dueDateInput || null,
      reminder: reminderInput || null,
      topTask: false,
    };

    setTasks([...tasks, newTask]);
    setInput('');
    setCategoryInput('');
    setTagInput('');
    setDueDateInput('');
    setReminderInput('');
    setShowAdd(false);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTopTask = (id) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, topTask: !task.topTask } : task));
  };

  // Subtask handlers
  const addSubtask = (taskId, subtaskText) => {
    if (!subtaskText.trim()) return;
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubtasks = [...task.subtasks, { id: Date.now(), text: subtaskText.trim(), completed: false }];
        return { ...task, subtasks: newSubtasks };
      }
      return task;
    }));
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubtasks = task.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
        return { ...task, subtasks: newSubtasks };
      }
      return task;
    }));
  };

  const deleteSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
        return { ...task, subtasks: newSubtasks };
      }
      return task;
    }));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>To-Do List</h2>

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
            onChange={e => setInput(e.target.value)}
            className={styles.input}
          />

          <div className={styles.formRow}>
            <input
              type="text"
              placeholder="Category (type or pick)"
              value={categoryInput}
              onChange={e => setCategoryInput(e.target.value)}
              className={styles.input}
              list="categories"
              autoComplete="off"
            />
            <datalist id="categories">
              {categories.map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>

            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              className={styles.input}
              list="tags"
            />
            <datalist id="tags">
              {defaultTags.map(t => (
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
                onChange={e => setDueDateInput(e.target.value)}
                className={styles.input}
                style={{ marginLeft: '0.5rem', minWidth: '150px' }}
              />
            </label>

            <label>
              Reminder:
              <input
                type="datetime-local"
                value={reminderInput}
                onChange={e => setReminderInput(e.target.value)}
                className={styles.input}
                style={{ marginLeft: '0.5rem', minWidth: '220px' }}
              />
            </label>
          </div>

          <div className={styles.formRow} style={{ justifyContent: 'flex-start' }}>
            <button
              onClick={addTask}
              className={styles.addButton}
            >
              Add Task
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className={styles.cancelButton}
            >
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
                    onChange={() => toggleTask(task.id)}
                    className={styles.iconButton}
                  />
                  <span
                    className={styles.taskTitle}
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.text}
                  </span>
                  {task.topTask && (
                    <span className={styles.topBadge}>TOP</span>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => toggleTopTask(task.id)}
                    title="Toggle Top Task"
                    className={`${styles.iconButton} ${styles.star}`}
                    aria-label="Toggle Top Task"
                  >
                    ★
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    title="Delete task"
                    className={`${styles.iconButton} ${styles.delete}`}
                    aria-label="Delete task"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className={styles.taskMeta}>
                <span className={styles.category}>{task.category}</span>
                {task.tags.length > 0 && (
                  <span>
                    Tags:{' '}
                    {task.tags.map((tag, i) => (
                      <span key={i} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </span>
                )}
                {task.dueDate && <span>Due: {task.dueDate}</span>}
                {task.reminder && <span>Reminder: {new Date(task.reminder).toLocaleString()}</span>}
              </div>

              <SubtaskSection
                subtasks={task.subtasks}
                onAdd={(text) => addSubtask(task.id, text)}
                onToggle={(subtaskId) => toggleSubtask(task.id, subtaskId)}
                onDelete={(subtaskId) => deleteSubtask(task.id, subtaskId)}
              />
            </li>
          ))}
      </ul>
    </div>
  );
}

function SubtaskSection({ subtasks, onAdd, onToggle, onDelete }) {
  const [subInput, setSubInput] = useState('');

  const handleAdd = () => {
    if (!subInput.trim()) return;
    onAdd(subInput);
    setSubInput('');
  };

  return (
    <div className={styles.subtaskSection}>
      <ul className={styles.subtaskList}>
        {subtasks.map((subtask) => (
          <li key={subtask.id} className={styles.subtaskItem}>
            <label
              className={`${subtask.completed ? styles.completed : ''}`}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1 }}
            >
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => onToggle(subtask.id)}
                className={styles.iconButton}
              />
              {subtask.text}
            </label>
            <button
              onClick={() => onDelete(subtask.id)}
              className={`${styles.iconButton} ${styles.delete}`}
              title="Delete subtask"
              aria-label="Delete subtask"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.subtaskControls}>
        <input
          type="text"
          placeholder="Add subtask"
          value={subInput}
          onChange={(e) => setSubInput(e.target.value)}
          className={styles.subtaskInput}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        />
        <button
          onClick={handleAdd}
          className={styles.subtaskAddBtn}
          aria-label="Add subtask"
        >
          +
        </button>
      </div>
    </div>
  );
}
