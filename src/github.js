// GitHub-backed database
// Reads from public raw content — no auth needed
// Writes handled by Hans via GitHub API

const OWNER = 'WiggidyWiggidy'
const REPO  = 'everestlabs-workspace'
const BRANCH = 'main'

const raw = (file) =>
  `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/data/${file}?t=${Date.now()}`

export async function fetchIdeas() {
  try {
    const r = await fetch(raw('ideas.json'))
    const d = await r.json()
    return d.ideas || []
  } catch { return [] }
}

export async function fetchExperiments() {
  try {
    const r = await fetch(raw('experiments.json'))
    const d = await r.json()
    return d.experiments || []
  } catch { return [] }
}

export async function fetchTokens() {
  try {
    const r = await fetch(raw('tokens.json'))
    const d = await r.json()
    return d.sessions || []
  } catch { return [] }
}

export async function fetchMarketing() {
  try {
    const r = await fetch(raw('marketing.json'))
    return await r.json()
  } catch { return { dailyLog: [], summary: {}, notes: '' } }
}
