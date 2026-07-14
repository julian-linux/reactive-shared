import { useRef, useEffect, useMemo } from 'react'

import { onlyText } from '../utils/intlHelpers'

export const shouldTranslateLabel = (label: string): boolean => {
  return label.includes('.') && label === label.toUpperCase()
}

export const getLabelText = (label: string | (() => string)): string => {
  if (typeof label === 'function') return label()
  if (typeof label !== 'string') return '-'

  if (shouldTranslateLabel(label)) {
    const text = onlyText(label)

    if (typeof text !== 'string') {
      throw new Error(`label ${label.toString()} is not a string`)
    }

    if (text.startsWith('#') && text.endsWith('#')) {
      return text.slice(2, -2)
    }

    return text
  }

  return label
}

export const usePreviousValue = <T>(value: T): T => {
  const ref = useRef<T>(null)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current!
}

export const useLabel = (label: string | (() => string)): string => {
  const renderLabel = useMemo(() => {
    return getLabelText(label)
  }, [label])

  return renderLabel
}
