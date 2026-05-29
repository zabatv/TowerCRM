import { useState, useEffect, FormEvent } from 'react';
import { lessonsApi } from '../api/lessons';

const statusLabels: Record<string, string> = { scheduled: 'Запланировано', completed: 'Завершено', cancelled: 'Отменено' };

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
    if (!confirm('Удалить это занятие?')) return;
    await lessonsApi.delete(id);
    load();
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Занятия</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: '', description: '', dateTime: '', duration: 60, teacherId: '', groupId: '', branchId: '' }); }}>+ Занятие</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card form-card">
          <div className="form-row">
            <div className="form-group">
              <label>Название *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Дата и время *</label>
              <input type="datetime-local" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Длительность (мин)</label>
              <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} min={15} />
            </div>
          </div>
          <div className="form-group">
            <label>Описание</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
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
              <th>Дата и время</th>
              <th>Длит.</th>
              <th>Преподаватель</th>
              <th>Группа</th>
              <th>Филиал</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l: any) => (
              <tr key={l.id}>
                <td>{l.title}</td>
                <td>{new Date(l.dateTime).toLocaleString('ru-RU')}</td>
                <td>{l.duration} мин</td>
                <td>{l.teacher?.name || '-'}</td>
                <td>{l.group?.name || '-'}</td>
                <td>{l.branch?.name || '-'}</td>
                <td><span className={`badge badge-${l.status}`}>{statusLabels[l.status] || l.status}</span></td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(l.id)}>Удалить</button>
                </td>
              </tr>
            ))}
            {lessons.length === 0 && <tr><td colSpan={8} className="empty">Занятий нет</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
