import { useState } from 'react'
import './index.css'
import Marketing from './pages/Marketing'
import IceMatrix from './pages/IceMatrix'
import IdeaLog from './pages/IdeaLog'
import TokenLog from './pages/TokenLog'

const NAV = [
  { id: 'marketing', label: 'Marketing', icon: '📊', section: 'PERFORMANCE' },
  { id: 'ice',       label: 'Experiment Queue', icon: '🧪', section: null },
  { id: 'ideas',     label: 'Idea Log', icon: '💡', section: 'PLANNING' },
  { id: 'tokens',    label: 'Token Usage', icon: '🔋', section: 'SYSTEM' },
]

export default function App() {
  const [page, setPage] = useState('marketing')
  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const pages = { marketing: <Marketing />, ice: <IceMatrix />, ideas: <IdeaLog />, tokens: <TokenLog /> }
  let lastSection = null

  return (
    <div className="app">
      <div className="topbar">
        <div className="topbar-logo">
          <div className="logo-dot" />
          KRYO Command Centre
        </div>
        <div className="topbar-meta">Everest Labs · {now}</div>
      </div>

      <div className="sidebar">
        {NAV.map(item => (
          <div key={item.id}>
            {item.section && item.section !== lastSection && (() => { lastSection = item.section; return <div className="nav-section">{item.section}</div> })()}
            <div
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div className="main">
        {pages[page]}
      </div>
    </div>
  )
}
