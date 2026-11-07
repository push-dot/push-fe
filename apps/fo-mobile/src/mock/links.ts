import { Linking } from 'react-native'
import { setAccount } from './chat'
import { setRules, type Rule } from './server'
import { emptyFeed } from './social'

// `kind:METHOD:path-regex`, e.g. fail:GET:postings or hang:POST:postings/.*/apply; `reset` drops every rule.
const toRule = (spec: string): Rule | null => {
  const [kind, method, ...path] = spec.split(':')
  if (kind !== 'hang' && kind !== 'fail' && kind !== 'empty') return null
  return { kind, method: method!, re: new RegExp(`^${path.join(':')}`) }
}

// Tours reach states the fixtures can't hold through a link like push://social?mock=empty-feed (the router still opens the path).
// `mock=` takes comma-separated switches: empty-feed, plan-ultra, credits-out (an ULTRA account / spent credits), reset, or a rule (see toRule).
export const listenMockLinks = () =>
  Linking.addEventListener('url', ({ url }) => {
    const specs = decodeURIComponent(/[?&]mock=([^&#]*)/.exec(url)?.[1] ?? '').split(',').filter(Boolean)
    if (specs.includes('empty-feed')) emptyFeed()
    if (specs.includes('reset')) {
      setRules([])
      setAccount({ ultra: false, spent: false })
    }
    if (specs.includes('plan-ultra')) setAccount({ ultra: true })
    if (specs.includes('credits-out')) setAccount({ spent: true })
    const next = specs.flatMap((s) => toRule(s) ?? [])
    if (next.length) setRules(next)
  })
