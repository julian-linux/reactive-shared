// Libraries
import React, { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'

// Material Components
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'

// Intl
import { Intl, onlyText } from '../../utils'

// Styles
import { sxSubHeader } from './sx'

// interfaces
export interface MenuItemsProps {
  name: string
  // icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string}
  // icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string; }
  icon: any
  path: string
  divider?: boolean
  disabled?: boolean
}

interface MenuProps {
  isMenuOpen: boolean
  onCloseMenu: any
  menuItems: MenuItemsProps[]
}

// const container = window !== undefined ? () => window.document.body : undefined

const Menu: React.FC<MenuProps> = ({ isMenuOpen, onCloseMenu, menuItems }) => {
  const renderMenuItems = useMemo(() => {
    const subheader = (
      <ListSubheader sx={sxSubHeader}>
        <Intl langKey='MENU.WELCOME' variant='h6' style={{ marginTop: '16px' }} color='secondary' />
      </ListSubheader>
    )

    const items = menuItems.map(({ name, icon: Icon, path, divider = false, disabled = false }) => {
      return (
        <Fragment key={`menu-list-item-to-${path}`}>
          <ListItemButton component={Link} onClick={onCloseMenu} to={path} disabled={disabled}>
            <ListItemIcon>
              <Icon />
            </ListItemIcon>
            <ListItemText primary={onlyText(name)} />
          </ListItemButton>

          {divider && <Divider />}
        </Fragment>
      )
    })

    return (
      <List subheader={subheader} sx={{ mt: 6 }}>
        {items}
      </List>
    )
  }, [menuItems, onCloseMenu])

  return (
    <Drawer
      // sx={{ mt: 6, bgcolor: 'primary.main', '& .MuiListItemText-primary': { color: 'rgba(0, 0, 0, 0.87)' } }}

      anchor='right'
      open={isMenuOpen}
      onClose={onCloseMenu}
      ModalProps={{
        keepMounted: true
      }}
    >
      {renderMenuItems}
    </Drawer>
  )
}

export default React.memo(Menu)
