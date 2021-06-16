import React, { useState, useEffect } from 'react';
import { Row, Label, Nav, NavItem, FormGroup, Button, TabContent, TabPane } from 'reactstrap';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import classnames from 'classnames';

import { NotificationManager } from '../../../components/common/react-notifications';

import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';

import * as api from '../../../api';
import PermissionForm from './permissions';

const ProfilePage = ({
  history,
  match,
}) => {
  let avatarInput = null;
  const [profile, setProfile] = useState({ email: '', user_name: '' });
  const [permission, setPermission] = useState({});
  const [avatar, setAvatar] = useState('/assets/img/no_profile.png');
  const [activeTab, setActiveTab] = useState('1');

  const [loading1, setLoading1] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.r_getEmployeeRequest(match.params.id)
      .then(({ data: admin, status, permission: adminPermission }) => {
        setLoading1(false);
        if (status) {
          setProfile(admin);
          setPermission(adminPermission);
          admin.avatar ? setAvatar(admin.avatar): console.log(null);
        } else {
          NotificationManager.error('Error while loading data!', 'Admin Profile');
        }
      })

    return () => {};
  }, [match]);

  const onUpdateProfile = async (values) => {
    const file = avatarInput.files[0];
    setLoading(true);
    await api.r_updateProfileRequest(profile, file);
    // await updateAdminProfile(profile, file);
    console.log('done');

    NotificationManager.success('Profile has been updated.', 'Profile Update', 3000);
    setLoading(false);
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
  const handleOnChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  const filterPermissionFields = (data) => {
    const excludeKeys = ['id', 'admin_id', 'create_time', 'update_time'];
    const newData = {};
    Object.keys(data).forEach(key => {
      if (!excludeKeys.includes(key)) {
        newData[key] = data[key];
      }
    });
    return newData;
  }
  const onUpdatePermission = async (data) => {
    setLoading1(true);
    const res = await api.r_updateEmployeePermission(match.params.id, data);
    setLoading1(false);
    if (res.status) {
      NotificationManager.success(res.message, 'Admin Permission', 3000);
      api.r_getEmployeeRequest(match.params.id)
      .then(({ data: admin, status, permission: adminPermission }) => {
        if (status) {
          setPermission(adminPermission);
        } else {
          NotificationManager.error('Error while loading data!', 'Admin Profile');
        }
      })
    } else {
      NotificationManager.error(res.message, 'Admin Permission', 3000);
    }
  }

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
      </Row>
      {loading1 && <div className="loading" />}
      
      <Nav tabs className="card-header-tabs mb-3">
        <NavItem>
          <NavLink
            to="#"
            location={{}}
            className={classnames({
              active: activeTab === '1',
              'nav-link': true,
            })}
            onClick={() => {
              setActiveTab('1');
            }}
          >
            Profile
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            to="#"
            location={{}}
            className={classnames({
              active: activeTab === '2',
              'nav-link': true,
            })}
            onClick={() => {
              setActiveTab('2');
            }}
          >
            Permission
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
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
        </TabPane>

        <TabPane tabId="2">
          <PermissionForm 
            permission={filterPermissionFields(permission)}
            onUpdate={onUpdatePermission}
            waiting={loading}
          />
        </TabPane>
      </TabContent>
    </>
  );
};

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {})(ProfilePage);
