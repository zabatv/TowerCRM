import { useState, useEffect, FormEvent } from 'react';
import { branchesApi } from '../api/branches';

export function Branches() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await branchesApi.list();
      setBranches(res.data || res);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await branchesApi.update(editingId, form);
      } else {
        await branchesApi.create(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', address: '', phone: '' });
      load();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (b: any) => {
    setForm({ name: b.name, address: b.address || '', phone: b.phone || '' });
    setEditingId(b.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this branch?')) return;
    await branchesApi.delete(id);
    load();
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Branches</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', address: '', phone: '' }); }}>Add Branch</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card form-card">
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Users</th>
              <th>Groups</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b: any) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.address || '-'}</td>
                <td>{b.phone || '-'}</td>
                <td>{b._count?.users || 0}</td>
                <td>{b._count?.groups || 0}</td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => handleEdit(b)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {branches.length === 0 && <tr><td colSpan={6} className="empty">No branches found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
