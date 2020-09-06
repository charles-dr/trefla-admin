import React, { useEffect, useState } from 'react';
import { Row, Card, CardBody } from 'reactstrap';
import { ReactSortable } from 'react-sortablejs';
import { connect } from 'react-redux';

import IntlMessages from '../../helpers/IntlMessages';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';

import IconCardsCarousel from '../../containers/dashboards/IconCardsCarousel';
import RecentOrders from '../../containers/dashboards/RecentOrders';
import SalesChartCard from '../../containers/dashboards/SalesChartCard';

import { statIn7Days } from '../../utils';


const DashboardPage = ({ match, history, comments, posts, reports, users }) => {
  const [iconCarouselData, setIconCarouselData] = useState([
    { title: 'pages.users', icon: 'simple-icon-people', value: 0 },
    { title: 'pages.posts', icon: 'simple-icon-paper-plane', value: 0 },
    { title: 'pages.comments', icon: 'simple-icon-bubbles', value: 0 },
    { title: 'pages.reports', icon: 'simple-icon-shield', value: 0 },
  ]);
  const [stat, setStat] = useState({
    posts: [0, 0, 0, 0, 0, 0, 0]
  });


  useEffect(() => {
    setIconCarouselData([
      { title: 'pages.users', icon: 'simple-icon-people', value: users.length, onClick: () => history.push('/app/user') },
      { title: 'pages.posts', icon: 'simple-icon-paper-plane', value: posts.length, onClick: () => history.push('/app/post') },
      { title: 'pages.comments', icon: 'simple-icon-bubbles', value: comments.length, onClick: () => history.push('/app/comment') },
      { title: 'pages.reports', icon: 'simple-icon-shield', value: reports.length, onClick: () => history.push('/app/report') },
    ]);
      // const data = statIn7Days(posts, 'post_time');
      // console.log('[post data]', data);
    return () => { }
  }, [posts, users, comments, reports]);

  useEffect(() => {
    const data = statIn7Days(posts, 'post_time');
    setStat({...stat, posts: data});
    return () => {}
  }, [match, posts]);

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
        <Colxx lg="12" xl="6">
          <IconCardsCarousel data={iconCarouselData} />

          <Row>
            <Colxx md="12" className="mb-4">
              <SalesChartCard stat={stat} />
            </Colxx>
          </Row>
        </Colxx>

        <Colxx lg="12" xl="6" className="mb-4">
          <RecentOrders />
        </Colxx>

      </Row>
    </>
  );
};


const mapStateToProps = ({ posts: postApp, users: userApp, comments: commentApp, reports: reportApp }) => {
  const { list: posts } = postApp;
  const { list: users } = userApp;
  const { list: comments } = commentApp;
  const { list: reports } = reportApp;

  return {
    users, posts, comments, reports
  };
};

export default connect(mapStateToProps, {

})(DashboardPage);
