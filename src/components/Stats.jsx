import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine } from 'recharts'
import {
  SOURCES, CATEGORIES_DEPENSE, formatFCFAFull, formatFCFA,
  OBJECTIF_JOUR, OBJECTIF_SEMAINE,
  groupByDay, groupByWeek,
  getTodayKey, getThisWeekKey, computeSourceTotals
} from '../data/constants'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.fill, fontWeight: 500 }}>{formatFCFAFull(p.value)}</div>
      ))}
    </div>
  )
}

const PERIOD_TABS = [
  { id: 'jour', label: 'Jour' },
  { id: 'semaine', label: 'Semaine' },
  { id: 'mois', label: 'Mois' },
]

function JalonBar({ data, type }) {
  // data: array of { key, label, total, target, isCurrent }
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barCategoryGap="28%" margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#606060' }} tickLine={false} axisLine={false} />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={data[0]?.target} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" />
        <Bar dataKey="total" name="Réalisé" radius={[4,4,0,0]} maxBarSize={type === 'jour' ? 14 : 28}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.total >= d.target ? '#22c55e' : (d.isCurrent ? '#f97316' : '#ef4444')} fillOpacity={d.total === 0 ? 0.25 : 1} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function JalonSuivi({ entries, period }) {
  const todayKey = getTodayKey()
  const weekKey = getThisWeekKey()

  const dayData = useMemo(() => {
    if (period !== 'jour') return []
    const byDay = groupByDay(entries)
    const byDayDep = groupByDay(entries, 'depense')
    const days = []
    const now = new Date()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const k = d.toISOString().split('T')[0]
      days.push({
        key: k,
        label: d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0,3),
        total: byDay[k] || 0,
        depense: byDayDep[k] || 0,
        target: OBJECTIF_JOUR,
        isCurrent: k === todayKey,
      })
    }
    return days
  }, [entries, period, todayKey])

  const weekData = useMemo(() => {
    if (period !== 'semaine') return []
    const byWeek = groupByWeek(entries)
    const byWeekDep = groupByWeek(entries, 'depense')
    const weeks = Object.values(byWeek).sort((a,b) => a.weekStart.localeCompare(b.weekStart))
    return weeks.slice(-10).map(w => ({
      key: w.weekStart,
      label: new Date(w.weekStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      total: w.total,
      depense: byWeekDep[w.weekStart]?.total || 0,
      target: OBJECTIF_SEMAINE,
      isCurrent: w.weekStart === weekKey,
      joursActifs: Object.keys(w.days).length,
    }))
  }, [entries, period, weekKey])

  if (period === 'jour') {
    const today = dayData.find(d => d.isCurrent)
    const streak = (() => {
      let s = 0
      for (let i = dayData.length - 1; i >= 0; i--) {
        if (dayData[i].total >= OBJECTIF_JOUR) s++
        else if (dayData[i].key !== todayKey) break
        else continue // aujourd'hui pas encore atteint, ne casse pas le streak passé
      }
      return s
    })()
    const joursReussis = dayData.filter(d => d.total >= OBJECTIF_JOUR).length

    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
          <div style={{ flex: 1, background: today?.total >= OBJECTIF_JOUR ? 'var(--green-dim)' : 'var(--bg1)', border: `1px solid ${today?.total >= OBJECTIF_JOUR ? 'var(--green)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Aujourd'hui</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: today?.total >= OBJECTIF_JOUR ? 'var(--green)' : 'var(--text)' }}>{formatFCFA(today?.total || 0)}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>objectif {formatFCFA(OBJECTIF_JOUR)}</div>
          </div>
          <div style={{ flex: 1, background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Jours réussis (14j)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{joursReussis}/14</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>≥ {formatFCFA(OBJECTIF_JOUR)}/jour</div>
          </div>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          padding: '0.6rem 0.9rem', marginBottom: '1rem', fontSize: 12
        }}>
          <span style={{ color: 'var(--text3)' }}>Dépenses aujourd'hui : <b style={{ color: 'var(--red)' }}>{formatFCFA(today?.depense || 0)}</b></span>
          <span style={{ color: 'var(--text3)' }}>Net : <b style={{ color: (today?.total || 0) - (today?.depense || 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatFCFA((today?.total || 0) - (today?.depense || 0))}</b></span>
        </div>
        <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>14 derniers jours</div>
            <div style={{ fontSize: 12, color: streak > 0 ? 'var(--green)' : 'var(--text3)', fontWeight: 600 }}>
              {streak > 0 ? `🔥 série de ${streak}j` : 'aucune série en cours'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 11, color: 'var(--text3)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#22c55e', display: 'inline-block' }} />Objectif atteint</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444', display: 'inline-block' }} />Manqué</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#f97316', display: 'inline-block' }} />Aujourd'hui</span>
          </div>
          <JalonBar data={dayData} type="jour" />
        </div>
      </div>
    )
  }

  // semaine
  const thisWeek = weekData.find(w => w.isCurrent)
  const semainesReussies = weekData.filter(w => w.total >= OBJECTIF_SEMAINE).length

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <div style={{ flex: 1, background: thisWeek?.total >= OBJECTIF_SEMAINE ? 'var(--green-dim)' : 'var(--bg1)', border: `1px solid ${thisWeek?.total >= OBJECTIF_SEMAINE ? 'var(--green)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '0.75rem', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Cette semaine</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: thisWeek?.total >= OBJECTIF_SEMAINE ? 'var(--green)' : 'var(--text)' }}>{formatFCFA(thisWeek?.total || 0)}</div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>objectif {formatFCFA(OBJECTIF_SEMAINE)}</div>
        </div>
        <div style={{ flex: 1, background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Jours actifs cette sem.</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{thisWeek?.joursActifs || 0}/5</div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>min. 5 jours travaillés</div>
        </div>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        padding: '0.6rem 0.9rem', marginBottom: '1rem', fontSize: 12
      }}>
        <span style={{ color: 'var(--text3)' }}>Dépenses cette semaine : <b style={{ color: 'var(--red)' }}>{formatFCFA(thisWeek?.depense || 0)}</b></span>
        <span style={{ color: 'var(--text3)' }}>Net : <b style={{ color: (thisWeek?.total || 0) - (thisWeek?.depense || 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatFCFA((thisWeek?.total || 0) - (thisWeek?.depense || 0))}</b></span>
      </div>
      <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: '0.5rem' }}>10 dernières semaines · {semainesReussies}/{weekData.length} réussies</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 11, color: 'var(--text3)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#22c55e', display: 'inline-block' }} />Objectif atteint</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444', display: 'inline-block' }} />Manqué</span>
        </div>
        {weekData.length > 0 ? <JalonBar data={weekData} type="semaine" /> : (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text3)', fontSize: 13 }}>Pas encore de données cette semaine</div>
        )}
      </div>
    </div>
  )
}

