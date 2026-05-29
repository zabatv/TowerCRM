import { useState, useEffect } from 'react';
import { usersApi } from '../api/auth';

export function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await usersApi.list('?role=student');
      setStudents(res.data || res);
    } catch {
      try {
        const res = await usersApi.list('');
        const all = res.data || res;
        setStudents(Array.isArray(all) ? all.filter((u: any) => u.role === 'student') : []);
      } catch (err) { console.error(err); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Студенты</h1>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Филиал</th>
              <th>Статус</th>
              <th>Записан с</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s: any) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.branch?.name || '-'}</td>
                <td>{s.isActive ? 'Активен' : 'Неактивен'}</td>
                <td>{new Date(s.createdAt).toLocaleDateString('ru-RU')}</td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan={5} className="empty">Студентов нет. Конвертируйте лид, чтобы создать студента.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
