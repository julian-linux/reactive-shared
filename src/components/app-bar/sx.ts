import { SxProps } from '@mui/system'

export const sxSubHeader: SxProps = {
  paddingTop: 2,
  paddingBottom: 2,
  backgroundColor: 'primary.dark'
}

export const sxAppBar: SxProps = {
  zIndex: 'modal',
  bgcolor: 'background.paper',
  paddingTop: 'env(safe-area-inset-top, 0px)',
  '& .MuiToolbar-root': {
    minHeight: '50px'
  },
  // Additional padding for iPhone devices
  '@media screen and (max-device-width: 430px) and (-webkit-min-device-pixel-ratio: 2)': {
    paddingTop: 'max(env(safe-area-inset-top, 0px), 20px)'
  }
}

export const sxLinkHome: SxProps = {
  marginTop: '5px',
  marginRight: 2,
  '& img': {
    width: '26px'
  }
}
