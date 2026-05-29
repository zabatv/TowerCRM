import { useState, useEffect, FormEvent, useCallback } from 'react';
import { leadsApi } from '../api/leads';

const statuses = ['new', 'contacted', 'converted', 'lost'];
const sources = ['website', 'referral', 'social', 'call', 'other'];

export function Leads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'list'>('list');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: '', status: 'new', assignedTo: '', notes: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  const load = useCallback(async () => {
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const res = await leadsApi.list(params);
      setLeads(res.data || res);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener('ws:lead:created', handler);
    window.addEventListener('ws:lead:updated', handler);
    window.addEventListener('ws:lead:deleted', handler);
    window.addEventListener('ws:lead:converted', handler);
    window.addEventListener('ws:leads:bulk-assigned', handler);
    return () => {
      window.removeEventListener('ws:lead:created', handler);
      window.removeEventListener('ws:lead:updated', handler);
      window.removeEventListener('ws:lead:deleted', handler);
      window.removeEventListener('ws:lead:converted', handler);
      window.removeEventListener('ws:leads:bulk-assigned', handler);
    };
  }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await leadsApi.update(editingId, form);
      } else {
        await leadsApi.create(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', email: '', phone: '', source: '', status: 'new', assignedTo: '', notes: '' });
      load();
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await leadsApi.update(id, { status });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    await leadsApi.delete(id);
    load();
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Leads</h1>
        <div className="page-actions">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-select">
            <option value="">All Statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="btn-group">
            <button className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('list')}>List</button>
            <button className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('kanban')}>Kanban</button>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', email: '', phone: '', source: '', status: 'new', assignedTo: '', notes: '' }); }}>Add Lead</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Source</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                <option value="">Select</option>
                {sources.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {view === 'kanban' ? (
        <div className="kanban-board">
          {statuses.map((status) => (
            <div key={status} className="kanban-column">
              <h3 className="kanban-title">{status.charAt(0).toUpperCase() + status.slice(1)}</h3>
              <div className="kanban-cards">
                {leads.filter((l) => l.status === status).map((lead) => (
                  <div key={lead.id} className="kanban-card">
                    <h4>{lead.name}</h4>
                    <p className="text-muted">{lead.email || lead.phone || 'No contact'}</p>
                    {lead.source && <span className="badge">{lead.source}</span>}
                    <div className="kanban-actions">
                      <select value={lead.status} onChange={(e) => handleStatusChange(lead.id, e.target.value)} className="form-select form-select-sm">
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(lead.id)}>✕</button>
                    </div>
                  </div>
                ))}
                {leads.filter((l) => l.status === status).length === 0 && (
                  <p className="empty">No leads</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Source</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.email || lead.phone || '-'}</td>
                  <td><span className="badge">{lead.source || '-'}</span></td>
                  <td><span className={`badge badge-${lead.status}`}>{lead.status}</span></td>
                  <td>{lead.assigned?.name || '-'}</td>
                  <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select value={lead.status} onChange={(e) => handleStatusChange(lead.id, e.target.value)} className="form-select form-select-sm">
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(lead.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && <tr><td colSpan={7} className="empty">No leads found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
