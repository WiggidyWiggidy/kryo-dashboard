import { useState, useEffect } from 'react'
import { fetchExperiments } from '../github'

const STATUS_OPTIONS = ['Queue', 'Running', 'Done', 'Paused']
const CATEGORY_OPTIONS = ['Ad Copy', 'Creative', 'Landing Page', 'Offer', 'Audience', 'Other']

function iceScore(i, c, e) {
  const avg = (Number(i) + Number(c) + Number(e)) / 3
  return isNaN(avg) || avg === 0 ? null : Math.round(avg * 10) / 10
}

function iceClass(score) {
  if (!score) return ''
  if (score >= 7) return 'ice-high'
  if (score >= 4) return 'ice-mid'
  return 'ice-low'
}

export default function IceMatrix() {
  const [experiments, setExperiments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [lastUpdated, setLastUpdated] = useState(null)

  async function load() {
    setLoading(true)
    const data = await fetchExperiments()
    setExperiments(data)
    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  const filtered = experiments
    .filter(e => filter === 'All' || e.status === filter)
    .map(e => ({ ...e, score: iceScore(e.impact, e.confidence, e.ease) }))
    .sort((a, b) => (b.score || 0) - (a.score || 0))

  const counts = { All: experiments.length }
  STATUS_OPTIONS.forEach(s => { counts[s] = experiments.filter(e => e.status === s).length })

  const BADGE_CLASS = { Running: 'badge-running', Queue: 'badge-queue', Done: 'badge-done', Paused: 'badge-paused' }

  return (
    <div>
      <div className="page-title">Experiment Queue</div>
      <div className="page-sub">ICE-scored — sorted by priority. Tell Hans to add or update experiments.</div>

      <div className="data-banner">
        🧪 To add an experiment: tell Hans in Telegram. Updates sync every 60 seconds.
        {lastUpdated && <span style={{ marginLeft: 8, opacity: 0.6 }}>Last synced: {lastUpdated.toLocaleTimeString()}</span>}
        <button onClick={load} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>↻ Refresh</button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {['All', ...STATUS_OPTIONS].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)} style={{ fontSize: 12, padding: '5px 12px' }}>
            {f} <span style={{ opacity: 0.6 }}>{counts[f] || 0}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading experiments from GitHub...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No experiments yet</h3>
          <p>Tell Hans to add your first experiment to the ICE matrix.</p>
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
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp, i) => (
                  <tr key={exp.id || i}>
                    <td>
                      <div className={`ice-score ${iceClass(exp.score)}`}>{exp.score || '—'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{exp.name}</div>
                      {exp.hypothesis && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{exp.hypothesis}</div>}
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{exp.category}</td>
                    <td>{exp.impact || '—'}</td>
                    <td>{exp.confidence || '—'}</td>
                    <td>{exp.ease || '—'}</td>
                    <td><span className={`badge ${BADGE_CLASS[exp.status] || 'badge-queue'}`}>{exp.status || 'Queue'}</span></td>
                    <td style={{ color: 'var(--muted)', fontSize: 12, maxWidth: 160 }}>{exp.result || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16, padding: '14px 20px' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--text)' }}>ICE Guide</strong> &nbsp;·&nbsp;
          Impact: how much could this move the needle? &nbsp;·&nbsp;
          Confidence: how sure are we? &nbsp;·&nbsp;
          Ease: how fast/cheap to execute? &nbsp;·&nbsp;
          Score 1–10 each. Higher = do first.
        </div>
      </div>
    </div>
  )
}
