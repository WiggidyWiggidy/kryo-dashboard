import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const STORAGE_KEY = 'kryo_marketing_data'

const defaultKPIs = {
  spend: '',
  revenue: '',
  orders: '',
  sessions: '',
  ctr: '',
  cpa: '',
  addToCart: '',
  convRate: '',
}

const defaultDailyRows = []

const CHART_STYLE = {
  background: 'transparent',
  fontSize: 11,
}

function toNum(v) { return parseFloat(v) || 0 }
function fmt(n, prefix = '') { return n ? `${prefix}${Number(n).toLocaleString()}` : '—' }
function pct(n) { return n ? `${Number(n).toFixed(1)}%` : '—' }

function getRoas(spend, revenue) {
  const s = toNum(spend), r = toNum(revenue)
  if (!s) return null
  return (r / s).toFixed(2)
}

export default function Marketing() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  const [kpis, setKpis] = useState(saved.kpis || defaultKPIs)
  const [daily, setDaily] = useState(saved.daily || defaultDailyRows)
  const [showEntry, setShowEntry] = useState(false)
  const [entry, setEntry] = useState({ date: new Date().toISOString().slice(0, 10), spend: '', revenue: '', orders: '', sessions: '', ctr: '', cpa: '' })
  const [tab, setTab] = useState('summary')

  function save(k, d) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ kpis: k, daily: d }))
  }

  function updateKpi(field, val) {
    const next = { ...kpis, [field]: val }
    setKpis(next)
    save(next, daily)
  }

  function addEntry() {
    const next = [...daily, entry].sort((a, b) => a.date > b.date ? -1 : 1)
    setDaily(next)
    save(kpis, next)
    setShowEntry(false)
    setEntry({ date: new Date().toISOString().slice(0, 10), spend: '', revenue: '', orders: '', sessions: '', ctr: '', cpa: '' })
  }

  function deleteEntry(i) {
    const next = daily.filter((_, idx) => idx !== i)
    setDaily(next)
    save(kpis, next)
  }

  const roas = getRoas(kpis.spend, kpis.revenue)

  const chartData = [...daily].reverse().map(r => ({
    date: r.date.slice(5),
    spend: toNum(r.spend),
    revenue: toNum(r.revenue),
    roas: toNum(r.spend) ? (toNum(r.revenue) / toNum(r.spend)).toFixed(2) : 0,
    orders: toNum(r.orders),
  }))

  const KPI_FIELDS = [
    { key: 'spend', label: 'Total Spend', prefix: '$' },
    { key: 'revenue', label: 'Total Revenue', prefix: '$' },
    { key: 'orders', label: 'Orders', prefix: '' },
    { key: 'sessions', label: 'Sessions', prefix: '' },
    { key: 'ctr', label: 'CTR (%)', prefix: '' },
    { key: 'cpa', label: 'CPA ($)', prefix: '$' },
    { key: 'addToCart', label: 'Add to Cart', prefix: '' },
    { key: 'convRate', label: 'Conv. Rate (%)', prefix: '' },
  ]

  return (
    <div>
      <div className="page-title">Marketing Performance</div>
      <div className="page-sub">Dubai campaign · KRYO launch</div>

      <div className="data-banner">
        🔌 APIs not yet connected — enter data manually below or via daily log. API integration coming soon.
      </div>

      {/* TAB BAR */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['summary', 'daily', 'charts'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <>
          <div className="kpi-grid">
            {KPI_FIELDS.map(f => (
              <div className="kpi-card" key={f.key}>
                <div className="kpi-label">{f.label}</div>
                <input
                  value={kpis[f.key]}
                  onChange={e => updateKpi(f.key, e.target.value)}
                  placeholder="—"
                  style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 24, fontWeight: 700, color: 'var(--text)', width: '100%' }}
                />
              </div>
            ))}
            <div className="kpi-card" style={{ borderColor: 'rgba(79,110,247,0.3)' }}>
              <div className="kpi-label">ROAS</div>
              <div className="kpi-value" style={{ color: roas && roas >= 2 ? 'var(--green)' : roas ? 'var(--yellow)' : 'var(--muted)' }}>
                {roas ? `${roas}x` : '—'}
              </div>
              <div className="kpi-change neutral" style={{ fontSize: 11 }}>Revenue ÷ Spend</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Quick Notes</div>
            <textarea
              placeholder="Observations, what's working, what's not..."
              defaultValue={saved.notes || ''}
              onChange={e => localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'), notes: e.target.value }))}
              style={{ marginTop: 4 }}
            />
          </div>
        </>
      )}

      {tab === 'daily' && (
        <div className="card">
          <div className="section-header">
            <div className="card-title" style={{ marginBottom: 0 }}>Daily Log</div>
            <button className="btn btn-primary" onClick={() => setShowEntry(true)}>+ Add Day</button>
          </div>

          {daily.length === 0 ? (
            <div className="empty-state">
              <h3>No entries yet</h3>
              <p>Add your first daily data point above</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Spend</th><th>Revenue</th><th>ROAS</th><th>Orders</th><th>Sessions</th><th>CTR</th><th>CPA</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>{fmt(r.spend, '$')}</td>
                      <td>{fmt(r.revenue, '$')}</td>
                      <td style={{ color: toNum(r.spend) ? (toNum(r.revenue)/toNum(r.spend) >= 2 ? 'var(--green)' : 'var(--yellow)') : 'var(--muted)' }}>
                        {toNum(r.spend) ? `${(toNum(r.revenue)/toNum(r.spend)).toFixed(2)}x` : '—'}
                      </td>
                      <td>{r.orders || '—'}</td>
                      <td>{fmt(r.sessions)}</td>
                      <td>{pct(r.ctr)}</td>
                      <td>{fmt(r.cpa, '$')}</td>
                      <td><button className="btn btn-danger" onClick={() => deleteEntry(i)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'charts' && (
        <>
          {daily.length < 2 ? (
            <div className="chart-placeholder">
              <span>📉</span>
              <span>Add at least 2 days of data to see charts</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div className="card-title">Spend vs Revenue</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} {...CHART_STYLE}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted)" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                    <YAxis stroke="var(--muted)" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                    <Bar dataKey="spend" fill="var(--accent2)" radius={[4,4,0,0]} name="Spend ($)" />
                    <Bar dataKey="revenue" fill="var(--accent)" radius={[4,4,0,0]} name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div className="card-title">ROAS over time</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} {...CHART_STYLE}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted)" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                    <YAxis stroke="var(--muted)" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
                    <Line type="monotone" dataKey="roas" stroke="var(--green)" strokeWidth={2} dot={{ fill: 'var(--green)' }} name="ROAS" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {showEntry && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Add Daily Data</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'date', label: 'Date', type: 'date' },
                { key: 'spend', label: 'Spend ($)' },
                { key: 'revenue', label: 'Revenue ($)' },
                { key: 'orders', label: 'Orders' },
                { key: 'sessions', label: 'Sessions (GA4)' },
                { key: 'ctr', label: 'CTR (%)' },
                { key: 'cpa', label: 'CPA ($)' },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <div className="form-label">{f.label}</div>
                  <input type={f.type || 'number'} value={entry[f.key]} onChange={e => setEntry({ ...entry, [f.key]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowEntry(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addEntry}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
