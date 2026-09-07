import { useEffect, useRef, useState } from 'react'

/** Reveals `text` word-by-word to simulate transcription appearing in real time (demo mode). */
export function useTypewriter(text: string, active: boolean, wordsPerTick = 2, tickMs = 45) {
  const [revealed, setRevealed] = useState('')
  const [done, setDone] = useState(false)
  const wordsRef = useRef<string[]>([])

  useEffect(() => {
    if (!active || !text) {
      return
    }
    wordsRef.current = text.split(' ')
    let index = 0
    setRevealed('')
    setDone(false)
    const interval = setInterval(() => {
      index += wordsPerTick
      setRevealed(wordsRef.current.slice(0, index).join(' '))
      if (index >= wordsRef.current.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, tickMs)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, active])

  return { revealed, done }
}
