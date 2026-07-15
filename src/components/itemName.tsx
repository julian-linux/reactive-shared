import React from 'react'

import Avatar from '@mui/material/Avatar'

export interface ItemNameProps {
  image?: string | undefined
  name: string
}
const ItemNameContainer: React.FC<ItemNameProps> = ({ image, name = '' }) => {
  return (
    <Avatar src={image} alt={name} variant='square'>
      {name.slice(0, 1).toUpperCase()}
    </Avatar>
  )
}

export const ItemName = React.memo(ItemNameContainer)
