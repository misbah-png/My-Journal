import HabitTracker from '../HabitTracker/HabitTracker';
import ToDoList from '../ToDoList/ToDoList';

export default function TasksAndHabits() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Habit Tracker</h2>
        <HabitTracker />
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">To-Do List</h2>
        <ToDoList />
      </div>
    </div>
  );
}

