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

import * as api from '../../../api';

const initConfig = {
  lang_version: '',
  admin_email: '',
  default_zone: '',
  apply_default_zone: 0,
  android_version: '',
  android_link: '',
  apple_version: '',
  apple_link: '',
  enable_top_music: 0,
  defaultAroundRadius: 0,
  defaultUserRadiusAround: 0,
};

const ConfigPage = ({
  history,
  match,
  loginUserAction,
  updateLoginAction,
}) => {
  const [config, setConfig] = useState(initConfig);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    loadConfigData();

    return () => {};
  }, [match]);
  const onUpdateConfig = async (values) => {
    if (loading) return;
    // set loading
    setLoading(true);
    const res = await api.r_updateAdminConfigRequest(config);

    // unset loading
    setLoading(false);
    if (res.status === true) {
      NotificationManager.success(res.message, 'Config');
    } else {
      NotificationManager.warning(res.message, 'Config');
    }
  };

  const loadConfigData = () => {
    api.r_loadAdminConfigRequest()
      .then(({ status, message, data }) => {
        if (!status) {
          NotificationManager.warning(message, 'Config');
        } else {
          setConfig(data);
        }
      })
      .catch((err) => {
        console.log(err);
        NotificationManager.warning('Failed to get config info', 'Config');
      });
  };

  const validateLangVersion = () => {
    const value = config.lang_version;
    let error;
    if (!value) {
      error = 'Language version is required!';
    }
    return error;
  };

  const handleOnChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const initialValues = config;
  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.config" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>

      <Row>
        {/* <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.config" />
          </h3>
        </Colxx> */}

        <Formik initialValues={initialValues} onSubmit={onUpdateConfig}>
          {({ errors, touched }) => (
            <Form
              className="av-tooltip tooltip-label-bottom mx-auto"
              style={{ maxWidth: 1024, width: '100%' }}
            >
              <h3 className="mb-4">Versions</h3>
              <Row>
                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label>
                      <IntlMessages id="config.lang-version" />
                    </Label>
                    <Field
                      className="form-control"
                      type="text"
                      name="lang_version"
                      value={config.lang_version}
                      validate={validateLangVersion}
                      onChange={handleOnChange}
                    />
                    {errors.lang_version && touched.lang_version && (
                      <div className="invalid-feedback d-block">
                        {errors.lang_version}
                      </div>
                    )}
                  </FormGroup>
                </Colxx>
              </Row>
              
              <Row>
                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label>Android Version</Label>
                    <Field
                      className="form-control"
                      type="text"
                      name="android_version"
                      value={config.android_version}
                      onChange={handleOnChange}
                    />
                    {errors.android_version && touched.android_version && (
                      <div className="invalid-feedback d-block">
                        {errors.android_version}
                      </div>
                    )}
                  </FormGroup>
                </Colxx>
                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label>Android Link</Label>
                    <Field
                      className="form-control"
                      type="text"
                      name="android_link"
                      value={config.android_link}
                      onChange={handleOnChange}
                    />
                    {errors.android_link && touched.android_link && (
                      <div className="invalid-feedback d-block">
                        {errors.android_link}
                      </div>
                    )}
                  </FormGroup>
                </Colxx>
              </Row>

              <Row>
                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label>Apple Version</Label>
                    <Field
                      className="form-control"
                      type="text"
                      name="apple_version"
                      value={config.apple_version}
                      onChange={handleOnChange}
                    />
                    {errors.apple_version && touched.apple_version && (
                      <div className="invalid-feedback d-block">
                        {errors.apple_version}
                      </div>
                    )}
                  </FormGroup>
                </Colxx>
                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label>Apple Link</Label>
                    <Field
                      className="form-control"
                      type="text"
                      name="apple_link"
                      value={config.apple_link}
                      onChange={handleOnChange}
                    />
                    {errors.apple_link && touched.apple_link && (
                      <div className="invalid-feedback d-block">
                        {errors.apple_link}
                      </div>
                    )}
                  </FormGroup>
                </Colxx>
              </Row>

              <hr/>

              <h3 className="mb-4">Default Settings</h3>
              <Row>
                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label>
                      Admin Email(Notification)
                    </Label>
                    <Field
                      className="form-control"
                      type="email"
                      name="admin_email"
                      value={config.admin_email}
                      validate={validateLangVersion}
                      onChange={handleOnChange}
                    />
                    {errors.admin_email && touched.admin_email && (
                      <div className="invalid-feedback d-block">
                        {errors.admin_email}
                      </div>
                    )}
                  </FormGroup>
                </Colxx>
              </Row>

              <Row>
                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label>
                      Default Zone
                    </Label>
                    <Field
                      className="form-control"
                      type="text"
                      name="default_zone"
                      value={config.default_zone}
                      onChange={handleOnChange}
                    />
                  </FormGroup>
                </Colxx>

                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label>
                      Apply Default Zone
                    </Label>
                    <Switch
                      className="custom-switch custom-switch-secondary"
                      checked={config.apply_default_zone === 1}
                      onChange={(st) => setConfig({ ...config, apply_default_zone: st === true ? 1 : 0 })}
                    />
                  </FormGroup>
                </Colxx>
              </Row>
              
              <Row>
                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label>Default Around Radius</Label>
                    <Field
                      className="form-control"
                      type="text"
                      name="defaultAroundRadius"
                      value={config.defaultAroundRadius || 1000}
                      onChange={handleOnChange}
                    />
                    {errors.defaultAroundRadius && touched.defaultAroundRadius && (
                      <div className="invalid-feedback d-block">
                        {errors.defaultAroundRadius}
                      </div>
                    )}
                  </FormGroup>
                </Colxx>
                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label>Default User Around Radius</Label>
                    <Field
                      className="form-control"
                      type="text"
                      name="defaultUserRadiusAround"
                      value={config.defaultUserRadiusAround || 1000}
                      onChange={handleOnChange}
                    />
                    {errors.defaultUserRadiusAround && touched.defaultUserRadiusAround && (
                      <div className="invalid-feedback d-block">
                        {errors.defaultUserRadiusAround}
                      </div>
                    )}
                  </FormGroup>
                </Colxx>
              </Row>

              <Row>
                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                      <Label>
                        Enable Top Music
                      </Label>
                      <Switch
                        className="custom-switch custom-switch-secondary"
                        checked={config.enable_top_music === 1}
                        onChange={(st) => setConfig({ ...config, enable_top_music: st === true ? 1 : 0 })}
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
                    <span className="glyph-icon iconsminds-disk" />
                    <IntlMessages id="user.save" />
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

const mapStateToProps = (state) => {
  return {};
};
export default connect(mapStateToProps, {
  loginUserAction: login,
  updateLoginAction: updateLogin,
})(ConfigPage);
