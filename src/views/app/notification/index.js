import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

const SendNotificationPage = React.lazy(() => import('./send'));


const UserModule = ({ match }) => (
  <Suspense fallback={<div className="loading" />}>
    <Switch>
      <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
      <Route
        path={`${match.url}/send`}
        render={(props) => <SendNotificationPage {...props} />}
      />
      <Redirect to="/error" />
    </Switch>
  </Suspense>
);
export default UserModule;
