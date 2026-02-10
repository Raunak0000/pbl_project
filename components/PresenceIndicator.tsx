import React from 'react';
import { ActiveEditor } from '../services/liveEditingService';

interface PresenceIndicatorProps {
  editors: ActiveEditor[];
  maxDisplay?: number;
}

const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ editors, maxDisplay = 3 }) => {
  if (editors.length === 0) return null;

  const displayEditors = editors.slice(0, maxDisplay);
  const extraCount = editors.length - maxDisplay;

  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
  ];

  const getColor = (index: number) => colors[index % colors.length];

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {displayEditors.map((editor, index) => (
          <div
            key={editor.userId}
            className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
            style={{ backgroundColor: getColor(index) }}
            title={`${editor.userName} is editing`}
          >
            <span className="text-white text-xs font-semibold">
              {editor.userName.charAt(0).toUpperCase()}
            </span>
            <div 
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800"
              style={{ backgroundColor: '#10b981' }}
            />
          </div>
        ))}
        {extraCount > 0 && (
          <div
            className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-500"
            title={`${extraCount} more editing`}
          >
            <span className="text-white text-xs font-semibold">
              +{extraCount}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span>Live</span>
      </div>
    </div>
  );
};

export default PresenceIndicator;
