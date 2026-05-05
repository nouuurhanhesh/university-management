import React, { useState, useEffect } from "react";
import "./RoomReservation.css";

const DAYS = ['Mon 5', 'Tue 6', 'Wed 7', 'Thu 8', 'Fri 9'];
const TIMES = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];
const ROOMS = ['LH-101','SR-202','CR-305','LAB-410'];
const dateMap = ['2026-05-05','2026-05-06','2026-05-07','2026-05-08','2026-05-09'];

export default function RoomReservation() {
  const [tab, setTab] = useState('availability');
  const [filter, setFilter] = useState('all');
  
  const [reservations, setReservations] = useState(() => {
    const saved = localStorage.getItem('uni_reservations');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, room: 'LH-101', day: 0, start: '09:00', end: '11:00', purpose: 'CS101 Lecture', mine: false },
      { id: 2, room: 'SR-202', day: 1, start: '13:00', end: '15:00', purpose: 'Faculty Senate', mine: false },
      { id: 3, room: 'CR-305', day: 2, start: '10:00', end: '12:00', purpose: 'Orientation Planning', mine: true },
    ];
  });

  useEffect(() => {
    localStorage.setItem('uni_reservations', JSON.stringify(reservations));
  }, [reservations]);

  const [form, setForm] = useState({ room: '', date: '2026-05-05', start: '08:00', end: '09:00', purpose: '' });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isSlotOccupied = (room, dayIdx, time) => {
    return reservations.find(r => r.room === room && r.day === dayIdx && time >= r.start && time < r.end);
  };

  const makeReservation = () => {
    if (!form.room || !form.purpose) return showToast('Fill all fields', 'alert-danger');
    if (form.start >= form.end) return showToast('Invalid time', 'alert-danger');

    const dayIdx = dateMap.indexOf(form.date);
    if (dayIdx === -1) return showToast('Date must be between May 5 and May 9', 'alert-danger');

    const conflict = reservations.find(r => r.room === form.room && r.day === dayIdx && !(form.end <= r.start || form.start >= r.end));
    if (conflict) return showToast('Conflict with another reservation', 'alert-danger');

    setReservations(prev => [...prev, {
      id: Date.now(),
      room: form.room,
      day: dayIdx,
      start: form.start,
      end: form.end,
      purpose: form.purpose,
      mine: true
    }]);

    showToast('Reservation successful!', 'success');
    setForm({ ...form, purpose: '' });
    setTab('my');
  };

  const cancelReservation = (id) => {
    if(window.confirm('Are you sure you want to cancel this reservation?')) {
      setReservations(prev => prev.filter(r => r.id !== id));
      showToast('Reservation cancelled', 'success');
    }
  };

  const renderGrid = () => {
    const rooms = filter === 'all' ? ROOMS : [filter];

    return (
      <div className="calendar-grid">
        <div className="calendar-header" style={{background: 'transparent'}}></div>
        {DAYS.map(d => <div key={d} className="calendar-header">{d}</div>)}

        {TIMES.map(time => (
          <React.Fragment key={time}>
            <div className="calendar-time">{time}</div>
            {DAYS.map((_, di) => {
              const occupied = rooms.map(r => isSlotOccupied(r, di, time)).filter(Boolean);

              if (occupied.length > 0) {
                const isMine = occupied.some(o => o.mine);
                return (
                  <div key={`${di}-${time}`} className={`calendar-cell ${isMine ? 'mine' : 'other'}`}>
                    {occupied.map(o => (
                      <div key={o.id} className={`reservation-block ${o.mine ? 'reservation-mine' : 'reservation-other'}`}>
                        <div className="reservation-title">{o.room}</div>
                        <div className="reservation-subtitle">{o.purpose}</div>
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <div key={`${di}-${time}`} onClick={() => {
                  setForm({ ...form, room: rooms[0] !== 'all' ? rooms[0] : ROOMS[0], start: time, date: dateMap[di] });
                  setTab('reserve');
                }} className="calendar-cell empty"></div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="glass-card">
        <h2>Room Reservations</h2>
        <p className="mb-4" style={{ color: 'var(--text-muted)' }}>Manage and book lecture halls, seminar rooms, and labs.</p>

        {toast && (
          <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {toast.msg}
          </div>
        )}

        <div className="reservation-tabs">
          <button 
            className={`tab-btn ${tab === 'availability' ? 'active' : ''}`} 
            onClick={() => setTab('availability')}
          >
            Availability
          </button>
          <button 
            className={`tab-btn ${tab === 'reserve' ? 'active' : ''}`} 
            onClick={() => setTab('reserve')}
          >
            Reserve a Room
          </button>
          <button 
            className={`tab-btn ${tab === 'my' ? 'active' : ''}`} 
            onClick={() => setTab('my')}
          >
            My Reservations
          </button>
        </div>

        {tab === 'availability' && (
          <>
            <div className="filter-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <select className="form-control" style={{ width: '250px' }} value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="all">All Rooms</option>
                  {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            {renderGrid()}
          </>
        )}

        {tab === 'reserve' && (
          <div style={{ maxWidth: '600px' }}>
            <div className="form-group">
              <label>Select Room</label>
              <select className="form-control" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })}>
                <option value="">-- Choose a Room --</option>
                {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input type="date" className="form-control" min={dateMap[0]} max={dateMap[4]} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Start Time</label>
                <select className="form-control" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })}>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>End Time</label>
                <select className="form-control" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })}>
                  {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Purpose</label>
              <input className="form-control" placeholder="e.g. CS101 Lecture" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} />
            </div>

            <button onClick={makeReservation} className="btn-primary" style={{ width: '100%' }}>
              Confirm Reservation
            </button>
          </div>
        )}

        {tab === 'my' && (
          <div className="my-reservations-list">
            {reservations.filter(r => r.mine).length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>You have no active reservations.</p>
            ) : (
              reservations.filter(r => r.mine).map(r => (
                <div key={r.id} className="my-reservation-item">
                  <div className="my-reservation-info">
                    <h4>{r.purpose}</h4>
                    <div className="my-reservation-meta">
                      {r.room} &bull; {DAYS[r.day]} &bull; {r.start} - {r.end}
                    </div>
                  </div>
                  <button onClick={() => cancelReservation(r.id)} className="btn-danger">Cancel</button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
