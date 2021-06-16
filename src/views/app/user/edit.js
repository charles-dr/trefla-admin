import React, { useState, useEffect } from 'react';
import {
  Row,
  Label,
  FormGroup,
  Button,
  Nav,
  NavItem,
  TabContent,
  TabPane,
} from 'reactstrap';
import { NavLink } from 'react-router-dom';
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
import classnames from 'classnames';

import { NotificationManager } from '../../../components/common/react-notifications';
import CustomSelectInput from '../../../components/common/CustomSelectInput';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { LocationItem, UserSettings } from '../../../components/custom';
import * as api from '../../../api';

import {
  formatTime,
  getMapPositionFromString,
  transformTime,
  ru_updateUserProfile,
} from '../../../utils';
import { loadAllUsers } from '../../../redux/actions';

const INIT_USER_INFO = {
  active: 1,
  birthday: '1/1/1970',
  card_number: '',
  city: '',
  device_token: '',
  email: '',
  location_address: '',
  location_array: [],
  location_coordinate: '0,0',
  sex: '1',
  user_id: -1,
  user_name: '',
  ban_reason: '',
  ban_reply: '',
};

const genderData = [
  { label: 'Male', value: '0', key: 0 },
  { label: 'Female', value: '1', key: 1 },
];

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

const EditUserPage = ({
  history,
  match,
  loginUserAction,
  updateLoginAction,
  loadAllUsersAction,
}) => {
  let avatarInput = null;
  let cardImgFile = null;

  const [profile, setProfile] = useState(INIT_USER_INFO);
  const [dob, setDob] = useState(new Date());
  const [active, setActive] = useState(true);
  const [avatar, setAvatar] = useState({ mode: 0, path: 0 }); // mode: 0 - avatar, 1 - file
  const [gender, setGender] = useState(genderData[0]);
  const [cardImage, setCardImage] = useState(
    '/assets/img/default/default_national_card.png'
  );

  // map-related statuses
  const [zoom, setZoom] = useState(8);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [mapMarkers, setMapMarkers] = useState([]);

  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.r_getUserByIdRequest(match.params.id)
      .then(({ data: res }) => {
        // console.log(res);
        if (!res) {
          NotificationManager.warning(
            'Error while getting user info!',
            'Edit User'
          );
        } else {
          res.sex = res.sex.toString();
          setProfile(res);
          if (res.birthday) {
            const str_arr = res.birthday.split('/');
            setDob(new Date(Number(str_arr[2]), Number(str_arr[1]) - 1, Number(str_arr[0])));
          }

          // active
          setActive(res.active === 1);

          // gender
          if (res.sex === '1') {
            setGender(genderData[1]);
          } else {
            setGender(genderData[0]);
          }

          // card image
          if (res.card_img_url) {
            setCardImage(res.card_img_url);
          }

          // profile photo
          if (res.photo) {
            setAvatar({ mode: 1, path: res.photo });
          } else if (res.avatarIndex) {
            setAvatar({ mode: 0, path: res.avatarIndex });
          }

          setMapData(res);
        }
      })
      .catch((err) => {
        console.error(err);
        NotificationManager.warning(
          'Error while getting user info!',
          'Edit User'
        );
      });
    return () => {
      return true;
    };
  }, [match]);

  const onUpdateProfile = async (values) => {
    // console.log(profile, avatar, gender, active, dob, cardImage);
    const cardFile = cardImgFile.files[0];
    const avatarFile = avatarInput.files[0];

    const new_profile = composeSubmitData();

    // set loading
    setLoading(true);

    const res = await ru_updateUserProfile(
      new_profile,
      avatar.mode === 1 ? avatarFile : null,
      cardFile
    );

    // cancel the loading
    setLoading(false);
    if (res.status === true) {
      NotificationManager.success(res.message, 'User Update', 3000, null, null, '');
      history.push('/app/user');
    } else {
      NotificationManager.warning(res.message, 'User Update', 3000, null, null, '');
    }
  };

  const composeSubmitData = () => {
    const submit_profile = {};
    for (const key in profile) {
      submit_profile[key] = profile[key];
    }

    // active
    submit_profile.active = active === true ? 1 : 0;
    // dob
    submit_profile.birthday = formatTime(dob, 'm/d/Y');
    // avatar
    if (avatar.mode === 0) {
      submit_profile.avatarIndex = avatar.path;
      submit_profile.photo = '';
    }
    // gender
    submit_profile.sex = Number(gender.value);

    return submit_profile;
  };

  const setMapData = (res) => {
    setZoom(10);
    const tCenter = getMapPositionFromString(res.location_coordinate);

    // set markers
    const tMarkers = [];
    const location_array = res.location_array || [];
    for (const location of location_array) {
      const tArray = location.split('&&');
      const strPoint = tArray[0];
      const position = getMapPositionFromString(strPoint);

      // time
      const time = transformTime(tArray[1]);

      tMarkers.push({
        position,
        clickable: true,
        title: `${time}`,
      });
    }
    setMapMarkers(tMarkers);

    // determine center of the markers
    if (tMarkers.length > 0) {
      let total_x = 0;
      let total_y = 0;
      for (const marker of tMarkers) {
        total_x += marker.position.lat;
        total_y += marker.position.lng;
      }
      tCenter.lat = total_x / tMarkers.length;
      tCenter.lng = total_y / tMarkers.length;
    }

    setMapCenter(tCenter);
  };
  const validateUserName = () => {
    const value = profile.user_name;
    let error;
    if (!value) {
      error = 'Please enter name!';
    }
    return error;
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
  const handleOnCardImgChange = (e) => {
    const file = e.target.files[0];

    // check if selected valid file
    if (file) {
      setCardImage(URL.createObjectURL(file));
      // console.log(cardImgFile.files[0]);
    }
  };
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];

    // check if selected valid file
    if (file) {
      setAvatar({ mode: 1, path: URL.createObjectURL(file) });
    }
  };
  const handleOnClickAvatar = (num) => {
    setAvatar({ mode: 0, path: num });
  };
  const openAvatarSelector = () => {
    avatarInput.click();
  };
  const getAvatarPath = () => {
    if (avatar.mode === 0) {
      return `/assets/avatar/${
        gender && gender.value === '1' ? 'girl' : 'boy'
      }/${avatar.path}.png`;
    }
    return avatar.path || '/assets/avatar/avatar_boy1.png';
  };
  const ProfileForm = () => {
    return (
      <Formik initialValues={initialValues} onSubmit={onUpdateProfile}>
        {({
          // setFieldValue,
          // setFieldTouched,
          errors,
          touched,
          values,
        }) => (
          <Form
            className="av-tooltip tooltip-label-bottom mx-auto"
            style={{ maxWidth: 1024, width: '100%' }}
          >
            <div className="profile-avatar">
              <div className="wrapper">
                <img src={getAvatarPath()} alt="User Profile" />
                <div className="hover-layer">
                  <div
                    className="glyph-icon simple-icon-picture change-avatar two"
                    title="Select from avatars"
                    onClick={openAvatarSelector}
                  />
                  <div
                    className="glyph-icon simple-icon-camera change-avatar two"
                    title="Upload file"
                    onClick={openAvatarSelector}
                  />
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

            <div className="all-avatars mt-1 mb-5">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => (
                <img
                  className={`example-avatar ${
                    avatar.path === num ? 'selected' : ''
                  }`}
                  src={`/assets/avatar/${
                    gender && gender.value === '1' ? 'girl' : 'boy'
                  }/${num}.png`}
                  onClick={() => handleOnClickAvatar(num)}
                  alt={`Example Avatar ${i}`}
                  key={i}
                />
              ))}
            </div>

            {/* name & email */}
            <Row>
              <Colxx xxs="12" md="6">
                <FormGroup className="form-group">
                  <Label>
                    <IntlMessages id="user.name" />
                  </Label>
                  <Field
                    className="form-control"
                    type="text"
                    name="user_name"
                    value={profile.user_name}
                    validate={validateUserName}
                    onChange={handleOnChange}
                  />
                  {errors.user_name && touched.user_name && (
                    <div className="invalid-feedback d-block">
                      {errors.user_name}
                    </div>
                  )}
                </FormGroup>
              </Colxx>

              <Colxx xxs="12" md="6">
                <FormGroup className="form-group">
                  <Label>
                    <IntlMessages id="user.email" />
                  </Label>
                  <Field
                    className="form-control"
                    type="text"
                    name="email"
                    value={profile.email}
                    validate={() => validateRequired('email')}
                    onChange={handleOnChange}
                  />
                  {errors.email && touched.email && (
                    <div className="invalid-feedback d-block">
                      {errors.email}
                    </div>
                  )}
                </FormGroup>
              </Colxx>
            </Row>

            {/* BirthDay & Gender */}
            <Row>
              <Colxx xxs="12" md="6">
                <FormGroup className="form-group">
                  <Label>
                    <IntlMessages id="user.birthday" />
                  </Label>

                  <DatePicker
                    name="birthday"
                    selected={dob}
                    onChange={setDob}
                    placeholderText="Birthday"
                  />
                  {errors.birthday && touched.birthday && (
                    <div className="invalid-feedback d-block">
                      {errors.birthday}
                    </div>
                  )}
                </FormGroup>
              </Colxx>

              <Colxx xxs="12" md="6">
                <label>
                  <IntlMessages id="user.gender" />
                </label>
                <Select
                  components={{ Input: CustomSelectInput }}
                  className="react-select"
                  classNamePrefix="react-select"
                  value={gender}
                  onChange={setGender}
                  options={genderData}
                />
              </Colxx>
            </Row>

            {/* Card Number & Image */}
            <Row>
              <Colxx xxs="12" md="6">
                <FormGroup className="form-group">
                  <Label>
                    <IntlMessages id="user.card-number" />
                  </Label>
                  <Field
                    className="form-control"
                    type="text"
                    name="card_number"
                    value={profile.card_number}
                    // validate={() => validateRequired('card_number')}
                    onChange={handleOnChange}
                  />
                  {errors.card_number && touched.card_number && (
                    <div className="invalid-feedback d-block">
                      {errors.card_number}
                    </div>
                  )}
                </FormGroup>
              </Colxx>

              <Colxx xxs="12" md="6">
                <FormGroup className="form-group">
                  <Label>Card Image</Label>
                  <input
                    className="form-control"
                    type="file"
                    accept="image/*"
                    ref={(input) => {
                      cardImgFile = input;
                    }}
                    onChange={handleOnCardImgChange}
                  />
                  <div className="max-w-300px">
                    <img className="mt-2 w-full" src={cardImage} alt="Card" />
                  </div>
                </FormGroup>
              </Colxx>
            </Row>

            {/* Location & City */}
            <Row>
              {/* Location */}
              <Colxx xxs="12" md="6">
                <FormGroup className="form-group">
                  <Label>
                    <IntlMessages id="user.location" />
                  </Label>
                  <Field
                    className="form-control"
                    type="text"
                    name="location_address"
                    value={profile.location_address}
                    // validate={() => validateRequired('location_address')}
                    onChange={handleOnChange}
                  />
                  {errors.location_address && touched.location_address && (
                    <div className="invalid-feedback d-block">
                      {errors.location_address}
                    </div>
                  )}
                </FormGroup>
              </Colxx>

              {/* City */}
              <Colxx xxs="12" md="6">
                <FormGroup className="form-group">
                  <Label>
                    <IntlMessages id="user.city" />
                  </Label>
                  <Field
                    className="form-control"
                    type="text"
                    name="city"
                    value={profile.city || ''}
                    // validate={() => validateRequired('city')}
                    onChange={handleOnChange}
                  />
                  {errors.city && touched.city && (
                    <div className="invalid-feedback d-block">
                      {errors.city}
                    </div>
                  )}
                </FormGroup>
              </Colxx>
            </Row>

            {/* Bio & Active */}
            <Row>
              <Colxx xxs="12" md="6">
                <FormGroup className="form-group">
                  <Label>
                    <IntlMessages id="user.bio" />
                  </Label>
                  <Field
                    className="form-control"
                    type="text"
                    component="textarea"
                    name="bio"
                    value={profile.bio}
                    onChange={handleOnChange}
                  />
                  {errors.bio && touched.bio && (
                    <div className="invalid-feedback d-block">{errors.bio}</div>
                  )}
                </FormGroup>
              </Colxx>

              {/* Active */}
              <Colxx xxs="12" md="6">
                <FormGroup className="form-group">
                  <Label>
                    <IntlMessages id="user.active" />
                  </Label>
                  <Switch
                    className="custom-switch custom-switch-secondary"
                    checked={active}
                    onChange={(st) => setActive(st)}
                  />
                </FormGroup>
              </Colxx>
            </Row>

            <Row>
              <Colxx xxs="12" md="6">
                <FormGroup className="form-group">
                  <Label>Ban Reason</Label>
                  <Field
                    className="form-control"
                    type="text"
                    component="textarea"
                    name="ban_reason"
                    value={profile.ban_reason}
                    onChange={handleOnChange}
                  />
                  {errors.ban_reason && touched.ban_reason && (
                    <div className="invalid-feedback d-block">
                      {errors.ban_reason}
                    </div>
                  )}
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
    );
  };

  const initialValues = profile;

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.users" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>

      <Row>
        <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.user" />
          </h3>
        </Colxx>
      </Row>

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
            Location History
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            to="#"
            location={{}}
            className={classnames({
              active: activeTab === '3',
              'nav-link': true,
            })}
            onClick={() => {
              setActiveTab('3');
            }}
          >
            User Settings
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">{ProfileForm()}</TabPane>

        <TabPane tabId="2" className="mx-auto" style={{ maxWidth: 1024 }}>
          <Row>
            <Colxx xxs="12" md="12">
              <MapWithAMarker
                googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBdnoTzHFUFDuI-wEyMiZSqPpsy4k4TYDM&v=3.exp&libraries=geometry,drawing,places"
                loadingElement={<div className="map-item" />}
                containerElement={<div className="map-item" />}
                mapElement={<div className="map-item" />}
                zoom={zoom}
                center={mapCenter}
                markers={mapMarkers}
              />
            </Colxx>

            <Colxx xxs="12">
              <div
                className="custom-scrollbar mt-4"
                style={{ maxHeight: '75vh', overflow: 'auto' }}
              >
                {profile &&
                  profile.location_array &&
                  profile.location_array.length > 0 &&
                  profile.location_array.map((location, i) => (
                    <LocationItem strInfo={location} key={i} />
                  ))}
              </div>
            </Colxx>
          </Row>
        </TabPane>

        <TabPane tabId="3">
          <UserSettings className="" profile={profile} />
        </TabPane>
      </TabContent>
    </>
  );
};

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {
  loadAllUsersAction: loadAllUsers,
})(EditUserPage);
