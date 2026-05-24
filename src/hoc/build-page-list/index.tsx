// Libraries
import React, {
  // Dispatch,
  NamedExoticComponent,
  ReactElement,
  // SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'

import { Link } from 'react-router-dom'

import map from 'lodash/map'
import debounce from 'lodash/debounce'
import merge from 'lodash/merge'

// Material Components
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import Textfield from '@mui/material/TextField'

// Icons
import AddIcon from '@mui/icons-material/Add'

// Shared
import { onlyText } from '../../utils'
import { Loading, AppTabs } from '../../components'
import { useAppContext } from '../hooks'

// Components
import DefaultDialog, { SelectedItemProps, DialogOptionsProps } from './defaultDialog'
import IScroll from './infiniteScroll'
import { SxProps } from '@mui/system'

// Interfaces
/**
 * Object of options for show in dialog when a item is selected.
 *
 * each option must be an object with the following key/value
 * ```
 * {
 *   [name]: {
 *     icon: [MaterialIcon](<AddIcon />),
 *     text: [Text for list item](<Intl langKey="INCOME.LABEL.EDIT" />),
 *     to: [Route for click](routes.income.edit),
 *   }
 *    * }```
 * if there is **to** key, to this route will be added a *selectedItem.id* value.
 *
 * [name] can be used for custom actions:
 * ```
 * const dialogOptions = {
 *   delete: {
 *     icon: <DeleteIcon color="secondary" />,
 *     text: <Intl langKey="INCOME.LABEL.DELETE" color="secondary" />,
 *   }
 * };
 *
 * const Component = () => {
 *   //---...
 *   dialogOptions.delete.onConfirm = async ({ id }) => {
 *     await deleteIncome({ variables: { id } });
 *   };
 *   // ...
 * };
 * ```
 */

/**
 * Used for split content in tabs
 * tabsHeader: label for show in tabhead
 * filterTabs: array of fns for filter content in each tab. Each tab will
 * use the defined component
 */
interface TabsProps<T extends SelectedItemProps = SelectedItemProps> {
  tabsHeader: string[]
  filterTabs: Array<(data: T[]) => SelectedItemProps[]>
}

interface SearchProps {
  key: string
}

type ItemComponentProps<T extends SelectedItemProps = SelectedItemProps> =
  NamedExoticComponent<any>
  | ((props: { item: T, onSelect: () => void, [key: string]: any, onClose: () => void }) => ReactElement)

export interface BuildPageListProps<T extends SelectedItemProps = SelectedItemProps> {
  // useQuery: (options?: UseQueryOptions) => UseQueryResult
  useQuery: any
  /** add params to request */
  useQueryParams?: {
    params: {
      [key: string]: string | number | boolean
    }
  },
  useQueryOptions?: { [key: string]: any }
  /** URL for ADD page */
  addRoute?: string
  /** translation string */
  addText?: string
  /** translation string */
  pageTitle: string
  dialogOptions?: DialogOptionsProps
  dialogProps?: { sx?: SxProps }
  dialogFullScreen?: boolean
  DialogComponent?: (props: { onClose: () => void, selectedItem: SelectedItemProps, title: string, dialogFullScreen: boolean }) => ReactElement
  loading?: boolean
  ItemComponent: ItemComponentProps<T>
  itemComponentProps?: any
  tabs?: TabsProps<T>
  SearchComponent?: any,
  MiddleComponent?: any,
  search?: boolean,
  infiniteScroll?: boolean
  sortFunction?: (data: T[]) => T[]
}

/** Component for Create Lists with commons functionalities */
const BuildPageListComponent = <T extends SelectedItemProps = SelectedItemProps>({
  useQuery,
  useQueryParams,
  useQueryOptions = {},
  addRoute,
  pageTitle,
  addText,
  dialogOptions,
  dialogProps = {},
  dialogFullScreen = false,
  DialogComponent,
  loading,
  ItemComponent,
  itemComponentProps,
  tabs,
  MiddleComponent,
  SearchComponent,
  search = false,
  infiniteScroll = false,
  sortFunction
}: BuildPageListProps<T>): ReactElement => {
  const { setPageTitle, setSnackBarMessage } = useAppContext()

  const [searchParams, setSearchParams] = useState<SearchProps>()

  const [selectedItem, setSelectedItem] = useState<SelectedItemProps | undefined>(undefined)

  const [page, setPage] = useState<number>(1)

  const queryParams = useMemo(() => {
    const params = merge({}, useQueryParams?.params, searchParams)

    if (infiniteScroll) {
      params.page = page
    }

    return { params }
  }, [useQueryParams, searchParams, page, infiniteScroll])

  const { loading: isLoading, data: queryData, error } = useQuery(queryParams, useQueryOptions)

  const handleSelectItem = useCallback((selectedItem: any) => () => {
    if ((dialogOptions != null) || (DialogComponent != null)) {
      setSelectedItem(selectedItem)
    }
  }, [dialogOptions, DialogComponent])

  const handleOnClose = useCallback(() => setSelectedItem(undefined), [])

  const debouncedSearch = useMemo(() => debounce(setSearchParams, 500), [])

  const renderButton = useMemo(() => {
    if (addRoute === undefined) return null

    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, p: 1, pt: 2, pb: 2 }}>
        <Button
          color='primary'
          component={Link}
          to={addRoute}
          variant='contained'
        >
          <AddIcon />
          {onlyText(addText ?? 'GENERAL.ADD')}
        </Button>
      </Box>
    )
  }, [addRoute, addText])

  const renderDialog = useMemo(() => {
    if ((selectedItem == null) || (dialogOptions == null)) return null

    if (DialogComponent != null) {
      return (
        <DialogComponent
          dialogFullScreen={dialogFullScreen}
          onClose={handleOnClose}
          selectedItem={selectedItem}
          title={selectedItem.name ?? onlyText('FORM.LABEL.OPTIONS')}
        />
      )
    }

    if (dialogOptions !== undefined) {
      return (
        <DefaultDialog
          dialogProps={dialogProps}
          dialogFullScreen={dialogFullScreen}
          onClose={handleOnClose}
          options={dialogOptions}
          selectedItem={selectedItem}
          title={selectedItem.name ?? onlyText('FORM.LABEL.OPTIONS')}
        />
      )
    }
  }, [
    selectedItem,
    dialogOptions,
    dialogFullScreen,
    handleOnClose,
    DialogComponent
  ])

  const renderList = useMemo(() => {
    if (queryData === undefined) return []

    const data = sortFunction?.(queryData.data as T[]) ?? queryData.data

    if (tabs != null) {
      const tabsBody = tabs.filterTabs.map((fn, idxTab) => {
        const filteredData = fn(data)
        return (
          <List key={`list-tab-${idxTab}`}>
            {map(filteredData, (item, idx) => (
              <ItemComponent
                {...itemComponentProps}
                key={idx}
                item={item}
                onSelect={handleSelectItem}
              />
            ))}
          </List>
        )
      })

      return (
        <AppTabs
          tabsBody={tabsBody}
          tabsHeader={tabs.tabsHeader}
        />
      )
    }

    return map(data, (item, idx) => (
      <ItemComponent
        {...itemComponentProps}
        key={idx}
        item={item}
        onSelect={handleSelectItem}
      />
    ))
  },
    [
      queryData,
      ItemComponent,
      itemComponentProps,
      handleSelectItem,
      tabs,
      page,
      sortFunction
    ]
  )

  const renderSearch = useMemo(() => {
    if (SearchComponent !== undefined) return <SearchComponent onSearch={setSearchParams} />

    if (search) {
      return (
        <Textfield
          fullWidth
          placeholder={onlyText('GENERAL.SEARCH')}
          onChange={(input) => debouncedSearch({ key: input.target.value })}
        />
      )
    }
  }, [SearchComponent, search])

  useEffect(() => {
    setPageTitle(onlyText(pageTitle))
  }, [setPageTitle, pageTitle])

  useEffect(() => {
    if (error instanceof Error) {
      setSnackBarMessage({ message: onlyText('GENERAL.ERROR'), severity: 'error' })
    }
  }, [error, setSnackBarMessage])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <Paper>
      {renderDialog}
      {renderButton}
      <Box>
        {renderSearch}
        {MiddleComponent && <MiddleComponent />}
        {!!tabs && renderList}
        {infiniteScroll && !tabs && (
          <IScroll page={page} onNext={() => setPage((prev) => prev + 1)} items={renderList} />
        )}
        {!infiniteScroll && !tabs && (
          <List>
            {renderList}
          </List>
        )}
      </Box>
      {(loading === true || isLoading === true) && <Loading backdrop />}
    </Paper>
  )
}

export const BuildPageList = React.memo(BuildPageListComponent) as typeof BuildPageListComponent
