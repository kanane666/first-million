import { useState } from 'react'

const SECTIONS = [
  {
    id: 'pourquoi',
    emoji: '🔥',
    title: 'Pourquoi tu fais tout ça',
    color: '#f97316',
    content: [
      {
        type: 'text',
        text: "Ton ordinateur n'est pas un rêve de gosse. C'est un outil de production. Avec lui, tu peux coder, apprendre, créer, livrer des projets, générer des revenus numériques. Sans lui, tu empruntes, tu attends, tu dépends."
      },
      {
        type: 'text',
        text: "Tu as été volé. On t'a pris du matériel — mais pas ce que tu sais faire, ni ce que tu es capable de construire. Le Projet Phoenix, c'est ta réponse. Pas la vengeance. La reconstruction."
      },
      {
        type: 'quote',
        text: "Un homme qui sait pourquoi il travaille peut supporter n'importe quel comment."
      }
    ]
  },
  {
    id: 'mindset',
    emoji: '🧠',
    title: 'Comment te comporter dans les moments durs',
    color: '#3b82f6',
    content: [
      {
        type: 'rule',
        num: '01',
        title: 'Le mauvais jour n\'annule pas le projet',
        text: "Tu vas avoir des semaines à 0 FCFA. Des chantiers qui tombent. Des journées où tu rentres épuisé avec rien dans la poche. Ce n'est pas un signe que le plan ne marche pas. C'est le plan qui se teste. Continue."
      },
      {
        type: 'rule',
        num: '02',
        title: 'Compare-toi à toi d\'il y a un mois',
        text: "Pas à quelqu'un qui a déjà son PC. Pas à un étudiant européen avec une bourse. Toi d'aujourd'hui vs toi de juillet 2026. C'est le seul match qui compte."
      },
      {
        type: 'rule',
        num: '03',
        title: 'La fatigue est normale. L\'abandon est un choix.',
        text: "Plomberie + cours + révisions + auto-formation : c'est lourd. Ton corps va réclamer du repos — donne-lui. Mais ne confonds pas \"j'ai besoin de repos\" avec \"j'abandonne\". L'un te recharge. L'autre t'efface."
      },
      {
        type: 'rule',
        num: '04',
        title: 'Pose le problème, pas les mains',
        text: "Quand ça bloque — un skill que tu comprends pas, un client qui paye pas, un mois trop court — pose-toi une seule question : qu'est-ce que je peux contrôler là, maintenant ? Agis sur ça. Le reste, lâche."
      }
    ]
  },
  {
    id: 'tentation',
    emoji: '💸',
    title: 'Résister à la tentation de dépenser',
    color: '#ef4444',
    content: [
      {
        type: 'text',
        text: "Le premier vrai salaire est dangereux. Pas parce que tu es faible — parce que tu mérites de te récompenser, et ton cerveau le sait. Il va te parler en FCFA, pas en pourcentage."
      },
      {
        type: 'tip',
        icon: '⚡',
        title: 'La règle des 48h',
        text: "Toute dépense non-essentielle supérieure à 5 000 FCFA attend 48 heures. Si au bout de 48h tu veux encore l'acheter, demande-toi combien d'heures de chantier ça représente. Souvent, l'envie passe."
      },
      {
        type: 'tip',
        icon: '📲',
        title: 'Vire l\'argent dès que tu le reçois',
        text: "L'argent qui dort dans ta poche ou sur ton compte principal finit par partir. Dès que tu gagnes, transfère 70–80% sur ton compte épargne Wave avant même de rentrer chez toi. Ce que tu ne vois pas, tu ne le dépenses pas."
      },
      {
        type: 'tip',
        icon: '👁️',
        title: 'Visualise ce que tu achètes vraiment',
        text: "Quand tu veux dépenser 15 000 FCFA en dehors, dis-toi : \"c'est une semaine de travail\". Quand tu veux dépenser 50 000, dis-toi : \"c'est un mois d'avance sur mon PC\". Les achats ont une autre saveur après."
      },
      {
        type: 'tip',
        icon: '🎯',
        title: 'Les 20% sont sacrés, mais réels',
        text: "Le plan prévoit 20% pour toi sur les bonus. C'est pas de la faiblesse — c'est du carburant. Un projet tenu sur 15 mois a besoin de petites victoires en chemin. Utilise tes 20%, pas plus."
      }
    ]
  },
  {
    id: 'conseils',
    emoji: '🛠️',
    title: 'Conseils pour tenir sur la durée',
    color: '#22c55e',
    content: [
      {
        type: 'tip',
        icon: '📅',
        title: 'Le samedi est ton jour de bilan',
        text: "Chaque samedi, 20 minutes. Tu ouvres Phoenix, tu notes ce que tu as gagné, tu vois où tu en es, tu planifies la semaine suivante. Ce rituel seul fait la différence entre ceux qui atteignent leurs objectifs et ceux qui les abandonnent."
      },
      {
        type: 'tip',
        icon: '📓',
        title: 'Note chaque contact',
        text: "Chaque client satisfait en plomberie est une source potentielle de 3 autres clients. Note les noms, les quartiers, les problèmes résolus. Dans 6 mois, ce carnet vaut de l'or."
      },
      {
        type: 'tip',
        icon: '🎓',
        title: 'Ne lâche jamais les cours',
        text: "Même épuisé. Même si c'est juste 30 minutes de révision. Le diplôme change ta catégorie de valeur sur le marché. Un plombier informaticien diplômé au Sénégal en 2027, c'est rare — c'est toi."
      },
      {
        type: 'tip',
        icon: '🤝',
        title: 'Dis à quelqu\'un que tu fais ça',
        text: "Trouve une personne — un ami, un cousin, quelqu'un — à qui tu peux dire \"je construis quelque chose\". Pas pour te vanter. Pour créer un témoin. Les engagements publics tiennent mieux que les engagements secrets."
      },
      {
        type: 'tip',
        icon: '🏁',
        title: 'Célèbre les jalons intermédiaires',
        text: "100k FCFA atteint ? C'est une victoire réelle. Marque-la. Pas avec 50k de dépenses — mais avec quelque chose de simple et significatif. Une soirée, un bon repas, un moment pour toi. Tu as le droit."
      }
    ]
  },
  {
    id: 'final',
    emoji: '🚀',
    title: 'Ce qui t\'attend de l\'autre côté',
    color: '#a855f7',
    content: [
      {
        type: 'text',
        text: "Dans 15 mois, si tu suis ce plan, tu n'auras pas seulement un ordinateur. Tu auras prouvé que tu peux construire quelque chose sur la durée avec tes mains et ta tête, en même temps, sans abandonner."
      },
      {
        type: 'text',
        text: "Tu seras plombier avec des clients. Tu seras étudiant avec de l'expérience terrain. Tu seras développeur avec un outil professionnel. Et tu seras la preuve vivante qu'au Sénégal, en partant de zéro, on peut reconstruire."
      },
      {
        type: 'quote',
        text: "Le PC que tu vas acheter avec cet argent ne sera pas juste un outil. Ce sera la preuve physique de ce que tu es capable de faire."
      },
      {
        type: 'text',
        text: "Alors vas-y. Jour après jour. Semaine après semaine. 2 500 FCFA à la fois. 🔥"
      }
    ]
  }
]

