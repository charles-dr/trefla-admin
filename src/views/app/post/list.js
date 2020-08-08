import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Label, Modal, ModalHeader, ModalBody, Row } from 'reactstrap';
import {
    AvForm,
    AvField,
    AvGroup,
    AvInput,
    AvFeedback,
} from 'availity-reactstrap-validation';

import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';

import { getPostTableContent } from '../../../api/functions.api';
import { _firebase } from '../../../utils';

const INIT_UNIT = {
    _id: '',
    districtId: '',
    name: '',
    district: { districtName: '', city: { cityName: '' } },
};

const PostList = ({ match, posts, users }) => {
    const [pageLoaded, setPageLoaded] = useState(true);
    // const [posts, setPosts] = useState([]);
    const [modalDetails, setModalDetails] = useState(false);
    const [unit, setUnit] = useState(INIT_UNIT);

    const cols = [
        {
            Header: 'User',
            accessor: 'post_user_id',
            cellClass: 'list-item-heading w-30',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Content',
            accessor: 'feed',
            cellClass: 'text-muted  w-25',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Time',
            accessor: 'post_time',
            cellClass: 'text-muted  w-25',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Actions',
            accessor: 'post_id',
            cellClass: 'text-muted  w-20',
            Cell: (props) => (
                <>
                    <div className="tbl-actions">
                        <i
                            className="iconsminds-file-edit"
                            title="Edit"
                            onClick={() => handleOnEdit(props.value)}
                        />
                        <i
                            className="simple-icon-trash"
                            title="Remove"
                            onClick={() => handleOnDelete(props.value)}
                        />
                    </div>
                </>
            ),
        },
    ];

    useEffect(() => {
        console.log(users, posts);
        // _firebase.firestore().collection('posts').orderBy('post_id', 'asc').get()
        //     .then((querySnapshot) => {
        //         const rows = [];
        //         querySnapshot.forEach((doc) => {
        //             // console.log(`${doc.id}`, doc.data());
        //             rows.push(doc.data());
        //         });
        //         // console.log(rows);
        //         setPosts(rows);
        //     });

        return () => { };
    }, [match]);

    const openAddModal = () => {
        // console.log('[openAddModal]');
        // setModalDetails(true);
    };
    const handleOnEdit = (_id) => {
        // getSchoolById({ variables: { _id: _id, force: new Date().getTime().toString() } });
    };
    const handleOnDelete = (_id) => {
        // if (window.confirm('Are you sure to delete data?')) {
        //     deleteSchoolById({ variables: { _id: _id } });
        // }
    };
    const setData = (data) => { };
    const onSubmit = (event, errors, values) => {
        // console.log(errors);
        // console.log(values, unit);
        // if (errors.length === 0) {
        //     // submit
        //     if (unit._id === "") { addNewSchool({ variables: values}); }
        //     else { updateSchoolById({ variables: {...values, _id: unit._id }}); }
        // }
    };
    const handleOnChange = (e) => {
        // setUnit({ ...unit, [e.target.name]: e.target.value });
    };
    const handleOnCheck = (column, colIndex) => {
        console.log(column, colIndex);
    };
    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb heading="menu.posts" match={match} />
                    <Separator className="mb-5" />
                </Colxx>
            </Row>

            <Row>
                <Colxx xxs="12">
                    <h3 className="mb-4">
                        <IntlMessages id="pages.posts" />
                    </h3>
                </Colxx>

                <Colxx className="d-flex justify-content-end" xxs={12}>
                    <Button color="primary" className="mb-2" onClick={openAddModal}>
                        <i className="simple-icon-plus mr-1" />
                        <IntlMessages id="actions.add" />
                    </Button>{' '}
                    <Modal
                        isOpen={modalDetails}
                        toggle={() => setModalDetails(!modalDetails)}
                        backdrop="static"
                    >
                        <ModalHeader>
                            <IntlMessages id="pages.districts.add-new" />
                        </ModalHeader>
                        <ModalBody>
                            <AvForm
                                className="av-tooltip tooltip-label-right"
                                onSubmit={(event, errors, values) =>
                                    onSubmit(event, errors, values)
                                }
                            >
                                <AvField
                                    type="select"
                                    name="districtId"
                                    required
                                    label="District"
                                    value={unit.districtId}
                                    onChange={handleOnChange}
                                    errorMessage="Please select a district!"
                                >
                                    {[
                                        { id: 1, name: 'Option I' },
                                        { id: 2, name: 'Option II' },
                                    ].map((district) => (
                                        <option value={district._id} key={district.id}>
                                            {district.name}
                                        </option>
                                    ))}
                                </AvField>

                                <AvGroup>
                                    <Label>School Name</Label>
                                    <AvInput
                                        name="name"
                                        value={unit.name}
                                        onChange={handleOnChange}
                                        required
                                    />
                                    <AvFeedback>School name is required!</AvFeedback>
                                </AvGroup>

                                <Separator className="mb-5" />

                                <div className="d-flex justify-content-end">
                                    <Button color="primary mr-2">
                                        <IntlMessages id="actions.submit" />
                                    </Button>{' '}
                                    <Button
                                        color="secondary"
                                        onClick={() => setModalDetails(false)}
                                    >
                                        <IntlMessages id="actions.cancel" />
                                    </Button>
                                </div>
                            </AvForm>
                        </ModalBody>
                    </Modal>
                </Colxx>

                <Colxx xxs="12">
                    <ReactTableWithPaginationCard
                        cols={cols}
                        data={posts}
                        onCheck={handleOnCheck}
                    />
                </Colxx>
            </Row>
        </>
    );
};

const mapStateToProps = ({ posts: postApp, users: userApp }) => {
    const {list: posts} = postApp;
    const {list: users} = userApp;
    
    return {
        users, posts
    };
  };

export default connect(mapStateToProps)(PostList);
