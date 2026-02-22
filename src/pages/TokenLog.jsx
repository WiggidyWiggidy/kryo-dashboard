import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { gh } from '../github'

export default function TokenLog() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)

  function load() {
    setLoading(true)
    gh.tokens().then(d => {
      if (d?.sessions) setSessions(d.sessions)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const totalInput  = sessions.reduce((s, l) => s + Number(l.inputTokens), 0)
  const totalOutput = sessions.reduce((s, l) => s + Number(l.outputTokens), 0)
  const totalCost   = sessions.reduce((s, l) => s + Number(l.cost), 0)

  const chartData = [...sessions].reverse().slice(-14).map(l => ({
    date: l.date.slice(5),
    tokens: Number(l.inputTokens) + Number(l.outputTokens),
  }))

  return (
    <div>
      <div className="page-title">Token Usage</div>
      <div className="page-sub">Logged automatically by Hans at the end of each session</div>

      <div className="data-banner">
        🤖 Hans logs token usage automatically. No manual entry needed — data syncs from GitHub.
        <button className="btn btn-ghost" onClick={load} style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 10px' }}>↻ Refresh</button>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Input Tokens</div>
          <div className="kpi-value" style={{ fontSize: 20 }}>{loading ? '—' : Number(totalInput).toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Output Tokens</div>
          <div className="kpi-value" style={{ fontSize: 20 }}>{loading ? '—' : Number(totalOutput).toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Tokens</div>
          <div className="kpi-value" style={{ fontSize: 20 }}>{loading ? '—' : Number(totalInput + totalOutput).toLocaleString()}</div>
        </div>
        <div className="kpi-card" style={{ borderColor: 'rgba(79,110,247,0.3)' }}>
          <div className="kpi-label">Est. Total Cost</div>
          <div className="kpi-value" style={{ fontSize: 20, color: 'var(--accent)' }}>{loading ? '—' : `$${totalCost.toFixed(2)}`}</div>
        </div>
      </div>

      {!loading && sessions.length >= 2 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Daily Token Usage (last 14 sessions)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted)" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
              <YAxis stroke="var(--muted)" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
              <Bar dataKey="tokens" fill="var(--accent)" radius={[4,4,0,0]} name="Tokens" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px 0' }}>
          <div className="card-title">Session Log</div>
        </div>
        {loading ? (
          <div className="empty-state"><p>Loading from GitHub...</p></div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <h3>No sessions logged yet</h3>
            <p>Hans will log the first session automatically at the end of today's conversation.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Date</th><th>Model</th><th>Input</th><th>Output</th><th>Total</th><th>Est. Cost</th><th>Tasks</th></tr>
              </thead>
              <tbody>
                {sessions.map(l => (
                  <tr key={l.id}>
                    <td>{l.date}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{l.model}</td>
                    <td>{Number(l.inputTokens).toLocaleString()}</td>
                    <td>{Number(l.outputTokens).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>{Number(l.totalTokens).toLocaleString()}</td>
                    <td style={{ color: 'var(--accent)' }}>${l.cost}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12, maxWidth: 200 }}>{l.tasks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 12, padding: '12px 16px' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          Pricing: claude-sonnet-4-6 — $3/1M input · $15/1M output. Estimates only.
        </div>
      </div>
    </div>
  )
}
