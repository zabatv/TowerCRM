import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard';

export function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.stats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return null;

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.leads.total}</div>
          <div className="stat-label">Total Leads</div>
        </div>
        <div className="stat-card stat-new">
          <div className="stat-value">{stats.leads.new}</div>
          <div className="stat-label">New Leads</div>
        </div>
        <div className="stat-card stat-converted">
          <div className="stat-value">{stats.leads.conversionRate}%</div>
          <div className="stat-label">Conversion Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.users}</div>
          <div className="stat-label">Employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.groups}</div>
          <div className="stat-label">Active Groups</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.lessons}</div>
          <div className="stat-label">Total Lessons</div>
        </div>
      </div>

      {stats.upcomingLessons && stats.upcomingLessons.length > 0 && (
        <div className="section">
          <h2>Upcoming Lessons</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date & Time</th>
                  <th>Teacher</th>
                  <th>Group</th>
                  <th>Branch</th>
                </tr>
              </thead>
              <tbody>
                {stats.upcomingLessons.map((lesson: any) => (
                  <tr key={lesson.id}>
                    <td>{lesson.title}</td>
                    <td>{new Date(lesson.dateTime).toLocaleString()}</td>
                    <td>{lesson.teacher?.name || '-'}</td>
                    <td>{lesson.group?.name || '-'}</td>
                    <td>{lesson.branch?.name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="quick-links">
        <Link to="/leads" className="btn btn-primary">Manage Leads</Link>
        <Link to="/groups" className="btn btn-outline">View Groups</Link>
        <Link to="/lessons" className="btn btn-outline">View Lessons</Link>
      </div>
    </div>
  );
}
