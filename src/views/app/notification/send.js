import React, { useState, useEffect } from 'react';
import { Row, Label, FormGroup, Button } from 'reactstrap';
import { connect } from 'react-redux';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';
import Select from 'react-select';
import { Formik, Form, Field } from 'formik';

import { NotificationManager } from '../../../components/common/react-notifications';
import CustomSelectInput from '../../../components/common/CustomSelectInput';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';

import { sendSingleNotificationRequest, sendMultiNotificationsRequest } from '../../../api/functions.api';
import { formatTime, addNewUserRequest } from '../../../utils';
import { loadAllUsers } from '../../../redux/actions';

const INIT_USER_INFO = {
  active: 1,
  birthday: '1/1/1970',
  card_number: '',
  city: '',
  email: '',
  sex: '1',
  user_id: -1,
  user_name: '',
  bio: '',
  password: '',
  cpassword: '',
};

const genderData = [
  { label: 'Male', value: '0', key: 0 },
  { label: 'Female', value: '1', key: 1 },
];

const EditUserPage = ({ history, match, user_list, loadAllUsersAction }) => {

  const [profile, setProfile] = useState(INIT_USER_INFO);

  const [singleNoti, setSingleNoti] = useState({ title: '', body: '' });
  const [multiNoti, setMultiNoti] = useState({ title: '', body: '' });

  const [active, setActive] = useState(false);
  const [gender, setGender] = useState(null);
  const [loading, setLoading] = useState(false);

  const [userOptions, setUserOptions] = useState([]);
  const [singleUser, setSingleUser] = useState(null);
  const [multiUser, setMultiUser] = useState(null);

  useEffect(() => {
    setUserOptions(user_list.map((user, i) => ({ label: user.user_name, value: user.user_id, key: i })));

    return () => {
      return true;
    };
  }, [match, user_list]);

  const onUpdateProfile = async (values) => {

  };

  const composeSubmitData = () => {

  };

  const validateRequired = (name) => {
    const value = profile[name];
    let error;
    if (!value) {
      error = 'This field is required!';
    }
    return error;
  };
  const handleOnChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleOnChangeSingleNoti = (e) => {
    setSingleNoti({ ...singleNoti, [e.target.name]: e.target.value });
  }
  const handleOnChangeMultiNoti = (e) => {
    setMultiNoti({ ...multiNoti, [e.target.name]: e.target.value });
  }
  const validateRequiredS = (fld) => {
    const value = singleNoti[fld];
    let error;
    if (!value) {
      error = 'This field is required!';
    }
    return error;
  }
  const validateRequiredM = (fld) => {
    const value = multiNoti[fld];
    let error;
    if (!value) {
      error = 'This field is required!';
    }
    return error;
  }

  const sendSingleNotification = async (values) => {
    if (!singleUser) {
      NotificationManager.warning('Please select a user!');
      return false;
    }

    // console.log(singleUser, singleNoti);
    const params = {
      ...singleNoti, user_id: singleUser.value
    };

    console.log(values);
    setLoading(true);
    sendSingleNotificationRequest(params)
      .then(res => {
        setLoading(false);
        NotificationManager.success('Notification has been sent!', 'Send Notification');
        setSingleNoti({ title: '', body: '' });
        setSingleUser(null);
      })
      .catch(err => {
        setLoading(false);
        console.log(err.message);
        NotificationManager.error('Something went wrong!', 'Send Notification');
      });;
  }
  const sendMultiNotifications = async () => {
    if (!multiUser) {
      NotificationManager.warning('Please select some users!');
      return false;
    }

    const params = {
      ...multiNoti, user_ids: multiUser.map(user => user.value)
    };

    setLoading(true);
    sendMultiNotificationsRequest(params)
      .then(res => {
        setLoading(false);
        // init form
        setMultiNoti({ title: '', body: '' });
        setMultiUser(null);
        NotificationManager.success('Notifications have been sent!', 'Send Notification');
      })
      .catch(err => {
        setLoading(false);
        console.log(err.message);
        NotificationManager.error('Something went wrong!', 'Send Notification');
      });
  }

  const initSingleNoti = singleNoti;
  const initMultiNoti = multiNoti;

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.notifications" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>

      <Row>
        <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.notifications" />
          </h3>
        </Colxx>

        <div className="mx-auto" style={{ maxWidth: 1024, width: '100%' }}>
          <Row>
            <Colxx xxs="12" md="6">
              <h4>Send to a Single User</h4>
              <Formik initialValues={initSingleNoti} onSubmit={sendSingleNotification}>
                {({ errors, touched, values }) => (
                  <Form
                    className="av-tooltip tooltip-label-bottom mx-auto"
                    style={{ maxWidth: 1024, width: '100%' }}
                  >
                    <FormGroup className="form-group">
                      <Label> Title </Label>
                      <Field
                        className="form-control"
                        type="text"
                        name="title"
                        value={singleNoti.title}
                        validate={() => validateRequiredS('title')}
                        onChange={handleOnChangeSingleNoti}
                      />

                      {errors.title && touched.title && (
                        <div className="invalid-feedback d-block">
                          {errors.title}
                        </div>
                      )}
                    </FormGroup>
                    <FormGroup className="form-group">
                      <Label> Body </Label>
                      <Field
                        className="form-control"
                        type="text"
                        name="body"
                        component="textarea"
                        value={singleNoti.body}
                        validate={() => validateRequiredS('body')}
                        onChange={handleOnChangeSingleNoti}
                      />

                      {errors.body && touched.body && (
                        <div className="invalid-feedback d-block">
                          {errors.body}
                        </div>
                      )}
                    </FormGroup>
                    <div className="mb-3">
                      <label>User</label>
                      <Select
                        components={{ Input: CustomSelectInput }}
                        className="react-select"
                        classNamePrefix="react-select"
                        value={singleUser}
                        onChange={setSingleUser}
                        options={userOptions}
                      />
                    </div>
                    <div className="d-flex justify-content-end align-items-center">
                      <Button
                        type="submit"
                        color="primary"
                        className={`btn-shadow btn-multiple-state ${loading ? 'show-spinner' : ''
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
            </Colxx>

            <Colxx xxs="12" md="6">
              <h4>Send to Multiple Users</h4>
              <Formik initialValues={initMultiNoti} onSubmit={sendMultiNotifications}>
                {({ errors, touched, values }) => (
                  <Form
                    className="av-tooltip tooltip-label-bottom mx-auto"
                    style={{ maxWidth: 1024, width: '100%' }}
                  >
                    <FormGroup className="form-group">
                      <Label> Title </Label>
                      <Field
                        className="form-control"
                        type="text"
                        name="title"
                        value={multiNoti.title}
                        validate={() => validateRequiredM('title')}
                        onChange={handleOnChangeMultiNoti}
                      />

                      {errors.title && touched.title && (
                        <div className="invalid-feedback d-block">
                          {errors.title}
                        </div>
                      )}
                    </FormGroup>
                    <FormGroup className="form-group">
                      <Label> Body </Label>
                      <Field
                        className="form-control"
                        type="text"
                        name="body"
                        component="textarea"
                        value={multiNoti.body}
                        validate={() => validateRequiredM('body')}
                        onChange={handleOnChangeMultiNoti}
                      />

                      {errors.body && touched.body && (
                        <div className="invalid-feedback d-block">
                          {errors.body}
                        </div>
                      )}
                    </FormGroup>
                    <div className="mb-3">
                      <label>Users</label>
                      <Select
                        components={{ Input: CustomSelectInput }}
                        className="react-select"
                        classNamePrefix="react-select"
                        isMulti
                        value={multiUser}
                        onChange={setMultiUser}
                        options={userOptions}
                      />
                    </div>
                    <div className="d-flex justify-content-end align-items-center">
                      <Button
                        type="submit"
                        color="primary"
                        className={`btn-shadow btn-multiple-state ${loading ? 'show-spinner' : ''
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
            </Colxx>
          </Row>
        </div>
      </Row>
    </>
  );
};

const mapStateToProps = ({ users: userApp }) => {
  const { list: user_list } = userApp;
  return { user_list };
};

export default connect(mapStateToProps, {
  loadAllUsersAction: loadAllUsers,
})(EditUserPage);
