import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const STORAGE_KEY = 'kryo_tokens'

// Claude Sonnet 4.5 approx pricing
const INPUT_COST_PER_1K  = 0.003   // $3 per 1M input tokens
const OUTPUT_COST_PER_1K = 0.015   // $15 per 1M output tokens

function cost(input, output) {
  return ((Number(input) / 1000) * INPUT_COST_PER_1K + (Number(output) / 1000) * OUTPUT_COST_PER_1K).toFixed(4)
}

function fmt(n) { return Number(n).toLocaleString() }

const blank = () => ({
  date: new Date().toISOString().slice(0, 10),
  inputTokens: '',
  outputTokens: '',
  model: 'claude-sonnet-4-5',
  tasks: '',
})

export default function TokenLog() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  const [logs, setLogs] = useState(saved)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank())

  function persist(data) {
    setLogs(data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function add() {
    const entry = {
      ...form,
      id: Date.now(),
      totalTokens: Number(form.inputTokens) + Number(form.outputTokens),
      cost: cost(form.inputTokens, form.outputTokens),
    }
    const next = [...logs, entry].sort((a, b) => b.date > a.date ? 1 : -1)
    persist(next)
    setShowForm(false)
    setForm(blank())
  }

  function del(id) { persist(logs.filter(l => l.id !== id)) }

  const totalInput  = logs.reduce((s, l) => s + Number(l.inputTokens), 0)
  const totalOutput = logs.reduce((s, l) => s + Number(l.outputTokens), 0)
  const totalCost   = logs.reduce((s, l) => s + Number(l.cost), 0)

  const chartData = [...logs].reverse().map(l => ({
    date: l.date.slice(5),
    tokens: Number(l.inputTokens) + Number(l.outputTokens),
    cost: Number(l.cost),
  }))

  return (
    <div>
      <div className="page-title">Token Usage</div>
      <div className="page-sub">Track daily AI usage and cost — log manually after each session</div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Input Tokens</div>
          <div className="kpi-value" style={{ fontSize: 20 }}>{fmt(totalInput)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Output Tokens</div>
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

      {logs.length >= 2 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Daily Token Usage</div>
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
        <div className="section-header" style={{ padding: '16px 20px 0' }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Session Log</div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Log Session</button>
        </div>

        {logs.length === 0 ? (
          <div className="empty-state">
            <h3>No sessions logged yet</h3>
            <p>Add your first session above to start tracking token usage</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Model</th><th>Input</th><th>Output</th><th>Total</th><th>Est. Cost</th><th>Tasks</th><th></th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td>{l.date}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{l.model}</td>
                    <td>{fmt(l.inputTokens)}</td>
                    <td>{fmt(l.outputTokens)}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(l.totalTokens)}</td>
                    <td style={{ color: 'var(--accent)' }}>${l.cost}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12, maxWidth: 200 }}>{l.tasks || '—'}</td>
                    <td><button className="btn btn-danger" onClick={() => del(l.id)} style={{ fontSize: 12, padding: '4px 8px' }}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 12, padding: '12px 16px' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          Pricing based on claude-sonnet-4-5 — $3/1M input · $15/1M output. Estimates only. Check your actual bill on Anthropic Console.
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Log Session</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <div className="form-label">Date</div>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <div className="form-label">Model</div>
                <input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <div className="form-label">Input Tokens</div>
                  <input type="number" value={form.inputTokens} onChange={e => setForm({ ...form, inputTokens: e.target.value })} />
                </div>
                <div className="form-group">
                  <div className="form-label">Output Tokens</div>
                  <input type="number" value={form.outputTokens} onChange={e => setForm({ ...form, outputTokens: e.target.value })} />
                </div>
              </div>
              {form.inputTokens && form.outputTokens && (
                <div style={{ textAlign: 'center', padding: 8, borderRadius: 8, background: 'var(--surface2)', color: 'var(--accent)', fontWeight: 700, fontSize: 13 }}>
                  Est. cost: ${cost(form.inputTokens, form.outputTokens)}
                </div>
              )}
              <div className="form-group">
                <div className="form-label">Tasks / Notes</div>
                <textarea value={form.tasks} onChange={e => setForm({ ...form, tasks: e.target.value })} placeholder="What did we work on this session?" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={add}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
