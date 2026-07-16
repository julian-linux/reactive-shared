import React, { useEffect, useMemo, useState } from 'react'

import TextField from '@mui/material/TextField'

import { NumericFormat } from 'react-number-format'

import isEqual from 'lodash/isEqual'

import { sxTextField } from './styles'
import { onlyText, useLabel, usePreviousValue } from '../../utils'

import type { BuildInputProps } from './sharedTypes'

const SharedNumberFormatComponent: React.FC<BuildInputProps> = ({
  renderProps: {
    field,
    fieldState: { error }
  },
  inputProps: {
    sx = {},
    label,
    helpText,
    onChange,
    value
  }
}) => {
  const previousValue = usePreviousValue(value)
  const renderLabel = useLabel(label)
  const [inputValue, setInputValue] = useState(field.value ?? value ?? '')

  const getHelperText = useMemo(() => {
    if (error != null) {
      return error.message
    }

    if (helpText !== undefined) {
      const text = typeof helpText === 'string' ? helpText : helpText(onlyText)
      return text
    }
  }, [error, helpText])

  const handleChange = ({ value }: { value: string }) => {
    const newValue = value
    setInputValue(newValue)
    field.onChange(parseFloat(newValue))

    if (typeof onChange === 'function') {
      onChange(parseFloat(newValue))
    }
  }

  useEffect(() => {
    if (!isEqual(previousValue, value)) {
      field.onChange(parseFloat(value))
      setInputValue(value || '')
    }
  }, [previousValue, value])// eslint-disable-line react-hooks/exhaustive-deps

  return (
    <NumericFormat
      value={inputValue}
      onValueChange={handleChange}
      customInput={TextField}
      thousandSeparator
      valueIsNumericString
      prefix="$"
      sx={{ width: '100%', ...sxTextField, ...sx }}
      label={renderLabel}
      helperText={getHelperText}
      error={Boolean(error)}
    />
  )
}

export const SharedNumberFormat = React.memo(SharedNumberFormatComponent)

export default React.memo(SharedNumberFormatComponent)
