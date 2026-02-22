import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { fetchTokens } from '../github'

function fmt(n) { return Number(n || 0).toLocaleString() }

export default function TokenLog() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  async function load() {
    setLoading(true)
    const data = await fetchTokens()
    setSessions(data)
    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  const totalInput  = sessions.reduce((s, l) => s + Number(l.inputTokens  || 0), 0)
  const totalOutput = sessions.reduce((s, l) => s + Number(l.outputTokens || 0), 0)
  const totalCost   = sessions.reduce((s, l) => s + Number(l.estimatedCost || 0), 0)

  const chartData = [...sessions].reverse().slice(-14).map(l => ({
    date: (l.date || '').slice(5),
    tokens: Number(l.inputTokens || 0) + Number(l.outputTokens || 0),
  }))

  return (
    <div>
      <div className="page-title">Token Usage</div>
      <div className="page-sub">Logged automatically by Hans at the end of each session</div>

      <div className="data-banner">
        🔋 Hans logs token usage automatically. Data syncs from GitHub every 60 seconds.
        {lastUpdated && <span style={{ marginLeft: 8, opacity: 0.6 }}>Last synced: {lastUpdated.toLocaleTimeString()}</span>}
        <button onClick={load} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>↻ Refresh</button>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Input</div>
          <div className="kpi-value" style={{ fontSize: 20 }}>{fmt(totalInput)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Output</div>
          <div className="kpi-value" style={{ fontSize: 20 }}>{fmt(totalOutput)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Tokens</div>
          <div className="kpi-value" style={{ fontSize: 20 }}>{fmt(totalInput + totalOutput)}</div>
        </div>
        <div className="kpi-card" style={{ borderColor: 'rgba(79,110,247,0.3)' }}>
          <div className="kpi-label">Est. Total Cost</div>
          <div className="kpi-value" style={{ fontSize: 20, color: 'var(--accent)' }}>${totalCost.toFixed(2)}</div>
        </div>
      </div>

      {sessions.length >= 2 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Daily Token Usage (last 14 days)</div>
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
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)' }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Session Log</div>
        </div>

        {loading ? (
          <div className="empty-state"><p>Loading from GitHub...</p></div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <h3>No sessions logged yet</h3>
            <p>Hans will log sessions here automatically</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Date</th><th>Model</th><th>Input</th><th>Output</th><th>Total</th><th>Cost</th><th>Tasks</th></tr>
              </thead>
              <tbody>
                {[...sessions].reverse().map((l, i) => (
                  <tr key={i}>
                    <td>{l.date}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{l.model || 'claude-sonnet-4-6'}</td>
                    <td>{fmt(l.inputTokens)}</td>
                    <td>{fmt(l.outputTokens)}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(Number(l.inputTokens || 0) + Number(l.outputTokens || 0))}</td>
                    <td style={{ color: 'var(--accent)' }}>${Number(l.estimatedCost || 0).toFixed(4)}</td>
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
          Pricing estimate: claude-sonnet-4-6 · $3/1M input · $15/1M output. Check actual billing on Anthropic Console.
        </div>
      </div>
    </div>
  )
}
