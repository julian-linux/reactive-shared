import React from 'react'

import { NumericFormat } from 'react-number-format'

import TextField from './textField'

import type { BuildInputProps } from './sharedTypes'
import type { NumericFormatProps } from 'react-number-format'

interface CustomProps {
  onChange: (event: { target: { name: string, value: string } }) => void
  name: string
}

const NumberFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>(({ onChange, ...props }, ref) => {
  return (
    <NumericFormat
      {...props}
      getInputRef={ref}
      onValueChange={({ value }) => {
        onChange({
          target: {
            name: props.name,
            value
          }
        })
      }}
      thousandSeparator='.'
      decimalSeparator=','
      prefix="$"
      decimalScale={2}
    />
  )
})

NumberFormatCustom.displayName = 'NumberFormatCustom'

const SharedNumberFormatComponent: React.FC<BuildInputProps> = ({ renderProps, inputProps }) => {
  return (
    <TextField
      renderProps={renderProps}
      inputProps={{
        ...inputProps,
        inputComponent: NumberFormatCustom as any
      }}

    />
  )
}

export const SharedNumberFormat = React.memo(SharedNumberFormatComponent)

export default React.memo(SharedNumberFormatComponent)
