import React, { useEffect, useState } from 'react';
import { Row } from 'reactstrap';
// import { ReactSortable } from 'react-sortablejs';
import { connect } from 'react-redux';

import IntlMessages from '../../helpers/IntlMessages';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';

import IconCardsCarousel from '../../containers/dashboards/IconCardsCarousel';
import RecentPosts from '../../containers/dashboards/RecentPosts';
import SalesChartCard from '../../containers/dashboards/SalesChartCard';

import * as api from '../../api';
import {
  formatTime,
  moderateString,
  statIn7Days,
  transformTime,
} from '../../utils';

const DashboardPage = ({ match, history }) => {
  const [iconCarouselData, setIconCarouselData] = useState([
    { title: 'pages.users', icon: 'simple-icon-people', value: 0 },
    { title: 'pages.posts', icon: 'simple-icon-paper-plane', value: 0 },
    { title: 'pages.comments', icon: 'simple-icon-bubbles', value: 0 },
    { title: 'pages.reports', icon: 'simple-icon-shield', value: 0 },
  ]);
  const [stat, setStat] = useState({
    posts: [0, 0, 0, 0, 0, 0, 0],
  });
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {

    api.r_getStatsRequest()
      .then(result => {
        if (result.status) {
          const { recentPosts } = result;
          setRecentPosts(recentPosts.map((post, i) => {
            return {
              id: i + 1,
              title: moderateString(post.feed, 60),
              img: getUserAvatarUrl(post.user),
              createDate: formatTime(
                new Date(post.create_time * 1000),
                'd.m.Y'
              ),
              description: post.user ? post.user.user_name : 'unknown',
              post_link: `/app/post/edit/${post.post_id}`,
              user_profile_link: `/app/user/edit/${post.post_user_id}`,
            };
          }))

          const { total } = result;
          setIconCarouselData([
            {
              title: 'pages.users',
              icon: 'simple-icon-people',
              value: total.users,
              onClick: () => history.push('/app/user'),
            },
            {
              title: 'pages.posts',
              icon: 'simple-icon-paper-plane',
              value: total.posts,
              onClick: () => history.push('/app/post'),
            },
            {
              title: 'pages.comments',
              icon: 'simple-icon-bubbles',
              value: total.comments,
              onClick: () => history.push('/app/comment'),
            },
            {
              title: 'pages.reports',
              icon: 'simple-icon-shield',
              value: total.reports,
              onClick: () => history.push('/app/report'),
            },
          ]);
      
          const { stats4Post } = result;
          setStat({ ...stat, posts: stats4Post });
        }
      })
    return () => {};
  }, []);

  const getUserAvatarUrl = ({ photo, sex, avatarIndex }) => {
    if (photo) {
      return photo;
    }
    if (avatarIndex !== undefined && avatarIndex !== '') {
      return `/assets/avatar/${
        sex === '1' ? 'girl' : 'boy'
      }/${avatarIndex}.png`;
    }
    return `/assets/avatar/avatar_${sex === '1' ? 'girl2' : 'boy1'}.png`;
  };

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
          <RecentPosts posts={recentPosts} />
        </Colxx>
      </Row>
    </>
  );
};

const mapStateToProps = ({}) => {

  return {};
};

export default connect(mapStateToProps, {})(DashboardPage);
