import React, { useState, useEffect } from 'react';
import { Row, Label, FormGroup, Button } from 'reactstrap';
import { connect } from 'react-redux';

import { Formik, Form, Field } from 'formik';
import { NotificationManager } from '../../../components/common/react-notifications';

import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';

import {
  getAdminAvatarURL,
  getAdminInfo,
  updateAdminProfile,
} from '../../../utils';
import { downloadAvatar, loadAuthInfo } from '../../../redux/actions';
import * as api from '../../../api';

const ProfilePage = ({
  history,
  match,
  loadAuthInfoAction,
  downloadAvatarAction,
}) => {
  let avatarInput = null;
  const [profile, setProfile] = useState({ email: '', user_name: '', password: '', cpassword: '' });
  const [avatar, setAvatar] = useState('/assets/img/no_profile.png');
  const [loading1, setLoading1] = useState(true); // preloader
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading1(false);
    // api.r_getProfileRequest()
    //   .then(({ data: admin, status }) => {
    //     if (status) {
    //       setProfile(admin);
    //       admin.avatar ? setAvatar(admin.avatar): console.log(null);
    //     } else {
    //       NotificationManager.error('Error while loading data!', 'Admin Profile');
    //     }
    //   })

    return () => {};
  }, [match]);

  const onAddAdministrator = async (values) => {
    const file = avatarInput.files[0];
    setLoading(true);
    await api.r_addEmployeeRequest(profile, file);
    NotificationManager.success('Administrator has been added.', 'Add Administrator', 3000);
    setLoading(false);
    history.push('/app/admin/list');
  };
  const openFileSelector = () => {
    avatarInput.click();
  };
  const handleAvatarSelect = (e) => {
    e.preventDefault();
    setAvatar(URL.createObjectURL(e.target.files[0]));
  };
  const validateEmail = () => {
    const value = profile.email;
    let error;
    if (!value) {
      error = 'Please enter your email address';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
      error = 'Invalid email address';
    }
    return error;
  };
  const validateName = () => {
    const value = profile.user_name;
    let error;
    if (!value) {
      error = 'Please enter name';
    } else if (value.length < 4) {
      error = 'Value must be longer than 3 characters';
    }
    return error;
  };
  const validatePassword = () => {
    const value = profile.password;
    let error;
    if (!value) {
      error = 'Please enter password';
    } else if (value.length < 4) {
      error = 'Value must be longer than 3 characters';
    }
    return error;
  }
  const validateCPassword = () => {
    const value = profile.cpassword;
    let error;
    if (!value) {
      error = 'Please confirm password';
    } else if (profile.password !== value) {
      error = 'Password does not match!';
    }
    return error;
  }
  const handleOnChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  const initialValues = { email: profile.email, user_name: profile.user_name };
  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.admin" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>

      <Row>
        <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.admin.add" />
          </h3>
        </Colxx>
        {loading1 && <div className="loading" />}
        {
          <Formik initialValues={initialValues} onSubmit={onAddAdministrator}>
            {({ errors, touched }) => (
              <Form
                className="av-tooltip tooltip-label-bottom mx-auto"
                style={{ maxWidth: 640, width: '100%' }}
              >
                <div className="profile-avatar">
                  <div className="wrapper">
                    <img src={avatar} alt="User Profile" />
                    <div className="hover-layer" onClick={openFileSelector}>
                      <div className="glyph-icon simple-icon-camera change-avatar" />
                    </div>
                  </div>
                  <input
                    type="file"
                    className="hidden-file"
                    ref={(input) => {
                      avatarInput = input;
                    }}
                    onChange={handleAvatarSelect}
                    accept="image/*"
                  />
                </div>
                <FormGroup className="form-group">
                  <Label>
                    <IntlMessages id="user.email" />
                  </Label>
                  <Field
                    className="form-control"
                    name="email"
                    value={profile.email}
                    onChange={handleOnChange}
                    validate={validateEmail}
                  />
                  {errors.email && touched.email && (
                    <div className="invalid-feedback d-block">
                      {errors.email}
                    </div>
                  )}
                </FormGroup>
                <FormGroup className="form-group">
                  <Label>
                    <IntlMessages id="user.username" />
                  </Label>
                  <Field
                    className="form-control"
                    name="user_name"
                    value={profile.user_name}
                    onChange={handleOnChange}
                    validate={validateName}
                    autoCorrect="false"
                  />
                  {errors.user_name && touched.user_name && (
                    <div className="invalid-feedback d-block">
                      {errors.user_name}
                    </div>
                  )}
                </FormGroup>
                <FormGroup className="form-group">
                  <Label>
                    <IntlMessages id="user.password" />
                  </Label>
                  <Field
                    className="form-control"
                    name="password"
                    value={profile.password}
                    type="password"
                    onChange={handleOnChange}
                    validate={validatePassword}
                    autoCorrect="false"
                  />
                  {errors.password && touched.password && (
                    <div className="invalid-feedback d-block">
                      {errors.password}
                    </div>
                  )}
                </FormGroup>
                <FormGroup className="form-group">
                  <Label>
                    <IntlMessages id="user.password.confirm" />
                  </Label>
                  <Field
                    className="form-control"
                    name="cpassword"
                    value={profile.cpassword}
                    type="password"
                    onChange={handleOnChange}
                    validate={validateCPassword}
                    autoCorrect="false"
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
                      <IntlMessages id="user.submit" />
                    </span>
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        }
      </Row>
    </>
  );
};

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {})(ProfilePage);
