import { useState } from 'react'

const STORAGE_KEY = 'kryo_ideas'
const TAG_OPTIONS = ['Ad Copy', 'Creative', 'Landing Page', 'Offer', 'Audience', 'Product', 'Strategy', 'Other']

export default function IdeaLog() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  const [ideas, setIdeas] = useState(saved)
  const [text, setText] = useState('')
  const [tag, setTag] = useState('Ad Copy')
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('All')

  function persist(data) {
    setIdeas(data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function add() {
    if (!text.trim()) return
    persist([{ id: Date.now(), text: text.trim(), tag, date: new Date().toISOString(), promoted: false }, ...ideas])
    setText('')
  }

  function del(id) { persist(ideas.filter(i => i.id !== id)) }
  function toggle(id) { persist(ideas.map(i => i.id === id ? { ...i, promoted: !i.promoted } : i)) }

  const filtered = ideas
    .filter(i => filterTag === 'All' || i.tag === filterTag)
    .filter(i => !search || i.text.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="page-title">Idea Log</div>
      <div className="page-sub">Brain dump your ideas fast — promote the good ones to experiments</div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Drop an idea here — copy angle, creative concept, offer idea, anything..."
              style={{ minHeight: 60 }}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) add() }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select value={tag} onChange={e => setTag(e.target.value)} style={{ width: 140 }}>
              {TAG_OPTIONS.map(t => <option key={t}>{t}</option>)}
            </select>
            <button className="btn btn-primary" onClick={add} style={{ width: 140 }}>
              Add Idea
            </button>
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

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No ideas yet</h3>
          <p>Start a brain dump above. Ideas are sorted newest first.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(idea => (
            <div key={idea.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', opacity: idea.promoted ? 0.5 : 1 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{idea.text}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                  <span className="badge badge-queue">{idea.tag}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {new Date(idea.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  {idea.promoted && <span className="badge badge-done">→ Promoted to Experiment</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => toggle(idea.id)}
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  title="Mark as promoted to ICE Matrix"
                >
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
