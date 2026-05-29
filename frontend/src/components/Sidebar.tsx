import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊', roles: ['admin', 'manager', 'teacher', 'sales'] },
  { path: '/leads', label: 'Leads', icon: '👥', roles: ['admin', 'manager', 'sales'] },
  { path: '/groups', label: 'Groups', icon: '📚', roles: ['admin', 'manager', 'teacher'] },
  { path: '/lessons', label: 'Lessons', icon: '📅', roles: ['admin', 'manager', 'teacher'] },
  { path: '/students', label: 'Students', icon: '🎓', roles: ['admin', 'manager', 'teacher'] },
  { path: '/branches', label: 'Branches', icon: '🏢', roles: ['admin', 'manager'] },
  { path: '/employees', label: 'Employees', icon: '👤', roles: ['admin', 'manager'] },
  { path: '/reports', label: 'Reports', icon: '📈', roles: ['admin', 'manager'] },
];

export function Sidebar() {
  const { hasRole } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>TowerCRM</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems
          .filter((item) => item.roles.some((r) => hasRole(r)))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
