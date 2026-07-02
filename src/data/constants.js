export const OBJECTIF = 1_000_000
export const START_DATE = '2026-07-14' // début plomberie dans 2 semaines
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

export function formatFCFA(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace('.00','') + 'M FCFA'
  if (n >= 1000) return Math.round(n / 1000) + 'k FCFA'
  return Math.round(n).toLocaleString('fr-FR') + ' FCFA'
}

export function formatFCFAFull(n) {
  return Math.round(n).toLocaleString('fr-FR') + ' FCFA'
}

export function getMonthsElapsed(startDate) {
  const start = new Date(startDate)
  const now = new Date()
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()))
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

// Regroupe les revenus par jour : { '2026-07-14': montant }
export function groupByDay(entries) {
  const map = {}
  entries.filter(e => e.type === 'revenu').forEach(e => {
    const k = dateKey(e.date)
    map[k] = (map[k] || 0) + e.montant
  })
  return map
}

// Regroupe les revenus par semaine (lundi → dimanche) : { '2026-07-13': { total, days: {date: montant} } }
export function groupByWeek(entries) {
  const map = {}
  entries.filter(e => e.type === 'revenu').forEach(e => {
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

export function getTodayKey() {
  return dateKey(new Date())
}

export function getThisWeekKey() {
  return isoWeekKey(new Date())
}

