import React, { useMemo, useCallback, useLayoutEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FormHelperText from '@mui/material/FormHelperText'

import isBoolean from 'lodash/isBoolean'
import isEqual from 'lodash/isEqual'

import { usePreviousValue, useLabel, onlyText } from '../../utils'

import type { BuildInputProps } from './sharedTypes'

const SharedCheckbox: React.FC<BuildInputProps> = ({
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
  const newValue = isBoolean(field.value) ? field.value : isBoolean(value) ? value : false
  const previousValue = usePreviousValue(newValue)

  const [checked, setChecked] = useState(newValue)

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

  useLayoutEffect(() => {
    if (!isEqual(previousValue, newValue)) {
      setChecked(newValue)
      onChangeField(newValue)
    }
  }, [previousValue, newValue])// eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={sx}>
      <FormGroup>
        <FormControlLabel
          disabled={disabled}
          control={(
            <Checkbox
              disabled={disabled}
              checked={checked}
              onChange={handleChange}
            />)}
          label={renderLabel}
        />
      </FormGroup>
      {renderHelpText}
    </Box>
  )
}

export default React.memo(SharedCheckbox)
