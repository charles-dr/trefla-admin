import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

const AdminList = React.lazy(() => import('./list'));
const AdminEdit = React.lazy(() => import('./edit'));
const AdminAdd = React.lazy(() => import('./add'));

const AdminModule = ({ match }) => (
  <Suspense fallback={<div className="loading" />}>
    <Switch>
      <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
      <Route
        path={`${match.url}/list`}
        render={(props) => <AdminList {...props} />}
      />
      <Route
        path={`${match.url}/edit/:id`}
        render={(props) => <AdminEdit {...props} />}
      />
      <Route
        path={`${match.url}/add`}
        render={(props) => <AdminAdd {...props} />}
      />
      <Redirect to="/error" />
    </Switch>
  </Suspense>
);
export default AdminModule;
