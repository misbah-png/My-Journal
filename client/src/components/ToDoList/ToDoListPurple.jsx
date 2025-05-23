import { useState, useEffect } from 'react';

export default function ToDoListPurple() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('todoTasks'));
    if (saved) setTasks(saved);
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
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 rounded-2xl bg-white shadow-md space-y-4">
      <h2 className="text-lg font-semibold text-purple-600">To-Do List</h2>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New task"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 focus:outline-none text-sm"
        />
        <button
          onClick={addTask}
          className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-600"
        >
          Add
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {tasks.map((task, index) => (
          <li
            key={index}
            className={`flex justify-between items-center px-4 py-3 rounded-xl shadow-sm ${
              task.completed ? 'bg-purple-100 text-gray-500 line-through' : 'bg-purple-50 text-purple-800'
            }`}
          >
            <span onClick={() => toggleTask(index)} className="cursor-pointer">
              {task.text}
            </span>
            <button
              onClick={() => deleteTask(index)}
              className="text-red-400 hover:text-red-600 text-lg font-bold"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

