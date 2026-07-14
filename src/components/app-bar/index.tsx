// Libraries
import React, { useState, useCallback } from 'react'

// Material Components
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
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
interface ButtonAppBarProps {
  mainAppHook: any
  logo: any
}

const ButtonAppBar: React.FC<ButtonAppBarProps> = ({ mainAppHook, logo }) => {
  const [isMenuOpen, setOpenMenu] = useState(false)
  const { pageTitle } = useAppContext()
  const { menuItems } = mainAppHook()

  const handleClick = () => setOpenMenu(open => !open)
  const handleReload = useCallback(() => window.location.reload(), [])

  return (
    <>
      <AppBar sx={sxAppBar} position='fixed'>
        <Toolbar>
          <Button sx={sxLinkHome} type='button' onClick={handleReload}>
            <img src={logo} alt='logo' />
          </Button>

          <Typography sx={{ flexGrow: 1 }} variant='h6'>
            {pageTitle}
          </Typography>

          <IconButton className='menu-icon-button' aria-label='menu' edge='end' onClick={handleClick}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu menuItems={menuItems} onCloseMenu={() => setOpenMenu(false)} isMenuOpen={isMenuOpen} />
    </>
  )
}

export default React.memo(ButtonAppBar)
