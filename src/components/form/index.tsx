import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import type { BoxProps } from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Tooltip from '@mui/material/Tooltip'

import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import each from 'lodash/each'
import isEmpty from 'lodash/isEmpty'
import map from 'lodash/map'
import reduce from 'lodash/reduce'

import { object } from 'yup'

import BuildInput from './buildInput'
import { Intl, onlyText } from '../../utils'

import type { InputProps, RenderProps } from './sharedTypes'

export interface BuildFormInputProps {
  name: string
  showInput?: boolean
  tooltip?: string
  parentBox?: BoxProps
}

export interface InputsFormConfigProps { [key: string]: InputProps }

export type RenderBuildInputProps = (renderPros: RenderProps, inputProps: InputProps, useFormProps: any) => any

export interface BuildFormProps {
  loading?: boolean
  noBackButton?: boolean
  onBackAction?: () => void
  backTo?: string | null
  fixedActionsBottom?: boolean
  disabled?: boolean
  confirmButtonLangkey?: string
  inputsFormConfig: InputsFormConfigProps
  responseErrors?: { [key: string]: string }
  onSubmit?: (formData: { [key: string]: any }) => any
  defaultSuccessMessage?: boolean,
  formBoxProps?: { [key: string]: any }
}

const CreateFormContainer: React.FC<BuildFormProps> = ({
  loading,
  noBackButton = false,
  onBackAction,
  backTo = '',
  fixedActionsBottom = false,
  disabled,
  confirmButtonLangkey = '',
  inputsFormConfig,
  responseErrors,
  onSubmit,
  formBoxProps = {}
}) => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const [validationSchema]: [any, any] = useState(() => {
    const fields: { [key: string]: any } = reduce(inputsFormConfig, (prev, { name, yupValidation }) => ({
      ...prev,
      [name]: yupValidation
    }), {})

    return object().shape(fields).required()
  })

  const {
    control,
    handleSubmit,
    setError,
    formState,
    ...useFormProps
  } = useForm<{ [key: string]: any }>({ resolver: yupResolver(validationSchema) })
  const { isDirty } = formState

  const confirmDialog = useCallback(() => backTo ? navigate(backTo) : navigate(-1), [navigate, backTo])
  const closeDialog = useCallback(() => setOpen(false), [])

  const handleBackAction = useCallback(() => {
    if (isDirty) {
      setOpen(true)
    } else {
      if (backTo) {
        navigate(backTo)
      } else if (onBackAction) {
        onBackAction()
      } else {
        navigate(-1)
      }
    }
  }, [isDirty, backTo, onBackAction, navigate])

  const handleOnSubmit = useCallback((evt: React.SyntheticEvent) => {
    evt.preventDefault()
    evt.stopPropagation()
    return handleSubmit(onSubmit!)(evt)
  }, [handleSubmit, onSubmit])

  const buildForm = useMemo(() => {
    return map(inputsFormConfig, ({
      showInput = true,
      tooltip,
      parentBox = {},
      yupValidation, //eslint-disable-line
      ...inputProps
    }: BuildFormInputProps & InputProps, key) => {
      if (!showInput) {
        return null
      }

      if (tooltip !== undefined) {
        return (
          <Box key={key} {...parentBox} sx={{ mt: 1, ...parentBox.sx }}>
            <Tooltip title={onlyText(tooltip)} arrow placement='top'>
              <div>
                <Controller
                  key={key}
                  name={inputProps.name}
                  control={control}
                  render={(renderProps) => <BuildInput renderProps={renderProps} inputProps={inputProps} useFormProps={useFormProps} />}
                />
              </div>
            </Tooltip>
          </Box>
        )
      }

      return (
        <Box key={key} sx={{ mt: 1, ...parentBox.sx }}>
          <Controller
            key={key}
            name={inputProps.name}
            control={control}
            render={(renderProps) => <BuildInput renderProps={renderProps} inputProps={inputProps} useFormProps={useFormProps} />}
          />
        </Box>
      )
    }
    )
  }, [inputsFormConfig, control, useFormProps])

  const RenderDialogBack = useMemo(() => {
    if (!open) return undefined

    return (
      <Dialog
        open
        onClose={closeDialog}
      >
        <DialogTitle>
          <Intl langKey='GENERAL.GO_BACK.TITLE' />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Intl transpileHTML langKey='GENERAL.GO_BACK.SUB_TITLE' />
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={closeDialog}><Intl langKey='GENERAL.CANCEL' /></Button>
          <Button onClick={confirmDialog} variant='contained'><Intl langKey='GENERAL.ACCEPT' color='secondary' /></Button>
        </DialogActions>
      </Dialog>
    )
  }, [closeDialog, confirmDialog, open])

  const backButton = useMemo(() => {
    if (noBackButton) return null

    return (
      <Box sx={{ mr: 3 }}>
        <Button
          disabled={loading}
          variant='contained'
          onClick={handleBackAction}
          disableElevation
        >
          <Intl langKey='GENERAL.BACK' color='secondary' />
        </Button>
      </Box>
    )
  }, [noBackButton, handleBackAction, loading])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !isEmpty(formState?.errors)) {
      console.log('useFormProps', useFormProps.getValues())
      console.log('errors in form', formState.errors)
    }
  }, [formState.errors, useFormProps])

  useEffect(() => {
    if (!isEmpty(responseErrors)) {
      each(responseErrors, (error, name) => {
        setError(name, { type: 'error', message: onlyText(`SERVER.VALIDATION.ERROR.${error}`) })
      })
    }
  }, [responseErrors, setError])

  return (
    <form autoComplete='off' data-testid='form' onSubmit={handleOnSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }} {...formBoxProps}>
        {buildForm}
      </Box>

      {fixedActionsBottom && <Box sx={{ height: 104 }} />}

      <Box
        sx={{
          display: 'flex',
          justifyContent: noBackButton ? 'flex-end' : 'space-between',
          pb: 4,
          pt: 6,
          ...(fixedActionsBottom
            ? {
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              px: 3,
              bgcolor: 'background.paper',
              zIndex: 1000,
              borderTop: '1px solid',
              borderColor: 'divider'
            }
            : {})
        }}
      >
        {backButton}
        <Button

          disableElevation
          disabled={loading || disabled}
          type='submit'
          variant='contained'
        >
          {Boolean(loading) &&
            <CircularProgress
              data-testid='circular-progress'
              size={20}
            />}

          <Intl langKey={confirmButtonLangkey} color='secondary' />
        </Button>
      </Box>
      {RenderDialogBack}
    </form>
  )
}

export const CreateForm = CreateFormContainer
