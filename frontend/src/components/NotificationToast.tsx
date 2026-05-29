import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';

const typeColors: Record<string, string> = {
  lead: '#4f46e5',
  info: '#2563eb',
  warning: '#d97706',
  success: '#16a34a',
  error: '#dc2626',
};

export function NotificationToast() {
  const { notifications, clearNotification } = useSocket();
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    notifications.forEach((n) => {
      if (!visible[n.id]) {
        setVisible((prev) => ({ ...prev, [n.id]: true }));
        setTimeout(() => {
          setVisible((prev) => ({ ...prev, [n.id]: false }));
          setTimeout(() => clearNotification(n.id), 300);
        }, 4000);
      }
    });
  }, [notifications]);

  const handleDismiss = useCallback((id: string) => {
    setVisible((prev) => ({ ...prev, [id]: false }));
    setTimeout(() => clearNotification(id), 300);
  }, [clearNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="toast-container">
      {notifications.slice(0, 5).map((n) => (
        <div
          key={n.id}
          className={`toast ${visible[n.id] ? 'toast-enter' : 'toast-exit'}`}
          style={{ borderLeftColor: typeColors[n.type] || typeColors.info }}
        >
          <div className="toast-content">
            <div className="toast-title">{n.title}</div>
            {n.message && <div className="toast-message">{n.message}</div>}
          </div>
          <button className="toast-close" onClick={() => handleDismiss(n.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}
