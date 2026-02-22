import { useState } from 'react'

const STORAGE_KEY = 'kryo_ice_data'

const STATUS_OPTIONS = ['Queue', 'Running', 'Done', 'Paused']
const CATEGORY_OPTIONS = ['Ad Copy', 'Creative', 'Landing Page', 'Offer', 'Audience', 'Other']

const BADGE_CLASS = {
  Running: 'badge-running',
  Queue: 'badge-queue',
  Done: 'badge-done',
  Paused: 'badge-paused',
}

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
  id: Date.now(),
  name: '',
  hypothesis: '',
  category: 'Ad Copy',
  impact: '',
  confidence: '',
  ease: '',
  status: 'Queue',
  result: '',
  date: new Date().toISOString().slice(0, 10),
})

export default function IceMatrix() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  const [experiments, setExperiments] = useState(saved)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank())
  const [editId, setEditId] = useState(null)
  const [filter, setFilter] = useState('All')

  function persist(data) {
    setExperiments(data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function save() {
    if (!form.name.trim()) return
    if (editId) {
      persist(experiments.map(e => e.id === editId ? { ...form, id: editId } : e))
    } else {
      persist([...experiments, { ...form, id: Date.now() }])
    }
    setShowForm(false)
    setForm(blank())
    setEditId(null)
  }

  function edit(exp) {
    setForm({ ...exp })
    setEditId(exp.id)
    setShowForm(true)
  }

  function del(id) {
    persist(experiments.filter(e => e.id !== id))
  }

  function updateStatus(id, status) {
    persist(experiments.map(e => e.id === id ? { ...e, status } : e))
  }

  const filtered = experiments
    .filter(e => filter === 'All' || e.status === filter)
    .map(e => ({ ...e, score: iceScore(e.impact, e.confidence, e.ease) }))
    .sort((a, b) => (b.score || 0) - (a.score || 0))

  const counts = { All: experiments.length }
  STATUS_OPTIONS.forEach(s => { counts[s] = experiments.filter(e => e.status === s).length })

  return (
    <div>
      <div className="page-title">Experiment Queue</div>
      <div className="page-sub">ICE-scored — sorted by priority automatically</div>

      <div className="section-header">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All', ...STATUS_OPTIONS].map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)} style={{ fontSize: 12, padding: '5px 12px' }}>
              {f} <span style={{ opacity: 0.6 }}>{counts[f] || 0}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(blank()); setEditId(null); setShowForm(true) }}>+ Add Experiment</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No experiments yet</h3>
          <p>Add your first test above. ICE scoring will auto-prioritise your queue.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 52 }}>ICE</th>
                  <th>Experiment</th>
                  <th>Category</th>
                  <th>I</th><th>C</th><th>E</th>
                  <th>Status</th>
                  <th>Result</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(exp => (
                  <tr key={exp.id}>
                    <td>
                      <div className={`ice-score ${iceClass(exp.score)}`}>
                        {exp.score || '—'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{exp.name}</div>
                      {exp.hypothesis && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{exp.hypothesis}</div>}
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{exp.category}</td>
                    <td>{exp.impact || '—'}</td>
                    <td>{exp.confidence || '—'}</td>
                    <td>{exp.ease || '—'}</td>
                    <td>
                      <select
                        value={exp.status}
                        onChange={e => updateStatus(exp.id, e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 12, cursor: 'pointer', padding: 0, width: 'auto' }}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 12, maxWidth: 160 }}>{exp.result || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost" onClick={() => edit(exp)} style={{ fontSize: 12, padding: '4px 8px' }}>Edit</button>
                        <button className="btn btn-danger" onClick={() => del(exp.id)} style={{ fontSize: 12, padding: '4px 8px' }}>✕</button>
                      </div>
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
          <strong style={{ color: 'var(--text)' }}>ICE Scoring Guide</strong> &nbsp;·&nbsp;
          Impact: how much could this move the needle? &nbsp;·&nbsp;
          Confidence: how sure are you it'll work? &nbsp;·&nbsp;
          Ease: how fast/cheap to execute? &nbsp;·&nbsp;
          Score each 1–10. Score = average. Higher = do first.
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">{editId ? 'Edit Experiment' : 'New Experiment'}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <div className="form-label">Experiment Name *</div>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Test productivity angle in ad headline" />
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
                <div style={{ textAlign: 'center', padding: '8px', borderRadius: 8, background: 'var(--surface2)', color: 'var(--accent)', fontWeight: 700 }}>
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
