import { useState, useEffect } from 'react';
import { branchesApi } from '../api/branches';
import { lessonsApi } from '../api/lessons';

const HOURS = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function Schedule() {
  const [branches, setBranches] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  useEffect(() => {
    Promise.all([
      branchesApi.list(),
      lessonsApi.calendar(`?from=${selectedDate}T00:00:00&to=${selectedDate}T23:59:59`),
    ])
      .then(([b, l]) => {
        setBranches(b.data || b);
        setLessons(l.data || l);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const getLesson = (branchId: string, hour: string) => {
    const [h] = hour.split(':');
    const start = new Date(`${selectedDate}T${hour}:00`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return lessons.filter((l: any) => {
      if (l.branchId !== branchId) return false;
      const lt = new Date(l.dateTime);
      return lt >= start && lt < end;
    });
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  const dateObj = new Date(selectedDate);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Расписание</h1>
      </div>

      <div className="schedule-controls">
        <button className="schedule-nav-btn" onClick={() => setSelectedDate(formatDate(addDays(dateObj, -1)))}>←</button>
        <input type="date" className="schedule-date-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        <button className="schedule-nav-btn" onClick={() => setSelectedDate(formatDate(addDays(dateObj, 1)))}>→</button>
        <button className="btn btn-sm btn-outline" onClick={() => setSelectedDate(formatDate(new Date()))}>Сегодня</button>
      </div>

      {branches.length === 0 ? (
        <div className="schedule-empty">Нет филиалов для отображения</div>
      ) : (
        <div className="schedule-grid">
          <table className="schedule-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Время</th>
                {branches.map((b: any) => (
                  <th key={b.id}>{b.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour}>
                  <td className="time-cell">{hour}</td>
                  {branches.map((b: any) => {
                    const cellLessons = getLesson(b.id, hour);
                    return (
                      <td key={b.id}>
                        {cellLessons.map((l: any) => (
                          <div key={l.id} className="schedule-lesson" title={`${l.title} - ${l.teacher?.name || ''}`}>
                            <span className="lesson-title">{l.title}</span>
                            <span className="lesson-meta">{l.teacher?.name || ''}{l.group ? ` · ${l.group.name}` : ''}</span>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="schedule-legend">
        <div className="schedule-legend-item">
          <div className="schedule-legend-color" style={{ background: 'var(--primary-light)', borderLeft: '3px solid var(--primary)' }} />
          Занятие
        </div>
      </div>
    </div>
  );
}
