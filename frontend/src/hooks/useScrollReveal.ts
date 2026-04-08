import { useIntersectionObserver } from './useIntersectionObserver'

export function useScrollReveal<T extends Element>(
  threshold = 0.15,
  rootMargin = '0px 0px -8% 0px',
) {
  const { targetRef, isIntersecting } = useIntersectionObserver<T>({
    threshold,
    rootMargin,
    freezeOnceVisible: true,
  })

  return {
    ref: targetRef,
    isVisible: isIntersecting,
  }
}
