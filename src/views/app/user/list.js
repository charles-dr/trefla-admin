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


const UserList = ({ match, history, friends, posts, users }) => {
    const [data, setData] = useState([]);
    const [modalDetails, setModalDetails] = useState(false);

    const cols = [
        {
            Header: 'Name',
            accessor: 'user_name',
            cellClass: 'list-item-heading w-15',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Image',
            accessor: 'image',
            cellClass: 'list-item-heading w-10',
            Cell: (props) => <>
                <div className="text-center">
                    <img src={getUserAvatarUrl(props.value)} style={{width: 50, height: 50, borderRadius: '50%'}} alt="User Profile" />
                </div>
            </>,
        },
        {
            Header: 'Email',
            accessor: 'email',
            cellClass: 'text-muted  w-5',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Gender',
            accessor: 'sex',
            cellClass: 'text-muted  w-5',
            Cell: (props) => <>
                {props.value === "1" && <div className="text-center">
                    <span className="glyph-icon iconsminds-female"
                        style={{ fontSize: 18, color: '#16c5bd' }}></span>
                </div>}
                {props.value !== "1" && <div className="text-center">
                    <span className="glyph-icon iconsminds-male"
                        style={{ fontSize: 18, color: '#1675c5' }}></span>
                </div>}
            </>,
        },
        {
            Header: 'Birthday',
            accessor: 'birthday',
            cellClass: 'text-muted  w-5',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Card Number',
            accessor: 'card_number',
            cellClass: 'text-muted  w-5',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Location',
            accessor: 'location_address',
            cellClass: 'text-muted  w-5',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Coordinate',
            accessor: 'location_coordinate',
            cellClass: 'text-muted  w-5',
            Cell: (props) => <>{formatCoordinate(props.value)}</>,
        },
        {
            Header: 'Active',
            accessor: 'active',
            cellClass: 'text-muted  w-5',
            Cell: (props) => <><Badge color={props.value === 1 ? 'success' : 'danger'} pill className="mb-1">{props.value === 1 ? 'Active' : 'Disabled'}</Badge></>,
        },
        {
            Header: 'Actions',
            accessor: 'user_id',
            cellClass: 'text-muted  w-10',
            Cell: (props) => (
                <>
                    <div className="tbl-actions">
                        <i
                            className="iconsminds-file-edit info"
                            title="Edit"
                            style={{ fontSize: 18 }}
                            onClick={() => handleOnEdit(props.value)}
                        />
                        <i
                            className="simple-icon-trash danger"
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
        recomposeUsers();
        return () => { return true; };
    }, [match, users, posts, friends]);

    const getUserAvatarUrl = ({ photo, sex, avatarIndex }) => {
        if (!!photo) {
            return photo;
        } else if (avatarIndex !== undefined && avatarIndex !== "") {
            return `/assets/avatar/${sex==='1'?'girl':'boy'}/${avatarIndex}.png`;
        } else {
            return `/assets/avatar/avatar_${sex==='1' ? 'girl2' : 'boy1'}.png`;
        }
    }

    const formatCoordinate = (coord) => {
        const arr = coord.split(',');
        return <>
            <p>X: {arr[0]}</p>
            <p>Y: {arr[1]}</p>
        </>
    }
    const recomposeUsers = () => {
        let new_users = [];
        for (let user of users) {
            let user_item = {};
            // copy all key-values
            for (let key in user) {
                if (user[key] !== undefined) {
                    user_item[key] = user[key];
                }
            }
            // new key - image
            user_item.image = {
                photo: user.photo,
                sex: user.sex,
                avatarIndex: user.avatarIndex,
            }

            // put item to array
            new_users.push(user_item);
        }
        setData(new_users);
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
        history.push('/app/user/add');
    };
    const handleOnEdit = (user_id) => {
        history.push(`/app/user/edit/${user_id}`);
    };
    const handleOnDelete = (user_id) => {
        setModalDetails(true);
    };


    const onConfirmDelete = () => {

    }

    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb heading="menu.users" match={match} />
                    <Separator className="mb-5" />
                </Colxx>
            </Row>

            <Row>
                <Colxx xxs="12">
                    <h3 className="mb-4">
                        <IntlMessages id="pages.users" />
                    </h3>
                </Colxx>

                <Colxx className="d-flex justify-content-end" xxs={12}>
                    <Button color="primary" className="mb-2" onClick={openAddModal}>
                        <i className="simple-icon-plus mr-1" />
                        <IntlMessages id="actions.add" />
                    </Button>{' '}
                </Colxx>

                <Colxx xxs="12">
                    <ReactTableWithPaginationCard
                        cols={cols}
                        data={data}
                    />
                </Colxx>
            </Row>

            <Modal
                isOpen={modalDetails}
                toggle={() => setModalDetails(!modalDetails)}
                backdrop="static"
            >
                <ModalHeader>
                    <IntlMessages id="pages.delete-user" />
                </ModalHeader>
                <ModalBody>
                    <AvForm
                        className="av-tooltip tooltip-label-right"
                        onSubmit={(event, errors, values) =>
                            onConfirmDelete(event, errors, values)
                        }
                    >

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
        </>
    );
};


const mapStateToProps = ({ friends: friendApp, posts: postApp, users: userApp }) => {
    const { list: posts } = postApp;
    const { list: users } = userApp;
    const { list: friends } = friendApp;

    return {
        friends, users, posts
    };
};

export default connect(mapStateToProps)(UserList);
