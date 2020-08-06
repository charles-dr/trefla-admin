import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

const PostList = React.lazy(() => import('./list'));

const PostModule = ({ match }) => (
  <Suspense fallback={<div className="loading" />}>
    <Switch>
      <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
      <Route
        path={`${match.url}/list`}
        render={(props) => <PostList {...props} />}
      />
      <Redirect to="/error" />
    </Switch>
  </Suspense>
);
export default PostModule;
