import { useState, useEffect } from 'react'
import { gh } from '../github'

const LS_KEY = 'kryo_ice_data'
const STATUS_OPTIONS = ['Queue', 'Running', 'Done', 'Paused']
const CATEGORY_OPTIONS = ['Ad Copy', 'Creative', 'Landing Page', 'Offer', 'Audience', 'Other']

function iceScore(i, c, e) {
  const avg = (Number(i) + Number(c) + Number(e)) / 3
  return isNaN(avg) ? null : Math.round(avg * 10) / 10
}

function iceClass(score) {
  if (!score) return ''
  if (score >= 7) return 'ice-high'
  if (score >= 4) return 'ice-mid'
  return 'ice-low'
}

const blank = () => ({
  id: Date.now(), name: '', hypothesis: '', category: 'Ad Copy',
  impact: '', confidence: '', ease: '', status: 'Queue', result: '',
  date: new Date().toISOString().slice(0, 10),
})

export default function IceMatrix() {
  const [ghExps, setGhExps]     = useState([])
  const [lsExps, setLsExps]     = useState(JSON.parse(localStorage.getItem(LS_KEY) || '[]'))
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(blank())
  const [editId, setEditId]     = useState(null)
  const [filter, setFilter]     = useState('All')

  function loadGH() {
    setLoading(true)
    gh.experiments().then(d => {
      if (d?.experiments) setGhExps(d.experiments)
      setLoading(false)
    })
  }

  useEffect(() => { loadGH() }, [])

  function persistLS(data) {
    setLsExps(data)
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  }

  function save() {
    if (!form.name.trim()) return
    if (editId) {
      persistLS(lsExps.map(e => e.id === editId ? { ...form, id: editId } : e))
    } else {
      persistLS([...lsExps, { ...form, id: Date.now(), _source: 'manual' }])
    }
    setShowForm(false); setForm(blank()); setEditId(null)
  }

  function edit(exp) { setForm({ ...exp }); setEditId(exp.id); setShowForm(true) }
  function del(id)   { persistLS(lsExps.filter(e => e.id !== id)) }

  function updateStatus(id, status) {
    persistLS(lsExps.map(e => e.id === id ? { ...e, status } : e))
  }

  const all = [
    ...ghExps.map(e => ({ ...e, _source: 'hans', score: iceScore(e.impact, e.confidence, e.ease) })),
    ...lsExps.map(e => ({ ...e, _source: e._source || 'manual', score: iceScore(e.impact, e.confidence, e.ease) })),
  ]
  .filter(e => filter === 'All' || e.status === filter)
  .sort((a, b) => (b.score || 0) - (a.score || 0))

  const counts = { All: all.length }
  STATUS_OPTIONS.forEach(s => { counts[s] = all.filter(e => e.status === s).length })

  return (
    <div>
      <div className="page-title">Experiment Queue</div>
      <div className="page-sub">ICE-scored and auto-prioritised — Hans queues experiments, you approve and run</div>

      <div className="section-header">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All', ...STATUS_OPTIONS].map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)} style={{ fontSize: 12, padding: '5px 12px' }}>
              {f} <span style={{ opacity: 0.6 }}>{counts[f] || 0}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={loadGH} style={{ fontSize: 12 }}>↻ Refresh</button>
          <button className="btn btn-primary" onClick={() => { setForm(blank()); setEditId(null); setShowForm(true) }}>+ Add Experiment</button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading from GitHub...</p></div>
      ) : all.length === 0 ? (
        <div className="empty-state">
          <h3>No experiments yet</h3>
          <p>Hans will queue experiments based on data. You can also add manually above.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th style={{ width: 52 }}>ICE</th><th>Experiment</th><th>Category</th><th>I</th><th>C</th><th>E</th><th>Status</th><th>Source</th><th>Result</th><th></th></tr>
              </thead>
              <tbody>
                {all.map(exp => (
                  <tr key={exp.id}>
                    <td><div className={`ice-score ${iceClass(exp.score)}`}>{exp.score || '—'}</div></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{exp.name}</div>
                      {exp.hypothesis && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{exp.hypothesis}</div>}
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{exp.category}</td>
                    <td>{exp.impact || '—'}</td>
                    <td>{exp.confidence || '—'}</td>
                    <td>{exp.ease || '—'}</td>
                    <td>
                      {exp._source === 'manual' ? (
                        <select value={exp.status} onChange={e => updateStatus(exp.id, e.target.value)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 12, cursor: 'pointer', padding: 0, width: 'auto' }}>
                          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className={`badge badge-${exp.status?.toLowerCase() === 'running' ? 'running' : exp.status?.toLowerCase() === 'done' ? 'done' : 'queue'}`}>{exp.status}</span>
                      )}
                    </td>
                    <td style={{ fontSize: 11, color: exp._source === 'hans' ? 'var(--accent)' : 'var(--muted)' }}>
                      {exp._source === 'hans' ? '🤖 Hans' : '✍️ Manual'}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 12, maxWidth: 140 }}>{exp.result || '—'}</td>
                    <td>
                      {exp._source === 'manual' && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost" onClick={() => edit(exp)} style={{ fontSize: 11, padding: '3px 8px' }}>Edit</button>
                          <button className="btn btn-danger" onClick={() => del(exp.id)} style={{ fontSize: 11, padding: '3px 7px' }}>✕</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16, padding: '14px 20px' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--text)' }}>ICE Guide</strong> · Impact: needle movement (1–10) · Confidence: how sure (1–10) · Ease: speed/cost to run (1–10) · Score = average. Higher = run first.
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">{editId ? 'Edit Experiment' : 'New Experiment'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <div className="form-label">Name *</div>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Test productivity angle in headline" />
              </div>
              <div className="form-group">
                <div className="form-label">Hypothesis</div>
                <textarea value={form.hypothesis} onChange={e => setForm({ ...form, hypothesis: e.target.value })} placeholder="We believe that... will result in..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <div className="form-label">Category</div>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <div className="form-label">Status</div>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {['impact', 'confidence', 'ease'].map(f => (
                  <div className="form-group" key={f}>
                    <div className="form-label">{f.charAt(0).toUpperCase() + f.slice(1)} (1–10)</div>
                    <input type="number" min="1" max="10" value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} />
                  </div>
                ))}
              </div>
              {form.impact && form.confidence && form.ease && (
                <div style={{ textAlign: 'center', padding: 8, borderRadius: 8, background: 'var(--surface2)', color: 'var(--accent)', fontWeight: 700 }}>
                  ICE Score: {iceScore(form.impact, form.confidence, form.ease)}
                </div>
              )}
              <div className="form-group">
                <div className="form-label">Result / Notes</div>
                <textarea value={form.result} onChange={e => setForm({ ...form, result: e.target.value })} placeholder="Leave blank while running..." />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
