import { useEffect, useState } from 'react'

/** ตัวอย่างคำที่ใช้กับ typewriter ในช่องค้นหา — ใช้ร่วมระหว่างหน้า Home และ AllSubjects */
export const SEARCH_TYPEWRITER_WORDS = [
  'สรีรวิทยา',
  'พันธุศาสตร์',
  'ตรีโกณมิติ',
  'กฎของนิวตัน',
  'ไฟฟ้าเคมี',
  'ตับ · ไต · หัวใจ',
  '#midterm',
]

interface Props {
  words: string[]
  prefix?: string
  typeSpeed?: number
  deleteSpeed?: number
  pauseAfterTyped?: number
  pauseAfterDeleted?: number
}

/** placeholder ที่พิมพ์ → ลบ → พิมพ์คำใหม่ วนซ้ำ (typewriter effect)
 *  ใช้คู่กับ <input> โดยส่งค่าที่ render ไปเป็น `placeholder` */
export function useTypewriter({
  words,
  prefix = '',
  typeSpeed = 75,
  deleteSpeed = 40,
  pauseAfterTyped = 1400,
  pauseAfterDeleted = 350,
}: Props) {
  const [text, setText] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing')

  useEffect(() => {
    // เคารพ prefers-reduced-motion: ไม่หมุน — โชว์คำเดียวค้างไว้
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setText(words[0] ?? ''); return }

    const word = words[wordIdx % words.length] ?? ''
    let t: number

    if (phase === 'typing') {
      if (text.length < word.length) {
        t = window.setTimeout(() => setText(word.slice(0, text.length + 1)), typeSpeed)
      } else {
        t = window.setTimeout(() => setPhase('deleting'), pauseAfterTyped)
      }
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        t = window.setTimeout(() => setText(word.slice(0, text.length - 1)), deleteSpeed)
      } else {
        t = window.setTimeout(() => {
          setWordIdx(i => (i + 1) % words.length)
          setPhase('typing')
        }, pauseAfterDeleted)
      }
    } else {
      t = 0
    }
    return () => { if (t) window.clearTimeout(t) }
  }, [text, phase, wordIdx, words, typeSpeed, deleteSpeed, pauseAfterTyped, pauseAfterDeleted])

  return prefix + text
}
