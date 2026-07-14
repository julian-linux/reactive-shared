import React, { useCallback, useMemo, useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'

import isEqual from 'lodash/isEqual'

import { onlyText, usePreviousValue, useLabel, getLabelText } from '../../utils'

import type { BuildInputProps, ItemOption } from './sharedTypes'

const getValue = (fieldValue: string | string[], value: string | string[]): Array<string | number> => {
  if (typeof fieldValue === 'string') {
    return [fieldValue]
  }
  if (typeof value === 'string') {
    return [value]
  }

  return Array.isArray(fieldValue) ? fieldValue : Array.isArray(value) ? value : []
}

const SharedSelectMultiple: React.FC<BuildInputProps> = ({
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
    required,
    items = [],
    onChange,
    disabled,
    value
  }
}) => {
  const previousValue = usePreviousValue(value)

  const [inputValue, setInputValue] = useState<Array<string | number>>(getValue(field.value, value))

  const normalizedItems = useMemo<ItemOption[]>(() => {
    return Array.isArray(items) ? items : []
  }, [items])

  const handleOnChange = useCallback((evt: SelectChangeEvent<string[]>) => {
    const { value } = evt.target
    const nextValue = getValue(value, value)

    setInputValue(nextValue)
    onChangeField(nextValue)

    if (typeof onChange === 'function') {
      onChange(nextValue)
    }
  }, [onChange, onChangeField])

  const renderOptions = useMemo(() => {
    return normalizedItems.map(({ label, value }: ItemOption) => {
      const checked = inputValue.includes(value)
      const renderLabel = getLabelText(label)

      return (
        <MenuItem key={renderLabel} value={value}>
          <Checkbox checked={checked} />
          <ListItemText primary={renderLabel} />
        </MenuItem>
      )
    })
  }, [inputValue, normalizedItems])

  const renderValue = useCallback((selected: any) => {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {normalizedItems
          .filter(({ value }: ItemOption) => selected.includes(value))
          .map(({ label }: ItemOption) => {
            const renderLabel = getLabelText(label)
            return (
              <Chip key={renderLabel} label={renderLabel} />
            )
          })}
      </Box>
    )
  }, [normalizedItems])

  const renderHelpText = useMemo(() => {
    if (error != null) {
      return (<FormHelperText>{error.message}</FormHelperText>)
    }

    if (helpText !== undefined) {
      const text = typeof helpText === 'string' ? helpText : helpText(onlyText)
      return (<FormHelperText>{text}</FormHelperText>)
    }
  }, [error, helpText])

  const renderLabel = useLabel(label)

  useEffect(() => {
    if (!isEqual(previousValue, value)) {
      const nextValue = getValue(field.value, value)
      onChangeField(nextValue)
      setInputValue(nextValue)
    }
  }, [field.value, previousValue, value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FormControl fullWidth error={Boolean(error)} required={required} sx={{ mt: 2 }}>
      <InputLabel sx={{ bgcolor: 'white', px: 1 }} id={`id-select-multiple-${renderLabel.toLowerCase()}`}>{renderLabel}</InputLabel>
      <Select
        {...field}
        labelId={`id-select-multiple-${renderLabel.toLowerCase()}`}
        disabled={disabled}
        multiple
        value={inputValue}
        defaultValue={value}
        renderValue={renderValue}
        onChange={handleOnChange}
      >
        <MenuItem>
          <em>{onlyText('FORM.LABEL.DEFAULT_SELECT')}</em>
        </MenuItem>
        {renderOptions}
      </Select>
      {renderHelpText}
    </FormControl>
  )
}

export default React.memo(SharedSelectMultiple)
