import { useState, useEffect, FormEvent } from 'react';
import { lessonsApi } from '../api/lessons';

export function Lessons() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dateTime: '', duration: 60, teacherId: '', groupId: '', branchId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await lessonsApi.list();
      setLessons(res.data || res);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, dateTime: new Date(form.dateTime).toISOString() };
      if (editingId) {
        await lessonsApi.update(editingId, data);
      } else {
        await lessonsApi.create(data);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: '', description: '', dateTime: '', duration: 60, teacherId: '', groupId: '', branchId: '' });
      load();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lesson?')) return;
    await lessonsApi.delete(id);
    load();
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Lessons</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: '', description: '', dateTime: '', duration: 60, teacherId: '', groupId: '', branchId: '' }); }}>Add Lesson</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Date & Time *</label>
              <input type="datetime-local" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Duration (min)</label>
              <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} min={15} />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date & Time</th>
              <th>Duration</th>
              <th>Teacher</th>
              <th>Group</th>
              <th>Branch</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l: any) => (
              <tr key={l.id}>
                <td>{l.title}</td>
                <td>{new Date(l.dateTime).toLocaleString()}</td>
                <td>{l.duration} min</td>
                <td>{l.teacher?.name || '-'}</td>
                <td>{l.group?.name || '-'}</td>
                <td>{l.branch?.name || '-'}</td>
                <td><span className={`badge badge-${l.status}`}>{l.status}</span></td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(l.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {lessons.length === 0 && <tr><td colSpan={8} className="empty">No lessons found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
