import React, { useMemo } from 'react'

import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import type { TableProps } from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import map from 'lodash/map'

export interface AppTableProps extends TableProps {
  headItems: string[]
  bodyItems: any[][]
  size?: 'medium' | 'small'
  className?: string
}

const AppTableComponent: React.FC<AppTableProps> = ({
  headItems,
  bodyItems,
  size = 'small',
  className,
  ...props
}) => {
  const renderTableHead = useMemo(() => {
    const rows = map(headItems, (name, idx) => {
      const key = `tableCell-${name}-${idx}`
      return (
        <TableCell
          key={key}
          align={idx > 0 ? 'right' : 'left'}
        >
          {name}
        </TableCell>
      )
    })

    return (
      <TableHead>
        <TableRow>
          {rows}
        </TableRow>
      </TableHead>
    )
  }, [headItems])

  const renderTableBody = useMemo(() => (
    <TableBody>
      {bodyItems.map((row, keyRow) => {
        return (
          <TableRow key={`tableBody-row-${keyRow}`}>
            {row.map((item, keyItem) => (
              <TableCell
                key={`tableBody-row-${keyRow}-item-${keyItem}`}
                component={keyItem === 0 ? 'th' : undefined}
                scope={keyItem === 0 ? 'row' : undefined}
                align={keyItem > 0 ? 'right' : 'left'}
                sx={{ whiteSpace: 'pre' }}
              >
                {item}
              </TableCell>
            )
            )}
          </TableRow>
        )
      })}
    </TableBody>
  ), [bodyItems])

  return (
    <TableContainer className={className} component={Paper}>
      <Table
        {...props}
        aria-label='simple table'
        size={size}
      >
        {renderTableHead}

        {renderTableBody}
      </Table>
    </TableContainer>
  )
}

export const AppTable = React.memo(AppTableComponent)
