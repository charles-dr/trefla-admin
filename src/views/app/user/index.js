import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

const UserAdd = React.lazy(() => import('./add'));
const UserEdit = React.lazy(() => import('./edit'));
const UserList = React.lazy(() => import('./list'));
const DriverIDList = React.lazy(() => import('./driver-ids'));
const IDChangeList = React.lazy(() => import('./id-changes'));
const DriverIDTransfer = React.lazy(() => import('./driver-id-transfer'));
const NationalIDList = React.lazy(() => import('./national-ids'));

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

      <Route
        path={`${match.url}/driver-ids`}
        render={(props) => <DriverIDList {...props} />}
      />
      
      <Route
        path={`${match.url}/id-changes`}
        render={(props) => <IDChangeList {...props} />}
      />

      <Route
        path={`${match.url}/driver-id-transfer`}
        render={(props) => <DriverIDTransfer {...props} /> }
      />

      <Route
        path={`${match.url}/national-ids`}
        render={(props) => <NationalIDList {...props} />}
      />

      <Redirect to="/error" />
    </Switch>
  </Suspense>
);
export default UserModule;
