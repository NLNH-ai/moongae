import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver<T extends Element>(
  options: UseIntersectionObserverOptions = {},
) {
  const {
    threshold = 0.15,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = true,
  } = options

  const targetRef = useRef<T | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const node = targetRef.current

    if (!node || (freezeOnceVisible && isIntersecting)) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)

        if (entry.isIntersecting && freezeOnceVisible) {
          observer.unobserve(node)
        }
      },
      { threshold, root, rootMargin },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [freezeOnceVisible, isIntersecting, root, rootMargin, threshold])

  return { targetRef, isIntersecting }
}
