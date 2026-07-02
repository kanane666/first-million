import { useState, useMemo } from 'react'
import { useStorage } from './hooks/useStorage'
import Dashboard from './components/Dashboard'
import Saisie from './components/Saisie'
import Competences from './components/Competences'
import Stats from './components/Stats'

const TABS = [
  { id: 'dashboard', label: 'Accueil', icon: '🔥' },
  { id: 'saisie', label: 'Saisie', icon: '➕' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'competences', label: 'Skills', icon: '🔧' },
]

function EpargneInput({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [tmp, setTmp] = useState('')

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          autoFocus
          type="number"
          value={tmp}
          onChange={e => setTmp(e.target.value)}
          placeholder="Épargne initiale"
          style={{
            width: 130, background: 'var(--bg2)', border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-sm)', padding: '5px 8px', color: 'var(--text)', fontSize: 12
          }}
        />
        <button onClick={() => { onChange(parseFloat(tmp) || 0); setEditing(false) }}
          style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 'var(--radius-sm)', padding: '5px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>OK</button>
      </div>
    )
  }
  return (
    <button onClick={() => { setTmp(value.toString()); setEditing(true) }}
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '5px 10px', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>
      {value > 0 ? `+${value.toLocaleString('fr-FR')} F initial` : 'Épargne initiale'}
    </button>
  )
}

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [entries, setEntries] = useStorage('phoenix_entries', [])
  const [skills, setSkills] = useStorage('phoenix_skills', {})
  const [timeEntries, setTimeEntries] = useStorage('phoenix_time', [])
  const [epargneManuelle, setEpargneManuelle] = useStorage('phoenix_epargne', 0)

  const epargneCalculee = useMemo(() => {
    const revenus = entries.filter(e => e.type === 'revenu').reduce((s, e) => s + e.montant, 0)
    const depenses = entries.filter(e => e.type === 'depense').reduce((s, e) => s + e.montant, 0)
    return Math.max(0, revenus - depenses + epargneManuelle)
  }, [entries, epargneManuelle])

  function addEntry(entry) { setEntries(prev => [entry, ...prev]) }
  function deleteEntry(id) { setEntries(prev => prev.filter(e => e.id !== id)) }
  function updateSkill(id, val) { setSkills(prev => ({ ...prev, [id]: val })) }
  function addTime(entry) { setTimeEntries(prev => [entry, ...prev]) }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      <header style={{ padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border)', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--accent)' }}>🔥 Projet Phoenix</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>Objectif 1 000 000 FCFA · 15 mois</div>
          </div>
          <EpargneInput value={epargneManuelle} onChange={setEpargneManuelle} />
        </div>
      </header>

      <main style={{ flex: 1, padding: '1rem 1.25rem 5rem', overflowY: 'auto' }}>
        {tab === 'dashboard' && <Dashboard entries={entries} epargne={epargneCalculee} />}
        {tab === 'saisie' && <Saisie onAdd={addEntry} entries={entries} onDeleteEntry={deleteEntry} />}
        {tab === 'stats' && <Stats entries={entries} />}
        {tab === 'competences' && <Competences skills={skills} onUpdateSkill={updateSkill} timeEntries={timeEntries} onAddTime={addTime} />}
      </main>

      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'var(--bg1)', borderTop: '1px solid var(--border)',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '0.5rem 0 max(0.5rem, env(safe-area-inset-bottom))',
        zIndex: 20
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 0', background: 'none', border: 'none',
            color: tab === t.id ? 'var(--accent)' : 'var(--text3)',
            transition: 'color 0.15s', cursor: 'pointer',
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 600 : 400 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
