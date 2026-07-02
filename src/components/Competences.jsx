import { useState } from 'react'
import { SKILLS_PLOMBERIE } from '../data/constants'

const LEVELS = [
  { val: 0, label: 'Pas encore', color: 'var(--text3)' },
  { val: 1, label: 'Observé', color: '#f59e0b' },
  { val: 2, label: 'Pratiqué', color: '#3b82f6' },
  { val: 3, label: 'Autonome', color: '#22c55e' },
]

function SkillRow({ skill, level, onChange }) {
  const lvl = LEVELS[level] || LEVELS[0]
  return (
    <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.875rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--text)' }}>{skill.label}</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: lvl.color, background: `${lvl.color}20`, padding: '2px 8px', borderRadius: 12 }}>{lvl.label}</span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[1,2,3].map(l => (
          <button
            key={l}
            onClick={() => onChange(level === l ? l - 1 : l)}
            style={{
              flex: 1, height: 6, borderRadius: 3, border: 'none',
              background: level >= l ? LEVELS[l].color : 'var(--bg3)',
              opacity: level >= l ? 1 : 0.25,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          />
        ))}
      </div>
    </div>
  )
}

function TimeLogger({ onAdd }) {
  const [heures, setHeures] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')

  function handleAdd() {
    if (!heures || isNaN(parseFloat(heures))) return
    onAdd({ id: Date.now(), heures: parseFloat(heures), date, note })
    setHeures('')
    setNote('')
  }

  const inputS = {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 10px',
    color: 'var(--text)',
    fontSize: 13,
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input type="number" placeholder="Heures" value={heures} onChange={e => setHeures(e.target.value)} style={{ ...inputS, width: 80 }} />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputS, flex: 1, minWidth: 120 }} />
      <input type="text" placeholder="Note" value={note} onChange={e => setNote(e.target.value)} style={{ ...inputS, flex: 2, minWidth: 120 }} />
      <button onClick={handleAdd} style={{ padding: '8px 16px', background: 'var(--accent)', color: '#000', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
        + Log
      </button>
    </div>
  )
}

export default function Competences({ skills, onUpdateSkill, timeEntries, onAddTime }) {
  const mastered = Object.values(skills).filter(v => v === 3).length
  const inProgress = Object.values(skills).filter(v => v === 2).length
  const total = SKILLS_PLOMBERIE.length
  const globalPct = total > 0 ? Math.round((Object.values(skills).reduce((s, v) => s + v, 0) / (total * 3)) * 100) : 0
  const totalHeures = timeEntries.reduce((s, e) => s + (e.heures || 0), 0)
  const joursActifs = new Set(timeEntries.map(e => e.date)).size

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>Progression compétences</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{globalPct}%</span>
        </div>
        <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden', marginBottom: '0.75rem' }}>
          <div style={{ height: '100%', width: `${globalPct}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
          <div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>{mastered}</div><div style={{ fontSize: 10, color: 'var(--text3)' }}>Maîtrisés</div></div>
          <div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--blue)' }}>{inProgress}</div><div style={{ fontSize: 10, color: 'var(--text3)' }}>En cours</div></div>
          <div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text2)' }}>{total - mastered - inProgress}</div><div style={{ fontSize: 10, color: 'var(--text3)' }}>À apprendre</div></div>
        </div>
      </div>

      <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: '0.75rem' }}>Temps chantier</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: '0.75rem' }}>
          <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{Math.round(totalHeures)}h</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Total chantier</div>
          </div>
          <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--blue)', fontFamily: 'var(--mono)' }}>{joursActifs}j</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Jours actifs</div>
          </div>
        </div>
        <TimeLogger onAdd={onAddTime} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {LEVELS.filter(l => l.val > 0).map(l => (
          <span key={l.val} style={{ fontSize: 11, color: l.color, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block' }} />{l.label}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SKILLS_PLOMBERIE.map(skill => (
          <SkillRow key={skill.id} skill={skill} level={skills[skill.id] || 0} onChange={val => onUpdateSkill(skill.id, val)} />
        ))}
      </div>

      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--accent)' }}>Règle des 1000h</strong> — Il faut environ 1 000h de pratique pour être autonome. Tu es à <strong style={{ color: 'var(--accent)' }}>{Math.round(totalHeures)}h</strong> soit {Math.round((totalHeures / 1000) * 100)}%.
      </div>
    </div>
  )
}
