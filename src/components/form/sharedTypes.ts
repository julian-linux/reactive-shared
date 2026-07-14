import type { InputBaseProps } from '@mui/material/InputBase'
import type { OverridableComponent } from '@mui/material/OverridableComponent'
import type { SvgIconTypeMap } from '@mui/material/SvgIcon'
import type { SxProps } from '@mui/system'

import { ACCEPTED_FILE_TYPES } from './file/constants'

import type { OnlyTextProps } from '../../utils'
import type {
  ControllerRenderProps, UseFormStateReturn, ControllerFieldState
} from 'react-hook-form'

type HTMLTypeProps = 'file' | 'checkbox' | 'radio' | 'select' | 'selectMultiple' | 'text' | 'textarea' | 'password' | 'email' | 'number' | 'switch'
type SharedTypeProps = 'numberFormat' | 'divider' | 'datePicker' | 'dateTimePicker' | 'component' | 'title'
type TypeProps = HTMLTypeProps | SharedTypeProps

export type ItemOption = { label: string | (() => string), value: string | number, disabled?: boolean }
export type GroupedItems = { [key: string]: ItemOption[] }

export interface InputProps {
  type: TypeProps
  name: string
  label: string | (() => string)
  yupValidation?: any
  icon?: OverridableComponent<SvgIconTypeMap<object, 'svg'>> & { muiName: string; }
  defaultValue?: any
  sx?: SxProps
  className?: string
  error?: boolean
  errors?: { [key: string]: string }
  parentBox?: { [key: string]: any }
  helpText?: string | string | ((onlyText: OnlyTextProps) => string)
  disabled?: boolean
  slotProps?: InputBaseProps['slotProps']
  multiline?: boolean
  multiple?: boolean
  required?: boolean
  rows?: number
  items?: ItemOption[] | GroupedItems
  tooltip?: string
  component?: any
  onChange?: any
  value?: any
  incomingValue?: any
  showInput?: boolean
  native?: boolean
  fullWidth?: boolean
  [k: string]: unknown,
  accept?: string,
  maxSize?: number,
  fileType?: keyof typeof ACCEPTED_FILE_TYPES,
}

export interface RenderProps {
  field: ControllerRenderProps<{ [p: string]: any }, string>
  fieldState: ControllerFieldState & { error?: any }
  formState: UseFormStateReturn<{ [p: string]: any }>
}

export interface BuildInputProps {
  renderProps: RenderProps
  inputProps: InputProps
  useFormProps?: any
}
