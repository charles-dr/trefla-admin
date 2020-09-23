import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

const ConfigPage = React.lazy(() => import('./config'));
const DBBackupList = React.lazy(() => import('./db-backups'));
const EmailTemplateList = React.lazy(() => import('./email-templates'));
const EmailTemplatePage = React.lazy(() => import('./email-template'));
const ProfilePage = React.lazy(() => import('./profile'));
const PasswordPage = React.lazy(() => import('./password'));

const UserModule = ({ match }) => (
  <Suspense fallback={<div className="loading" />}>
    <Switch>
      <Redirect exact from={`${match.url}/`} to={`${match.url}/config`} />
      <Route
        path={`${match.url}/config`}
        render={(props) => <ConfigPage {...props} />}
      />
      <Route 
        path={`${match.url}/db-backups`}
        render={(props) => <DBBackupList {...props} /> }
      />
      <Route
        path={`${match.url}/email-templates`}
        render={(props) => <EmailTemplateList {...props} />}
      />
      <Route
        path={`${match.url}/email-template/:id`}
        render={(props) => <EmailTemplatePage {...props} /> }
      />
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
