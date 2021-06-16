import React, { useState, useEffect } from 'react';
import { Row, Label, FormGroup, Button } from 'reactstrap';
import { connect } from 'react-redux';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';
import Select from 'react-select';
import { Formik, Form, Field } from 'formik';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from 'react-google-maps';

import { NotificationManager } from '../../../components/common/react-notifications';
import CustomSelectInput from '../../../components/common/CustomSelectInput';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { LocationItem } from '../../../components/custom';

import {
  convertTimeToString,
  getMapPositionFromString,
  transformTime,
} from '../../../utils';
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
  location_address: '',
  location_coordiate: '0,0',
  option_val: '',
  id: '',
  post_name: '',
  post_time: '',
  post_user_id: -1,
  target_date: '',
  type: 1,
};

const MapWithAMarker = withScriptjs(
  withGoogleMap(({ zoom, center, markers }) => (
    <GoogleMap
      defaultZoom={8}
      defaultCenter={{ lat: -34.397, lng: 150.644 }}
      zoom={zoom}
      center={center}
    >
      {markers.map((marker, i) => (
        <Marker {...marker} key={i} />
      ))}
    </GoogleMap>
  ))
);

const EditPostPage = ({ history, match, loadAllPostsAction }) => {
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

  const [strLocation, setStrLocation] = useState('');
  const [mapMarkers, setMapMarkers] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // compose the user select source
    Promise.all([
      api.r_loadUserRequest({ page: 0, limit: 0, mode: 'SIMPLE' }),
      api.r_getPostByIdRequest(match.params.id),
    ])
      .then(([usersRes, postRes]) => {
        if (usersRes.status) {
          const userList = usersRes.data.map((user, index) => ({ 
            label: user.user_name,
            value: user.id.toString(),
            key: index
          }));
          setUserSelValues(userList);

          if (postRes.status) {
            setPost(postRes.data);
            const [selValue] = userList.filter(user => user.value === postRes.data.user.id.toString());
            setUser(selValue);
            setGuest(postRes.data.isGuest === 1);
            setActive(postRes.data.active === 1);

            const tPosition = getMapPositionFromString(postRes.data.location_coordinate);
            setMapCenter(tPosition);

            const tMarkers = [
              {
                position: tPosition,
                clickable: true,
                title: transformTime(postRes.data.post_time),
              },
            ];
            setMapMarkers(tMarkers);
            setStrLocation(
              `${postRes.data.location_coordinate}&&${postRes.data.post_time}&&${postRes.data.location_address}`
            );
            const [t] = typeList.filter(type => type.value === postRes.data.type);
            setType(t);
            // set Target Time
            if (postRes.data.target_date) {
              setTimeAdded(true);
              const time = transformTime(postRes.data.target_date);
              setTargetTime(new Date(time));
            }
          }
        }
      });

    return () => {
      return true;
    };
  }, [match]);

  const onUpdatePost = async (values) => {
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

    // console.log(params);

    setLoading(true);
    console.log(post.id, params);
    const res = await api.r_updatePostRequest(post.id, params);

    setLoading(false);

    if (res.status === true) {
      NotificationManager.success(res.message, 'Update Post');
      // loadAllPostsAction();
      history.push('/app/post');
    } else {
      NotificationManager.error(res.message, 'Update Post');
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

  const handleOnChange = (e) => {
    // console.log(e.target.name, e.target.value);
    setPost({ ...post, [e.target.name]: e.target.value });
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
          <h3 className="mb-4">
            <IntlMessages id="pages.post" />
          </h3>
        </Colxx>

        <Formik initialValues={initialValues} onSubmit={onUpdatePost}>
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
                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label>Set Target Time</Label>
                    <Switch
                      className="custom-switch custom-switch-secondary"
                      checked={timeAdded}
                      onChange={(st) => setTimeAdded(st)}
                    />
                  </FormGroup>
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
                    <Label>As Guest</Label>
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

              {/* Map & Location */}
              <Row>
                <Colxx xxs="12">
                  <MapWithAMarker
                    googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBdnoTzHFUFDuI-wEyMiZSqPpsy4k4TYDM&v=3.exp&libraries=geometry,drawing,places"
                    loadingElement={<div className="map-item" />}
                    containerElement={<div className="map-item" />}
                    mapElement={<div className="map-item" />}
                    zoom={10}
                    center={mapCenter}
                    markers={mapMarkers}
                  />

                  <LocationItem strInfo={strLocation} />
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

// eslint-disable-next-line
const mapStateToProps = (state) => {
  return { };
};

export default connect(mapStateToProps, {
  loadAllPostsAction: loadAllPosts,
})(EditPostPage);
