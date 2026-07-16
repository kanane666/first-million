import { useState, useRef } from 'react'

function Section({ title, children }) {
  return (
    <div style={{
      background: 'var(--bg1)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1rem'
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: '0.75rem' }}>{title}</div>
      {children}
    </div>
  )
}

function Btn({ onClick, color = 'var(--accent)', children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '11px', borderRadius: 'var(--radius)',
      fontSize: 13, fontWeight: 600,
      background: disabled ? 'var(--bg3)' : color,
      color: disabled ? 'var(--text3)' : (color === 'var(--accent)' ? '#000' : '#fff'),
      border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'opacity 0.2s', marginTop: 8
    }}>{children}</button>
  )
}

export default function Backup({ allData, onImport, startDate, onChangeStartDate }) {
  const [importStatus, setImportStatus] = useState(null) // null | 'ok' | 'error'
  const [codeCopied, setCodeCopied] = useState(false)
  const [codeImportVal, setCodeImportVal] = useState('')
  const [codeImportStatus, setCodeImportStatus] = useState(null)
  const fileRef = useRef()

  const dataStr = JSON.stringify(allData, null, 2)
  const entriesCount = allData.entries?.length ?? 0
  const sessionsCount = allData.timeEntries?.length ?? 0
  const epargne = allData.epargneManuelle ?? 0

  // — Export JSON fichier —
  function handleExportFile() {
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().split('T')[0]
    a.href = url
    a.download = `phoenix-backup-${date}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // — Import JSON fichier —
  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (!parsed.entries && !parsed.timeEntries) throw new Error('Format invalide')
        if (!window.confirm('Restaurer ce backup va remplacer toutes tes données actuelles. Continuer ?')) {
          e.target.value = ''
          return
        }
        onImport(parsed)
        setImportStatus('ok')
        setTimeout(() => setImportStatus(null), 3000)
      } catch {
        setImportStatus('error')
        setTimeout(() => setImportStatus(null), 3000)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // — Code texte copiable (base64 compact) —
  const backupCode = btoa(unescape(encodeURIComponent(JSON.stringify(allData))))

  function handleCopyCode() {
    navigator.clipboard.writeText(backupCode).then(() => {
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2500)
    })
  }

  function handleImportCode() {
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(codeImportVal.trim()))))
      if (!decoded.entries && !decoded.timeEntries) throw new Error('invalide')
      if (!window.confirm('Restaurer ce backup va remplacer toutes tes données actuelles. Continuer ?')) return
      onImport(decoded)
      setCodeImportStatus('ok')
      setCodeImportVal('')
      setTimeout(() => setCodeImportStatus(null), 3000)
    } catch {
      setCodeImportStatus('error')
      setTimeout(() => setCodeImportStatus(null), 2500)
    }
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>

      {/* Résumé des données */}
      <div style={{
        background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
        borderRadius: 'var(--radius)', padding: '0.9rem 1rem', marginBottom: '1rem',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{entriesCount}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Entrées</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{sessionsCount}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Sessions</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
            {epargne > 0 ? `${Math.round(epargne/1000)}k` : '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Épargne init.</div>
        </div>
      </div>

      {/* Réglages */}
      <Section title="⚙️ Réglages — Date de début du plan">
        <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 8 }}>
          Cette date sert de référence pour calculer ta phase actuelle et ta progression sur 15 mois.
          Modifie-la si ton début réel diffère de la valeur par défaut.
        </div>
        <input
          type="date"
          value={startDate}
          onChange={e => onChangeStartDate(e.target.value)}
          style={{
            width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text)', fontSize: 14
          }}
        />
      </Section>

      {/* EXPORT — Fichier JSON */}
      <Section title="📤 Exporter — Fichier JSON">
        <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 4 }}>
          Télécharge un fichier <code style={{ background: 'var(--bg3)', padding: '1px 5px', borderRadius: 4 }}>.json</code> contenant toutes tes données.
          Sauvegarde-le dans iCloud, WhatsApp ou tes notes.
        </div>
        <Btn onClick={handleExportFile}>⬇ Télécharger phoenix-backup.json</Btn>
      </Section>

      {/* IMPORT — Fichier JSON */}
      <Section title="📥 Importer — Fichier JSON">
        <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 4 }}>
          Sélectionne un fichier backup exporté précédemment pour restaurer toutes tes données.
        </div>
        <input type="file" accept=".json" ref={fileRef} onChange={handleFileChange}
          style={{ display: 'none' }} />
        <Btn onClick={() => fileRef.current.click()} color="#3b82f6">📂 Choisir un fichier .json</Btn>
        {importStatus === 'ok' && (
          <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--green)', textAlign: 'center' }}>
            ✓ Données restaurées avec succès !
          </div>
        )}
        {importStatus === 'error' && (
          <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--red)', textAlign: 'center' }}>
            ✗ Fichier invalide — assure-toi que c'est un backup Phoenix
          </div>
        )}
      </Section>

      {/* EXPORT — Code texte */}
      <Section title="📋 Exporter — Code texte">
        <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 8 }}>
          Copie ce code et colle-le dans tes Notes, WhatsApp ou n'importe où. Pour restaurer, colle-le dans la zone d'import ci-dessous.
        </div>
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          padding: '10px 12px', fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)',
          wordBreak: 'break-all', maxHeight: 80, overflow: 'hidden',
          position: 'relative', lineHeight: 1.5
        }}>
          {backupCode.slice(0, 200)}...
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 30,
            background: 'linear-gradient(transparent, var(--bg2))' }} />
        </div>
        <Btn onClick={handleCopyCode} color={codeCopied ? '#22c55e' : 'var(--accent)'}>
          {codeCopied ? '✓ Code copié !' : '📋 Copier le code complet'}
        </Btn>
      </Section>

      {/* IMPORT — Code texte */}
      <Section title="🔑 Importer — Code texte">
        <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 8 }}>
          Colle ici un code backup copié précédemment pour restaurer tes données.
        </div>
        <textarea
          value={codeImportVal}
          onChange={e => setCodeImportVal(e.target.value)}
          placeholder="Colle le code backup ici..."
          rows={4}
          style={{
            width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text)',
            fontSize: 11, fontFamily: 'var(--mono)', resize: 'none', lineHeight: 1.5
          }}
        />
        <Btn onClick={handleImportCode} disabled={!codeImportVal.trim()} color="#3b82f6">
          🔄 Restaurer depuis le code
        </Btn>
        {codeImportStatus === 'ok' && (
          <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--green)', textAlign: 'center' }}>
            ✓ Données restaurées avec succès !
          </div>
        )}
        {codeImportStatus === 'error' && (
          <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--red)', textAlign: 'center' }}>
            ✗ Code invalide — vérifie que tu as tout copié
          </div>
        )}
      </Section>

      {/* Conseil */}
      <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.7, padding: '0 0.25rem' }}>
        💡 <strong style={{ color: 'var(--text2)' }}>Conseil :</strong> exporte une sauvegarde chaque samedi lors de ton bilan hebdomadaire.
        Garde les 2 derniers fichiers au cas où.
      </div>
    </div>
  )
}
