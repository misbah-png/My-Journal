import { useState, useEffect } from 'react';
import styles from './ToDoList.module.css';

export default function ToDoList() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('todoTasks'));
    if (stored) setTasks(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { text: input.trim(), completed: false }]);
    setInput('');
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  const deleteTask = (index) => {
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);
  };

  return (
    <div className={styles.container}>
      <h2>To-Do List</h2>
      <div className={styles.add}>
        <input
          type="text"
          placeholder="New task"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={addTask}>Add</button>
      </div>
      <ul className={styles.list}>
        {tasks.map((task, index) => (
          <li key={index} className={task.completed ? styles.completed : ''}>
            <span onClick={() => toggleTask(index)}>{task.text}</span>
            <button onClick={() => deleteTask(index)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
