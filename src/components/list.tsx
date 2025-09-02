// React
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'

// Shared
import { onlyText } from '../utils/intl'
import { useAppContext } from '../hoc/hooks'


interface SharedSimpleListProps {
  items: Array<{
    name: string
    icon: React.ElementType
    to: string
  }>
  title: string
}


export const SharedSimpleList = ({ items, title }: SharedSimpleListProps) => {
  const navigate = useNavigate()
  const { setPageTitle } = useAppContext()

  useEffect(() => {
    setPageTitle(onlyText(title))
  }, [setPageTitle])

  return items.map((item) => (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }} key={item.name}>
      <ListItem disablePadding>
        <ListItemButton onClick={() => navigate(item.to)}>
          <ListItemAvatar>
            <Avatar>
              <item.icon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={onlyText(item.name)} />
        </ListItemButton>
      </ListItem>
      <Divider />
    </List>
  ))
}
