import React, { Suspense, useEffect } from 'react';
import { Route, withRouter, Switch, Redirect, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import AppLayout from '../../layout/AppLayout';

import {
  downloadAvatar,
  loadAllComments,
  loadAllFriends,
  loadAllLangs,
  loadAllPosts,
  loadAllUsers,
  loadAuthInfo
} from '../../redux/actions';

const CommentModule = React.lazy(() => import('./comment'));
const LangModule = React.lazy(() => import('./lang'));
const PostModule = React.lazy(() => import('./post'));
const SettingModule = React.lazy(() => import('./settings'));
const UserModule = React.lazy(() => import('./user'));
const DashboardPage = React.lazy(() => import('./dashboard'));

const App = ({ match, downloadAvatarAction, getAllCommentsAction, getAllFriendsAction, getAllLangsAction, getAllPostsAction, getAllUsersAction, loadAuthInfoAction, login }) => {
  const history = useHistory();
  useEffect(() => {
    if (!login) {
      console.log('[->] Login');
      history.push('/auth/login');
    }
    // load all data
    getAllCommentsAction();
    getAllFriendsAction();
    getAllLangsAction();
    getAllPostsAction();
    getAllUsersAction();
    loadAuthInfoAction();
    downloadAvatarAction();
  }, [getAllUsersAction, getAllPostsAction])
  return (
    <AppLayout>
      <div className="dashboard-wrapper">
        <Suspense fallback={<div className="loading" />}>
          <Switch>
            <Redirect exact from={`${match.url}/`} to={`${match.url}/dashboard`} />

            <Route
              path={`${match.url}/dashboard`}
              render={(props) => <DashboardPage {...props} />}
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
            <Redirect to="/error" />
          </Switch>
        </Suspense>
      </div>
    </AppLayout>
  );
};

const mapStateToProps = ({ menu, auth }) => {
  const { containerClassnames } = menu;
  const { login } = auth;
  return { containerClassnames, login };
};

export default withRouter(connect(mapStateToProps, {
  downloadAvatarAction: downloadAvatar,
  getAllCommentsAction: loadAllComments,
  getAllFriendsAction: loadAllFriends,
  getAllLangsAction: loadAllLangs,
  getAllPostsAction: loadAllPosts,
  getAllUsersAction: loadAllUsers,
  loadAuthInfoAction: loadAuthInfo,
})(App));
