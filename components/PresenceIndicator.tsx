import React from 'react';
import { ActiveEditor } from '../services/liveEditingService';

interface PresenceIndicatorProps {
  editors: ActiveEditor[];
  maxDisplay?: number;
  roleResolver?: (editor: ActiveEditor) => string;
  compact?: boolean;
}

const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  editors,
  maxDisplay = 3,
  roleResolver,
  compact = false
}) => {
  if (editors.length === 0) return null;

  const displayEditors = editors.slice(0, maxDisplay);
  const extraCount = editors.length - maxDisplay;

  // Updated Orbit Colors
  const roleColors: Record<string, string> = {
    ADMIN: '#8b5cf6', // Violet
    USER: '#3b82f6',  // Blue
    MANAGER: '#f59e0b', // Amber
    GUEST: '#94a3b8'  // Slate
  };

  const colors = ['#D4FF00', '#00F0FF', '#FF2E63', '#8b5cf6', '#10b981']; // Primary, Secondary, Tertiary, Violet, Emerald
  const getColor = (index: number) => colors[index % colors.length];
  const getRoleColor = (role: string | undefined, index: number) => roleColors[role || ''] || getColor(index);
  const avatarSize = compact ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-3">
        {displayEditors.map((editor, index) => {
          const role = roleResolver ? roleResolver(editor) : 'USER';
          const ringColor = getRoleColor(role, index);
          return (
            <div
              key={editor.userId}
              className={`relative flex items-center justify-center ${avatarSize} rounded-full border-2 border-white dark:border-brand-surface bg-brand-surface-light`}
              style={{ boxShadow: `0 0 0 1px ${ringColor}40` }}
              title={`${editor.userName} • ${role}`}
            >
              <div
                className="w-full h-full rounded-full opacity-80 flex items-center justify-center text-[10px] font-bold text-brand-dark"
                style={{ backgroundColor: getColor(index) }}
              >
                {editor.userName.charAt(0).toUpperCase()}
              </div>

              <div
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-brand-surface bg-status-success"
              />
            </div>
          );
        })}
        {extraCount > 0 && (
          <div
            className={`relative flex items-center justify-center ${avatarSize} rounded-full border-2 border-white dark:border-brand-surface bg-brand-surface-light text-slate-500`}
            title={`${extraCount} more editing`}
          >
            <span className="text-[10px] font-bold">+{extraCount}</span>
          </div>
        )}
      </div>
      {!compact && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
          <span>LIVE</span>
        </div>
      )}
    </div>
  );
};

export default PresenceIndicator;
