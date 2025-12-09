/**
 * Notification Center Component
 *
 * macOS-style notification panel that slides in from the top-right.
 * Displays system notifications with timestamps and dismiss functionality.
 *
 * @module components/layout/NotificationCenter
 */

import React from 'react';
import { Bell, X } from 'lucide-react';

/** Notification data structure */
export interface Notification {
  /** Unique identifier */
  id: string;
  /** Notification title */
  title: string;
  /** Notification message body */
  message: string;
  /** When the notification was created */
  time: Date;
}

/** Props for the NotificationCenter component */
export interface NotificationCenterProps {
  /** Whether the notification center is visible */
  isOpen: boolean;
  /** Array of notifications to display */
  notifications: Notification[];
  /** Callback to close the notification center */
  onClose: () => void;
  /** Callback to dismiss a single notification */
  onDismiss: (id: string) => void;
  /** Callback to clear all notifications */
  onClearAll: () => void;
}

/**
 * Notification Center panel for displaying system notifications.
 * Appears as a slide-down panel from the menu bar.
 *
 * @example
 * ```tsx
 * <NotificationCenter
 *   isOpen={isNotificationCenterOpen}
 *   notifications={notifications}
 *   onClose={() => setIsNotificationCenterOpen(false)}
 *   onDismiss={(id) => removeNotification(id)}
 *   onClearAll={() => setNotifications([])}
 * />
 * ```
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  notifications,
  onClose,
  onDismiss,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - clicking closes the panel */}
      <div className="fixed inset-0 z-[150]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-10 right-2 w-80 max-h-[500px] overflow-hidden z-[151] animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-black dark:text-white">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[10px] text-blue-500 hover:text-blue-600 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              // Empty state
              <div className="p-8 text-center">
                <Bell size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-400">No notifications</p>
              </div>
            ) : (
              // Notification list
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-black dark:text-white">
                        {notif.title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        {notif.time.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => onDismiss(notif.id)}
                      className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                      aria-label="Dismiss notification"
                    >
                      <X size={12} className="text-zinc-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
