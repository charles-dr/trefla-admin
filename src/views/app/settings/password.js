import React, { useState, useEffect } from 'react';
import { Row, Label, FormGroup, Button } from 'reactstrap';
// import { NavLink, Redirect, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import { Formik, Form, Field } from 'formik';
import { NotificationManager } from '../../../components/common/react-notifications';

import { login, updateLogin } from '../../../redux/actions';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';

import * as api from '../../../api';

const PasswordPage = ({
  history,
  match
}) => {
  const [profile, setProfile] = useState({
    old_pass: '',
    password: '',
    cpassword: '',
  });
  const [loading, setLoading] = useState(false);

  const onUpdatePassword = async (values) => {
    console.log('admin', profile);
    // set loading
    setLoading(true);
    const res = await api.r_updatePasswordRequest(profile);

    // cancel the loading
    setLoading(false);
    if (res.status === true) {
      NotificationManager.success(res.message, 'Password Update', 3000);
      setProfile({ old_pass: '', password: '', cpassword: '' });
    } else {
      NotificationManager.warning(res.message, 'Password Update', 3000);
    }
  };

  const validateOldPassword = () => {
    const value = profile.old_pass;
    let error;
    if (!value) {
      error = 'Please enter the old password';
    }
    return error;
  };

  const validatePassword = (value) => {
    value = profile.password;
    let error;
    if (!value) {
      error = 'Please enter new password';
    } else if (value.length < 4) {
      error = 'Value must be longer than 3 characters';
    }
    return error;
  };

  const validateCPassword = () => {
    let error;
    if (profile.password !== profile.cpassword) {
      error = 'Password does not match!';
    }
    return error;
  };

  const handleOnChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const initialValues = profile;

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.password" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>

      <Row>
        <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.password" />
          </h3>
        </Colxx>

        <Formik initialValues={initialValues} onSubmit={onUpdatePassword}>
          {({ errors, touched }) => (
            <Form
              className="av-tooltip tooltip-label-bottom mx-auto"
              style={{ maxWidth: 640, width: '100%' }}
            >
              <FormGroup className="form-group">
                <Label>
                  <IntlMessages id="user.old-password" />
                </Label>
                <Field
                  className="form-control"
                  type="password"
                  name="old_pass"
                  value={profile.old_pass}
                  validate={validateOldPassword}
                  onChange={handleOnChange}
                />
                {errors.old_pass && touched.old_pass && (
                  <div className="invalid-feedback d-block">
                    {errors.old_pass}
                  </div>
                )}
              </FormGroup>
              <FormGroup className="form-group">
                <Label>
                  <IntlMessages id="user.new-password" />
                </Label>
                <Field
                  className="form-control"
                  type="password"
                  name="password"
                  value={profile.password}
                  validate={validatePassword}
                  onChange={handleOnChange}
                />
                {errors.password && touched.password && (
                  <div className="invalid-feedback d-block">
                    {errors.password}
                  </div>
                )}
              </FormGroup>
              <FormGroup className="form-group">
                <Label>
                  <IntlMessages id="user.confirm-password" />
                </Label>
                <Field
                  className="form-control"
                  type="password"
                  name="cpassword"
                  value={profile.cpassword}
                  validate={validateCPassword}
                  onChange={handleOnChange}
                />
                {errors.cpassword && touched.cpassword && (
                  <div className="invalid-feedback d-block">
                    {errors.cpassword}
                  </div>
                )}
              </FormGroup>

              <div className="d-flex justify-content-end align-items-center">
                <Button
                  type="submit"
                  color="primary"
                  className={`btn-shadow btn-multiple-state ${
                    loading ? 'show-spinner' : ''
                  }`}
                  size="lg"
                >
                  <span className="spinner d-inline-block">
                    <span className="bounce1" />
                    <span className="bounce2" />
                    <span className="bounce3" />
                  </span>
                  <span className="label">
                    <IntlMessages id="user.update" />
                  </span>
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Row>
    </>
  );
};

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {
  loginUserAction: login,
  updateLoginAction: updateLogin,
})(PasswordPage);
