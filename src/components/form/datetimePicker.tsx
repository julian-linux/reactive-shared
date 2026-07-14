import React, { useCallback, useState, useEffect } from 'react'

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker'

import isEqual from 'lodash/isEqual'

import { useLabel, usePreviousValue } from '../../utils'

import type { BuildInputProps } from './sharedTypes'

const SharedDateTimePicker: React.FC<BuildInputProps> = ({
  renderProps: {
    field
  },
  inputProps: {
    label,
    ...inputProps
  }
}) => {
  const previousValue = usePreviousValue(inputProps.value)

  const [value, setValue] = useState(inputProps.value)

  const renderLabel = useLabel(label)

  const handleChange = useCallback((value: any) => {
    setValue(value)
    field?.onChange?.(value)
  }, [field?.onChange]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isEqual(previousValue, value)) {
      field?.onChange?.(value)
      setValue(value)
    }
  }, [previousValue, value, field?.onChange]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <MobileDateTimePicker
        label={renderLabel}
        format='yyyy-MM-DD hh:mm a'
        value={value}
        onChange={handleChange}
      />
    </LocalizationProvider>
  )
}

export default React.memo(SharedDateTimePicker)
