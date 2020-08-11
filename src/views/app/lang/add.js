import React, { createRef, useState, useEffect } from 'react';
import { Row, Card, CardTitle, Label, FormGroup, Button } from 'reactstrap';
import { NavLink, Redirect, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import DropzoneComponent from 'react-dropzone-component';
import 'dropzone/dist/min/dropzone.min.css';
import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';

import { Formik, Form, Field } from 'formik';
import { NotificationManager } from '../../../components/common/react-notifications';

import { login, updateLogin } from '../../../redux/actions';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';

import { loadAllLangs } from '../../../redux/actions';
import { addNewLangRequest, convertTimeToString, getAdminInfo, updateAdminPassword } from '../../../utils';


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

const AddLangPage = ({ history, match, lang_list, loadAllLangsAction, loginUserAction, updateLoginAction }) => {
    let avatarInput = null;

    const [active, setActive] = useState(true);
    const [lang, setLang] = useState({ name: '', code: '', active: true, file: '' });
    const [items, setItems] = useState({});
    const [keys, setKeys] = useState([]);
    const [values, setValues] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        return () => { }
    }, [match]);

    const handleOnSubmit = async (value) => {
        // console.log(value, keys, values);

        // generate new blob
        let lang_data = {};
        for (let i = 0; i < keys.length; i++) {
            lang_data[keys[i]] = values[i];
        }
        const blob = new Blob([JSON.stringify(lang_data)], { type: 'application/json' });

        // compose parameters
        const params = {
            lang_id: getNextLangId(),
            name: value.name,
            code: value.code,
            active: active === true ? 1 : 0,
            blob: blob,
        };

        setLoading(true);

        // send request
        addNewLangRequest(params)
            .then(res => {
                setLoading(false);
                // console.log(res);
                if (res.status === true) {
                    NotificationManager.success(res.message, 'Add Language');
                    loadAllLangsAction();
                    history.push('/app/lang');
                } else {
                    NotificationManager.warning(res.message, 'Add Language');
                }
            })
            .catch(err => {
                setLoading(false);
                console.error(err);
                NotificationManager.warning('Something went wrong!', 'Add Language');
            });
    };
    const getNextLangId = () => {
        if (lang_list.length === 0) {
            return 0;
        }
        let lang_id = -1;
        for (let lang_item of lang_list) {
            lang_id = Math.max(lang_id, lang_item.lang_id);
        }
        return lang_id + 1;
    }

    const validateName = (value) => {
        let error;
        if (!value) {
            error = 'Please enter name';
        }
        return error;
    };
    const validateCode = (value) => {
        let error;
        if (!value) {
            error = 'Please enter code';
        } else if (value.length !== 2) {
            error = 'Value must be 2 characters long!';
        }
        return error;
    };
    const validateFile = () => { }

    const handleOnKeyChange = (e) => {
        const fld_name = e.target.name;
        const arr = fld_name.split('__');
        const index = Number(arr[1]);
        const new_keys = keys.map((key, i) => i === index ? e.target.value : key);
        setKeys(new_keys);
    }
    const handleOnValueChange = (e) => {
        const fld_name = e.target.name;
        const arr = fld_name.split('__');
        const index = Number(arr[1]);
        const new_values = values.map((value, i) => i === index ? e.target.value : value);
        setValues(new_values);
    }
    const handleOnFileChange = (e) => {
        const file = e.target.files[0];

        //ignore the cancel, same file
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function () {
            const text = reader.result;
            // console.log(JSON.parse(text));
            try {
                const json = JSON.parse(text);
                let t_keys = [], t_values = [];
                Object.keys(json).map((key, i) => {
                    t_keys.push(key);
                    t_values.push(json[key]);
                });
                setKeys(t_keys);
                setValues(t_values);
                // setItems(JSON.parse(text));
            } catch (e) {
                setItems({});
            }
        }
        reader.readAsText(file);
    }

    const initialValues = lang;

    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb heading="menu.languages" match={match} />
                    <Separator className="mb-5" />
                </Colxx>
            </Row>

            <Row >

                <Colxx xxs="12">
                    <h3 className="mb-4">
                        <IntlMessages id="pages.language" />
                    </h3>
                </Colxx>


                <Formik initialValues={initialValues} onSubmit={handleOnSubmit}>
                    {({ errors, touched }) => (
                        <Form className="av-tooltip tooltip-label-bottom mx-auto" style={{ maxWidth: 1024, width: '100%', padding: 15 }}>
                            <Row>
                                <Colxx xxs="12" md="6">
                                    <FormGroup className="form-group">
                                        <Label>
                                            <IntlMessages id="user.name" />
                                        </Label>
                                        <Field
                                            className="form-control"
                                            type="text"
                                            name="name"
                                            validate={validateName}
                                        />
                                        {errors.name && touched.name && (
                                            <div className="invalid-feedback d-block">
                                                {errors.name}
                                            </div>
                                        )}
                                    </FormGroup>
                                </Colxx>
                                <Colxx xxs="12" md="6">
                                    <FormGroup className="form-group">
                                        <Label>
                                            <IntlMessages id="user.code" />
                                        </Label>
                                        <Field
                                            className="form-control"
                                            type="text"
                                            name="code"
                                            validate={validateCode}
                                        />
                                        {errors.code && touched.code && (
                                            <div className="invalid-feedback d-block">
                                                {errors.code}
                                            </div>
                                        )}
                                    </FormGroup>
                                </Colxx>
                            </Row>
                            <Row>
                                <Colxx xxs="12" md="6">
                                    <FormGroup className="form-group">
                                        <Label>
                                            <IntlMessages id="user.lang-file" />
                                        </Label>
                                        <Field
                                            className="form-control"
                                            type="file"
                                            name="file"
                                            validate={validateFile}
                                            accept="application/JSON"
                                            onChange={handleOnFileChange}
                                        />
                                        {errors.file && touched.file && (
                                            <div className="invalid-feedback d-block">
                                                {errors.file}
                                            </div>
                                        )}
                                    </FormGroup>
                                </Colxx>
                                <Colxx xxs="12" md="6">
                                    <label>
                                        <IntlMessages id="user.active" />
                                    </label>
                                    <Switch
                                        className="custom-switch custom-switch-secondary"
                                        checked={active}
                                        onChange={(secondary) => setActive(secondary)}
                                    />
                                </Colxx>
                            </Row>

                            {
                                Object.keys(keys).map((key, i) => (
                                    <Row key={i} className="mt-3">
                                        <Colxx xxs="12" md="5">
                                            <Field
                                                className="form-control"
                                                type="text"
                                                value={keys[i]}
                                                name={`key__${i}`}
                                                onChange={handleOnKeyChange}

                                            />
                                        </Colxx>
                                        <Colxx xxs="12" md="7">
                                            <Field
                                                className="form-control"
                                                type="text"
                                                value={values[i]}
                                                name={`value__${i}`}
                                                onChange={handleOnValueChange}
                                            />
                                        </Colxx>
                                    </Row>
                                ))
                            }

                            <div className="d-flex justify-content-end align-items-center mt-3">
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

            </Row>
        </>
    );
};

const mapStateToProps = ({ langs: langApp }) => {
    const { list: lang_list } = langApp;
    return { lang_list };
};

export default connect(mapStateToProps, {
    loadAllLangsAction: loadAllLangs,
    loginUserAction: login,
    updateLoginAction: updateLogin
})(AddLangPage);
