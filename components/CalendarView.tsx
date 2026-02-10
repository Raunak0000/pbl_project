import React, { useState } from 'react';
import { Task } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onSelectTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay(); // 0 for Sunday, 1 for Monday...
  const daysInMonth = endOfMonth.getDate();

  const today = new Date();
  const todayString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  
  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-start-${i}`} className="border-r border-b dark:border-[#30363D]"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayOfMonth = day.toString().padStart(2, '0');
    const dateString = `${year}-${month}-${dayOfMonth}`;
    
    const tasksForDay = tasks.filter(task => task.dueDate === dateString);

    const isToday = dateString === todayString;

    days.push(
      <div key={day} className="border-r border-b dark:border-[#30363D] p-2 min-h-[120px] flex flex-col">
        <div className="flex justify-start items-center">
            <span className={`font-semibold w-8 h-8 flex items-center justify-center ${isToday ? 'bg-blue-600 text-white rounded-full' : ''}`}>{day}</span>
        </div>
        <div className="mt-2 space-y-1 overflow-y-auto">
          {tasksForDay.map(task => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="bg-slate-200 dark:bg-[#21262D] text-slate-800 dark:text-slate-200 text-xs rounded px-2 py-1 cursor-pointer hover:bg-slate-300 dark:hover:bg-[#30363D]"
            >
              {task.title}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <div className="bg-slate-100 dark:bg-[#161B22] rounded-lg shadow-lg p-4 sm:p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#21262D]" aria-label="Previous month">&lt;</button>
        <h2 className="text-xl font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#21262D]" aria-label="Next month">&gt;</button>
      </div>
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-7 text-center font-semibold text-slate-600 dark:text-slate-400 border-t border-l dark:border-[#30363D]" style={{minWidth: "640px"}}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 border-r border-b dark:border-[#30363D]">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
          {days}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
