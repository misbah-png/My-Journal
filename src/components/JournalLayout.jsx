import { useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import HabitTracker from './HabitTracker/HabitTracker';
import ToDoList from './ToDoList/ToDoList';
import Calendar from './Calendar/Calendar';
import styles from './JournalLayout.module.css';

const tabs = ['Habit Tracker', 'To-Do List', 'Calendar'];

export default function JournalLayout() {
  const [activeTab, setActiveTab] = useState(0); // index of the active tab

  const pages = [
    <div className={styles.page} key="habit"><HabitTracker /></div>,
    <div className={styles.page} key="todo"><ToDoList /></div>,
    <div className={styles.page} key="calendar"><Calendar /></div>,
  ];

  return (
    <div className={styles.bookContainer}>
      <div className={styles.tabContainer}>
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === i ? styles.active : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      <HTMLFlipBook
        width={700}
        height={500}
        size="stretch"
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1536}
        maxShadowOpacity={0.5}
        showCover={false}
        mobileScrollSupport={true}
        className={styles.flipBook}
        startPage={activeTab}
        onFlip={(e) => setActiveTab(e.data)}
      >
        {pages}
      </HTMLFlipBook>
    </div>
  );
}
