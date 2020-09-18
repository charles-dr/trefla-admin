import React, { useEffect, useState } from 'react';
import { Row, Card, CardBody } from 'reactstrap';
import { ReactSortable } from 'react-sortablejs';
import { connect } from 'react-redux';

import IntlMessages from '../../helpers/IntlMessages';
import { Colxx, Separator } from '../../components/common/CustomBootstrap';
import Breadcrumb from '../../containers/navs/Breadcrumb';

import IconCardsCarousel from '../../containers/dashboards/IconCardsCarousel';
import RecentPosts from '../../containers/dashboards/RecentPosts';
import SalesChartCard from '../../containers/dashboards/SalesChartCard';

import {
  formatTime,
  moderateString,
  statIn7Days,
  transformTime,
} from '../../utils';

const DashboardPage = ({ match, history, comments, posts, reports, users }) => {
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
    setIconCarouselData([
      {
        title: 'pages.users',
        icon: 'simple-icon-people',
        value: users.length,
        onClick: () => history.push('/app/user'),
      },
      {
        title: 'pages.posts',
        icon: 'simple-icon-paper-plane',
        value: posts.length,
        onClick: () => history.push('/app/post'),
      },
      {
        title: 'pages.comments',
        icon: 'simple-icon-bubbles',
        value: comments.length,
        onClick: () => history.push('/app/comment'),
      },
      {
        title: 'pages.reports',
        icon: 'simple-icon-shield',
        value: reports.length,
        onClick: () => history.push('/app/report'),
      },
    ]);

    return () => {};
  }, [posts, users, comments, reports, history]);

  useEffect(() => {
    const data = statIn7Days(posts, 'post_time');
    setStat({ ...stat, posts: data });

    // set recent posts
    const posts_num = posts.length;
    const cut_num = Math.min(posts_num, 7);
    const rPosts = posts.slice(posts.length - cut_num, posts.length).reverse();

    const refactored = rPosts.map((post, i) => {
      // console.log(post);
      const user = getUserById(post.post_user_id);
      // console.log(user);

      return {
        id: i + 1,
        title: moderateString(post.feed, 60),
        img: getUserAvatarUrl(user),
        createDate: formatTime(
          new Date(transformTime(post.post_time)),
          'd.m.Y'
        ),
        description: user ? user.user_name : 'unknown',
        post_link: `/app/post/edit/${post.post_id}`,
        user_profile_link: `/app/user/edit/${post.post_user_id}`,
      };
    });

    setRecentPosts(refactored);

    return () => {};
  }, [getUserById, posts, users]);

  const getUserById = (id) => {
    const userR = users.filter((user) => Number(user.user_id) === Number(id));
    return userR.length > 0 ? userR[0] : false;
  };

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

const mapStateToProps = ({
  posts: postApp,
  users: userApp,
  comments: commentApp,
  reports: reportApp,
}) => {
  const { list: posts } = postApp;
  const { list: users } = userApp;
  const { list: comments } = commentApp;
  const { list: reports } = reportApp;

  return {
    users,
    posts,
    comments,
    reports,
  };
};

export default connect(mapStateToProps, {})(DashboardPage);
