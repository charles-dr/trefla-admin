import React, { Suspense, useEffect } from 'react';
import { Route, withRouter, Switch, Redirect, useHistory} from 'react-router-dom';
import { connect } from 'react-redux';

import AppLayout from '../../layout/AppLayout';

import { loadAllFriends, loadAllPosts, loadAllUsers } from '../../redux/actions';

const PostModule = React.lazy(() => import('./post'));

const UserModule = React.lazy(() => import('./user'));

const DashboardPage = React.lazy(() => import('./dashboard'));

const App = ({ match, getAllFriendsAction, getAllPostsAction, getAllUsersAction, login }) => {
  const history = useHistory();
  useEffect(() => {
    if (!login) {
      console.log('[->] Login');
      history.push('/auth/login');
    }
    getAllUsersAction();
    getAllFriendsAction();
    getAllPostsAction();
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
              path={`${match.url}/post`}
              render={(props) => <PostModule {...props} />}
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
  getAllFriendsAction: loadAllFriends,
  getAllPostsAction: loadAllPosts,
  getAllUsersAction: loadAllUsers
})(App));
