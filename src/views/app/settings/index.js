import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';


const ProfilePage = React.lazy(() => import('./profile'));
const PasswordPage = React.lazy(() => import('./password'));

const UserModule = ({ match }) => (
  <Suspense fallback={<div className="loading" />}>
    <Switch>
      <Redirect exact from={`${match.url}/`} to={`${match.url}/profile`} />
      <Route
        path={`${match.url}/password`}
        render={(props) => <PasswordPage {...props} />}
      />
      <Route
        path={`${match.url}/profile`}
        render={(props) => <ProfilePage {...props} />}
      />
      <Redirect to="/error" />
    </Switch>
  </Suspense>
);
export default UserModule;