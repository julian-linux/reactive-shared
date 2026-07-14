import React, { useCallback, useEffect, useState } from 'react'

import type { SxProps, Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'

import { NumericFormat } from 'react-number-format'

export interface BasicNumberFormatProps {
  name: string,
  label: string,
  onChange: (value: string) => void,
  value: string | number,
  sx?: SxProps<Theme>
}

const BasicNumberFormat: React.FC<BasicNumberFormatProps> = ({ name, label, value, onChange, sx }) => {
  const [inputValue, setValue] = useState(value || '')
  const handleChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { value } = evt.target
    setValue(value)
    if (typeof onChange === 'function') {
      onChange(value)
    }
  }, [onChange])

  useEffect(() => {
    setValue(value || '')
  }, [value])

  return (
    <NumericFormat
      value={inputValue}
      onChange={handleChange}
      customInput={TextField}
      thousandSeparator
      valueIsNumericString
      prefix="$"
      variant="standard"
      label={label}
      name={name}
      sx={sx}
    />

  )
}

export const SharedBasicNumberFormat = React.memo(BasicNumberFormat)
