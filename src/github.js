// GitHub data service — reads from everestlabs-workspace repo
const BASE = 'https://raw.githubusercontent.com/WiggidyWiggidy/everestlabs-workspace/main/data'

async function fetchJSON(file) {
  try {
    const r = await fetch(`${BASE}/${file}?t=${Date.now()}`)
    if (!r.ok) return null
    return await r.json()
  } catch {
    return null
  }
}

export const gh = {
  ideas:       () => fetchJSON('ideas.json'),
  experiments: () => fetchJSON('experiments.json'),
  tokens:      () => fetchJSON('tokens.json'),
  feedback:    () => fetchJSON('feedback.json'),
}
