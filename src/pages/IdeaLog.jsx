import { useState, useEffect } from 'react'
import { fetchIdeas } from '../github'

const LOCAL_KEY = 'kryo_ideas_local'
const TAG_OPTIONS = ['Ad Copy', 'Creative', 'Landing Page', 'Offer', 'Audience', 'Product', 'Strategy', 'Other']

export default function IdeaLog() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [tag, setTag] = useState('Ad Copy')
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('All')
  const [lastSync, setLastSync] = useState(null)

  async function load() {
    setLoading(true)
    const remote = await fetchIdeas()
    const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    // Merge: remote is source of truth, local adds unsync'd entries
    const remoteIds = new Set(remote.map(i => i.id))
    const merged = [...remote, ...local.filter(i => !remoteIds.has(i.id))]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    setIdeas(merged)
    setLastSync(new Date())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function addLocal() {
    if (!text.trim()) return
    const entry = { id: `local_${Date.now()}`, text: text.trim(), tag, date: new Date().toISOString(), promoted: false, source: 'manual' }
    const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    localStorage.setItem(LOCAL_KEY, JSON.stringify([entry, ...local]))
    setIdeas(prev => [entry, ...prev])
    setText('')
  }

  function del(id) {
    const next = ideas.filter(i => i.id !== id)
    setIdeas(next)
    const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    localStorage.setItem(LOCAL_KEY, JSON.stringify(local.filter(i => i.id !== id)))
  }

  function toggle(id) {
    setIdeas(ideas.map(i => i.id === id ? { ...i, promoted: !i.promoted } : i))
  }

  const filtered = ideas
    .filter(i => filterTag === 'All' || i.tag === filterTag)
    .filter(i => !search || i.text.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="page-title">Idea Log</div>
      <div className="page-sub">Talk to Hans on Telegram — ideas appear here automatically</div>

      <div className="data-banner">
        🔄 Synced from GitHub · {lastSync ? `Last updated ${lastSync.toLocaleTimeString()}` : 'Loading...'} ·
        <span style={{ cursor: 'pointer', marginLeft: 6, color: 'var(--accent)' }} onClick={load}>↻ Refresh</span>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
          💬 <strong style={{ color: 'var(--text)' }}>Preferred:</strong> Tell Hans your idea on Telegram — it syncs here automatically.
          Or add manually below.
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Quick idea — ad angle, offer, creative concept, audience to test..."
              style={{ minHeight: 60 }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select value={tag} onChange={e => setTag(e.target.value)} style={{ width: 140 }}>
              {TAG_OPTIONS.map(t => <option key={t}>{t}</option>)}
            </select>
            <button className="btn btn-primary" onClick={addLocal} style={{ width: 140 }}>Add Locally</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ideas..." style={{ maxWidth: 220 }} />
        {['All', ...TAG_OPTIONS].map(t => (
          <button key={t} className={`btn ${filterTag === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterTag(t)} style={{ fontSize: 11, padding: '4px 10px' }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><h3>Loading ideas from GitHub...</h3></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No ideas yet</h3>
          <p>Tell Hans an idea on Telegram — it'll show up here. Or add one above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(idea => (
            <div key={idea.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', opacity: idea.promoted ? 0.5 : 1 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{idea.text}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                  <span className="badge badge-queue">{idea.tag}</span>
                  {idea.source === 'hans' && <span className="badge badge-running">via Hans</span>}
                  {idea.source === 'manual' && <span style={{ fontSize: 11, color: 'var(--muted)' }}>manual · local</span>}
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {new Date(idea.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  {idea.promoted && <span className="badge badge-done">→ Promoted</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="btn btn-ghost" onClick={() => toggle(idea.id)} style={{ fontSize: 11, padding: '4px 10px' }}>
                  {idea.promoted ? 'Unpromote' : '→ Experiment'}
                </button>
                <button className="btn btn-danger" onClick={() => del(idea.id)} style={{ fontSize: 12, padding: '4px 8px' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
