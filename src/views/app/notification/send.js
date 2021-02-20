import React, { useState, useEffect } from 'react';
import { CustomInput, Row, Label, FormGroup, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import Switch from 'rc-switch';
// import 'rc-switch/assets/index.css';
import Select from 'react-select';

import { NotificationManager } from '../../../components/common/react-notifications';
import CustomSelectInput from '../../../components/common/CustomSelectInput';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
// import { FormikReactSelect, FormikCustomRadioGroup } from '../../../containers/form-validations/FormikFields';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';

import { loadAllUsers } from '../../../redux/actions';
import * as api from '../../../api';

// const INIT_USER_INFO = {
//   active: 1,
//   birthday: '1/1/1970',
//   card_number: '',
//   city: '',
//   email: '',
//   sex: '1',
//   user_id: -1,
//   user_name: '',
//   bio: '',
//   password: '',
//   cpassword: '',
// };
const genderData = [
  { label: 'All', value: '2', key: 1 },
  { label: 'Male', value: '0', key: 0 },
  { label: 'Female', value: '1', key: 1 },
];
// const userModeOptions = [
//   { value: 'manual', label: 'Manually' },
//   { value: 'filter', label: 'Using filters' },
// ];
const ageModes = [
  {value: 'none', label: 'None'},
  { value: 'old', label: 'Older than' },
  { value: 'young', label: 'Younger than' },
  { value: 'y_exact', label: 'Exactly year' },
  { value: 'm_exact', label: 'Exact month' },
];


const EditUserPage = ({ history, match, user_list, loadAllUsersAction }) => {

  // const [profile, setProfile] = useState(INIT_USER_INFO);

  const [singleNoti, setSingleNoti] = useState({ title: 'Trefla', body: '' });
  const [multiNoti] = useState({ title: 'Trefla', body: '' });

  // const [active, setActive] = useState(false);
  const [gender, setGender] = useState(null);
  const [loading, setLoading] = useState(false);

  const [userOptions, setUserOptions] = useState([]);
  const [singleUser, setSingleUser] = useState(null);
  const [multiUser, setMultiUser] = useState(null);

  // const [userMode, setUserMode] = useState(userModeOptions[0]);
  const [birthday, setBirthday] = useState(new Date());
  const [ageMode, setAgeMode] = useState('none')

  useEffect(() => {
    // setUserOptions(user_list.map((user, i) => ({ label: user.user_name, value: user.user_id, key: i })));

    api.r_loadUserRequest({ page: 0, limit: 0, mode: 'SIMPLE' })
      .then(res => {
        // console.log('[users]', users.length, users)
        const { status, message, data } = res;
        if (status) {
          setUserOptions(data.map((user, i) => ({ label: user.user_name, value: user.id, key: i })));
        } else {
          NotificationManager.error('Error while loading user data!', 'Loading Data');
        }
      })

    return () => {
      return true;
    };
  }, [match]);

  const handleOnChangeSingleNoti = (e) => {
    setSingleNoti({ ...singleNoti, [e.target.name]: e.target.value });
  }
  // const handleOnChangeMultiNoti = (e) => {
  //   setMultiNoti({ ...multiNoti, [e.target.name]: e.target.value });
  // }
  const handleOnGenderChange = (val) => {
    // console.log('[gender]', val);
    setGender(val);
    filterHandler({
      gn: val,
      am: ageMode,
      dob: birthday
    });
  }
  const handleOnAgeModeChange = (val) => {
    // console.log('[age mode]', val);
    setAgeMode(val.value);
    filterHandler({
      gn: gender,
      am: val.value,
      dob: birthday
    });
  }
  const handleOnBirthdayChange = (dt) => {
    // console.log('[dob]', dt);
    setBirthday(dt);
    filterHandler({
      gn: gender,
      am: ageMode,
      dob: dt
    });
  }
  const filterHandler = ({gn, am, dob}) => {
    // console.log(gn, am, dob);

    let filtered = user_list;
    if (!!gn && gn.value !== '2') {
      filtered = filtered.filter(user => user.sex === gn.value);
    }

    filtered = filtered.filter(user => {
      if (am === 'none') return true;
      if (!user.birthday) return false;
      const dob_arr = user.birthday.split('/');
      const dob_y = Number(dob_arr[2]);
      const dob_m = Number(dob_arr[0]);

      const c_y = dob.getFullYear();
      const c_m = dob.getMonth() + 1;

      switch(am) {
        case 'old':
          return (dob_y > c_y) || (dob_y === c_y && dob_m >= c_m);
        case 'young':
          return (dob_y < c_y) || (dob_y === c_y && dob_m <= c_m);
        case 'y_exact':
          return (dob_y === c_y);
        case 'm_exact':
          return (dob_y === c_y && dob_m === c_m);
        default:
          return true;
      }
    });
    // console.log(filtered.map(user => user.birthday));
    setMultiUser(userOptions.filter(userOption => (filtered.map(user => user.user_id).includes(userOption.value))));

  }
  const validateRequiredS = (fld) => {
    const value = singleNoti[fld];
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
    const params = {
      ...singleNoti, user_id: singleUser.value
    };

    // console.log(values);
    setLoading(true);
    api.r_sendNotification2User(params)
      .then(res => {
        setLoading(false);
        if (res.status) {
          NotificationManager.success('Notification has been sent!', 'Send Notification');
        } else {
          NotificationManager.error(res.message, 'Notification');
        }
        setSingleNoti({ title: '', body: '' });
        setSingleUser(null);
      })
      .catch(err => {
        setLoading(false);
        console.log(err.message);
        NotificationManager.error('Something went wrong!', 'Send Notification');
      });;
  }
  const sendMultiNotifications = async (values, {resetForm}) => {
    if (!multiUser) {
      NotificationManager.warning('Please select some users!');
      return false;
    }

    const params = {
      user_ids: multiUser.map(user => user.value), title: values.title, body: values.body,
    };

    setLoading(true);
    api.r_sendNotification2Multiple(params)
      .then(res => {
        setLoading(false);
        // init form
        // setMultiNoti({ title: '', body: '' });
        setMultiUser(null);
        resetForm();
        if (res.status) {
          NotificationManager.success('Notifications have been sent!', 'Send Notification');
        } else {
          NotificationManager.error(res.message, 'Notification');
        }
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
              <Formik
                initialValues={{
                  ...initSingleNoti,
                }}
                onSubmit={sendSingleNotification}>
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
              <Formik
                initialValues={{
                  ...initMultiNoti,
                  userMode: 'manual',
                  old: 'old',
                  // birthday: new Date(),
                }}
                validationSchema={Yup.object().shape({
                  title: Yup.string()
                    .required('Title is required'),
                  body: Yup.string().required('Body is required'),
                })}
                onSubmit={sendMultiNotifications}>
                {({
                  setFieldTouched,
                  setFieldValue,
                  errors,
                  touched,
                  values }) => (
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
                        // value={values.title}
                        // validate={() => validateRequiredM('title')}
                        // onChange={setFieldValue}
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
                        // value={values.body}
                        // validate={() => validateRequiredM('body')}
                        // onChange={setFieldValue}
                        />

                        {errors.body && touched.body && (
                          <div className="invalid-feedback d-block">
                            {errors.body}
                          </div>
                        )}
                      </FormGroup>

                      {/* <FormGroup className="error-l-175">
                        <Label className="d-block">Select Users</Label>
                        <FormikCustomRadioGroup
                          inline
                          name="userMode"
                          label="Which of these?"
                          value={values.userMode}
                          onChange={setFieldValue}
                          onBlur={setFieldTouched}
                          options={userModeOptions}
                        />

                        {errors.userMode && touched.userMode ? (
                          <div className="invalid-feedback d-block">
                            {errors.userMode}
                          </div>
                        ) : null}
                      </FormGroup> */}

                      <div className="mb-3">
                        <label>Gender</label>
                        <Select
                          components={{ Input: CustomSelectInput }}
                          className="react-select"
                          classNamePrefix="react-select"
                          value={gender}
                          onChange={handleOnGenderChange}
                          options={genderData}
                        />
                      </div>

                      <div>
                        <Label className="d-block">Age</Label>
                        <FormGroup className="error-l-175">

                          {/* <FormikCustomRadioGroup
                            inline
                            name="old"
                            value={values.old}
                            onChange={setFieldValue}
                            onBlur={setFieldTouched}
                            options={ageModes}
                          /> */}

                          {ageModes.map((child, index) => {
                            return (
                              <CustomInput
                                key={`old_${child.value}_${index}`}
                                type="radio"
                                id={`old_${child.value}_${index}`}
                                name='old'
                                label={child.label}
                                onChange={() => handleOnAgeModeChange(child)}
                                // onBlur={() => setFieldTouched('old', true)}
                                checked={ageMode === child.value}
                                inline={false}
                              />
                            );
                          })}

                          <DatePicker
                            selected={birthday}
                            onChange={handleOnBirthdayChange}
                            dateFormat="MM/yyyy"
                            showMonthYearPicker
                          />
                        </FormGroup>
                      </div>


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
