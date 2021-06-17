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

function Table({ columns, data, divided = false, defaultPageSize = 10, pageCount: controlledPageCount = 10, fetchData, defaultSortBy }) {
  const [sortCol, setSortCol] = React.useState(columns.map((col) => col.accessor).indexOf(defaultSortBy));
  const [sortDesc, setSortDesc] = React.useState(true);

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
    fetchData({ pageIndex, pageSize, sortBy: sortCol, sortDir: sortDesc });
    // eslint-disable-next-line
  }, [fetchData, pageIndex, pageSize])

  const onClickColumn = ({ columnIndex, column }) => {
    let newSortDesc = false;
    if (columnIndex === sortCol) {
      newSortDesc = !sortDesc; 
    } else {
      newSortDesc = false;
      setSortCol(columnIndex);
    }
    setSortDesc(newSortDesc);
    fetchData({ pageIndex, pageSize, sortBy: columnIndex, sortDir: newSortDesc });
  }

  return (
    <>
      <table
        {...getTableProps()}
        className={`r-table table ${classnames({ 'table-divided': divided })}`}
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, columnIndex) => {
                column.isSorted = columnIndex === sortCol ? true : false;
                column.isSortedDesc = sortDesc;
                const canSort = columns[columnIndex].canSort === false ? false : true;

                return <th
                  key={`th_${columnIndex}`}
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  onClick={() => !canSort ? {} : onClickColumn({ columnIndex, column })}
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
              })}
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

export const ReactTableWithPaginationCard = ({ cols, loadData, refresh, defaultSortBy }, ref) => {
  const defaultSortIndex = cols.map((col) => col.accessor).indexOf(defaultSortBy);
  const [data, setData] = React.useState([]);
  // const [lastId, setLastId] = React.useState(null);
  const [pageCount, setPageCount] = React.useState(0);
  const [pager, setPager] = React.useState({ limit: 10, page: 0, sortBy: defaultSortIndex, sortDir: true });

  React.useEffect(() => {
    if (refresh > 0) fetchData({ ...pager, pageSize: pager.limit, pageIndex: pager.page });
    // eslint-disable-next-line
  }, [refresh]);

  const fetchData = React.useCallback(async ({ pageSize, pageIndex: pIdx, sortDir, sortBy }) => {
    return loadData({ page: pIdx, limit: pageSize, sortBy, sortDir })
      .then(({ list, pager }) => {
        setPageCount(Math.ceil(pager.total / pager.limit));
        setData(list);
        setPager({ limit: pageSize, page: pIdx, sortDir, sortBy });
      })
      .catch(e => {
        console.log(e);
      })
    // eslint-disable-next-line
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
          defaultSortBy={defaultSortBy}
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
