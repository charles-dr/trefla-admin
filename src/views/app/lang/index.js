import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

const UserList = React.lazy(() => import('./list'));
const EditLangPage = React.lazy(() => import('./edit'));
const AddLangPage = React.lazy(() => import('./add'));

const UserModule = ({ match }) => (
  <Suspense fallback={<div className="loading" />}>
    <Switch>
      <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
      <Route
        path={`${match.url}/list`}
        render={(props) => <UserList {...props} />}
      />
      <Route
        path={`${match.url}/edit/:id`}
        render={(props) => <EditLangPage {...props} />}
      />
      <Route
        path={`${match.url}/add`}
        render={(props) => <AddLangPage {...props} />}
      />
      <Redirect to="/error" />
    </Switch>
  </Suspense>
);
export default UserModule;
