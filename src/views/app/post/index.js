import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

const PostList = React.lazy(() => import('./list'));
const PostEdit = React.lazy(() => import('./edit'));
const PostAdd = React.lazy(() => import('./add'));


const PostModule = ({ match }) => (
  <Suspense fallback={<div className="loading" />}>
    <Switch>
      <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
      <Route
        path={`${match.url}/list`}
        render={(props) => <PostList {...props} />}
      />
      <Route
        path={`${match.url}/edit/:id`}
        render={(props) => <PostEdit {...props} />}
      />
      <Route
        path={`${match.url}/add`}
        render={(props) => <PostAdd {...props} />}
      />
      <Redirect to="/error" />
    </Switch>
  </Suspense>
);
export default PostModule;
