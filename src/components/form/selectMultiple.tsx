import React, { useCallback, useMemo, useState, useEffect } from 'react'
import isEqual from 'lodash/isEqual'

// Material Components
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import FormHelperText from '@mui/material/FormHelperText'
import ListItemText from '@mui/material/ListItemText'
import Checkbox from '@mui/material/Checkbox'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

// Shared
import { BuildInputProps } from './sharedTypes'
import { onlyText, usePreviousValue, useLabel, getLabelText } from '../../utils'

const getValue = (fieldValue, value) => {
  if (typeof fieldValue === 'string') {
    return [fieldValue]
  }
  if (typeof value === 'string') {
    return [value]
  }

  return fieldValue || value || []
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

  const [inputValue, setInputValue] = useState(getValue(field.value, value))

  const handleOnChange = useCallback((evt: SelectChangeEvent) => {
    const { value } = evt.target

    setInputValue(value)
    onChangeField(value)

    if (typeof onChange === 'function') {
      onChange(value)
    }
  }, [onChange])// eslint-disable-line react-hooks/exhaustive-deps

  const renderOptions = useMemo(() => {
    return items.map(({ label, value }) => {
      const checked = inputValue.includes(value)
      const renderLabel = getLabelText(label)

      return (
        <MenuItem key={renderLabel} value={value}>
          <Checkbox checked={checked} />
          <ListItemText primary={renderLabel} />
        </MenuItem>
      )
    })
  }, [items, inputValue])

  const renderValue = useCallback((selected: any) => {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {items
          .filter(({ value }) => selected.includes(value))
          .map(({ label }: { label: string | (() => string) }) => {
            const renderLabel = getLabelText(label)
            return (
              <Chip key={renderLabel} label={renderLabel} />
            )
          })}
      </Box>
    )
  }, [items])

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
      onChangeField(value)
      setInputValue(value)
    }
  }, [previousValue, value]) // eslint-disable-line react-hooks/exhaustive-deps

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
