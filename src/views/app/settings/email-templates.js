import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Row } from 'reactstrap';

import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';

import { moderateString } from '../../../utils';
import * as api from '../../../api';

const EmailTemplateList = ({ history, match }) => {
  const [data, setData] = useState([]);
  const [refreshTable, setRefreshTable] = useState(0);

  const cols = [
    {
      Header: 'Subject',
      accessor: 'subject',
      cellClass: 'list-item-heading w-30',
      Cell: (props) => <>{props.value}</>,
    },
    {
      Header: 'Body',
      accessor: 'body',
      cellClass: 'text-muted  w-40',
      Cell: (props) => <>{shortenHTMLBody(props.value)}</>,
    },
    {
      Header: 'Use Case',
      accessor: 'use_case',
      cellClass: 'text-muted  w-25',
      Cell: (props) => <>{props.value}</>,
    },
    {
      Header: 'Actions',
      accessor: 'id',
      cellClass: 'text-muted  w-5',
      Cell: (props) => (
        <>
          <div className="tbl-actions">
            <i
              className="iconsminds-file-edit info"
              title="Edit"
              style={{ fontSize: 18 }}
              onClick={() => handleOnEdit(props.value)}
            />
          </div>
        </>
      ),
    },
  ];

  const loadData = ({ limit, page }) => {
    return api.r_loadEmailTemplateRequest({ page, limit })
      .then(res => {
        const { data, pager, status } = res;
        if (status) {
          return {
            list: data.map(row => ({
              ...row,
            })),
            pager,
          };
        } else {
          NotificationManager.error("Error while loading data!", "Email Templates")
        }
      });
  }

  const reloadTableContent = () => {
    setRefreshTable(refreshTable + 1);
  }

  const shortenHTMLBody = (html) => {
    const strippedHTML = html.replace(/<[^>]*>?/gm, '');
    return moderateString(strippedHTML, 50);
  }
  // const toAddPage = () => {
  //   history.push('/app/lang/add');
  // };
  const handleOnEdit = (id) => {
    history.push(`/app/settings/email-template/${id}`);
  };

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.email-templates" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>

      <Row>
        <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.email-templates" />
          </h3>
        </Colxx>

        <Colxx xxs="12">
          <ReactTableWithPaginationCard 
            cols={cols} 
            loadData={loadData}
            refresh={refreshTable}
            />
        </Colxx>
      </Row>
    </>
  );
};

const mapStateToProps = ({ }) => {
  return {};
};
export default connect(mapStateToProps, {})(EmailTemplateList);
