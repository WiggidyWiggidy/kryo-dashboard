import { useState, useEffect } from 'react'
import { gh } from '../github'

const LS_KEY = 'kryo_ideas'
const TAG_OPTIONS = ['Ad Copy', 'Creative', 'Landing Page', 'Offer', 'Audience', 'Product', 'Strategy', 'Other']

export default function IdeaLog() {
  const [ghIdeas, setGhIdeas]   = useState([])
  const [lsIdeas, setLsIdeas]   = useState(JSON.parse(localStorage.getItem(LS_KEY) || '[]'))
  const [loading, setLoading]   = useState(true)
  const [text, setText]         = useState('')
  const [tag, setTag]           = useState('Ad Copy')
  const [search, setSearch]     = useState('')
  const [filterTag, setFilterTag] = useState('All')
  const [source, setSource]     = useState('all') // 'all' | 'hans' | 'local'

  useEffect(() => {
    gh.ideas().then(d => {
      if (d?.ideas) setGhIdeas(d.ideas)
      setLoading(false)
    })
  }, [])

  function refreshGH() {
    setLoading(true)
    gh.ideas().then(d => {
      if (d?.ideas) setGhIdeas(d.ideas)
      setLoading(false)
    })
  }

  function addLocal() {
    if (!text.trim()) return
    const next = [{ id: Date.now(), text: text.trim(), tag, date: new Date().toISOString(), source: 'manual', promoted: false }, ...lsIdeas]
    setLsIdeas(next)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
    setText('')
  }

  function delLocal(id) {
    const next = lsIdeas.filter(i => i.id !== id)
    setLsIdeas(next)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
  }

  const all = [
    ...ghIdeas.map(i => ({ ...i, _source: 'hans' })),
    ...lsIdeas.map(i => ({ ...i, _source: 'manual' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  const filtered = all
    .filter(i => source === 'all' || i._source === source)
    .filter(i => filterTag === 'All' || i.tag === filterTag)
    .filter(i => !search || i.text.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="page-title">Idea Log</div>
      <div className="page-sub">Hans logs ideas from your conversations — they appear here automatically</div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add an idea manually here, or just tell Hans in conversation and it'll appear automatically..."
              style={{ minHeight: 60 }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select value={tag} onChange={e => setTag(e.target.value)} style={{ width: 140 }}>
              {TAG_OPTIONS.map(t => <option key={t}>{t}</option>)}
            </select>
            <button className="btn btn-primary" onClick={addLocal} style={{ width: 140 }}>Add Idea</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ maxWidth: 180 }} />
          {['All', ...TAG_OPTIONS].map(t => (
            <button key={t} className={`btn ${filterTag === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterTag(t)} style={{ fontSize: 11, padding: '4px 10px' }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {['all', 'hans', 'manual'].map(s => (
            <button key={s} className={`btn ${source === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSource(s)} style={{ fontSize: 11, padding: '4px 10px', textTransform: 'capitalize' }}>{s === 'hans' ? '🤖 From Hans' : s === 'manual' ? '✍️ Manual' : 'All'}</button>
          ))}
          <button className="btn btn-ghost" onClick={refreshGH} style={{ fontSize: 11, padding: '4px 10px' }}>↻ Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading from GitHub...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No ideas yet</h3>
          <p>Tell Hans an idea in conversation — it'll appear here automatically.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(idea => (
            <div key={idea.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{idea.text}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="badge badge-queue">{idea.tag}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {new Date(idea.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  {idea._source === 'hans' && <span style={{ fontSize: 11, color: 'var(--accent)' }}>🤖 via Hans</span>}
                  {idea.promoted && <span className="badge badge-done">→ Promoted</span>}
                </div>
              </div>
              {idea._source === 'manual' && (
                <button className="btn btn-danger" onClick={() => delLocal(idea.id)} style={{ fontSize: 12, padding: '4px 8px', flexShrink: 0 }}>✕</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
