import React, { useState, useEffect } from 'react';
import styles from './RoutinePlanner.module.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EmojiPicker from 'emoji-picker-react';

const defaultUnits = ['time', 'reps', 'hours', 'minutes', 'sets', ''];
const repeatOptions = ['none', 'daily', 'weekly'];

export default function RoutinePlanner() {
  const [routineGroups, setRoutineGroups] = useState({});
  const [groupName, setGroupName] = useState('');
  const [groupIcon, setGroupIcon] = useState('⏰');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newRoutine, setNewRoutine] = useState('');
  const [routineUnit, setRoutineUnit] = useState(defaultUnits[0]);
  const [routineRepeat, setRoutineRepeat] = useState('none');
  const [iconUploadData, setIconUploadData] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('routineGroups');
    if (stored) {
      const parsed = JSON.parse(stored);
      setRoutineGroups(cloneRepeatingRoutines(parsed));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('routineGroups', JSON.stringify(routineGroups));
  }, [routineGroups]);

  const today = new Date().toISOString().split('T')[0];

  const cloneRepeatingRoutines = (groups) => {
    const updatedGroups = { ...groups };

    for (const group in updatedGroups) {
      const { routines = [] } = updatedGroups[group];
      const newRoutines = [...routines];

      routines.forEach((r) => {
        const lastDate = r.lastCloned || '';
        const shouldCloneDaily = r.repeat === 'daily' && lastDate !== today;
        const shouldCloneWeekly =
          r.repeat === 'weekly' &&
          (!lastDate || new Date(lastDate).getDay() !== new Date().getDay());

        if ((shouldCloneDaily || shouldCloneWeekly) && !r.original) {
          newRoutines.push({
            ...r,
            lastCloned: today,
            original: true,
          });
        }
      });

      updatedGroups[group].routines = newRoutines.map((r) => {
        if (r.repeat !== 'none') {
          return { ...r, lastCloned: today };
        }
        return r;
      });
    }

    return updatedGroups;
  };

  const handleAddGroup = () => {
    const trimmedName = groupName.trim();
    if (trimmedName && !routineGroups[trimmedName]) {
      setRoutineGroups({
        ...routineGroups,
        [trimmedName]: {
          icon: iconUploadData || groupIcon,
          routines: [],
        },
      });
      setGroupName('');
      setSelectedGroup(trimmedName);
      setGroupIcon('⏰');
      setIconUploadData(null);
    }
  };

  const handleAddRoutine = () => {
    if (selectedGroup && newRoutine.trim()) {
      const group = routineGroups[selectedGroup];
      const updatedRoutines = [
        ...group.routines,
        {
          text: newRoutine.trim(),
          unit: routineUnit,
          repeat: routineRepeat,
          lastCloned: today,
        },
      ];
      setRoutineGroups({
        ...routineGroups,
        [selectedGroup]: { ...group, routines: updatedRoutines },
      });
      setNewRoutine('');
      setRoutineUnit(defaultUnits[0]);
      setRoutineRepeat('none');
    }
  };

  const handleDeleteRoutine = (group, idx) => {
    const updated = routineGroups[group].routines.filter((_, i) => i !== idx);
    setRoutineGroups({
      ...routineGroups,
      [group]: { ...routineGroups[group], routines: updated },
    });
  };

  const handleDeleteGroup = (group) => {
    const updatedGroups = { ...routineGroups };
    delete updatedGroups[group];
    setRoutineGroups(updatedGroups);
    if (selectedGroup === group) setSelectedGroup('');
  };

  const handleDragEnd = (result, groupKey) => {
    if (!result.destination) return;
    const items = Array.from(routineGroups[groupKey].routines);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRoutineGroups({
      ...routineGroups,
      [groupKey]: { ...routineGroups[groupKey], routines: items },
    });
  };

  return (
    <div className={styles['routine-planner']}>
      <h3>Your Daily Routine</h3>

      <div className={styles['form-row']}>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Add routine group..."
        />
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            {groupIcon || '😀'} Pick Icon
          </button>
          {showEmojiPicker && (
            <div style={{ position: 'absolute', zIndex: 10 }}>
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setGroupIcon(emojiData.emoji);
                  setIconUploadData(null);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}
          <button onClick={handleAddGroup} style={{ marginLeft: '8px' }}>
            Add Group
          </button>
        </div>
      </div>

      <div className={styles['form-select']}>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">Select a group</option>
          {Object.keys(routineGroups).map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>

      <div className={styles['form-row']}>
        <input
          type="text"
          value={newRoutine}
          onChange={(e) => setNewRoutine(e.target.value)}
          placeholder={`Add routine to ${selectedGroup || 'group'}...`}
          disabled={!selectedGroup}
        />
        <input
          type="text"
          value={routineUnit}
          onChange={(e) => setRoutineUnit(e.target.value)}
          placeholder="unit"
          disabled={!selectedGroup}
        />
        <select
          value={routineRepeat}
          onChange={(e) => setRoutineRepeat(e.target.value)}
          disabled={!selectedGroup}
        >
          {repeatOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddRoutine}
          disabled={!selectedGroup || !newRoutine.trim()}
        >
          Add Routine
        </button>
      </div>

      <div className={styles['routine-groups-container']}>
        {Object.entries(routineGroups).map(([group, data]) => (
          <div key={group} className={styles['routine-group-card']}>
            <div className={styles['routine-group-header']}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {data.icon?.startsWith('data:image') ? (
                  <img
                    src={data.icon}
                    alt="icon"
                    className={styles['group-icon-img']}
                  />
                ) : (
                  <span className={styles['group-icon-emoji']}>
                    {data.icon}
                  </span>
                )}
                <h4 style={{ marginLeft: '0.5rem' }}>{group}</h4>
              </div>
              <button
                onClick={() => handleDeleteGroup(group)}
                className={styles['delete-group-btn']}
              >
                ✖
              </button>
            </div>

            <DragDropContext onDragEnd={(result) => handleDragEnd(result, group)}>
              <Droppable droppableId={group}>
                {(provided) => (
                  <ul
                    className={styles['routine-list']}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {data.routines.map(({ text, unit, repeat }, idx) => (
                      <Draggable
                        key={`${group}-${idx}`}
                        draggableId={`${group}-${idx}`}
                        index={idx}
                      >
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={styles['routine-item']}
                          >
                            <span className={styles['routine-text']}>{text}</span>
                            <span className={styles['routine-unit']}>{unit}</span>
                            {repeat !== 'none' && (
                              <span className={styles['routine-repeat']}>🔁 {repeat}</span>
                            )}
                            <button
                              onClick={() => handleDeleteRoutine(group, idx)}
                              className={styles['delete-routine-btn']}
                            >
                              ❌
                            </button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        ))}
      </div>
    </div>
  );
}

