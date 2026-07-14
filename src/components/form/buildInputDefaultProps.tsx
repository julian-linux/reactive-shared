import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'

import type { BuildInputProps, InputProps } from './sharedTypes'

export const defaultProps = (params: Partial<BuildInputProps> & {
  onChange?: (value: any) => void
  value?: any
  name?: string
  label?: string | (() => string)
  type?: InputProps['type']
}) => {
  const {
    onChange,
    value,
    name,
    label,
    type,
    ...otherProps
  } = params
  const props = merge(
    cloneDeep(defaultInputProps),
    {
      renderProps: {
        field: {
          onChange,
          value,
          name
        }
      }
    },
    {
      inputProps: {
        ...cloneDeep(defaultInputProps.inputProps),
        type,
        label,
        name,
        value,
        size: 'small',
        sx: {
          marginTop: '1px'
        }
      }
    },
    otherProps
  )

  return { ...props } as BuildInputProps
}

export const defaultInputProps: BuildInputProps = {
  renderProps: {
    field: {
      onChange: () => { },
      value: '',
      onBlur: () => { },
      ref: () => { },
      name: ''
    },
    fieldState: {
      error: undefined as any,
      invalid: false,
      isTouched: false,
      isDirty: false,
      isValidating: false
    },
    formState: {
      isLoading: false,
      isDirty: false,
      dirtyFields: {},
      isSubmitted: false,
      isSubmitSuccessful: false,
      submitCount: 0,
      touchedFields: {},
      isSubmitting: false,
      isValidating: false,
      isValid: true,
      errors: {},
      disabled: false,
      validatingFields: {},
      isReady: true
    }
  },
  inputProps: {
    type: 'text' as const,
    name: '',
    label: ''
  }
}
