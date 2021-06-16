import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

const BugList = React.lazy(() => import('./list'));
const BugEdit = React.lazy(() => import('./edit'));

const BugModule = ({ match }) => (
  <Suspense fallback={<div className="loading" />}>
    <Switch>
      <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
      <Route
        path={`${match.url}/list`}
        render={(props) => <BugList {...props} />}
      />
      <Route
        path={`${match.url}/edit/:id`}
        render={(props) => <BugEdit {...props} />}
      />
      <Redirect to="/error" />
    </Switch>
  </Suspense>
);
export default BugModule;
