import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

const ReportList = React.lazy(() => import('./list'));
const ReportEdit = React.lazy(() => import('./edit'));

const ReportModule = ({ match }) => (
  <Suspense fallback={<div className="loading" />}>
    <Switch>
      <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
      <Route
        path={`${match.url}/list`}
        render={(props) => <ReportList {...props} />}
      />
      <Route
        path={`${match.url}/edit/:id`}
        render={(props) => <ReportEdit {...props} />}
      />
      <Redirect to="/error" />
    </Switch>
  </Suspense>
);
export default ReportModule;
