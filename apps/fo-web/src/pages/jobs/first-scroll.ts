export const onFirstScroll = (target: EventTarget, done: () => void) => {
  target.addEventListener('scroll', done, { once: true, passive: true })
  return () => target.removeEventListener('scroll', done)
}
