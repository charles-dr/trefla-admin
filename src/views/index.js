import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

const Main = ({ login }) => {
  return login ? <Redirect to="/app" /> : <Redirect to="/auth" />;
};

const mapStateToProps = ({ auth }) => {
  const { login } = auth;
  return { login };
}

export default connect(mapStateToProps)(Main);
