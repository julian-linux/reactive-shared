// Libraries
import React, { useCallback, useMemo } from 'react'

// Material Components
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'

const SnackBarComponent = ( { snackBarMessage, setSnackBarMessage }: any) => {

  const handleClose = useCallback(
    () => {
      setSnackBarMessage(undefined)
    },
    [setSnackBarMessage]
  )

  const renderAction = useMemo(() => (
    <Button
      color='primary'
      size='small'
      onClick={handleClose}
    >
      OK
    </Button>
  ), [handleClose])

  const renderMessage = useMemo(() => {
    if (snackBarMessage === undefined) return undefined

    const alertMessage = typeof snackBarMessage === 'object' ? snackBarMessage.message : snackBarMessage
    const alertSeverity = typeof snackBarMessage === 'object' ? snackBarMessage.severity : 'success'

    return (
      <Alert
        elevation={6}
        variant='filled'
        severity={alertSeverity}
        onClose={handleClose}
      >
        {alertMessage}

      </Alert>
    )
  }, [snackBarMessage, handleClose])

  return (
    <Snackbar
      action={renderAction}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
      autoHideDuration={3000}
      onClose={handleClose}
      open={Boolean(snackBarMessage)}
    >
      {renderMessage}
    </Snackbar>
  )
}

export const SnackBar = React.memo(SnackBarComponent)