export default function Stats({ entries }) {
  const [period, setPeriod] = useState('jour')

  const monthlyData = useMemo(() => {
    const map = {}
    entries.forEach(e => {
      const d = new Date(e.date)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      const label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      if (!map[key]) map[key] = { key, label, revenu: 0, depense: 0 }
      if (e.type === 'revenu') map[key].revenu += e.montant
      else map[key].depense += e.montant
    })
    return Object.values(map).sort((a,b) => a.key.localeCompare(b.key)).map(m => ({
      ...m, epargne: m.revenu - m.depense
    }))
  }, [entries])

  const sourceData = useMemo(() => computeSourceTotals(entries, SOURCES, 'revenu'), [entries])

  const depenseData = useMemo(() => computeSourceTotals(entries, CATEGORIES_DEPENSE, 'depense'), [entries])

  const totalRev = entries.filter(e => e.type === 'revenu').reduce((s, e) => s + e.montant, 0)
  const totalDep = entries.filter(e => e.type === 'depense').reduce((s, e) => s + e.montant, 0)
  const epargneNette = totalRev - totalDep
  const txEpargne = totalRev > 0 ? Math.round((epargneNette / totalRev) * 100) : 0
  const txEpargneAffiche = Math.max(-100, txEpargne) // le montant réel (epargneNette) reste visible à côté, ceci n'est que l'indicateur %

  const heuresData = useMemo(() => {
    const rev = entries.filter(e => e.type === 'revenu' && e.heures)
    if (rev.length === 0) return null
    const totalH = rev.reduce((s, e) => s + e.heures, 0)
    const totalM = rev.reduce((s, e) => s + e.montant, 0)
    return { totalH: Math.round(totalH), tauxHoraire: Math.round(totalM / totalH) }
  }, [entries])

  const currentMonth = useMemo(() => {
    const now = new Date()
    const key = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
    return monthlyData.find(m => m.key === key) || null
  }, [monthlyData])
  const seuilDepenseRatio = currentMonth && currentMonth.revenu > 0 ? currentMonth.depense / currentMonth.revenu : 0
  const alerteDepenses = currentMonth && currentMonth.depense > 0 && (currentMonth.depense >= currentMonth.revenu || seuilDepenseRatio > 0.5)

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Filtre période - toujours visible, c'est la priorité demandée */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 4 }}>
        {PERIOD_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setPeriod(t.id)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600,
              background: period === t.id ? 'var(--accent)' : 'transparent',
              color: period === t.id ? '#000' : 'var(--text2)',
              border: 'none', transition: 'all 0.15s'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(period === 'jour' || period === 'semaine') && (
        <div style={{ marginBottom: '1.5rem' }}>
          <JalonSuivi entries={entries} period={period} />
        </div>
      )}

      {period === 'mois' && (
        <>
          {entries.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 14, color: 'var(--text2)' }}>Pas encore de données</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Ajoute des entrées dans l'onglet Saisie</div>
            </div>
          ) : (
            <>
              {alerteDepenses && (
                <div style={{
                  background: currentMonth.depense >= currentMonth.revenu ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                  border: `1px solid ${currentMonth.depense >= currentMonth.revenu ? 'var(--red)' : 'var(--amber)'}`,
                  borderRadius: 'var(--radius)', padding: '0.7rem 0.9rem', marginBottom: '1rem', fontSize: 12,
                  color: currentMonth.depense >= currentMonth.revenu ? 'var(--red)' : 'var(--amber)', fontWeight: 500
                }}>
                  ⚠️ {currentMonth.depense >= currentMonth.revenu
                    ? `Ce mois-ci, tes dépenses (${formatFCFA(currentMonth.depense)}) dépassent tes revenus (${formatFCFA(currentMonth.revenu)}).`
                    : `Tes dépenses représentent ${Math.round(seuilDepenseRatio * 100)}% de tes revenus ce mois-ci (seuil recommandé : 50%).`}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: '1rem' }}>
                <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Taux d'épargne</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: txEpargne >= 70 ? 'var(--green)' : txEpargne >= 50 ? 'var(--amber)' : 'var(--red)' }}>{txEpargneAffiche}{txEpargne < -100 ? '−' : ''}%</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>objectif ≥ 70%</div>
                </div>
                <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Épargne nette</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: epargneNette >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatFCFA(epargneNette)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>revenus − dépenses</div>
                </div>
                <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Revenu total</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>{formatFCFA(totalRev)}</div>
                </div>
                <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Dépenses</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)' }}>{formatFCFA(totalDep)}</div>
                </div>
              </div>

              {heuresData && (
                <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', gap: 20 }}>
                  <div><div style={{ fontSize: 11, color: 'var(--text3)' }}>Heures loggées</div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{heuresData.totalH}h</div></div>
                  <div><div style={{ fontSize: 11, color: 'var(--text3)' }}>Taux horaire moyen</div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{formatFCFA(heuresData.tauxHoraire)}/h</div></div>
                </div>
              )}

              {monthlyData.length > 0 && (
                <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: '0.75rem' }}>Revenus vs dépenses par mois</div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 11, color: 'var(--text3)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#22c55e', display: 'inline-block' }} />Revenus</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444', display: 'inline-block' }} />Dépenses</span>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={monthlyData} barCategoryGap="30%" margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#606060' }} tickLine={false} axisLine={false} />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenu" name="Revenus" radius={[4,4,0,0]} maxBarSize={28}>
                        {monthlyData.map((_, i) => <Cell key={i} fill="#22c55e" />)}
                      </Bar>
                      <Bar dataKey="depense" name="Dépenses" radius={[4,4,0,0]} maxBarSize={28}>
                        {monthlyData.map((_, i) => <Cell key={i} fill="#ef4444" />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {sourceData.length > 0 && (
                <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: '0.75rem' }}>Revenus par source</div>
                  {sourceData.map(s => {
                    const pct = totalRev > 0 ? Math.round((s.total / totalRev) * 100) : 0
                    return (
                      <div key={s.id} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text2)' }}>{s.icon} {s.label}</span>
                          <span style={{ color: s.color, fontWeight: 600, fontFamily: 'var(--mono)' }}>{formatFCFA(s.total)} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({pct}%)</span></span>
                        </div>
                        <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 3 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {depenseData.length > 0 && (
                <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: '0.75rem' }}>Dépenses par catégorie</div>
                  {depenseData.map(s => {
                    const pct = totalDep > 0 ? Math.round((s.total / totalDep) * 100) : 0
                    return (
                      <div key={s.id} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text2)' }}>{s.label}</span>
                          <span style={{ color: s.color, fontWeight: 600, fontFamily: 'var(--mono)' }}>{formatFCFA(s.total)} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({pct}%)</span></span>
                        </div>
                        <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 3 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
