// components/LenisProvider.js
import { createContext, useContext, useEffect, useRef } from 'react'
import Lenis from '@studio-freight/lenis'

const LenisContext = createContext(null)

export function useLenis() {
  return useContext(LenisContext)
}

export function LenisProvider({ children, options = {} }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    lenisRef.current = new Lenis(options)
    function raf(time) {
      lenisRef.current.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenisRef.current.destroy()
    }
  }, [options])

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  )
}
