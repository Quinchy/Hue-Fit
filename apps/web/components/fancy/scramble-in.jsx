"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react"

const ScrambleIn = forwardRef(
  (
    {
      text,
      scrambleSpeed = 50,
      scrambledLetterCount = 2,
      characters = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
      className = "",
      scrambledClassName = "",
      autoStart = true,
      onStart,
      onComplete,
    },
    ref
  ) => {
    const [displayText, setDisplayText] = useState("")
    const [isAnimating, setIsAnimating] = useState(false)
    const [visibleLetterCount, setVisibleLetterCount] = useState(0)
    const [scrambleOffset, setScrambleOffset] = useState(0)

    const startAnimation = useCallback(() => {
      setIsAnimating(true)
      setVisibleLetterCount(0)
      setScrambleOffset(0)
      if (onStart) onStart()
    }, [onStart])

    const reset = useCallback(() => {
      setIsAnimating(false)
      setVisibleLetterCount(0)
      setScrambleOffset(0)
      setDisplayText("")
    }, [])

    useImperativeHandle(ref, () => ({
      start: startAnimation,
      reset,
    }))

    useEffect(() => {
      if (autoStart) {
        startAnimation()
      }
    }, [autoStart, startAnimation])

    useEffect(() => {
      let interval

      if (isAnimating) {
        interval = setInterval(() => {
          if (visibleLetterCount < text.length) {
            setVisibleLetterCount(prev => prev + 1)
          } else if (scrambleOffset < scrambledLetterCount) {
            setScrambleOffset(prev => prev + 1)
          } else {
            clearInterval(interval)
            setIsAnimating(false)
            if (onComplete) onComplete()
          }

          const remainingSpace = Math.max(0, text.length - visibleLetterCount)
          const currentScrambleCount = Math.min(remainingSpace, scrambledLetterCount)

          const scrambledPart = Array(currentScrambleCount)
            .fill(0)
            .map(() => characters[Math.floor(Math.random() * characters.length)])
            .join("")

          setDisplayText(text.slice(0, visibleLetterCount) + scrambledPart)
        }, scrambleSpeed)
      }

      return () => {
        if (interval) clearInterval(interval)
      }
    }, [
      isAnimating,
      text,
      visibleLetterCount,
      scrambleOffset,
      scrambledLetterCount,
      characters,
      scrambleSpeed,
      onComplete,
    ])

    const renderText = () => {
      const revealed = displayText.slice(0, visibleLetterCount)
      const scrambled = displayText.slice(visibleLetterCount)

      return (
        <>
          <span className={className}>{revealed}</span>
          <span className={scrambledClassName}>{scrambled}</span>
        </>
      )
    }

    return (
      <>
        <span className="sr-only">{text}</span>
        <span className="inline-block whitespace-pre-wrap" aria-hidden="true">
          {renderText()}
        </span>
      </>
    )
  }
)

ScrambleIn.displayName = "ScrambleIn"
export default ScrambleIn
