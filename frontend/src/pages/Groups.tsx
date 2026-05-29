import { useState, useEffect, FormEvent } from 'react';
import { groupsApi } from '../api/groups';

export function Groups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', course: '', level: '', capacity: 10, teacherId: '', branchId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await groupsApi.list();
      setGroups(res.data || res);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await groupsApi.update(editingId, form);
      } else {
        await groupsApi.create(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', course: '', level: '', capacity: 10, teacherId: '', branchId: '' });
      load();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту группу?')) return;
    await groupsApi.delete(id);
    load();
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Группы</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', course: '', level: '', capacity: 10, teacherId: '', branchId: '' }); }}>+ Группа</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Название *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Курс</label>
              <input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Уровень</label>
              <input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Вместимость</label>
              <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} min={1} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editingId ? 'Обновить' : 'Создать'}</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Отмена</button>
          </div>
        </form>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Курс / Уровень</th>
              <th>Вместимость</th>
              <th>Записано</th>
              <th>Преподаватель</th>
              <th>Филиал</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g: any) => (
              <tr key={g.id}>
                <td>{g.name}</td>
                <td>{g.course} {g.level ? `(${g.level})` : ''}</td>
                <td>{g.capacity}</td>
                <td>
                  <div className="capacity-bar">
                    <div className="capacity-fill" style={{ width: `${(g.enrolledCount / g.capacity) * 100}%` }} />
                    <span>{g.enrolledCount}/{g.capacity}</span>
                  </div>
                </td>
                <td>{g.teacher?.name || '-'}</td>
                <td>{g.branch?.name || '-'}</td>
                <td><span className={`badge badge-${g.status}`}>{g.status === 'active' ? 'Активна' : g.status}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline" onClick={() => { setForm({ name: g.name, course: g.course || '', level: g.level || '', capacity: g.capacity, teacherId: g.teacherId || '', branchId: g.branchId || '' }); setEditingId(g.id); setShowForm(true); }}>Ред.</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(g.id)}>Удалить</button>
                </td>
              </tr>
            ))}
            {groups.length === 0 && <tr><td colSpan={8} className="empty">Групп нет</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
