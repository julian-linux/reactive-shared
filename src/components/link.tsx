import React from 'react'

import MaterialLink from '@mui/material/Link'

import { Link as RouterLink } from 'react-router-dom'

import type { LinkProps as RouterLinkProps } from 'react-router-dom'

const LinkContainer: React.FC<RouterLinkProps> = (props) => {
  return <MaterialLink component={RouterLink} {...props} />
}

export const Link = React.memo(LinkContainer)
