export const OBJECTIF = 1_000_000
export const DEFAULT_START_DATE = '2026-07-14' // valeur par défaut, modifiable dans Backup/Réglages
export const TOTAL_MONTHS = 15

// Règle d'or du plan : 2 500 FCFA / jour, 5 jours / semaine = 12 500 FCFA / semaine
export const OBJECTIF_JOUR = 2500
export const JOURS_TRAVAIL_SEMAINE = 5
export const OBJECTIF_SEMAINE = OBJECTIF_JOUR * JOURS_TRAVAIL_SEMAINE // 12 500

export const SOURCES = [
  { id: 'plomberie', label: 'Plomberie', color: '#f97316', icon: '🔧' },
  { id: 'repairs', label: 'Réparations', color: '#3b82f6', icon: '🛠️' },
  { id: 'info', label: 'Missions info', color: '#a855f7', icon: '💻' },
  { id: 'autre', label: 'Autre', color: '#22c55e', icon: '💰' },
]

export const SKILLS_PLOMBERIE = [
  { id: 'tuyauterie', label: 'Tuyauterie PVC/cuivre' },
  { id: 'robinets', label: 'Pose/réparation robinets' },
  { id: 'evacuation', label: 'Évacuation / siphons' },
  { id: 'soudure', label: 'Soudure cuivre' },
  { id: 'chauffe_eau', label: 'Chauffe-eau / ballons' },
  { id: 'sanitaires', label: 'Sanitaires (WC, douche)' },
  { id: 'detection', label: 'Détection de fuites' },
  { id: 'preventif', label: 'Entretien préventif' },
  { id: 'devis', label: 'Établir un devis client' },
  { id: 'gestion', label: 'Gestion chantier' },
]

export const CATEGORIES_DEPENSE = [
  { id: 'transport', label: 'Transport', color: '#f59e0b' },
  { id: 'nourriture', label: 'Nourriture', color: '#22c55e' },
  { id: 'cours', label: 'Cours / IIBS', color: '#3b82f6' },
  { id: 'outils', label: 'Outils / matériel', color: '#f97316' },
  { id: 'sante', label: 'Santé', color: '#ef4444' },
  { id: 'autre', label: 'Autre', color: '#a0a0a0' },
]

export const PHASES = [
  { num: 1, label: 'Formation', months: '1–2', color: '#ef4444', revMin: 0, revMax: 10000 },
  { num: 2, label: 'Montée', months: '3–6', color: '#f59e0b', revMin: 30000, revMax: 60000 },
  { num: 3, label: 'Autonomie', months: '7–12', color: '#22c55e', revMin: 60000, revMax: 100000 },
  { num: 4, label: 'Sprint', months: '13–15', color: '#3b82f6', revMin: 100000, revMax: 150000 },
]

export function getCurrentPhase(monthsElapsed) {
  if (monthsElapsed <= 2) return PHASES[0]
  if (monthsElapsed <= 6) return PHASES[1]
  if (monthsElapsed <= 12) return PHASES[2]
  return PHASES[3]
}

// Projette, à partir du rythme d'épargne nette observé depuis le début du plan,
// dans combien de mois l'objectif sera réellement atteint (peut être avant ou après les 15 mois prévus).
export function computeProjection(epargne, startDate, totalMonths, objectif) {
  const start = new Date(startDate)
  const now = new Date()
  const daysElapsed = Math.floor((now - start) / 86400000)
  if (daysElapsed < 3) return { ready: false } // pas assez de recul pour projeter sérieusement

  const ratePerDay = epargne / daysElapsed
  const ratePerMonth = ratePerDay * 30
  const reste = Math.max(0, objectif - epargne)

  if (ratePerDay <= 0) {
    return { ready: true, ratePerMonth, onTrack: false, moisTotalEstime: null }
  }
  const joursRestants = reste / ratePerDay
  const moisTotalEstime = daysElapsed / 30 + joursRestants / 30
  return { ready: true, ratePerMonth, onTrack: moisTotalEstime <= totalMonths + 0.5, moisTotalEstime }
}

export function formatFCFA(n) {
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(2).replace('.00','') + 'M FCFA'
  if (abs >= 1000) return sign + Math.round(abs / 1000) + 'k FCFA'
  return sign + Math.round(abs).toLocaleString('fr-FR') + ' FCFA'
}

export function formatFCFAFull(n) {
  return Math.round(n).toLocaleString('fr-FR') + ' FCFA'
}

export function getMonthsElapsed(startDate) {
  const start = new Date(startDate)
  const now = new Date()
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()))
}

