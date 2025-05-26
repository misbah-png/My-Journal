import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('todoTasks'));
    if (saved) setTasks(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;

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
    setTasks(tasks.map(task => task.id === id ? {...task, completed: !task.completed} : task));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTopTask = (id) => {
    setTasks(tasks.map(task => task.id === id ? {...task, topTask: !task.topTask} : task));
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
        const newSubtasks = task.subtasks.map(st => st.id === subtaskId ? {...st, completed: !st.completed} : st);
        return {...task, subtasks: newSubtasks};
      }
      return task;
    }));
  };

  const deleteSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
        return {...task, subtasks: newSubtasks};
      }
      return task;
    }));
  };

  return (
    <div className="p-4 rounded-2xl bg-white shadow-md max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-purple-600 mb-4">To-Do List</h2>

      {/* Shortcut "+" button */}
      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-full text-lg hover:bg-purple-600 mb-4"
          aria-label="Add task"
        >
          +
        </button>
      )}

      {showAdd && (
        <div className="mb-4 space-y-2 bg-purple-50 p-4 rounded-xl shadow-inner">
          <input
            type="text"
            placeholder="New task"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Category (e.g. Work)"
              value={categoryInput}
              onChange={e => setCategoryInput(e.target.value)}
              className="flex-grow px-3 py-1 rounded-md border border-purple-300"
              list="categories"
            />
            <datalist id="categories">
              {defaultCategories.map(c => <option key={c} value={c} />)}
            </datalist>

            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              className="flex-grow px-3 py-1 rounded-md border border-purple-300"
              list="tags"
            />
            <datalist id="tags">
              {defaultTags.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>

          <div className="flex gap-2 flex-wrap">
            <label>
              Due date:
              <input
                type="date"
                value={dueDateInput}
                onChange={e => setDueDateInput(e.target.value)}
                className="ml-1 px-2 py-1 rounded-md border border-purple-300"
              />
            </label>

            <label>
              Reminder:
              <input
                type="datetime-local"
                value={reminderInput}
                onChange={e => setReminderInput(e.target.value)}
                className="ml-1 px-2 py-1 rounded-md border border-purple-300"
              />
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addTask}
              className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600"
            >
              Add Task
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {tasks
          .sort((a, b) => b.topTask - a.topTask) // Show top tasks first
          .map((task) => (
          <li
            key={task.id}
            className={`p-4 rounded-xl shadow-sm border border-purple-200 ${
              task.completed ? 'bg-purple-100 text-gray-500 line-through' : 'bg-purple-50 text-purple-800'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="cursor-pointer"
                />
                <span
                  className="font-semibold cursor-pointer select-none"
                  onClick={() => toggleTask(task.id)}
                >
                  {task.text}
                </span>
                {task.topTask && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-300 rounded-full text-yellow-900 font-bold">
                    TOP
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleTopTask(task.id)}
                  title="Toggle Top Task"
                  className="text-yellow-500 hover:text-yellow-700 font-bold"
                >
                  ★
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-700 font-bold text-xl"
                  title="Delete task"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Tags, category, due date, reminder */}
            <div className="mt-1 text-xs space-x-2 text-purple-600">
              <span className="italic">{task.category}</span>
              {task.tags.length > 0 && (
                <span>
                  Tags: {task.tags.map((tag, i) => (
                    <span key={i} className="mr-1 px-1 rounded bg-purple-200 text-purple-700">{tag}</span>
                  ))}
                </span>
              )}
              {task.dueDate && <span>Due: {task.dueDate}</span>}
              {task.reminder && <span>Reminder: {new Date(task.reminder).toLocaleString()}</span>}
            </div>

            {/* Subtasks */}
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
    <div className="mt-3 pl-6 space-y-1">
      <ul className="list-disc list-inside text-sm text-purple-700">
        {subtasks.map((subtask) => (
          <li key={subtask.id} className="flex justify-between items-center">
            <label className={`cursor-pointer flex items-center gap-2 ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => onToggle(subtask.id)}
                className="cursor-pointer"
              />
              {subtask.text}
            </label>
            <button
              onClick={() => onDelete(subtask.id)}
              className="text-red-500 hover:text-red-700 font-bold"
              title="Delete subtask"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 mt-1">
        <input
          type="text"
          placeholder="Add subtask"
          value={subInput}
          onChange={(e) => setSubInput(e.target.value)}
          className="flex-grow px-2 py-1 rounded border border-purple-300"
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        />
        <button
          onClick={handleAdd}
          className="bg-purple-500 text-white px-3 rounded hover:bg-purple-600"
          aria-label="Add subtask"
        >
          +
        </button>
      </div>
    </div>
  );
}

           
