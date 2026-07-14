import React, { useCallback, useState, useEffect } from 'react'

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'

import isEqual from 'lodash/isEqual'

import { useLabel, usePreviousValue } from '../../utils'

import type { BuildInputProps } from './sharedTypes'

const SharedDatePickerComponent: React.FC<BuildInputProps> = ({
  renderProps: {
    field
  },
  inputProps: {
    label,
    onChange,
    ...inputProps
  }
}) => {
  const previousValue = usePreviousValue(inputProps.value)

  const [value, setValue] = useState(inputProps.value)
  const renderLabel = useLabel(label)

  const handleChange = useCallback((value: any) => {
    setValue(value)
    field?.onChange?.(value)

    if (typeof onChange === 'function') {
      onChange(value)
    }
  }, [field?.onChange, onChange])// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isEqual(previousValue, value)) {
      field?.onChange?.(value)
      setValue(value)
    }
  }, [previousValue, value, field?.onChange, onChange]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <MobileDatePicker
        label={renderLabel}
        format='yyyy-MM-DD'
        value={value}
        onChange={handleChange}
      />
    </LocalizationProvider>
  )
}

export const SharedDatePicker = SharedDatePickerComponent

export default React.memo(SharedDatePickerComponent)
