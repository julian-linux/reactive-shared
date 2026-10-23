// Libraries
import React, { useState, useCallback, type ReactElement } from 'react'

// Material Components
import MenuIcon from '@mui/icons-material/Menu'
import DefaultAppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

// Icons

// Shared
import Menu from './menu'
import { sxAppBar, sxLinkHome } from './sx'
import { useAppContext } from '../../hoc/hooks'

// Components

// Styles

// Interfaces
interface AppBarProps {
  mainAppHook: any
  logo: any
  customItem: ReactElement | undefined
}

const AppBar: React.FC<AppBarProps> = ({ mainAppHook, logo, customItem }) => {
  const [isMenuOpen, setOpenMenu] = useState(false)
  const { pageTitle } = useAppContext()
  const { menuItems } = mainAppHook()

  const handleClick = () => setOpenMenu(open => !open)
  const handleReload = useCallback(() => window.location.reload(), [])

  return (
    <>
      <DefaultAppBar sx={sxAppBar} position='fixed'>
        <Toolbar>
          <Button sx={sxLinkHome} type='button' onClick={handleReload}>
            <img src={logo} alt='logo' />
          </Button>

          <Typography sx={{ flexGrow: 1 }} variant='h6'>
            {pageTitle}
          </Typography>

          {customItem}

          <IconButton className='menu-icon-button' aria-label='menu' edge='end' onClick={handleClick}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </DefaultAppBar>

      <Menu menuItems={menuItems} onCloseMenu={() => setOpenMenu(false)} isMenuOpen={isMenuOpen} />
    </>
  )
}

export default React.memo(AppBar)
