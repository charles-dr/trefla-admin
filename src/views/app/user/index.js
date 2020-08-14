import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

const UserAdd = React.lazy(() => import('./add'));
const UserEdit = React.lazy(() => import('./edit'));
const UserList = React.lazy(() => import('./list'));


const UserModule = ({ match }) => (
  <Suspense fallback={<div className="loading" />}>
    <Switch>
      <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
      <Route
        path={`${match.url}/list`}
        render={(props) => <UserList {...props} />}
      />
      <Route
        path={`${match.url}/add`}
        render={(props) => <UserAdd {...props} />}
      />
      <Route
        path={`${match.url}/edit/:id`}
        render={(props) => <UserEdit {...props} />}
      />
      <Redirect to="/error" />
    </Switch>
  </Suspense>
);
export default UserModule;
