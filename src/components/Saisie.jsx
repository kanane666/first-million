import { useState } from 'react'
import { SOURCES, CATEGORIES_DEPENSE, formatFCFAFull } from '../data/constants'

function Pill({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        border: active ? `1px solid ${color}` : '1px solid var(--border)',
        background: active ? `${color}22` : 'transparent',
        color: active ? color : 'var(--text2)',
        transition: 'all 0.15s'
      }}
    >
      {label}
    </button>
  )
}

export default function Saisie({ onAdd, entries, onDeleteEntry }) {
  const [type, setType] = useState('revenu')
  const [montant, setMontant] = useState('')
  const [source, setSource] = useState('plomberie')
  const [categorie, setCategorie] = useState('transport')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [heures, setHeures] = useState('')
  const [success, setSuccess] = useState(false)

  const inputStyle = {
    width: '100%',
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    color: 'var(--text)',
    fontSize: 14,
    transition: 'border-color 0.15s'
  }

  const labelStyle = { fontSize: 12, color: 'var(--text3)', marginBottom: 6, display: 'block' }

  function handleSubmit() {
    if (!montant || isNaN(parseFloat(montant))) return
    const entry = {
      id: Date.now(),
      type,
      montant: parseFloat(montant),
      source: type === 'revenu' ? source : categorie,
      date,
      note,
      heures: heures ? parseFloat(heures) : null,
    }
    onAdd(entry)
    setMontant('')
    setNote('')
    setHeures('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  const recent = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Type toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
        <button onClick={() => setType('revenu')} style={{
          flex: 1, padding: '10px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500,
          background: type === 'revenu' ? 'var(--green-dim)' : 'var(--bg1)',
          border: type === 'revenu' ? '1px solid var(--green)' : '1px solid var(--border)',
          color: type === 'revenu' ? 'var(--green)' : 'var(--text2)'
        }}>+ Revenu</button>
        <button onClick={() => setType('depense')} style={{
          flex: 1, padding: '10px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500,
          background: type === 'depense' ? 'var(--red-dim)' : 'var(--bg1)',
          border: type === 'depense' ? '1px solid var(--red)' : '1px solid var(--border)',
          color: type === 'depense' ? 'var(--red)' : 'var(--text2)'
        }}>− Dépense</button>
      </div>

      <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Montant */}
        <div>
          <label style={labelStyle}>Montant (FCFA)</label>
          <input
            type="number"
            placeholder="0"
            value={montant}
            onChange={e => setMontant(e.target.value)}
            style={{ ...inputStyle, fontSize: 22, fontFamily: 'var(--mono)', fontWeight: 600 }}
          />
        </div>

        {/* Source / catégorie */}
        <div>
          <label style={labelStyle}>{type === 'revenu' ? 'Source' : 'Catégorie'}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(type === 'revenu' ? SOURCES : CATEGORIES_DEPENSE).map(s => (
              <Pill
                key={s.id}
                label={`${s.icon || ''} ${s.label}`}
                active={(type === 'revenu' ? source : categorie) === s.id}
                color={s.color}
                onClick={() => type === 'revenu' ? setSource(s.id) : setCategorie(s.id)}
              />
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        </div>

        {/* Heures (revenus seulement) */}
        {type === 'revenu' && (
          <div>
            <label style={labelStyle}>Heures travaillées (optionnel)</label>
            <input type="number" placeholder="ex: 8" value={heures} onChange={e => setHeures(e.target.value)} style={inputStyle} />
          </div>
        )}

        {/* Note */}
        <div>
          <label style={labelStyle}>Note (optionnel)</label>
          <input type="text" placeholder="ex: Réparation fuite robinet, rue 12..." value={note} onChange={e => setNote(e.target.value)} style={inputStyle} />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!montant}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius)',
            fontSize: 14,
            fontWeight: 600,
            background: success ? 'var(--green)' : (type === 'revenu' ? 'var(--green)' : 'var(--red)'),
            color: '#0f0f0f',
            border: 'none',
            opacity: !montant ? 0.4 : 1,
            transition: 'all 0.2s'
          }}
        >
          {success ? '✓ Enregistré !' : (type === 'revenu' ? 'Ajouter ce revenu' : 'Ajouter cette dépense')}
        </button>
      </div>

      {/* Historique récent */}
      {recent.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: '0.75rem' }}>Dernières entrées</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recent.map(e => {
              const src = e.type === 'revenu'
                ? SOURCES.find(s => s.id === e.source)
                : CATEGORIES_DEPENSE.find(s => s.id === e.source)
              return (
                <div key={e.id} style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: e.type === 'revenu' ? 'var(--green)' : 'var(--red)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{src?.icon} {src?.label}{e.note ? ` — ${e.note}` : ''}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>{new Date(e.date).toLocaleDateString('fr-FR')}{e.heures ? ` · ${e.heures}h` : ''}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: e.type === 'revenu' ? 'var(--green)' : 'var(--red)' }}>
                    {e.type === 'revenu' ? '+' : '−'}{formatFCFAFull(e.montant)}
                  </div>
                  <button onClick={() => onDeleteEntry(e.id)} style={{ background: 'none', color: 'var(--text3)', fontSize: 16, padding: '0 4px', lineHeight: 1 }}>×</button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
