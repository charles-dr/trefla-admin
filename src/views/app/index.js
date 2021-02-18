import React, { Suspense, useEffect } from 'react';
import {
  Route,
  withRouter,
  Switch,
  Redirect,
  useHistory,
} from 'react-router-dom';
import { connect } from 'react-redux';

import AppLayout from '../../layout/AppLayout';

import {
  downloadAvatar,
  loadAllAdminNotiAction,
  loadAllComments,
  loadAllFriends,
  loadAllLangs,
  loadAllPosts,
  loadAllReports,
  loadAllUsers,
  loadAuthInfo,
} from '../../redux/actions';
import { anonymousLogin } from '../../utils';

const CommentModule = React.lazy(() => import('./comment'));
const LangModule = React.lazy(() => import('./lang'));
const NotificationModule = React.lazy(() => import('./notification'));
const PostModule = React.lazy(() => import('./post'));
const ReportModule = React.lazy(() => import('./report'));
const SettingModule = React.lazy(() => import('./settings'));
const UserModule = React.lazy(() => import('./user'));
const DashboardPage = React.lazy(() => import('./dashboard'));
const BugModule = React.lazy(() => import('./bug'));
const AdminModule = React.lazy(() => import('./admins'));

const App = ({
  match,
  downloadAvatarAction,
  getAllCommentsAction,
  getAllFriendsAction,
  getAllLangsAction,
  getAllPostsAction,
  getAllReportsAction,
  getAllUsersAction,
  loadAllAdminNotiAction$,
  loadAuthInfoAction,
  login,
  posts,
}) => {
  const history = useHistory();

  useEffect(() => {
    // if (!login) {
    //   console.log('[->] Login');
    //   history.push('/auth/login');
    // }

    anonymousLogin()
      .then(result => {
        // console.log('[firebase] =>');
        // load all data
        // getAllCommentsAction();
        // getAllFriendsAction();
        // getAllLangsAction();
        // getAllPostsAction(posts.pager);
        // getAllUsersAction();
        // loadAuthInfoAction();
        // downloadAvatarAction();
        // getAllReportsAction();
        // loadAllAdminNotiAction$();
      })
      .catch(error => {
        console.log('[Firebase login] failed');
      })
  }, [
    // match,
    getAllUsersAction,
    getAllPostsAction,
    login,
    getAllCommentsAction,
    getAllFriendsAction,
    getAllLangsAction,
    loadAuthInfoAction,
    downloadAvatarAction,
    getAllReportsAction,
    history,
  ]);

  return (
    <AppLayout>
      <div className="dashboard-wrapper">
        <Suspense fallback={<div className="loading" />}>
          <Switch>
            <Redirect
              exact
              from={`${match.url}/`}
              to={`${match.url}/dashboard`}
            />

            <Route
              path={`${match.url}/dashboard`}
              render={(props) => <DashboardPage {...props} />}
            />

            <Route 
              path={`${match.url}/bug`}
              render={(props) => <BugModule {...props} />}
            />

            <Route
              path={`${match.url}/comment`}
              render={(props) => <CommentModule {...props} />}
            />
            <Route
              path={`${match.url}/lang`}
              render={(props) => <LangModule {...props} />}
            />

            <Route
              path={`${match.url}/notification`}
              render={(props) => <NotificationModule {...props} />}
            />

            <Route
              path={`${match.url}/report`}
              render={(props) => <ReportModule {...props} />}
            />

            <Route
              path={`${match.url}/post`}
              render={(props) => <PostModule {...props} />}
            />
            <Route
              path={`${match.url}/settings`}
              render={(props) => <SettingModule {...props} />}
            />
            <Route
              path={`${match.url}/user`}
              render={(props) => <UserModule {...props} />}
            />
            <Route
              path={`${match.url}/admin`}
              render={(props) => <AdminModule {...props} />}
            />
            <Redirect to="/error" />
          </Switch>
        </Suspense>
      </div>
    </AppLayout>
  );
};

const mapStateToProps = ({ menu, auth, posts }) => {
  const { containerClassnames } = menu;
  const { login } = auth;
  return { containerClassnames, login, posts };
};

export default withRouter(
  connect(mapStateToProps, {
    downloadAvatarAction: downloadAvatar,
    getAllCommentsAction: loadAllComments,
    getAllFriendsAction: loadAllFriends,
    getAllLangsAction: loadAllLangs,
    getAllPostsAction: loadAllPosts,
    getAllReportsAction: loadAllReports,
    getAllUsersAction: loadAllUsers,
    loadAllAdminNotiAction$: loadAllAdminNotiAction,
    loadAuthInfoAction: loadAuthInfo,
  })(App)
);
