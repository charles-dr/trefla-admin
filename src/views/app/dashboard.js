import React, { useEffect, useState } from 'react';
import { Row, Card, CardBody } from 'reactstrap';
import { ReactSortable } from 'react-sortablejs';
import { connect } from 'react-redux';

import IntlMessages from '../../helpers/IntlMessages';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';

const DashboardPage = ({ match, posts, users }) => {
  const [listColumns, setListColumns] = useState([
    {
      icon: 'simple-icon-people',
      title: 'Users',
      value: 0,
      id: 1,
    },
    {
      icon: 'simple-icon-paper-plane',
      title: 'Posts',
      value: 0,
      id: 2,
    },
    // {
    //   icon: 'iconsminds-arrow-refresh',
    //   title: 'Refund Requests',
    //   value: 74,
    //   id: 3,
    // },
    // {
    //   icon: 'iconsminds-mail-read',
    //   title: 'New Comments',
    //   value: 25,
    //   id: 4,
    // },
  ]);

  useEffect(() => {

    setListColumns([
      {
        icon: 'simple-icon-people',
        title: 'Users',
        value: users.length || 0,
        id: 1,
      },
      {
        icon: 'simple-icon-paper-plane',
        title: 'Posts',
        value: posts.length || 0,
        id: 2,
      },
    ]);

    return () => {}
  }, [posts, users]);

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.dashboard" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="mb-4">
          <p>
            <IntlMessages id="menu.dashboard" />
          </p>
        </Colxx>
      </Row>

      <Row>
        <Colxx xxs="12" className="">
        <ReactSortable
            className="row icon-cards-row mb-2"
            list={listColumns}
            setList={(list) => setListColumns(list)}
          >
            {listColumns.map((item) => (
              <Colxx
                key={`column_${item.id}`}
                xxs="6"
                sm="4"
                md="3"
                className="mb-4"
              >
                <Card>
                  <CardBody className="text-center">
                    <i className={item.icon} />
                    <p className="card-text font-weight-semibold mb-0">
                      {item.title}
                    </p>
                    <p className="lead text-center">{item.value}</p>
                  </CardBody>
                </Card>
              </Colxx>
            ))}
          </ReactSortable>
        </Colxx>
      </Row>
    </>
  );
};


const mapStateToProps = ({ posts: postApp, users: userApp }) => {
  const { list: posts } = postApp;
  const { list: users } = userApp;

  return {
      users, posts
  };
};

export default connect(mapStateToProps, {

})(DashboardPage);
