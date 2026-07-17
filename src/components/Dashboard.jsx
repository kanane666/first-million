import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts'
import {
  OBJECTIF, SOURCES, formatFCFA, formatFCFAFull, getCurrentPhase, getMonthsElapsed, TOTAL_MONTHS,
  OBJECTIF_JOUR, OBJECTIF_SEMAINE, groupByDay, groupByWeek, getTodayKey, getThisWeekKey,
  computeSourceTotals, computeCumulativeReal, computeProjection
} from '../data/constants'

const REALISTE = [0,3000,8000,30000,65000,110000,165000,235000,310000,400000,490000,590000,700000,790000,890000,1000000]

function RingProgress({ pct, color, size = 80, stroke = 7 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  )
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>{icon}</span>{label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: color || 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sub}</div>}
    </div>
  )
}

function JalonMiniCard({ label, value, target, sub }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0
  const atteint = value >= target
  const color = atteint ? 'var(--green)' : (pct >= 50 ? 'var(--amber)' : 'var(--red)')
  return (
    <div style={{ flex: 1, background: atteint ? 'var(--green-dim)' : 'var(--bg1)', border: `1px solid ${atteint ? 'var(--green)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '0.85rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{label}</span>
        {atteint && <span style={{ fontSize: 14 }}>✅</span>}
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{formatFCFA(value)}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>sur {formatFCFA(target)} {sub}</div>
      <div style={{ marginTop: 6, height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: 'var(--text3)', marginBottom: 4 }}>Mois {label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 500 }}>
          {p.name === 'realiste' ? 'Prévu' : 'Réel'}: {formatFCFAFull(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function Dashboard({ entries, epargne, epargneInitiale = 0, startDate, reserveImprevus = 0 }) {
  const totalRevenu = useMemo(() => entries.filter(e => e.type === 'revenu').reduce((s, e) => s + e.montant, 0), [entries])
  const totalDepense = useMemo(() => entries.filter(e => e.type === 'depense').reduce((s, e) => s + e.montant, 0), [entries])
  const totalEpargne = epargne
  const pct = Math.min(100, (totalEpargne / OBJECTIF) * 100)
  const reste = Math.max(0, OBJECTIF - totalEpargne)
  const monthsElapsed = getMonthsElapsed(startDate)
  const phase = getCurrentPhase(monthsElapsed)
  const projection = useMemo(() => computeProjection(totalEpargne, startDate, TOTAL_MONTHS, OBJECTIF), [totalEpargne, startDate])

  const bySource = useMemo(() => computeSourceTotals(entries, SOURCES, 'revenu'), [entries])

  const chartData = useMemo(() => {
    const reelParMois = computeCumulativeReal(entries, startDate, TOTAL_MONTHS, epargneInitiale)
    return REALISTE.map((rev, i) => ({
      mois: i,
      realiste: rev,
      reel: reelParMois[i]
    }))
  }, [entries, startDate, epargneInitiale])

  const thisMonth = useMemo(() => {
    const now = new Date()
    return entries.filter(e => {
      const d = new Date(e.date)
      return e.type === 'revenu' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).reduce((s, e) => s + e.montant, 0)
  }, [entries])

  const todayTotal = useMemo(() => {
    const byDay = groupByDay(entries)
    return byDay[getTodayKey()] || 0
  }, [entries])

  const weekTotal = useMemo(() => {
    const byWeek = groupByWeek(entries)
    const wk = byWeek[getThisWeekKey()]
    return wk ? wk.total : 0
  }, [entries])

  const weekJoursActifs = useMemo(() => {
    const byWeek = groupByWeek(entries)
    const wk = byWeek[getThisWeekKey()]
    return wk ? Object.keys(wk.days).length : 0
  }, [entries])

  return (
    <div style={{ padding: '0 0 2rem' }}>
      {/* Hero objectif */}
      <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <RingProgress pct={pct} color="var(--accent)" size={96} stroke={8} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{Math.round(pct)}%</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Épargne cumulée</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{formatFCFAFull(totalEpargne)}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Reste : <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{formatFCFAFull(reste)}</span> vers 1 000 000 FCFA</div>
          <div style={{ marginTop: '0.75rem', height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.8s ease' }} />
          </div>
        </div>
      </div>

      {/* Projection réaliste basée sur le rythme actuel */}
      {projection.ready && (
        <div style={{
          background: projection.onTrack ? 'var(--green-dim)' : 'var(--bg1)',
          border: `1px solid ${projection.onTrack ? 'var(--green)' : (projection.ratePerMonth <= 0 ? 'var(--red)' : 'var(--amber)')}`,
          borderRadius: 'var(--radius)', padding: '0.85rem 1rem', marginBottom: '1rem'
        }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}>📡 Projection à ton rythme actuel</div>
          {projection.ratePerMonth <= 0 ? (
            <div style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>
              À ce rythme (dépenses ≥ revenus), tu n'atteins pas l'objectif — il faut inverser la tendance.
            </div>
          ) : (
            <div style={{ fontSize: 13, fontWeight: 600, color: projection.onTrack ? 'var(--green)' : 'var(--amber)' }}>
              ~{formatFCFA(projection.ratePerMonth)}/mois net → objectif atteint vers le mois {Math.ceil(projection.moisTotalEstime)}
              {projection.onTrack
                ? ` (dans les temps sur ${TOTAL_MONTHS})`
                : ` (soit ${Math.ceil(projection.moisTotalEstime - TOTAL_MONTHS)} mois de retard sur le plan)`}
            </div>
          )}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1rem' }}>
        <JalonMiniCard label="🎯 Aujourd'hui" value={todayTotal} target={OBJECTIF_JOUR} />
        <JalonMiniCard label="📅 Cette semaine" value={weekTotal} target={OBJECTIF_SEMAINE} sub={`· ${weekJoursActifs}/5 jours`} />
      </div>

      {/* Phase actuelle */}
      <div style={{ background: `${phase.color}18`, border: `1px solid ${phase.color}40`, borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: phase.color, flexShrink: 0 }} />
        <div>
          <span style={{ fontSize: 12, color: phase.color, fontWeight: 600 }}>Phase {phase.num} — {phase.label}</span>
          <span style={{ fontSize: 12, color: 'var(--text2)', marginLeft: 8 }}>Mois {phase.months} · Objectif {formatFCFA(phase.revMin)}–{formatFCFA(phase.revMax)}/mois</span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>Mois {monthsElapsed}/{TOTAL_MONTHS}</div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: '1rem' }}>
        <StatCard label="Ce mois" value={formatFCFA(thisMonth)} color="var(--green)" icon="📈" sub={`objectif ${formatFCFA(phase.revMin)}–${formatFCFA(phase.revMax)}`} />
        <StatCard label="Total revenus" value={formatFCFA(totalRevenu)} color="var(--blue)" icon="💵" sub="depuis le début" />
        <StatCard label="Total dépenses" value={formatFCFA(totalDepense)} color="var(--red)" icon="💸" sub="depuis le début" />
        <StatCard label="Mois restants" value={Math.max(0, TOTAL_MONTHS - monthsElapsed)} color="var(--amber)" icon="⏳" sub={`sur ${TOTAL_MONTHS} au total`} />
      </div>

      {/* Réserve imprévus */}
      {reserveImprevus > 0 && (
        <div style={{
          background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>🛟 Réserve imprévus <span style={{ color: 'var(--text3)' }}>(hors objectif)</span></span>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{formatFCFA(reserveImprevus)}</span>
        </div>
      )}

      {/* Courbe projection */}
      <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: '0.75rem', color: 'var(--text2)' }}>Projection vs réel</div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="mois" tick={{ fontSize: 10, fill: 'var(--text3)' }} tickLine={false} axisLine={false} tickFormatter={v => `M${v}`} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={1000000} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="realiste" name="realiste" stroke="#f97316" strokeWidth={2} fill="url(#gr)" dot={false} strokeDasharray="5 3" />
            {totalEpargne > 0 && (
              <Area type="monotone" dataKey="reel" name="reel" stroke="#22c55e" strokeWidth={2.5} fill="none" dot={false} />
            )}
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 16, height: 2, background: '#f97316', display: 'inline-block', opacity: 0.7 }} />Projection plan</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 16, height: 2, background: '#22c55e', display: 'inline-block' }} />Réel</span>
        </div>
      </div>

      {/* Revenus par source */}
      {bySource.length > 0 && (
        <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: '0.75rem', color: 'var(--text2)' }}>Revenus par source</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bySource.map(s => {
              const pctS = totalRevenu > 0 ? (s.total / totalRevenu) * 100 : 0
              return (
                <div key={s.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text2)' }}>{s.icon} {s.label}</span>
                    <span style={{ color: s.color, fontWeight: 500, fontFamily: 'var(--mono)' }}>{formatFCFA(s.total)}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pctS}%`, background: s.color, borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {bySource.length === 0 && (
        <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔥</div>
          <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 4 }}>Pas encore d'entrées</div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Ajoute ton premier revenu dans l'onglet "Saisie"</div>
        </div>
      )}
    </div>
  )
}
