import React, { useState, useEffect } from 'react';
import { Row, Label, FormGroup, Button } from 'reactstrap';
import { connect } from 'react-redux';

import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';
import Select from 'react-select';
import { Formik, Form, Field, } from 'formik';

import { NotificationManager } from '../../../components/common/react-notifications';
import CustomSelectInput from '../../../components/common/CustomSelectInput';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import IntlMessages from '../../../helpers/IntlMessages';
import Breadcrumb from '../../../containers/navs/Breadcrumb';


import { getCommentByIdRequest, updateCommentRequest } from '../../../utils';
import { loadAllPosts } from '../../../redux/actions';


const INIT_COMMENT_INFO = {
    active: 1, comment: '', comment_id: -1, isGuest: false, like_1_num: 0, like_2_num: 0, like_3_num: 0, like_4_num: 0, like_5_num: 0, like_6_num: 0, target_id: -1, time: new Date().toLocaleString(), type: 'POST', user_id: -1
};


const EditCommentPage = ({ history, match, user_list, loadAllPostsAction }) => {
    
    const [comment, setComment] = useState(INIT_COMMENT_INFO);
    const [userSelValues, setUserSelValues] = useState([]);
    const [user, setUser] = useState(userSelValues.length > 0 ? userSelValues[0] : {});
    const [guest, setGuest] = useState(false);
    const [active, setActive] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        // compose the user select source
        let list = [];

        let index = 0;
        for (let user of user_list) {
            list.push({ label: user.user_name, value: user.user_id.toString(), key: index })
            index++;
        }

        setUserSelValues(list);

        // get post value by id
        getCommentByIdRequest(match.params.id)
            .then(res => {
                // console.log(res);
                setComment(res);
                // set user (value of select element);
                for (let selValue of list) {
                    if (selValue.value === res.user_id.toString()) {
                        setUser(selValue);
                    }
                }

                // set  guest
                setGuest(res.isGuest);
                // set active
                setActive(res.active === 1 ? true : false);

                // set Target Time
                // if (!!res.target_date) {
                //     setTimeAdded(true);
                //     const time = transformTime(res.target_date);
                //     setTargetTime(new Date(time));
                // }                

            })
            .catch(err => {
                console.error(err);
                NotificationManager.error('Something went wrong', 'Fetch Post')
            });

        return () => { return true; }
    }, [match, user_list]);

    const onUpdatePost = async (values) => {
        // copy post
        let params = {};
        for (let key in comment) {
            params[key] = comment[key];
        }
        
        params['isGuest'] = guest;
        params['active'] = active === true ? 1 : 0;
        params['user_id'] = Number(user.value);

        // console.log(params);

        setLoading(true);

        const res = await updateCommentRequest(params);

        setLoading(false);

        if (res.status === true) {
            NotificationManager.success(res.message, 'Update Comment');
            loadAllPostsAction();
            history.push('/app/comment');
        }
        else {
            NotificationManager.error(res.message, 'Update Comment');
        }
    };

    const validateRequired = (name) => {
        const value = comment[name];
        let error;
        if (!value) {
            error = 'This field is required!'
        }
        return error;
    }

    const handleOnChange = (e) => {
        setComment({ ...comment, [e.target.name]: e.target.value });
    }

    const initialValues = comment;

    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb heading="menu.comments" match={match} />
                    <Separator className="mb-5" />
                </Colxx>
            </Row>

            <Row >
                <Colxx xxs="12">
                    <h3 className="mb-4">
                        <IntlMessages id="pages.comment" />
                    </h3>
                </Colxx>

                <Formik initialValues={initialValues} onSubmit={onUpdatePost}>
                    {({
                        errors, touched, values }) => (
                            <Form className="av-tooltip tooltip-label-bottom mx-auto px-2" style={{ maxWidth: 1024, width: '100%' }}>

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
                                            <Label>
                                                Content
                                            </Label>
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
                                            <Label>
                                                As Guest
                                            </Label>
                                            <Switch
                                                className="custom-switch custom-switch-secondary"
                                                checked={guest}
                                                onChange={(st) => setGuest(st)}
                                            />
                                        </FormGroup>
                                    </Colxx>

                                    <Colxx xxs="12" md="6">
                                        <FormGroup className="form-group">
                                            <Label>
                                                Active
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

const mapStateToProps = ({ posts: postApp, users: userApp }) => {
    const { list: user_list } = userApp;
    return { user_list };
};

export default connect(mapStateToProps, {
    loadAllPostsAction: loadAllPosts,
})(EditCommentPage);
