import React, { createRef, useState, useEffect } from 'react';
import { Row, Card, CardTitle, Label, FormGroup, Button, Nav, NavItem, TabContent, TabPane } from 'reactstrap';
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
import { LocationItem, UserSettings } from '../../../components/custom';

import { formatTime, getMapPositionFromString, getUserByIdRequest, transformTime, addNewUserRequest } from '../../../utils';
import { loadAllUsers } from '../../../redux/actions';


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
    active: 1, birthday: '1/1/1970', card_number: '', city: '', email: '', sex: '1', user_id: -1, user_name: '', bio: '', password: '', cpassword: '',
};

const genderData = [
    { label: 'Male', value: '0', key: 0 },
    { label: 'Female', value: '1', key: 1 },
];


const EditUserPage = ({ history, match, user_list, loadAllUsersAction }) => {
    let avatarInput = null;
    let cardImgFile = null;

    const [profile, setProfile] = useState(INIT_USER_INFO);
    const [dob, setDob] = useState(new Date());
    const [active, setActive] = useState(false);
    const [avatar, setAvatar] = useState({ mode: 0, path: 0 }); // mode: 0 - avatar, 1 - file
    const [gender, setGender] = useState(genderData[0]);
    const [cardImage, setCardImage] = useState('/assets/img/default/default_national_card.png');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        return () => { return true; }
    }, [match]);

    const onUpdateProfile = async (values) => {
        // console.log(profile, avatar, gender, active, dob, cardImage);
        const cardFile = cardImgFile.files[0];
        const avatarFile = avatarInput.files[0];

        // console.log(getUserNewId());return;
        const new_profile = composeSubmitData();
        // console.log(new_profile, avatar.mode === 1 ? avatarInput.files[0] : null, cardImgFile.files[0]);
        // return;

        // set loading
        setLoading(true);

        // console.log(cardImgFile, !!cardImgFile);
        const res = await addNewUserRequest({...new_profile, user_id: getUserNewId()}, avatar.mode === 1 ? avatarFile : null);
        // cancel the loading
        setLoading(false);
        if (res.status === true) {
            NotificationManager.success(res.message, 'Add User', 3000, null, null, '');
            // init form
            // setProfile({ old_pass: '', password: '', cpassword: '' });
            loadAllUsersAction();
            history.push('/app/user');
        } else {
            NotificationManager.warning(res.message, 'Add User', 3000, null, null, '');
        }
    };

    const composeSubmitData = () => {
        let submit_profile = {};
        for (let key in profile) {
            submit_profile[key] = profile[key];
        }

        // active
        submit_profile.active = active === true ? 1 : 0;
        // dob
        submit_profile.birthday = formatTime(dob, 'm/d/Y');
        // avatar
        if (avatar.mode === 0) {
            submit_profile.avatarIndex = avatar.path;
        }
        // gender
        submit_profile.sex = gender.value;

        return submit_profile;
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
            // console.log(cardImgFile.files[0]);
        }
    }
    const handleAvatarSelect = (e) => {
        const file = e.target.files[0];

        // check if selected valid file
        if (!!file) {
            setAvatar({ mode: 1, path: URL.createObjectURL(file) });
        }
    }
    const handleOnClickAvatar = (num) => {
        setAvatar({ mode: 0, path: num });
    }
    const openAvatarSelector = () => {
        avatarInput.click();
    }
    const getAvatarPath = () => {
        if (avatar.mode === 0) {
            return `/assets/avatar/${gender && gender.value === '1' ? 'girl' : 'boy'}/${avatar.path}.png`;
        } else {
            return avatar.path || '/assets/avatar/avatar_boy1.png';
        }
    }
    const getUserNewId = () => {
        let newId = -1;
        for (let user of user_list) {
            newId = user.user_id > newId ? user.user_id : newId;
        }
        return newId + 1;
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

                <Formik initialValues={initialValues} onSubmit={onUpdateProfile}>
                    {({
                        errors, touched, values }) => (
                            <Form className="av-tooltip tooltip-label-bottom mx-auto" style={{ maxWidth: 1024, width: '100%' }}>

                                <div className="profile-avatar">
                                    <div className="wrapper">
                                        <img src={getAvatarPath()} alt="User Profile" />
                                        <div className="hover-layer">
                                            <div
                                                className="glyph-icon simple-icon-picture change-avatar two"
                                                title="Select from avatars"
                                                onClick={openAvatarSelector}></div>
                                            <div
                                                className="glyph-icon simple-icon-camera change-avatar two"
                                                title="Upload file"
                                                onClick={openAvatarSelector}></div>
                                        </div>
                                    </div>
                                    <input type="file" className="hidden-file"
                                        ref={input => { avatarInput = input }}
                                        onChange={handleAvatarSelect}
                                        accept="image/*" />
                                </div>

                                <div className="all-avatars mt-1 mb-5">
                                    {
                                        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => (
                                            <img
                                                className={`example-avatar ${avatar.path === num ? 'selected' : ''}`}
                                                src={`/assets/avatar/${gender && gender.value === '1' ? 'girl' : 'boy'}/${num}.png`}
                                                onClick={() => handleOnClickAvatar(num)}
                                                alt={`Example Avatar ${i}`}
                                                key={i} />
                                        ))
                                    }
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

                                {/* password & cpassword */}
                                <Row>
                                    <Colxx xxs="12" md="6">
                                        <FormGroup className="form-group">
                                            <Label>
                                                <IntlMessages id="user.password" />
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
                                    </Colxx>

                                    <Colxx xxs="12" md="6">
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
            </Row>
        </>
    );
};


const mapStateToProps = ({ users: userApp }) => {
    const { list: user_list } = userApp;
    return {user_list};
};

export default connect(mapStateToProps, {
    loadAllUsersAction: loadAllUsers,
})(EditUserPage);
