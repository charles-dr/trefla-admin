import React, { useState, useEffect } from 'react';
import { Row, Label, FormGroup, Button } from 'reactstrap';
// import { NavLink, Redirect, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import { Formik, Form, Field } from 'formik';
import ReactQuill from 'react-quill';

import { NotificationManager } from '../../../components/common/react-notifications';

import { login, updateLogin } from '../../../redux/actions';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';

import { getEmailTemplateByIdRequest, updateEmailTemplateRequest } from '../../../utils';
import { loadAllEmailTemplateAction } from '../../../redux/actions';

import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';


const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],
    ['link', 'image'],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  "font",
  "size",
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
];


const EmailTemplatePage = ({
  history,
  match,
  loadAllEmailTemplateAction$,
}) => {
  const [templ, setTempl] = useState({ id: match.params.id, subject: '', body: '', usage: '' });
  const [templBody, setTemplBody] = useState('');

  const [profile, setProfile] = useState({
    old_pass: '',
    password: '',
    cpassword: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getEmailTemplateByIdRequest(match.params.id)
      .then(res => {
        // console.log(res);
        if (res === false) {
          NotificationManager.error('Error occurred while fetching template data!', 'Email Template');
        } else {
          setTempl(res);
          setTemplBody(res.body);
        }
      });
    return () => { };
  }, [match]);

  const onUpdateTemplate = async () => {
    const templ_new = {...templ, body: templBody};

    // set loading
    setLoading(true);
    const res = await updateEmailTemplateRequest(templ_new);
    // cancel the loading
    setLoading(false);
    if (res.status === true) {
      NotificationManager.success(
        res.message,
        'Email Template'
      );
      loadAllEmailTemplateAction$();
      history.push('/app/settings/email-templates');
    } else {
      NotificationManager.warning(
        res.message,
        'Email Template',
        3000,
        null,
        null,
        ''
      );
    }
  };

  const initialValues = templ;

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.email-template" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>

      <Row>
        <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.email-template" />
          </h3>
        </Colxx>

        <Formik initialValues={initialValues} onSubmit={onUpdateTemplate}>
          {({ errors, touched }) => (
            <Form
              className="av-tooltip tooltip-label-bottom mx-auto"
              style={{ maxWidth: 768, width: '100%' }}
            >
              <FormGroup className="form-group">
                <Label>
                  Email Subject
                </Label>
                <Field
                  className="form-control"
                  type="text"
                  name="subject"
                  value={templ.subject}
                  onChange={(e) => setTempl({ ...templ, subject: e.target.value })}
                />
                {errors.templ && touched.templ && (
                  <div className="invalid-feedback d-block">
                    {errors.templ}
                  </div>
                )}
              </FormGroup>

              <FormGroup className="form-group">
                <Label>
                  Usage
                </Label>
                <Field
                  className="form-control"
                  type="text"
                  name="usage"
                  value={templ.usage}
                  onChange={(e) => setTempl({ ...templ, usage: e.target.value })}
                />
                {errors.usage && touched.usage && (
                  <div className="invalid-feedback d-block">
                    {errors.usage}
                  </div>
                )}
              </FormGroup>

              <FormGroup className="form-group">
                <Label>
                  Email Body
                </Label>
                <ReactQuill

                  theme="snow"
                  value={templBody}
                  onChange={setTemplBody}
                  modules={quillModules}
                  formats={quillFormats}
                />
              </FormGroup>
              <div className="d-flex justify-content-end align-items-center">
                <Button
                  type="submit"
                  color="primary"
                  className={`btn-shadow btn-multiple-state ${loading ? 'show-spinner' : ''
                    }`}
                  size="lg"
                  // onClick={onUpdateTemplate}
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

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {
  loadAllEmailTemplateAction$: loadAllEmailTemplateAction,
})(EmailTemplatePage);
