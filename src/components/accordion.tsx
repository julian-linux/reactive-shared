import React from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import type { AccordionProps } from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'

import map from 'lodash/map'

interface ItemsProps extends AccordionProps {
  /**
     * Array of {name, children}
     *
     * @param {string} name: title of accordion tab
     * @param {ReactElement} children: inherited component. will be inside of accordion tab
     */
  name: string
}

export type SharedAccordionProps = { items?: ItemsProps[] } | null

const SharedAccordionComponent: React.FC<SharedAccordionProps> = props => {
  return (
    <Paper>
      {map(props?.items, ({ name, children, ...props }, itemIdx) => (
        <Accordion
          key={`common-accordion-item-${itemIdx}-${name}-${props.id}`}
          slotProps={{ transition: { unmountOnExit: true } }}
          {...props}
        >
          <AccordionSummary
            aria-controls={`panel${itemIdx}a-content`}
            expandIcon={<ExpandMoreIcon />}
            id={`panel${itemIdx}a-header`}
          >
            <Box sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
              {name}
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <Box>
              {children}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  )
}

export const SharedAccordion = React.memo(SharedAccordionComponent)