function RuleCard({ num, title, text, color }) {
  return (
    <div style={{
      display: 'flex', gap: 14, padding: '1rem 0',
      borderBottom: '1px solid var(--border)'
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color, fontFamily: 'var(--mono)',
        flexShrink: 0, marginTop: 2, opacity: 0.8
      }}>{num}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>{text}</div>
      </div>
    </div>
  )
}

function TipCard({ icon, title, text, color }) {
  return (
    <div style={{
      background: 'var(--bg2)', borderRadius: 'var(--radius-sm)',
      padding: '0.875rem 1rem', marginBottom: 8,
      borderLeft: `3px solid ${color}`
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        <span style={{ marginRight: 6 }}>{icon}</span>{title}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>{text}</div>
    </div>
  )
}

function Quote({ text }) {
  return (
    <div style={{
      borderLeft: '3px solid var(--accent)',
      paddingLeft: '1rem', margin: '1rem 0',
      fontStyle: 'italic', fontSize: 13,
      color: 'var(--text2)', lineHeight: 1.7
    }}>"{text}"</div>
  )
}

function SectionBlock({ section }) {
  const [open, setOpen] = useState(section.id === 'pourquoi')

  return (
    <div style={{
      background: 'var(--bg1)', border: `1px solid ${open ? section.color + '40' : 'var(--border)'}`,
      borderRadius: 'var(--radius)', marginBottom: 10, overflow: 'hidden',
      transition: 'border-color 0.2s'
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '1rem 1.125rem', background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left'
      }}>
        <span style={{ fontSize: 20 }}>{section.emoji}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{section.title}</span>
        <span style={{
          fontSize: 16, color: 'var(--text3)', transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s', lineHeight: 1
        }}>↓</span>
      </button>

      {open && (
        <div style={{ padding: '0 1.125rem 1.125rem' }}>
          <div style={{ width: '100%', height: 1, background: `${section.color}30`, marginBottom: '0.875rem' }} />
          {section.content.map((block, i) => {
            if (block.type === 'text') return (
              <p key={i} style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 12 }}>{block.text}</p>
            )
            if (block.type === 'quote') return <Quote key={i} text={block.text} />
            if (block.type === 'rule') return (
              <RuleCard key={i} num={block.num} title={block.title} text={block.text} color={section.color} />
            )
            if (block.type === 'tip') return (
              <TipCard key={i} icon={block.icon} title={block.title} text={block.text} color={section.color} />
            )
            return null
          })}
        </div>
      )}
    </div>
  )
}

export default function APropos() {
  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Header motivationnel */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(168,85,247,0.08) 100%)',
        border: '1px solid var(--accent-border)', borderRadius: 'var(--radius)',
        padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'center'
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🦅</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.3px', marginBottom: 6 }}>
          Projet Phoenix
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
          Ce n'est pas juste un tracker d'épargne.<br />
          C'est la preuve que tu vas construire quelque chose<br />
          <strong style={{ color: 'var(--text)' }}>avec tes mains, ta tête, et ta constance.</strong>
        </div>
      </div>

      {/* Sections accordéon */}
      {SECTIONS.map(s => <SectionBlock key={s.id} section={s} />)}

      {/* Signature */}
      <div style={{
        marginTop: '1.5rem', textAlign: 'center',
        fontSize: 11, color: 'var(--text3)', lineHeight: 1.8
      }}>
        Ababacar · Dakar, Sénégal · Juillet 2026<br />
        <span style={{ color: 'var(--accent)' }}>🔥 Le feu ne s'éteint pas</span>
      </div>
    </div>
  )
}
