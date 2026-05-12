// Libraries
import React from 'react'
import map from 'lodash/map'

// Material Components
import Accordion, { AccordionProps } from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

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
          {...props}
        >
          <AccordionSummary
            slotProps={{ transition: { unmountOnExit: true } }}
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
