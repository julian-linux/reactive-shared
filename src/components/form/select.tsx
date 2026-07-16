import React, { useCallback, useMemo, useEffect, useState } from 'react'

import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import ListSubheader from '@mui/material/ListSubheader'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'

import isArray from 'lodash/isArray'
import isEqual from 'lodash/isEqual'

import { onlyText, usePreviousValue, useLabel, getLabelText } from '../../utils'

import type { BuildInputProps, ItemOption, GroupedItems } from './sharedTypes'

type SelectProps = BuildInputProps & {
  inputProps: {
    native?: boolean

  }
}

const isItemOption = (item: any): item is ItemOption => {
  if (item == null || typeof item !== 'object') return false

  const hasValidLabel = typeof item.label === 'string' || typeof item.label === 'function'
  const hasValidValue = typeof item.value === 'string' || typeof item.value === 'number'
  const hasValidDisabled = item.disabled === undefined || typeof item.disabled === 'boolean'

  return hasValidLabel && hasValidValue && hasValidDisabled
}

const isGroupedItems = (items: any): items is GroupedItems => {
  if (items == null || typeof items !== 'object' || Array.isArray(items)) return false

  return Object.values(items).every((group) => Array.isArray(group) && group.every(isItemOption))
}

export const SharedSelect: React.FC<SelectProps> = ({
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
    value,
    native = false,
    fullWidth = true,
    sx = {},
    size = 'medium'
  }
}) => {
  const previousValue = usePreviousValue(value)

  const [inputValue, setInputValue] = useState(field.value ?? value ?? '')

  const handleOnChange = useCallback((evt: SelectChangeEvent) => {
    const { value } = evt.target

    onChangeField(value)
    setInputValue(value)

    if (typeof onChange === 'function') {
      onChange(value)
    }
  }, [onChangeField, onChange])

  const renderOptions = useMemo(() => {
    if (Array.isArray(items)) {
      return items.map(({ label, value, disabled = false }) => {
        const renderLabel = getLabelText(label)

        if (native) return <option key={renderLabel} value={value} disabled={disabled}>{renderLabel}</option>

        return (
          <MenuItem key={renderLabel} value={value} disabled={disabled}>{renderLabel}</MenuItem>
        )
      })
    }

    if (isGroupedItems(items)) {
      return Object.entries(items).flatMap(([groupName, groupItems]) => {
        return [
          (
            <ListSubheader
              key={`group-${groupName}`}
              disableSticky
              sx={{
                color: 'text.disabled',
                typography: 'body1',
                px: 2,
                py: 0,
                backgroundColor: '#eeeeee',
                fontStyle: 'italic',
                pl: 3,
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              {groupName}
            </ListSubheader>
          ),
          ...groupItems.map(({ label, value, disabled = false }) => {
            const renderLabel = getLabelText(label)

            return (
              <MenuItem key={`${groupName}-${renderLabel}`} value={value} disabled={disabled}>{renderLabel}</MenuItem>
            )
          })
        ]
      })
    }

    return []

  }, [items, native])

  const normalizedItems = useMemo<ItemOption[]>(() => {
    if (Array.isArray(items)) return items
    if (isGroupedItems(items)) return Object.values(items).flat()
    return []
  }, [items])

  const renderValue = useCallback((selected: any) => {
    if (normalizedItems.length === 0) return ''

    const item = normalizedItems.find(({ value }) => value === selected)

    if (item?.label === undefined) return ''

    return getLabelText(item.label)
  }, [normalizedItems])

  const renderHelpText = useMemo(() => {
    if (error != null) {
      const message = isArray(error) ? error[0].message : error.message
      return (<FormHelperText>{message}</FormHelperText>)
    }

    if (helpText !== undefined) {
      const text = typeof helpText === 'string' ? helpText : helpText(onlyText)

      return (<FormHelperText>{text}</FormHelperText>)
    }
  }, [error, helpText])

  const renderLabel = useLabel(label)

  const defaultSelect = onlyText('FORM.LABEL.DEFAULT_SELECT')
  const safeSize = size === 'small' || size === 'medium' ? size : 'medium'

  useEffect(() => {
    if (!isEqual(previousValue, value)) {
      onChangeField(value)
      setInputValue(value ?? '')
    }
  }, [previousValue, value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FormControl fullWidth={Boolean(fullWidth)} error={Boolean(error)} required={required} sx={{ mt: 2, ...sx }} size={safeSize}>
      <InputLabel sx={{ bgcolor: 'white', px: 1 }} id={`id-select-${renderLabel.toLowerCase()}`}>{renderLabel}</InputLabel>
      <Select
        {...field}
        native={native}
        labelId={`id-select-${renderLabel.toLowerCase()}`}
        disabled={disabled}
        value={inputValue}
        renderValue={renderValue}
        onChange={handleOnChange}
      >
        {native ? (<option>{defaultSelect}</option>) : (<MenuItem><em>{defaultSelect}</em></MenuItem>)}
        {renderOptions}
      </Select>
      {renderHelpText}
    </FormControl>
  )
}

export default React.memo(SharedSelect)
