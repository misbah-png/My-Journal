import HabitTracker from '../HabitTracker/HabitTracker';
import ToDoList from '../ToDoList/ToDoList';
import './TasksAndHabits.css';

export default function TasksAndHabits() {
  return (
    <div className="tasks-container">
      <h1 className="header">Tasks & Habits</h1>

      <div className="grid-container">
        <div className="card">
          <h2 className="card-title">Habit Tracker</h2>
          <HabitTracker />
        </div>

        <div className="card">
          <h2 className="card-title">To-Do List</h2>
          <ToDoList />
        </div>
      </div>
    </div>
  );
}