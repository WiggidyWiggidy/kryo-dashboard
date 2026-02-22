import { useState, useEffect } from 'react'
import { fetchIdeas } from '../github'

const TAG_OPTIONS = ['Ad Copy', 'Creative', 'Landing Page', 'Offer', 'Audience', 'Product', 'Strategy', 'Other']

export default function IdeaLog() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('All')
  const [lastUpdated, setLastUpdated] = useState(null)

  async function load() {
    setLoading(true)
    const data = await fetchIdeas()
    setIdeas(data)
    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => {
    load()
    // Auto-refresh every 60 seconds to pick up new ideas Hans adds
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  const filtered = ideas
    .filter(i => filterTag === 'All' || i.tag === filterTag)
    .filter(i => !search || i.text?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="page-title">Idea Log</div>
      <div className="page-sub">Tell Hans an idea in Telegram — it appears here automatically</div>

      <div className="data-banner">
        💬 To add an idea: just tell Hans in Telegram. Ideas sync from GitHub every 60 seconds.
        {lastUpdated && <span style={{ marginLeft: 8, opacity: 0.6 }}>Last synced: {lastUpdated.toLocaleTimeString()}</span>}
        <button onClick={load} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>↻ Refresh</button>
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
        <div className="empty-state"><p>Loading ideas from GitHub...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No ideas yet</h3>
          <p>Tell Hans an idea in Telegram and it will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((idea, i) => (
            <div key={idea.id || i} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', opacity: idea.promoted ? 0.55 : 1 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{idea.text}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  {idea.tag && <span className="badge badge-queue">{idea.tag}</span>}
                  {idea.source && <span style={{ fontSize: 11, color: 'var(--muted)' }}>via {idea.source}</span>}
                  {idea.date && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(idea.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                  {idea.promoted && <span className="badge badge-done">→ Promoted to Experiment</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
