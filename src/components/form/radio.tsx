import React, { useCallback, useMemo, useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Typography from '@mui/material/Typography'

import isEqual from 'lodash/isEqual'

import { onlyText, usePreviousValue, useLabel, getLabelText } from '../../utils'

import type { BuildInputProps } from './sharedTypes'

const SharedRadio: React.FC<BuildInputProps> = ({
  renderProps: {
    field: {
      onChange: onChangeField,
      ...field
    },
    fieldState: { error }
  },
  inputProps: {
    label,
    helpText,
    items,
    onChange,
    value
  }
}) => {
  const previousValue = usePreviousValue(value)

  const [inputValue, setInputValue] = useState(field.value ?? value ?? '')

  const handleChangeInputValue = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.target
    onChangeField(value)
    setInputValue(value)

    if (typeof onChange === 'function') {
      onChange(value)
    }
  }, [onChange]) // eslint-disable-line react-hooks/exhaustive-deps

  const renderOptions = useMemo(() => {
    if (items == null) return null

    if (!Array.isArray(items)) return null

    return items.map(({ value, label, disabled = false, helpText: itemHelpText }) => {
      const renderLabel = getLabelText(label)
      const renderHelpText = typeof itemHelpText === 'function' ? itemHelpText() : itemHelpText

      const labelNode = renderHelpText ? (
        <Box component='span' sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography component='span' sx={{ lineHeight: 1.5 }}>{renderLabel}</Typography>
          <Typography component='span' variant='caption' color='text.secondary' sx={{ lineHeight: 1.2 }}>
            {renderHelpText}
          </Typography>
        </Box>
      ) : renderLabel

      return (
        <FormControlLabel
          key={`${String(value)}-${renderLabel}`}
          value={value}
          disabled={disabled}
          control={<Radio />}
          label={labelNode}
        />
      )
    })
  }, [items])

  const renderHelpText = useMemo(() => {
    if (error != null) {
      return (
        <FormHelperText>
          {error.message}
        </FormHelperText>
      )
    }
    if (helpText !== undefined) {
      const text = typeof helpText === 'string' ? helpText : helpText(onlyText)
      return (
        <FormHelperText>
          {text}
        </FormHelperText>
      )
    }
  }, [error, helpText])

  const renderLabel = useLabel(label)

  useEffect(() => {
    if (!isEqual(previousValue, value)) {
      onChangeField(value)
      setInputValue(value ?? '')
    }
  }, [previousValue, value])// eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FormControl component='fieldset' error={Boolean(error)}>
      <FormLabel component='legend'>{renderLabel}</FormLabel>
      <RadioGroup
        {...field}
        value={inputValue}
        onChange={handleChangeInputValue}
      >
        {renderOptions}
      </RadioGroup>
      {renderHelpText}
    </FormControl>
  )
}

export default React.memo(SharedRadio)
