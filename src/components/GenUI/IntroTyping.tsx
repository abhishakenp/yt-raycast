import { useEffect, useRef, useState } from 'react'
import styles from './IntroLoader.module.css'

const FUN_MESSAGES = [
  'Igniting fusion reactors...',
  'Calibrating warp drive...',
  'Initializing rocket exhaust backdrop systems...',
  'Refueling the rocket with high-octane Tailwind configurations...',
]

export function IntroTyping() {
  const [text, setText] = useState('')
  const [messageIndex, setMessageIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const currentMessage = FUN_MESSAGES[messageIndex]
    
    const type = () => {
      if (isDeleting) {
        if (charIndex > 0) {
          setCharIndex(charIndex - 1)
          setText(currentMessage.substring(0, charIndex - 1))
        } else {
          setIsDeleting(false)
          setMessageIndex((prev) => (prev + 1) % FUN_MESSAGES.length)
        }
      } else {
        if (charIndex < currentMessage.length) {
          setCharIndex(charIndex + 1)
          setText(currentMessage.substring(0, charIndex + 1))
        } else {
          setIsDeleting(true)
        }
      }
    }

    const speed = isDeleting ? 30 : 50
    timeoutRef.current = setTimeout(type, speed)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [charIndex, isDeleting, messageIndex])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`${styles.typing} ${isVisible ? styles.visible : ''}`}>
      <span style={{ fontSize: '18px', color: '#ededef', fontFamily: 'ui-monospace, monospace' }}>
        {text}
        <span style={{ animation: 'blink 1s step-end infinite' }}>|</span>
      </span>
    </div>
  )
}
