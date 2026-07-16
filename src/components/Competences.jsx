import { useState, useMemo } from 'react'
import {
  SKILLS_PLOMBERIE, SKILL_SEUILS, SKILL_LEVEL_LABELS, SKILL_LEVEL_COLORS,
  getSkillLevel, computeSkillHours
} from '../data/constants'

// Barre de progression vers le prochain seuil
function SkillProgressBar({ heures }) {
  const level = getSkillLevel(heures)
  const seuils = [0, SKILL_SEUILS.observe, SKILL_SEUILS.pratique, SKILL_SEUILS.autonome]
  const nextSeuil = seuils[level + 1] ?? SKILL_SEUILS.autonome
  const prevSeuil = seuils[level] ?? 0
  const pct = level >= 3 ? 100 : Math.min(100, ((heures - prevSeuil) / (nextSeuil - prevSeuil)) * 100)
  const color = SKILL_LEVEL_COLORS[level]
  return (
    <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
    </div>
  )
}

function SkillCard({ skill, heures }) {
  const level = getSkillLevel(heures)
  const label = SKILL_LEVEL_LABELS[level]
  const color = SKILL_LEVEL_COLORS[level]
  const nextSeuil = [SKILL_SEUILS.observe, SKILL_SEUILS.pratique, SKILL_SEUILS.autonome, null][level]
  const restant = nextSeuil !== null ? Math.max(0, nextSeuil - heures) : 0

  return (
    <div style={{
      background: 'var(--bg1)', border: `1px solid ${level > 0 ? color + '40' : 'var(--border)'}`,
      borderRadius: 'var(--radius-sm)', padding: '0.875rem 1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text)' }}>{skill.label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            {Math.round(heures * 10) / 10}h
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600, color,
            background: `${color}20`, padding: '2px 8px', borderRadius: 12
          }}>{label}</span>
        </div>
      </div>
      <SkillProgressBar heures={heures} />
      {level < 3 && (
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
          encore {Math.round(restant * 10) / 10}h → {SKILL_LEVEL_LABELS[level + 1]}
        </div>
      )}
    </div>
  )
}

function SessionLogger({ onAdd }) {
  const [heures, setHeures] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [selected, setSelected] = useState([])
  const [success, setSuccess] = useState(false)

  function toggleSkill(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  function handleAdd() {
    const parsed = parseFloat(heures)
    if (!heures || isNaN(parsed) || parsed <= 0 || selected.length === 0) return
    onAdd({ id: Date.now(), heures: parsed, date, note, skills: selected })
    setHeures('')
    setNote('')
    setSelected([])
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  const inputS = {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '9px 12px',
    color: 'var(--text)', fontSize: 13, width: '100%'
  }

  return (
    <div style={{
      background: 'var(--bg1)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem'
    }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: '0.75rem' }}>
        📋 Logger une session chantier
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Heures</div>
          <input type="number" min="0" step="0.5" placeholder="ex: 6" value={heures}
            onChange={e => setHeures(e.target.value)} style={inputS} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Date</div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputS} />
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>
          Compétences pratiquées aujourd'hui <span style={{ color: 'var(--accent)' }}>({selected.length} sélectionnées)</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SKILLS_PLOMBERIE.map(s => {
            const active = selected.includes(s.id)
            return (
              <button key={s.id} onClick={() => toggleSkill(s.id)} style={{
                padding: '5px 11px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text2)',
                cursor: 'pointer', transition: 'all 0.15s'
              }}>{s.label}</button>
            )
          })}
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Note (optionnel)</div>
        <input type="text" placeholder="ex: Pose robinets cuisine, chantier Almadies"
          value={note} onChange={e => setNote(e.target.value)} style={inputS} />
      </div>

      <button onClick={handleAdd}
        disabled={!heures || selected.length === 0}
        style={{
          width: '100%', padding: '11px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600,
          background: success ? 'var(--green)' : 'var(--accent)',
          color: '#000', border: 'none',
          opacity: (!heures || selected.length === 0) ? 0.4 : 1,
          cursor: (!heures || selected.length === 0) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}>
        {success ? '✓ Session enregistrée !' : 'Enregistrer la session'}
      </button>

      {selected.length > 0 && heures && (
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, textAlign: 'center' }}>
          {(parseFloat(heures) / selected.length).toFixed(1)}h réparties sur chaque compétence sélectionnée
        </div>
      )}
    </div>
  )
}

