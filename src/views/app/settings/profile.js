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

const ProfilePage = ({
  history,
  match,
  loadAuthInfoAction,
  downloadAvatarAction,
}) => {
  let avatarInput = null;
  const [profile, setProfile] = useState({ email: '', name: '' });
  const [avatar, setAvatar] = useState('/assets/img/no_profile.png');
  const [loading1, setLoading1] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAdminProfile = async () => {
      const res = await getAdminInfo();
      if (res) {
        setProfile(res);
      }
      setLoading1(false);
    };

    loadAdminProfile();
    // get profile avatar
    getAdminAvatarURL().then((url) => setAvatar(url));
    return () => {};
  }, [match]);

  const onUpdateProfile = async (values) => {
    const file = avatarInput.files[0];
    setLoading(true);
    await updateAdminProfile(profile, file);
    console.log('done');

    NotificationManager.success(
      'Profile has been updated.',
      'Profile Update',
      3000,
      null,
      null,
      ''
    );
    setLoading(false);

    // reload admin information
    loadAuthInfoAction();
    downloadAvatarAction();
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
    const value = profile.name;
    let error;
    if (!value) {
      error = 'Please enter name';
    } else if (value.length < 4) {
      error = 'Value must be longer than 3 characters';
    }
    return error;
  };
  const handleOnChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  const initialValues = { email: profile.email, name: profile.name };
  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.profile" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>

      <Row>
        <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.profile" />
          </h3>
        </Colxx>
        {loading1 && <div className="loading" />}
        {
          <Formik initialValues={initialValues} onSubmit={onUpdateProfile}>
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
                    name="name"
                    value={profile.name}
                    onChange={handleOnChange}
                    validate={validateName}
                  />
                  {errors.name && touched.name && (
                    <div className="invalid-feedback d-block">
                      {errors.name}
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
                      <IntlMessages id="user.save" />
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

export default connect(mapStateToProps, {
  loadAuthInfoAction: loadAuthInfo,
  downloadAvatarAction: downloadAvatar,
})(ProfilePage);
