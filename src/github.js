// GitHub JSON Database — read from public raw URLs
// Hans writes via API; dashboard reads live from GitHub

const OWNER = 'WiggidyWiggidy'
const REPO  = 'everestlabs-workspace'
const BRANCH = 'main'

function rawUrl(path) {
  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}?t=${Date.now()}`
}

export async function fetchIdeas() {
  try {
    const res = await fetch(rawUrl('data/ideas.json'))
    const data = await res.json()
    return data.ideas || []
  } catch { return [] }
}

export async function fetchExperiments() {
  try {
    const res = await fetch(rawUrl('data/experiments.json'))
    const data = await res.json()
    return data.experiments || []
  } catch { return [] }
}

export async function fetchTokens() {
  try {
    const res = await fetch(rawUrl('data/tokens.json'))
    const data = await res.json()
    return data.sessions || []
  } catch { return [] }
}

export async function fetchMarketing() {
  try {
    const res = await fetch(rawUrl('data/marketing.json'))
    return await res.json()
  } catch { return { dailyLog: [], summary: {}, notes: '' } }
}
