import React, { useMemo, useCallback, useEffect, useState } from 'react'

import Error from '@mui/icons-material/Error'
import { red } from '@mui/material/colors'
import InputAdornment from '@mui/material/InputAdornment'
import type { InputBaseComponentsPropsOverrides } from '@mui/material/InputBase'
import TextField from '@mui/material/TextField'

import isEqual from 'lodash/isEqual'

import { sxTextField } from './styles'
import { usePreviousValue, useLabel, onlyText } from '../../utils'

import type { BuildInputProps } from './sharedTypes'

const SharedTextFieldComponent: React.FC<BuildInputProps> = ({
  renderProps: {
    field,
    fieldState: { error }
  },
  inputProps: {
    sx = {},
    label,
    helpText,
    slotProps = {},
    icon,
    onChange,
    value,
    ...inputProps
  }
}) => {
  const previousValue = usePreviousValue(value)

  const [inputValue, setInputValue] = useState(field.value || value || '')

  const renderStartAdornment = useMemo(() => {
    if (icon == null) return undefined

    const Icon = icon

    return (
      <InputAdornment position='start'>
        <Icon color='action' />
      </InputAdornment>
    )
  }, [icon])

  const renderEndAdornment = useMemo(() => {
    if (error == null) return undefined

    return (
      <InputAdornment position='end'>
        <Error sx={{ fontSize: 16, color: red[400] }} />
      </InputAdornment>
    )
  }, [error])

  const getHelperText = useMemo(() => {
    if (error != null) {
      return error.message
    }

    if (helpText !== undefined) {
      const text = typeof helpText === 'string' ? helpText : helpText(onlyText)
      return text
    }
  }, [error, helpText])

  const handleChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { value } = evt.target
    field.onChange(value)
    setInputValue(value)

    if (typeof onChange === 'function') {
      onChange(value)
    }
  }, [onChange]) // eslint-disable-line react-hooks/exhaustive-deps

  const renderLabel = useLabel(label)

  const mergedSlotProps = useMemo(() => {
    const filteredSlotProps = Object.entries(slotProps ?? {}).reduce<Record<string, unknown>>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }

      return acc
    }, {})

    return {
      ...filteredSlotProps,
      input: {
        startAdornment: renderStartAdornment,
        endAdornment: renderEndAdornment,
        ...(slotProps?.input as InputBaseComponentsPropsOverrides)
      }
    }
  }, [renderEndAdornment, renderStartAdornment, slotProps])

  useEffect(() => {
    if (!isEqual(previousValue, value)) {
      field.onChange(value)
      setInputValue(value)
    }
  }, [previousValue, value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TextField
      fullWidth
      margin='normal'
      {...inputProps}
      inputRef={field.ref}
      onChange={handleChange}
      value={inputValue}
      sx={{ ...sxTextField, ...sx }}
      label={renderLabel}
      error={Boolean(error)}
      helperText={getHelperText}
      slotProps={mergedSlotProps}
    />
  )
}
export const SharedTextField = React.memo(SharedTextFieldComponent)

export default React.memo(SharedTextField)
