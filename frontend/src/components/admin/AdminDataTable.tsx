import type {
  ComponentPropsWithoutRef,
  Key,
  ReactNode,
} from 'react'

export interface AdminDataTableColumn<T> {
  id: string
  header: ReactNode
  render: (row: T) => ReactNode
  headerClassName?: string
  cellClassName?: string
}

interface AdminDataTableProps<T> {
  columns: AdminDataTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => Key
  getRowProps?: (row: T) => Omit<ComponentPropsWithoutRef<'tr'>, 'children'>
  getRowTestId?: (row: T) => string | undefined
  wrapClassName: string
  tableClassName: string
  emptyState?: ReactNode
  emptyCellClassName?: string
}

function AdminDataTable<T>({
  columns,
  rows,
  getRowKey,
  getRowProps,
  getRowTestId,
  wrapClassName,
  tableClassName,
  emptyState,
  emptyCellClassName,
}: AdminDataTableProps<T>) {
  return (
    <div className={wrapClassName}>
      <table className={tableClassName}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th className={column.headerClassName} key={column.id}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => {
              const rowProps = getRowProps?.(row)
              const rowClassName = rowProps?.className

              return (
                <tr
                  {...rowProps}
                  className={rowClassName}
                  data-testid={getRowTestId?.(row)}
                  key={getRowKey(row)}
                >
                  {columns.map((column) => (
                    <td className={column.cellClassName} key={column.id}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              )
            })
          ) : emptyState ? (
            <tr>
              <td className={emptyCellClassName} colSpan={columns.length}>
                {emptyState}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}

export default AdminDataTable
