/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-key */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/display-name */
import React from 'react';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { useTable, usePagination, useSortBy } from 'react-table';
import classnames from 'classnames';

import IntlMessages from '../../helpers/IntlMessages';
import DatatablePagination from '../../components/DatatablePagination';

import products from '../../data/products';

function Table({ columns, data, divided = false, defaultPageSize = 10, pageCount: controlledPageCount = 10, fetchData }) {
  const {
    getTableProps,
    getTableBodyProps,
    prepareRow,
    headerGroups,

    // toggleSortBy,

    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data, 
      pageCount: controlledPageCount,
      manualPagination: true,
      autoResetPage: false,
      initialState: { pageIndex: 0, pageSize: defaultPageSize },
    },
    useSortBy,
    usePagination
  );

  React.useEffect(() => {
    fetchData({ pageIndex, pageSize })
  }, [fetchData, pageIndex, pageSize])

  return (
    <>
      <table
        {...getTableProps()}
        className={`r-table table ${classnames({ 'table-divided': divided })}`}
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, columnIndex) => (
                <th
                  key={`th_${columnIndex}`}
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className={
                    column.isSorted
                      ? column.isSortedDesc
                        ? 'sorted-desc'
                        : 'sorted-asc'
                      : ''
                  }
                >
                  {column.render('Header')}
                  <span />
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={`td_${cellIndex}`}
                    {...cell.getCellProps({
                      className: cell.column.cellClass,
                    })}
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <DatatablePagination
        page={pageIndex}
        pages={pageCount}
        canPrevious={canPreviousPage}
        canNext={canNextPage}
        pageSizeOptions={[10, 20, 30, 40, 50]}
        showPageSizeOptions
        showPageJump
        defaultPageSize={pageSize}
        onPageChange={(p) => gotoPage(p)}
        onPageSizeChange={(s) => setPageSize(s)}
        paginationMaxSize={5}
      />
    </>
  );
}

export const ReactTableWithPaginationCard = ({ cols, loadData, refresh }, ref) => {

  const [data, setData] = React.useState([]);
  const [lastId, setLastId] = React.useState(null);
  const [pageCount, setPageCount] = React.useState(0);
  const [pager, setPager] = React.useState({ limit: 10, page: 0 });

  React.useEffect(() => {
    if (refresh > 0) fetchData({ pageSize: pager.limit, pageIndex: pager.page });
  }, [refresh]);

  const fetchData = React.useCallback(async ({ pageSize, pageIndex: pIdx }) => {
    return loadData({ page: pIdx, limit: pageSize })
      .then(({ list, pager }) => {
        setPageCount(Math.ceil(pager.total / pager.limit));
        setData(list);
        setPager({ limit: pageSize, page: pIdx });
      })
      .catch(e => {
        console.log(e);
      })
  }, []);

  return (
    <Card className="mb-4">
      <CardBody>
        <CardTitle>
        </CardTitle>
        <Table 
          columns={cols} 
          data={data} 
          fetchData={fetchData}
          pageCount={pageCount}
          />
      </CardBody>
    </Card>
  );
};

export const ReactTableDivided = () => {
  const cols = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'title',
        cellClass: 'list-item-heading w-40',
        Cell: (props) => <>{props.value}</>,
      },
      {
        Header: 'Sales',
        accessor: 'sales',
        cellClass: 'text-muted  w-10',
        Cell: (props) => <>{props.value}</>,
      },
      {
        Header: 'Stock',
        accessor: 'stock',
        cellClass: 'text-muted  w-10',
        Cell: (props) => <>{props.value}</>,
      },
      {
        Header: 'Category',
        accessor: 'category',
        cellClass: 'text-muted  w-40',
        Cell: (props) => <>{props.value}</>,
      },
    ],
    []
  );
  return (
    <div className="mb-4">
      <CardTitle>
        <IntlMessages id="table.divided" />
      </CardTitle>
      <Table columns={cols} data={products} divided />
    </div>
  );
};
