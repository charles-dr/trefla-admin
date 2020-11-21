import React, { useState, useEffect } from 'react';
import { Row, Label, FormGroup, Button } from 'reactstrap';
import { connect } from 'react-redux';

import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';
import Select from 'react-select';
import { Formik, Form, Field } from 'formik';

import { NotificationManager } from '../../../components/common/react-notifications';
import CustomSelectInput from '../../../components/common/CustomSelectInput';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';

import { getCommentByIdRequest, updateCommentRequest } from '../../../utils';
import { loadAllPosts } from '../../../redux/actions';
import * as api from '../../../api';

const INIT_COMMENT_INFO = {
  active: 1,
  comment: '',
  id: -1,
  isGuest: false,
  like_1_num: 0,
  like_2_num: 0,
  like_3_num: 0,
  like_4_num: 0,
  like_5_num: 0,
  like_6_num: 0,
  target_id: -1,
  time: new Date().toLocaleString(),
  type: 'POST',
  user_id: -1,
};

const EditCommentPage = ({ history, match, loadAllPostsAction }) => {
  const [comment, setComment] = useState(INIT_COMMENT_INFO);
  const [userSelValues, setUserSelValues] = useState([]);
  const [user, setUser] = useState(
    userSelValues.length > 0 ? userSelValues[0] : {}
  );
  const [guest, setGuest] = useState(false);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.r_loadUserRequest({ page: 0, limit: 0, type: 'SIMPLE' }),
      api.r_getCommentByIdRequest(match.params.id),
    ])
      .then(([usersRes, commentRes]) => {        
        if (usersRes.status) {
          const userList = usersRes.data.map((user, index) => ({ 
            label: user.user_name,
            value: user.id.toString(),
            key: index
          }));
          setUserSelValues(userList);

          if (commentRes.status) {
            setComment(commentRes.data);
            const [selValue] = userList.filter(user => user.value === commentRes.data.id.toString());
            setUser(selValue);
            setGuest(commentRes.data.isGuest);
            setActive(commentRes.data.active === 1);
          }
        }
      });

    return () => {
      return true;
    };
  }, [match]);

  const onUpdateComment = async (values) => {
    // copy post
    const params = {};
    for (const key in comment) {
      params[key] = comment[key];
    }

    params.isGuest = guest;
    params.active = active === true ? 1 : 0;
    params.user_id = Number(user.value);

    // console.log(params); return ;

    setLoading(true);

    const res = await api.r_updateCommentRequest(params);

    setLoading(false);

    if (res.status === true) {
      NotificationManager.success(res.message, 'Update Comment');
      // loadAllPostsAction();
      history.push('/app/comment');
    } else {
      NotificationManager.error(res.message, 'Update Comment');
    }
  };

  const validateRequired = (name) => {
    const value = comment[name];
    let error;
    if (!value) {
      error = 'This field is required!';
    }
    return error;
  };

  const handleOnChange = (e) => {
    setComment({ ...comment, [e.target.name]: e.target.value });
  };

  const initialValues = comment;

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.comments" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>

      <Row>
        <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.comment" />
          </h3>
        </Colxx>

        <Formik initialValues={initialValues} onSubmit={onUpdateComment}>
          {({ errors, touched, values }) => (
            <Form
              className="av-tooltip tooltip-label-bottom mx-auto px-2"
              style={{ maxWidth: 1024, width: '100%' }}
            >
              {/* User & Comment */}
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

                <Colxx xxs="12" md="6">
                  <FormGroup className="form-group">
                    <Label>Content</Label>
                    <Field
                      className="form-control"
                      type="text"
                      component="textarea"
                      name="comment"
                      value={comment.comment}
                      validate={() => validateRequired('comment')}
                      onChange={handleOnChange}
                    />
                    {errors.comment && touched.comment && (
                      <div className="invalid-feedback d-block">
                        {errors.comment}
                      </div>
                    )}
                  </FormGroup>
                </Colxx>
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

const mapStateToProps = ({ }) => {
  return {  };
};

export default connect(mapStateToProps, {
  loadAllPostsAction: loadAllPosts,
})(EditCommentPage);