function SessionHistory({ timeEntries, onDelete }) {
  if (timeEntries.length === 0) return null
  const recent = [...timeEntries].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: '0.5rem' }}>
        Dernières sessions
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {recent.map(e => (
          <div key={e.id} style={{
            background: 'var(--bg1)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '10px 12px',
            display: 'flex', alignItems: 'flex-start', gap: 10
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
                  {e.heures}h
                </span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {new Date(e.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
                {e.note && <span style={{ fontSize: 11, color: 'var(--text2)' }}>— {e.note}</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {(e.skills || []).map(sid => {
                  const skill = SKILLS_PLOMBERIE.find(s => s.id === sid)
                  return skill ? (
                    <span key={sid} style={{
                      fontSize: 10, padding: '1px 7px', borderRadius: 10,
                      background: 'var(--bg3)', color: 'var(--text2)'
                    }}>{skill.label}</span>
                  ) : null
                })}
              </div>
            </div>
            <button onClick={() => { if (window.confirm('Supprimer cette session ?')) onDelete(e.id) }} style={{
              background: 'none', color: 'var(--text3)', fontSize: 16,
              padding: '0 2px', lineHeight: 1, cursor: 'pointer', flexShrink: 0
            }}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Competences({ timeEntries, onAddTime, onDeleteTime }) {
  const skillHours = useMemo(() => computeSkillHours(timeEntries), [timeEntries])
  const totalHeures = timeEntries.reduce((s, e) => s + (e.heures || 0), 0)
  const joursActifs = new Set(timeEntries.map(e => e.date)).size

  const mastered  = SKILLS_PLOMBERIE.filter(s => getSkillLevel(skillHours[s.id] || 0) === 3).length
  const pratique  = SKILLS_PLOMBERIE.filter(s => getSkillLevel(skillHours[s.id] || 0) === 2).length
  const observe   = SKILLS_PLOMBERIE.filter(s => getSkillLevel(skillHours[s.id] || 0) === 1).length
  const total     = SKILLS_PLOMBERIE.length
  const totalMaxH = total * SKILL_SEUILS.autonome
  const totalH    = Object.values(skillHours).reduce((s, h) => s + Math.min(h, SKILL_SEUILS.autonome), 0)
  const globalPct = Math.round((totalH / totalMaxH) * 100)

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Résumé global */}
      <div style={{
        background: 'var(--bg1)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>Progression globale</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{globalPct}%</span>
        </div>
        <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden', marginBottom: '0.75rem' }}>
          <div style={{ height: '100%', width: `${globalPct}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#22c55e' }}>{mastered}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>Autonome</div>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6' }}>{pratique}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>Pratiqué</div>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b' }}>{observe}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>Observé</div>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text3)' }}>{total - mastered - pratique - observe}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>À faire</div>
          </div>
        </div>
      </div>

      {/* Stats temps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1rem' }}>
        <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
            {Math.round(totalHeures * 10) / 10}h
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Total chantier</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
            {Math.round((totalHeures / 1000) * 100)}% des 1000h
          </div>
        </div>
        <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--blue)', fontFamily: 'var(--mono)' }}>
            {joursActifs}j
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Jours actifs</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
            {timeEntries.length} session{timeEntries.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Seuils info */}
      <div style={{
        background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
        borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.9rem',
        fontSize: 11, color: 'var(--text2)', marginBottom: '1rem',
        display: 'flex', gap: 16, flexWrap: 'wrap'
      }}>
        <span>🟡 Observé ≥ {SKILL_SEUILS.observe}h</span>
        <span>🔵 Pratiqué ≥ {SKILL_SEUILS.pratique}h</span>
        <span>🟢 Autonome ≥ {SKILL_SEUILS.autonome}h</span>
      </div>

      {/* Logger session */}
      <SessionLogger onAdd={onAddTime} />

      {/* Historique sessions */}
      <SessionHistory timeEntries={timeEntries} onDelete={onDeleteTime} />

      {/* Skills list */}
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: '0.5rem' }}>
        Compétences — calculées automatiquement
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SKILLS_PLOMBERIE.map(skill => (
          <SkillCard
            key={skill.id}
            skill={skill}
            heures={skillHours[skill.id] || 0}
          />
        ))}
      </div>
    </div>
  )
}
