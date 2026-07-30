import React, { useEffect, useState } from 'react'

import type { SxProps, Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'

import { NumericFormat } from 'react-number-format'

import { sxTextField } from './form/styles'

export interface BasicNumberFormatProps extends Omit<TextFieldProps, 'onChange' | 'value' | 'defaultValue'> {
  name: string,
  label: string,
  onChange: (value: string) => void,
  value: string | number,
  sx?: SxProps<Theme>
}

const BasicNumberFormat: React.FC<BasicNumberFormatProps> = ({ name, label, value, onChange, sx, ...props }) => {
  const [inputValue, setValue] = useState(value ?? '')

  const handleChange = ({ value }: { value: string }) => {
    setValue(value)
    if (typeof onChange === 'function') {
      onChange(value)
    }
  }

  useEffect(() => {
    setValue(value ?? '')
  }, [value])

  return (
    <NumericFormat
      value={inputValue}
      onValueChange={handleChange}
      customInput={TextField}
      thousandSeparator
      valueIsNumericString
      prefix="$ "
      variant="standard"
      label={label}
      name={name}
      sx={{ width: '100%', ...sxTextField, ...sx }}
      {...(props as Record<string, unknown>)}
    />

  )
}

export const SharedBasicNumberFormat = React.memo(BasicNumberFormat)
