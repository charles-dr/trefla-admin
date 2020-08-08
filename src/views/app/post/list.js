import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Badge, Button, Label, Modal, ModalHeader, ModalBody, Row } from 'reactstrap';
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
import { _firebase, transformTime } from '../../../utils';

const INIT_UNIT = {
    _id: '',
    districtId: '',
    name: '',
    district: { districtName: '', city: { cityName: '' } },
};

const typeIcons = ['simple-icon-credit-card', 'iconsminds-car', 'iconsminds-home', 'iconsminds-dog', 'iconsminds-heart'];
const reactionImages = ['like.png', 'love.png', 'wow.png', 'haha.png', 'sad.png', 'angry.png'];


const PostList = ({ match, posts, users }) => {
    const [pageLoaded, setPageLoaded] = useState(true);
    const [data, setData] = useState([]);
    const [modalDetails, setModalDetails] = useState(false);
    const [unit, setUnit] = useState(INIT_UNIT);

    const cols = [
        {
            Header: 'User',
            accessor: 'user_name',
            cellClass: 'list-item-heading w-15',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Type',
            accessor: 'type',
            cellClass: 'text-muted  w-10',
            Cell: (props) => <><div className={`glyph-icon ${typeIcons[props.value]}`} style={{ fontSize: 20 }}></div></>,
        },
        {
            Header: 'Content',
            accessor: 'feed',
            cellClass: 'text-muted  w-25',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Coordinate',
            accessor: 'location_coordinate',
            cellClass: 'text-muted  w-10',
            Cell: (props) => <>{formatCoordinate(props.value)}</>,
        },
        {
            Header: 'Location',
            accessor: 'location_address',
            cellClass: 'text-muted  w-25',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Likes',
            accessor: 'likes',
            cellClass: 'text-muted  w-25',
            Cell: (props) => <>{formatLikes(props.value)}</>,
        },
        {
            Header: 'Comments',
            accessor: 'comment_num',
            cellClass: 'text-muted  w-5',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Time',
            accessor: 'post_time',
            cellClass: 'text-muted  w-20',
            Cell: (props) => <>{transformTime(props.value)}</>,
        },
        {
            Header: 'Actions',
            accessor: 'post_id',
            cellClass: 'text-muted  w-20',
            Cell: (props) => (
                <>
                    <div className="tbl-actions">
                        {/* <i
                            className="iconsminds-file-edit"
                            title="Edit"
                            onClick={() => handleOnEdit(props.value)}
                        /> */}
                        <i
                            className="simple-icon-trash"
                            title="Remove"
                            style={{ fontSize: 18 }}
                            onClick={() => handleOnDelete(props.value)}
                        />
                    </div>
                </>
            ),
        },
    ];


    useEffect(() => {
        console.log(users, posts);

        const tableRows = recomposePosts();

        return () => { };
    }, [match, users, posts]);

    const formatLikes = (str_likes) => {
        const arr_likes = str_likes.split(',');
        const total = arr_likes.reduce((a, b) => Number(a) + Number(b), 0);

        if (total > 0) {
            return <>
                {arr_likes.map((like, i) => (
                    like > 0 && <img src={`/assets/img/reactions/${reactionImages[i]}`}
                        style={{ width: 20, display: 'inline' }}
                        alt="Reaction Icon"
                        key={i} />
                ))
                }
                <span style={{ paddingLeft: 10, verticalAlign: 'middle', fontSize: 16 }}>{total}</span>
            </>;
        } else {
            return <Badge color="warning" pill className="mb-1">
                No reactions
            </Badge>;
        }
    }
    const formatCoordinate = (coord) => {
        const arr = coord.split(',');
        return <>
            <p>X: {arr[0]}</p>
            <p>Y: {arr[1]}</p>
        </>
    }
    const recomposePosts = () => {
        let new_posts = [];
        for (let post of posts) {
            let post_item = {};
            // copy all key-values
            for (let key in post) {
                if (post[key] !== undefined) {
                    post_item[key] = post[key];
                }
            }
            // add new field 'user_name'
            post_item['user_name'] = getUserNameById(post.post_user_id);
            // add new field 'likes'
            post_item['likes'] = `${post.like_1_num},${post.like_2_num},${post.like_3_num},${post.like_4_num},${post.like_5_num},${post.like_6_num}`;
            // put item to array
            new_posts.push(post_item);
        }
        setData(new_posts);
    }
    const getUserNameById = id => {
        if (users.length > 0) {
            for (let user of users) {
                if (Number(user.user_id) === Number(id)) {
                    return user.user_name;
                }
            }
        } else {
            return '';
        }
    }

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
                        data={data}
                    />
                </Colxx>
            </Row>
        </>
    );
};

const mapStateToProps = ({ posts: postApp, users: userApp }) => {
    const { list: posts } = postApp;
    const { list: users } = userApp;

    return {
        users, posts
    };
};

export default connect(mapStateToProps)(PostList);
