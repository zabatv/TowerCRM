import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Дашборд', icon: '📊', roles: ['admin', 'manager', 'teacher', 'sales'] },
  { path: '/schedule', label: 'Расписание', icon: '📆', roles: ['admin', 'manager', 'teacher'] },
  { path: '/leads', label: 'Лиды', icon: '👥', roles: ['admin', 'manager', 'sales'] },
  { path: '/groups', label: 'Группы', icon: '📚', roles: ['admin', 'manager', 'teacher'] },
  { path: '/lessons', label: 'Занятия', icon: '📅', roles: ['admin', 'manager', 'teacher'] },
  { path: '/students', label: 'Студенты', icon: '🎓', roles: ['admin', 'manager', 'teacher'] },
  { path: '/branches', label: 'Филиалы', icon: '🏢', roles: ['admin', 'manager'] },
  { path: '/employees', label: 'Сотрудники', icon: '👤', roles: ['admin', 'manager'] },
  { path: '/reports', label: 'Отчёты', icon: '📈', roles: ['admin', 'manager'] },
];

export function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>TowerCRM</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems
          .filter((item) => user && item.roles.includes(user.role))
          .map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
