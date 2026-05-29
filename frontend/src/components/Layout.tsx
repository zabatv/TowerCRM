import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NotificationToast } from './NotificationToast';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

export function Layout() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <span>Привет, {user?.name}</span>
          </div>
          <div className="topbar-actions">
            <span className={`connection-status ${connected ? 'online' : 'offline'}`}>
              {connected ? '● Онлайн' : '○ Офлайн'}
            </span>
            <span className="user-role">{user?.role}</span>
            <button onClick={logout} className="btn btn-sm btn-outline">Выйти</button>
          </div>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
      <NotificationToast />
    </div>
  );
}
