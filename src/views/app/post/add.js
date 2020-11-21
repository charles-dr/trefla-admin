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

import { convertTimeToString, updatePostRequest } from '../../../utils';
import { loadAllPosts } from '../../../redux/actions';
import * as api from '../../../api';

const typeList = [
  { value: '0', label: 'Card', key: 0 },
  { value: '1', label: 'Date', key: 1 },
  { value: '21', label: 'Doctor', key: 3 },
  { value: '22', label: 'Lawyer', key: 4 },
  { value: '23', label: 'Dealer', key: 5 },
  { value: '31', label: 'Car', key: 6 },
  { value: '32', label: 'House', key: 7 },
  { value: '33', label: 'Animal', key: 8 },
];

const INIT_POST_INFO = {
  active: 1,
  city: '',
  comment_num: 0,
  feed: '',
  isGuest: false,
  like_1_num: 0,
  like_2_num: 0,
  like_3_num: 0,
  like_4_num: 0,
  like_5_num: 0,
  like_6_num: 0,
  location_address: ' ',
  location_coordiate: '0,0',
  option_val: '',
  post_id: '',
  post_name: '',
  post_time: '',
  post_user_id: -1,
  target_date: '',
  type: 1,
};

const AddPostPage = ({
  history,
  match,
  post_list,
  user_list,
  loadAllPostsAction,
}) => {
  const [post, setPost] = useState(INIT_POST_INFO);
  const [userSelValues, setUserSelValues] = useState([]);
  const [user, setUser] = useState(
    userSelValues.length > 0 ? userSelValues[0] : {}
  );
  const [type, setType] = useState(typeList[0]);
  const [guest, setGuest] = useState(false);
  const [active, setActive] = useState(false);
  const [timeAdded, setTimeAdded] = useState(false);
  const [targetTime, setTargetTime] = useState(new Date());

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // compose the user select source
    Promise.all([
      api.r_loadUserRequest({ page: 0, limit: 0, mode: 'SIMPLE' }),
    ])
      .then(([usersRes]) => {
        if (usersRes.status) {
          const { data: users } = usersRes;
          const userList = users.map(user => ({
            label: user.user_name,
            value: user.id.toString(),
            key: user.id.toString(),
          }));
          setUserSelValues(userList);
          setUser(userList[0]);
        }
      });
    return () => {
      return true;
    };
  }, [match]);

  const onCreatePost = async () => {
    // copy post

    const params = {};
    for (const key in post) {
      params[key] = post[key];
    }

    params.type = type.value;
    params.isGuest = guest;
    params.active = active === true ? 1 : 0;
    params.target_date =
      timeAdded === true ? convertTimeToString(targetTime) : '';
    params.user_id = Number(user.value);
    params.post_time = convertTimeToString();
    // params.post_id = getPostNewId();
    params.post_name = !post.post_name ? user.label : post.post_name;

    params.location_address = '1600, Amphitheatre Parkway, Mountain View, Santa Clara County, 94043, California';
    params.location_coordinate = '37.421998333333335,-122.08400000000002';
    // console.log(params);

    setLoading(true);

    const res = await api.r_createPostRequest(params);

    setLoading(false);

    if (res.status === true) {
      NotificationManager.success('Post has been created!', 'Add Post');
      // loadAllPostsAction();
      history.push('/app/post');
    } else {
      NotificationManager.error(res.message, 'Add Post');
    }
  };

  const validateRequired = (name) => {
    const value = post[name];
    let error;
    if (!value) {
      error = 'This field is required!';
    }
    return error;
  };

  const validateUser = () => {
    let error;
    if (!user || !user.value) {
      error = 'This field is required!';
    }
    return error;
  };

  const handleOnChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
  };

  const getPostNewId = () => {
    let newId = -1;
    for (const post of post_list) {
      newId = post.post_id > newId ? post.post_id : newId;
    }
    return newId + 1;
  };

  const initialValues = post;

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.posts" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>

      <Row>
        <Colxx xxs="12">
          <h3 className="mb-4">New Post</h3>
        </Colxx>

        <Formik initialValues={initialValues} onSubmit={onCreatePost}>
          {({ errors, touched, values }) => (
            <Form
              className="av-tooltip tooltip-label-bottom mx-auto"
              style={{ maxWidth: 1024, width: '100%' }}
            >
              {/* Title & Content */}
              <Row>
                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label> Post Name </Label>
                    <Field
                      className="form-control"
                      type="text"
                      name="post_name"
                      value={post.post_name}
                      onChange={handleOnChange}
                    />
                    {errors.post_name && touched.post_name && (
                      <div className="invalid-feedback d-block">
                        {errors.post_name}
                      </div>
                    )}
                  </FormGroup>
                </Colxx>

                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label>Content</Label>
                    <Field
                      className="form-control"
                      type="text"
                      component="textarea"
                      name="feed"
                      value={post.feed}
                      validate={() => validateRequired('feed')}
                      onChange={handleOnChange}
                    />
                    {errors.feed && touched.feed && (
                      <div className="invalid-feedback d-block">
                        {errors.feed}
                      </div>
                    )}
                  </FormGroup>
                </Colxx>
              </Row>

              {/* User & Type */}
              <Row>
                <Colxx xxs="12" md="6" style={{ marginBottom: '1rem' }}>
                  <label> User </label>
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    value={user}
                    onChange={setUser}
                    validate={validateUser}
                    options={userSelValues}
                  />
                </Colxx>

                <Colxx xxs="12" md="6" style={{ marginBottom: '1rem' }}>
                  <label> Type </label>
                  <Select
                    components={{ Input: CustomSelectInput }}
                    className="react-select"
                    classNamePrefix="react-select"
                    value={type}
                    onChange={setType}
                    options={typeList}
                  />
                </Colxx>
              </Row>

              {/* Target Time */}
              <Row>
                <Colxx xxs="12" md="6" style={{ marginBottom: '1rem' }}>
                  <Label>Set Target Time</Label>
                  <Switch
                    className="custom-switch custom-switch-secondary"
                    checked={timeAdded}
                    onChange={(st) => setTimeAdded(st)}
                  />
                </Colxx>

                {timeAdded && (
                  <Colxx>
                    <Label>Target Time</Label>
                    <DatePicker
                      selected={targetTime}
                      onChange={(date) => setTargetTime(date)}
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy hh:mm aa"
                      showTimeInput
                    />
                  </Colxx>
                )}
              </Row>

              {/* Guest  */}
              <Row>
                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label> As Guest </Label>
                    <Switch
                      className="custom-switch custom-switch-secondary"
                      checked={guest}
                      onChange={(st) => setGuest(st)}
                    />
                  </FormGroup>
                </Colxx>

                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label>Active</Label>
                    <Switch
                      className="custom-switch custom-switch-secondary"
                      checked={active}
                      onChange={(st) => setActive(st)}
                    />
                  </FormGroup>
                </Colxx>
              </Row>

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

const mapStateToProps = ({ posts: postApp, users: userApp }) => {
  const { list: user_list } = userApp;
  const { list: post_list } = postApp;
  return { post_list, user_list };
};

export default connect(mapStateToProps, {
  loadAllPostsAction: loadAllPosts,
})(AddPostPage);
