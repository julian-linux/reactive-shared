import React, { useCallback, useRef, useState, useEffect } from 'react'
import type { SyntheticEvent } from 'react'

import MaterialAutocomplete from '@mui/material/Autocomplete'
import type { AutocompleteChangeDetails, AutocompleteChangeReason, AutocompleteInputChangeReason } from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'

import debounce from 'lodash/debounce'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'

import { useLabel, usePreviousValue } from '../utils'

export interface AutocompleteProps {
  freeSolo?: boolean
  startAdornment?: any
  getOptionLabel?: any
  onChange?: any
  options?: any
  renderOption?: any
  value?: any
  useQuery?: any
  inputProps: {
    label: string | (() => string)
    error?: any
    helpText?: string
    value?: any
    incomingValue?: any
  }
  renderProps?: any
  useFormProps?: any
  sx?: { [k: string]: any }
  size?: 'small' | 'medium'
  displayField?: string
}

type DefaultUseQueryProps = () => {
  isLoading: boolean
  data: any
  refetch: () => void
}

type HandleInputChangeProps = (event: React.SyntheticEvent<Element, Event>, value: string, reason: AutocompleteInputChangeReason) => void
type HandleChangeProps = (event: SyntheticEvent<Element, Event>, value: any, reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails<any> | undefined) => void

const defaultUseQuery: DefaultUseQueryProps = () => {
  return {
    isLoading: false,
    data: [],
    refetch: () => { }
  }
}

const SharedAutocomplete: React.FC<AutocompleteProps> = ({
  useQuery = defaultUseQuery,
  options = [],
  startAdornment,
  inputProps,
  renderProps,
  onChange,
  useFormProps, // eslint-disable-line @typescript-eslint/no-unused-vars
  displayField = 'name', // this is when the value is updated and want to show the object[displayField] value
  ...props
}) => {
  const { field: fieldProps, fieldState: { error } } = renderProps
  const { onChange: onChangeField } = fieldProps
  const { label, helpText, value } = inputProps

  const [autocompleteValue, setAutocompleteValue] = useState(value)
  const [inputValue, setInputValue] = useState('')
  const [inputOptions, setInputOptions] = useState(options)

  const { isLoading, data, refetch } = useQuery({ params: { key: inputValue } }, { enabled: false })

  const debounceSearch = useRef(debounce(
    () => refetch(),
    999
  ))

  const prevOptions = usePreviousValue(options)

  const renderLabel = useLabel(label)

  const renderInput = useCallback((params: any) => {
    return (
      <TextField
        {...params}
        label={renderLabel}
        InputProps={{
          ...params.InputProps,
          startAdornment,
          endAdornment: (
            <>
              {Boolean(isLoading) && (<CircularProgress color='inherit' size={20} />)}
              {params.InputProps?.endAdornment}
            </>
          )
        }}
        error={Boolean(error)}
        helperText={get(error, 'message', helpText)}
      />
    )
  }, [startAdornment, error, renderLabel, helpText, isLoading])

  const handleChange = useCallback<HandleChangeProps>((_evt, value) => {
    onChangeField(value)
    setAutocompleteValue(value)

    if (typeof onChange === 'function') {
      onChange(value)
    }
  }, [onChange])// eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = useCallback<HandleInputChangeProps>((_evt, value, action) => {
    setInputValue(value)
    onChangeField(value)

    if (value.length < 2) return undefined
    if (action === 'reset') return undefined

    debounceSearch.current()
  }, [autocompleteValue])// eslint-disable-line react-hooks/exhaustive-deps

  // if a value is updated
  useEffect(() => {
    if (value === undefined || value === null) return undefined

    if (typeof value === 'string') {
      setInputValue(value)
      setAutocompleteValue(value)
      onChangeField(value)
      return undefined
    }
    setInputValue(value[displayField])

    onChangeField(value)
  }, [value, displayField])// eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (Object.is(useQuery, defaultUseQuery)) {
      return undefined
    }

    setInputOptions(data?.data || [])
  }, [data, useQuery])

  useEffect(() => {
    if (!isEqual(options, prevOptions)) setInputOptions(options)
  }, [options, prevOptions])

  return (
    <MaterialAutocomplete
      {...props}
      value={autocompleteValue}
      inputValue={inputValue}
      disablePortal
      filterOptions={(x) => x}
      options={inputOptions}
      renderInput={renderInput}
      onInputChange={handleInputChange}
      onChange={handleChange}
      loading={isLoading}
      sx={{ width: 1, ...props.sx }}
    />
  )
}

export const Autocomplete = React.memo(SharedAutocomplete)
