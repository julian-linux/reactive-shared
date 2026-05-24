import React, { useCallback, useMemo, useEffect, useState } from 'react'
import isArray from 'lodash/isArray'
import isEqual from 'lodash/isEqual'

// Material Components
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import ListSubheader from '@mui/material/ListSubheader'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import FormHelperText from '@mui/material/FormHelperText'

// Shared
import { BuildInputProps, ItemOption, GroupedItems } from './sharedTypes'
import { onlyText, usePreviousValue, useLabel, getLabelText } from '../../utils'

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
    formControlSx = {},
    size = 'medium'
  }
}) => {
  const previousValue = usePreviousValue(value)

  const [inputValue, setInputValue] = useState(field.value || value || '')

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
                py: 1,
                minHeight: 48,
                lineHeight: '1.5rem',
                backgroundColor: 'secondary.dark',
                fontStyle: 'italic',
                pl: 3
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
  const safeFormControlSx = typeof formControlSx === 'object' && formControlSx !== null ? formControlSx : {}
  const safeSize = size === 'small' || size === 'medium' ? size : 'medium'

  useEffect(() => {
    if (!isEqual(previousValue, value)) {
      onChangeField(value)
      setInputValue(value)
    }
  }, [previousValue, value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FormControl fullWidth={Boolean(fullWidth)} error={Boolean(error)} required={required} sx={{ mt: 2, ...safeFormControlSx }} size={safeSize}>
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
