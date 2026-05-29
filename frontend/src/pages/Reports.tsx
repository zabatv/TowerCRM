import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboard';
import { leadsApi } from '../api/leads';

export function Reports() {
  const [stats, setStats] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.stats(),
      leadsApi.list('?limit=100'),
    ])
      .then(([s, l]) => {
        setStats(s);
        setLeads(l.data || l);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  const exportCsv = () => {
    if (!leads.length) return;
    const headers = 'Name,Email,Phone,Source,Status,Created\n';
    const rows = leads.map((l: any) => `${l.name},${l.email || ''},${l.phone || ''},${l.source || ''},${l.status},${new Date(l.createdAt).toISOString()}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Reports</h1>
        <button className="btn btn-primary" onClick={exportCsv}>Export Leads CSV</button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.leads.total}</div>
            <div className="stat-label">Total Leads</div>
          </div>
          <div className="stat-card stat-new">
            <div className="stat-value">{stats.leads.new}</div>
            <div className="stat-label">New</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.leads.contacted}</div>
            <div className="stat-label">Contacted</div>
          </div>
          <div className="stat-card stat-converted">
            <div className="stat-value">{stats.leads.converted}</div>
            <div className="stat-label">Converted</div>
          </div>
          <div className="stat-card stat-lost">
            <div className="stat-value">{stats.leads.lost}</div>
            <div className="stat-label">Lost</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.leads.conversionRate}%</div>
            <div className="stat-label">Conversion Rate</div>
          </div>
        </div>
      )}

      <div className="section">
        <h2>Lead Breakdown by Source</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {['website', 'referral', 'social', 'call', 'other'].map((src) => (
              <tr key={src}>
                <td>{src}</td>
                <td>{leads.filter((l) => l.source === src).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