// Regroupe des entrées par source/catégorie et calcule le total pour un type donné.
// Utilisé à la fois par le Dashboard et les Stats pour éviter la duplication de logique.
export function computeSourceTotals(entries, sourceList, type = 'revenu') {
  return sourceList
    .map(s => ({
      ...s,
      total: entries
        .filter(e => e.type === type && e.source === s.id)
        .reduce((sum, e) => sum + e.montant, 0),
    }))
    .filter(s => s.total > 0)
}

// Calcule l'épargne cumulée réelle mois par mois depuis le début du plan,
// pour pouvoir la comparer à la courbe de projection sur le Dashboard.
// Retourne un tableau de longueur totalMonths+1, avec `undefined` après le mois en cours
// (pour que la courbe s'arrête à "aujourd'hui" plutôt que de retomber à 0).
export function computeCumulativeReal(entries, startDate, totalMonths, epargneInitiale = 0) {
  const start = new Date(startDate)
  const startMonthIndex = start.getFullYear() * 12 + start.getMonth()
  const monthsElapsed = getMonthsElapsed(startDate)

  const deltaByMonth = {}
  entries.forEach(e => {
    const d = new Date(e.date)
    const idx = d.getFullYear() * 12 + d.getMonth() - startMonthIndex
    if (idx < 0) return // entrée antérieure au début du plan : ignorée pour cette courbe
    const delta = e.type === 'revenu' ? e.montant : -e.montant
    deltaByMonth[idx] = (deltaByMonth[idx] || 0) + delta
  })

  let cumul = epargneInitiale
  const result = []
  for (let i = 0; i <= totalMonths; i++) {
    if (i > monthsElapsed) { result.push(undefined); continue }
    cumul += deltaByMonth[i] || 0
    result.push(Math.max(0, cumul))
  }
  return result
}

// --- Utilitaires jour / semaine ---

function dateKey(d) {
  const dt = new Date(d)
  return dt.toISOString().split('T')[0]
}

function startOfWeek(d) {
  const dt = new Date(d)
  const day = dt.getDay() // 0 = dimanche
  const diff = (day === 0 ? -6 : 1) - day // lundi comme premier jour
  dt.setDate(dt.getDate() + diff)
  dt.setHours(0,0,0,0)
  return dt
}

function isoWeekKey(d) {
  const start = startOfWeek(d)
  return dateKey(start)
}

// Regroupe les entrées d'un type donné par jour : { '2026-07-14': montant }
export function groupByDay(entries, type = 'revenu') {
  const map = {}
  entries.filter(e => e.type === type).forEach(e => {
    const k = dateKey(e.date)
    map[k] = (map[k] || 0) + e.montant
  })
  return map
}

// Regroupe les entrées d'un type donné par semaine (lundi → dimanche) : { '2026-07-13': { total, days: {date: montant} } }
export function groupByWeek(entries, type = 'revenu') {
  const map = {}
  entries.filter(e => e.type === type).forEach(e => {
    const wk = isoWeekKey(e.date)
    if (!map[wk]) map[wk] = { weekStart: wk, total: 0, days: {} }
    map[wk].total += e.montant
    const dk = dateKey(e.date)
    map[wk].days[dk] = (map[wk].days[dk] || 0) + e.montant
  })
  return map
}

export function formatDayLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatWeekLabel(weekStartStr) {
  const start = new Date(weekStartStr)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(end)}`
}

// Seuils heures cumulées par skill pour progresser automatiquement
export const SKILL_SEUILS = {
  observe:  3,   // 3h  → Observé
  pratique: 15,  // 15h → Pratiqué
  autonome: 50,  // 50h → Autonome
}

// Calcule le niveau d'un skill selon les heures cumulées
export function getSkillLevel(heures) {
  if (heures >= SKILL_SEUILS.autonome) return 3
  if (heures >= SKILL_SEUILS.pratique) return 2
  if (heures >= SKILL_SEUILS.observe)  return 1
  return 0
}

export const SKILL_LEVEL_LABELS = ['Pas encore', 'Observé', 'Pratiqué', 'Autonome']
export const SKILL_LEVEL_COLORS = ['var(--text3)', '#f59e0b', '#3b82f6', '#22c55e']

// Calcule les heures cumulées par skill depuis toutes les sessions de temps
// timeEntries: [{ id, date, heures, note, skills: ['tuyauterie', ...] }]
export function computeSkillHours(timeEntries) {
  const map = {}
  SKILLS_PLOMBERIE.forEach(s => { map[s.id] = 0 })
  timeEntries.forEach(entry => {
    if (!entry.skills || !entry.heures) return
    const hParSkill = entry.heures / entry.skills.length
    entry.skills.forEach(sid => {
      if (map[sid] !== undefined) map[sid] += hParSkill
    })
  })
  return map
}



export function getTodayKey() {
  return dateKey(new Date())
}

export function getThisWeekKey() {
  return isoWeekKey(new Date())
}
