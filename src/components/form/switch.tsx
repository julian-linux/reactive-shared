import React, { useMemo, useCallback, useEffect, useState } from 'react'

// Material Components
import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FormHelperText from '@mui/material/FormHelperText'
import Switch from '@mui/material/Switch'

import isEqual from 'lodash/isEqual'

import { usePreviousValue, useLabel, onlyText } from '../../utils'

import type { BuildInputProps } from './sharedTypes'

const SharedSwitch: React.FC<BuildInputProps> = ({
  renderProps: {
    field: {
      onChange: onChangeField,
      ...field
    },
    fieldState: { error }
  },
  inputProps: {
    sx = {},
    label,
    helpText,
    onChange,
    disabled = false,
    value
  }
}) => {
  const previousValue = usePreviousValue(value)

  const [checked, setChecked] = useState((field.value !== undefined && field.value) || value || false)

  const handleChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = evt.target

    setChecked(checked)
    onChangeField(checked)

    if (typeof onChange === 'function') {
      onChange(checked)
    }
  }, [onChange]) // eslint-disable-line react-hooks/exhaustive-deps

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
      setChecked(value)
      onChangeField(value)
    }
  }, [previousValue, value])// eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={sx}>
      <FormGroup>
        <FormControlLabel
          disabled={disabled}
          control={(
            <Switch
              checked={checked}
              onChange={handleChange}
              slotProps={{
                input: { 'aria-label': 'controlled' }
              }}
            />)}
          label={renderLabel}
        />
      </FormGroup>
      {renderHelpText}
    </Box>
  )
}

export default React.memo(SharedSwitch)
