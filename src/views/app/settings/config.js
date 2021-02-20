import React, { useState, useEffect } from 'react';
import { Row, Label, FormGroup, Button } from 'reactstrap';
import { connect } from 'react-redux';

import { Formik, Form, Field } from 'formik';
import { NotificationManager } from '../../../components/common/react-notifications';

import { login, updateLogin } from '../../../redux/actions';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';

import * as api from '../../../api';

import { getConfigRequest, updateConfigRequest } from '../../../utils';

const ConfigPage = ({
  history,
  match,
  loginUserAction,
  updateLoginAction,
}) => {
  const [config, setConfig] = useState({ lang_version: '', admin_email: '' });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    loadConfigData();

    return () => {};
  }, [match]);
  const onUpdateProfile = async (values) => {
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
        <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.config" />
          </h3>
        </Colxx>

        <Formik initialValues={initialValues} onSubmit={onUpdateProfile}>
          {({ errors, touched }) => (
            <Form
              className="av-tooltip tooltip-label-bottom mx-auto"
              style={{ maxWidth: 1024, width: '100%' }}
            >
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
