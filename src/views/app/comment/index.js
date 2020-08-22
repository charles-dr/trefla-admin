import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

const CommentList = React.lazy(() => import('./list'));
const CommentEdit = React.lazy(() => import('./edit'));


const PostModule = ({ match }) => (
  <Suspense fallback={<div className="loading" />}>
    <Switch>
      <Redirect exact from={`${match.url}/`} to={`${match.url}/list`} />
      <Route
        path={`${match.url}/list`}
        render={(props) => <CommentList {...props} />}
      />
      <Route
        path={`${match.url}/edit/:id`}
        render={(props) => <CommentEdit {...props} />}
      />
      <Redirect to="/error" />
    </Switch>
  </Suspense>
);
export default PostModule;
