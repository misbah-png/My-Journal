import HabitTrackerPurple from '../HabitTracker/HabitTrackerPurple';
import ToDoListPurple from '../ToDoList/ToDoListPurple';
import './TasksAndHabitsPurple.css';

export default function TasksAndHabitsPurple() {
  return (
    <div className="tasks-container">
      <h1 className="header">Tasks & Habits</h1>

      <div className="grid-container">
        <div className="card">
          <h2 className="card-title">Habit Tracker</h2>
          <HabitTrackerPurple />
        </div>

        <div className="card">
          <h2 className="card-title">To-Do List</h2>
          <ToDoListPurple />
        </div>
      </div>
    </div>
  );
}