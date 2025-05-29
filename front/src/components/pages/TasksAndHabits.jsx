import HabitTracker from '../HabitTracker/HabitTracker';
import ToDoList from '../ToDoList/ToDoList';
import './TasksAndHabits.css';


export default function TasksAndHabits() {
  return (
    <div className="tasks-container">
      <h1 className="header">Tasks & Habits</h1>

      <div className="grid-container">
          <HabitTracker />
        </div>

          <ToDoList />
        </div>
  );
}