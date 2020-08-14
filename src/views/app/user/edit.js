import React, { createRef, useState, useEffect } from 'react';
import { Row, Card, CardTitle, Label, FormGroup, Button, Nav, NavItem, TabContent, TabPane, } from 'reactstrap';
import { NavLink, Redirect, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';
import Select from 'react-select';
import { Formik, Form, Field, } from 'formik';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import classnames from 'classnames';


import { AvRadioGroup, AvRadio } from 'availity-reactstrap-validation';
import { NotificationManager } from '../../../components/common/react-notifications';

import {
    FormikCustomRadioGroup,
} from '../../../containers/form-validations/FormikFields';
import CustomSelectInput from '../../../components/common/CustomSelectInput';
import { login, updateLogin } from '../../../redux/actions';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import LocationItem from '../../../components/custom/LocationItem';

import { getMapPositionFromString, getUserByIdRequest, transformTime, updateAdminPassword } from '../../../utils';


const validateEmail = (value) => {
    let error;
    if (!value) {
        error = 'Please enter your email address';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
        error = 'Invalid email address';
    }
    return error;
};

const validateName = (value) => {
    let error;
    if (!value) {
        error = 'Please enter name';
    } else if (value.length < 4) {
        error = 'Value must be longer than 3 characters';
    }
    return error;
};

const INIT_USER_INFO = {
    active: 1, birthday: '1/1/1970', card_number: '', city: '', device_token: '', email: '', location_address: '', location_array: [],
    location_coordinate: '0,0', sex: '1', user_id: -1, user_name: '',
};

const genderData = [
    { label: 'Male', value: '0', key: 0 },
    { label: 'Female', value: '1', key: 1 },
];


const MapWithAMarker = withScriptjs(
    withGoogleMap(({ zoom, center, markers }) => (
        <GoogleMap defaultZoom={8} defaultCenter={{ lat: -34.397, lng: 150.644 }}
            zoom={zoom}
            center={center}>
            {
                markers.map((marker, i) => (
                    <Marker {...marker} key={i} />
                ))
            }
        </GoogleMap>
    ))
);

const EditUserPage = ({ history, match, loginUserAction, updateLoginAction }) => {
    let cardImgFile = null;

    const [profile, setProfile] = useState(INIT_USER_INFO);
    const [dob, setDob] = useState(new Date());
    const [active, setActive] = useState(true);
    const [gender, setGender] = useState(genderData[0]);
    const [cardImage, setCardImage] = useState('/assets/img/default/default_national_card.png');

    // map-related statuses
    const [zoom, setZoom] = useState(8);
    const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
    const [mapMarkers, setMapMarkers] = useState([]);

    const [activeTab, setActiveTab] = useState('1');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getUserByIdRequest(match.params.id)
            .then(res => {
                console.log(res);
                if (!res) {
                    NotificationManager.warning('Error while getting user info!', 'Edit User');
                } else {
                    setProfile(res);
                    if (!!res.birthday) {
                        setDob(new Date(res.birthday));
                    }
                    if (res.sex === '1') {
                        setGender(genderData[1]);
                    } else {
                        setGender(genderData[0]);
                    }

                    if (!!res.card_img_url) {
                        setCardImage(res.card_img_url);
                    }
                    setMapData(res);
                }
            })
            .catch(err => {
                console.error(err);
                NotificationManager.warning('Error while getting user info!', 'Edit User');
            });
        return () => { return true; }
    }, [match]);

    const onUpdateProfile = async (values) => {

        // set loading
        setLoading(true);
        const res = await updateAdminPassword(profile);

        // cancel the loading
        setLoading(false);
        if (res.status === true) {
            NotificationManager.success(res.message, 'Password Update', 3000, null, null, '');
            // init form
            setProfile({ old_pass: '', password: '', cpassword: '' });
        } else {
            NotificationManager.warning(res.message, 'Password Update', 3000, null, null, '');
        }
    };


    const setMapData = (res) => {
        setZoom(10);
        let tCenter = getMapPositionFromString(res.location_coordinate);

        //set markers
        let tMarkers = [];

        for (let location of res.location_array) {
            let tArray = location.split('&&');
            let strPoint = tArray[0];
            let position = getMapPositionFromString(strPoint);

            // time
            const time = transformTime(tArray[1]);


            tMarkers.push({
                position: position,
                clickable: true,
                title: `${time}`
            });
        }
        setMapMarkers(tMarkers);

        // determine center of the markers
        if (tMarkers.length > 0) {
            let total_x = 0, total_y = 0;
            for (let marker of tMarkers) {
                total_x += marker.position.lat;
                total_y += marker.position.lng;
            }
            tCenter.lat = total_x / tMarkers.length;
            tCenter.lng = total_y / tMarkers.length;
        }

        setMapCenter(tCenter);
    }
    const validateUserName = () => {
        const value = profile.user_name;
        let error;
        if (!value) {
            error = 'Please enter name!';
        }
        return error;
    }
    const validateRequired = (name) => {
        const value = profile[name];
        let error;
        if (!value) {
            error = 'This field is required!'
        }
        return error;
    }
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
    }
    const handleOnChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    }
    const handleOnCardImgChange = (e) => {
        const file = e.target.files[0];

        // check if selected valid file
        if (!!file) {
            setCardImage(URL.createObjectURL(file));
            console.log(cardImgFile.files[0]);
        }
    }
    // const setGender = (e) => {
    //     console.log(e);
    //     setProfile({...profile, sex: e.value});
    // }
    const setFieldValue = (e) => {
        console.log(e);
    }
    const setFieldTouched = (e) => {
        console.log(e);
    }
    const ProfileForm = () => {
        return (
            <Formik initialValues={initialValues} onSubmit={onUpdateProfile}>
                {({
                    // setFieldValue, 
                    // setFieldTouched, 
                    errors, touched, values }) => (
                        <Form className="av-tooltip tooltip-label-bottom mx-auto" style={{ maxWidth: 1024, width: '100%' }}>

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
                                            placeholderText='Birthday'
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
                                            validate={() => validateRequired('card_number')}
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
                                        <Label>
                                            Card Image
                                        </Label>
                                        <input
                                            className="form-control"
                                            type="file"
                                            accept="image/*"
                                            ref={input => { cardImgFile = input }}
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
                                            validate={() => validateRequired('location_address')}
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
                                            value={profile.city}
                                            validate={() => validateRequired('city')}
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
                                            <div className="invalid-feedback d-block">
                                                {errors.bio}
                                            </div>
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
    }

    const initialValues = profile;

    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb heading="menu.users" match={match} />
                    <Separator className="mb-5" />
                </Colxx>
            </Row>

            <Row >
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
                <TabPane tabId="1">
                    {ProfileForm()}
                </TabPane>

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
                            <div className="custom-scrollbar mt-4" style={{maxHeight: '75vh', overflow: 'auto'}}>
                            {
                                profile && profile.location_array && profile.location_array.length > 0 && profile.location_array.map((location, i) => (
                                    <LocationItem strInfo={location} key={i} />
                                ))
                            }
                            </div>
                        </Colxx>
                    </Row>
                </TabPane>

                <TabPane tabId="3">
                    <Row>
                        <Colxx xxs="12" md="6">

                        </Colxx>
                        <Colxx xxs="12" md="6">
                            
                        </Colxx>
                    </Row>
                </TabPane>
            </TabContent>

        </>
    );
};


const mapStateToProps = (state) => {
    return {};
};

export default connect(mapStateToProps, {
    loginUserAction: login,
    updateLoginAction: updateLogin
})(EditUserPage);
