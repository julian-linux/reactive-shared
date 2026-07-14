import React from 'react'
import type { ReactElement } from 'react'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

import Checkbox from './checkbox'
import DatePicker from './datePicker'
import DateTimePicker from './datetimePicker'
import File from './file'
import NumberFormat from './numberFormat'
import Radio from './radio'
import Select from './select'
import SelectMultiple from './selectMultiple'
import Switch from './switch'
import TextField from './textField'

import type { BuildInputProps } from './sharedTypes'

const BuildInputComponent: React.FC<BuildInputProps> = (props: BuildInputProps): ReactElement => {
  // React DevTools will automatically show this component's props and state
  // You can also add a displayName for easier identification
  BuildInputComponent.displayName = `BuildInput-${props.inputProps.type}`

  switch (props.inputProps.type) {
    case 'title':
      return (
        <Box sx={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>
          {typeof props.inputProps.label === 'function' ? props.inputProps.label() : props.inputProps.label}
        </Box>
      )
    case 'file':
      return (<File {...props} />)
    case 'checkbox':
      return (<Checkbox {...props} />)
    case 'numberFormat':
      return (<NumberFormat {...props} />)
    case 'divider':
      return (<Box sx={{ mt: 2, mb: 2 }}> <Divider /> </Box>)
    case 'datePicker':
      return (<DatePicker {...props} />)
    case 'dateTimePicker':
      return (<DateTimePicker {...props} />)
    case 'radio':
      return (<Radio {...props} />)
    case 'select':
      return (<Select {...props} />)
    case 'selectMultiple':
      return (<SelectMultiple {...props} />)
    case 'switch':
      return (<Switch {...props} />)
    case 'component':
      if (props.inputProps.component !== undefined) {
        const Component = props.inputProps.component
        return (<Component {...props} />)
      }
      return (<span>______NO_COMPONENT______</span>)
    default:
      return (<TextField {...props} />)
  }
}

export const BuildInput = BuildInputComponent

export default BuildInput
