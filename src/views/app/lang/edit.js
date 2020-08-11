import React, { useState, useEffect } from 'react';
import { Row, Label, FormGroup, Button } from 'reactstrap';
import { connect } from 'react-redux';

import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';

import { Formik, Form, Field } from 'formik';
import { NotificationManager } from '../../../components/common/react-notifications';

import { login, updateLogin } from '../../../redux/actions';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';

import { loadAllLangs } from '../../../redux/actions';
import { addNewLangRequest, getLangInfoByIdRequest, getLangFileContentRequest } from '../../../utils';


const EditLangPage = ({ history, match, lang_list, loadAllLangsAction, loginUserAction, updateLoginAction }) => {
    const [active, setActive] = useState(true);
    const [lang, setLang] = useState({ name: '', code: '', active: true, file: '' });
    const [keys, setKeys] = useState([]);
    const [values, setValues] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getLangInfoByIdRequest(match.params.id)
            .then(res => {
                // console.log(res);
                setLang({ ...lang, name: res.name, code: res.code });
                setActive(res.active === 1);
                // load file
                getLangFileContentRequest(res.code)
                    .then(json => {
                        initKeyValues(json);
                    })
                    .catch(err => {
                        console.error(err);
                    });
            })
            .catch(err => {
                console.error(err);
                NotificationManager.warning('Error while loading language info!', 'Update Language');
            });

        return () => {
            setLang([]);
        }
    }, [match]);

    const handleOnSubmit = async (value) => {
        // console.log(value, keys, values);
        let lang_data = {};
        for (let i = 0; i < keys.length; i++) {
            lang_data[keys[i]] = values[i];
        }
        const blob = new Blob([JSON.stringify(lang_data)], { type: 'application/json' })

        const params = {
            lang_id: match.params.id,
            name: lang.name,
            code: lang.code,
            active: active === true ? 1 : 0,
            blob: blob,
        };

        setLoading(true);
        addNewLangRequest(params)
            .then(res => {
                setLoading(false);
                console.log(res);
                if (res.status === true) {
                    NotificationManager.success(res.message, 'Update Language');
                    loadAllLangsAction();
                    history.push('/app/lang');
                } else {
                    NotificationManager.warning(res.message, 'Update Language')
                }
            })
            .catch(err => {
                setLoading(false);
                console.error(err);
                NotificationManager.warning('Something went wrong!', 'Update Language');
            })
    };

    const validateName = () => {
        let error;
        if (!lang.name) {
            error = 'Please enter name';
        }
        return error;
    };
    const validateCode = () => {
        let error;
        if (!lang.code) {
            error = 'Please enter code';
        } else if (lang.code.length !== 2) {
            error = 'Value must be 2 characters long!';
        }
        return error;
    };
    const validateFile = () => { }

    const handleOnChange = (e) => {
        setLang({ ...lang, [e.target.name]: e.target.value });
    }
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
                initKeyValues(json);
            } catch (e) {
                setKeys([]);
                setValues([]);
            }
        }
        reader.readAsText(file);
    }

    const initKeyValues = (json) => {
        let t_keys = [], t_values = [];
        Object.keys(json).map((key, i) => {
            t_keys.push(key);
            t_values.push(json[key]);
        });
        setKeys(t_keys);
        setValues(t_values);
    }
    const deleteLangItem = (key_index) => {
        const new_keys = keys.filter((key, i) => i !== key_index);
        const new_values = values.filter((value, i) => i !== key_index);
        setKeys(new_keys);
        setValues(new_values);
    }
    const addNewField = () => {
        const new_keys = keys.map(key => key); new_keys.push('New Field');
        const new_values = values.map(value => value); new_values.push('');
        setKeys(new_keys);
        setValues(new_values);
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
                                            value={lang.name}
                                            onChange={handleOnChange}
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
                                            value={lang.code}
                                            onChange={handleOnChange}
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
                                            <div className="d-flex">
                                                <Button
                                                    type="button"
                                                    color="info"
                                                    className={`default btn btn-info mb-1 mr-1`}
                                                    size="md"
                                                    onClick={() => deleteLangItem(i)}
                                                >
                                                    <div className="glyph-icon simple-icon-minus"></div>
                                                </Button>
                                                <Field
                                                    className="form-control mb-1"
                                                    type="text"
                                                    value={keys[i]}
                                                    name={`key__${i}`}
                                                    onChange={handleOnKeyChange}

                                                />
                                            </div>
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
                                    type="button"
                                    color="secondary"
                                    className={`btn-shadow btn-multiple-state mr-2`}
                                    size="lg"
                                    onClick={addNewField}
                                >
                                    <span className="glyph-icon simple-icon-plus mr-1"></span>
                                    <span className="label">
                                        <IntlMessages id="user.add-new-fld" />
                                    </span>
                                </Button>
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

const mapStateToProps = ({ langs: langApp }) => {
    const { list: lang_list } = langApp;
    return { lang_list };
};

export default connect(mapStateToProps, {
    loadAllLangsAction: loadAllLangs,
    loginUserAction: login,
    updateLoginAction: updateLogin
})(EditLangPage);