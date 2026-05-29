import { useState, useEffect, FormEvent } from 'react';
import { usersApi } from '../api/auth';

export function Employees() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'teacher', branchId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await usersApi.list();
      setUsers(res.data || res);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await usersApi.update(editingId, form);
      } else {
        await usersApi.create(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', email: '', password: '', role: 'teacher', branchId: '' });
      load();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (u: any) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, branchId: u.branchId || '' });
    setEditingId(u.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this user?')) return;
    await usersApi.delete(id);
    load();
  };

  const roles = ['admin', 'manager', 'teacher', 'sales'];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Employees</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', email: '', password: '', role: 'teacher', branchId: '' }); }}>Add Employee</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card form-card">
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          {!editingId && (
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingId} minLength={6} />
            </div>
          )}
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
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
              <th>Email</th>
              <th>Role</th>
              <th>Branch</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge badge-role">{u.role}</span></td>
                <td>{u.branch?.name || '-'}</td>
                <td>{u.isActive ? '✓' : '✗'}</td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => handleEdit(u)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>Deactivate</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={6} className="empty">No employees found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
