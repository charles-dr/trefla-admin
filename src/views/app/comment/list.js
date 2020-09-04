import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Badge, Button, Modal, ModalHeader, ModalBody, NavLink, Row } from 'reactstrap';

import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';


import { deleteCommentByIdRequest, transformTime } from '../../../utils';
import { loadAllComments } from '../../../redux/actions';
import { reactionImages } from '../../../constants/custom';


const CommentList = ({ match, history, comments, posts, users, loadAllCommentsAction }) => {
    const [data, setData] = useState([]);
    const [delModal, setDelModal] = useState(false);
    const [delId, setDelId] = useState(-1);
    const [loading, setLoading] = useState(false);


    const cols = [
        {
            Header: 'User',
            accessor: 'user_name',
            cellClass: 'list-item-heading w-15',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Comment',
            accessor: 'comment',
            cellClass: 'text-muted  w-20',
            Cell: (props) => <>
                {props.value}
            </>,
        },
        {
            Header: 'Parent Type',
            accessor: 'type',
            cellClass: 'text-muted  w-5',
            Cell: (props) => <>
                {props.value === 'COMMENT' && <Badge color="outline-info" pill className="mb-1"> Comment </Badge>}
                {props.value !== 'COMMENT' && <Badge color="outline-primary" pill className="mb-1"> Post </Badge>}
            </>,
        },
        {
            Header: 'Parent',
            accessor: 'parent',
            cellClass: 'text-muted w-25',
            Cell: (props) => <>
                {getParentContent(props.value)}
            </>
        },
        {
            Header: 'Guest',
            accessor: 'isGuest',
            cellClass: 'text-muted  w-5',
            Cell: (props) => <>
                {props.value && <Badge color="outline-success" pill className="mb-1"> True </Badge>}
                {!props.value && <Badge color="outline-danger" pill className="mb-1"> False </Badge>}
            </>,
        },
        {
            Header: 'Likes',
            accessor: 'likes',
            cellClass: 'text-muted  w-10',
            Cell: (props) => <>{formatLikes(props.value)}</>,
        },
        {
            Header: 'Time',
            accessor: 'time',
            cellClass: 'text-muted  w-10',
            Cell: (props) => <>{transformTime(props.value)}</>,
        },
        {
            Header: 'Active',
            accessor: 'active',
            cellClass: 'text-muted  w-5',
            Cell: (props) => <><Badge color={props.value === 1 ? 'success' : 'danger'} pill className="mb-1">{props.value === 1 ? 'Active' : 'Disabled'}</Badge></>,
        },
        {
            Header: 'Actions',
            accessor: 'comment_id',
            cellClass: 'text-muted  w-15',
            Cell: (props) => (
                <>
                    <div className="tbl-actions">
                        <NavLink
                            href={`/app/comment/edit/${props.value}`}
                            style={{ display: 'inline-block', padding: '0.5rem' }}
                        ><i
                                className="iconsminds-file-edit info"
                                title="Edit"
                                style={{ fontSize: 18 }}
                            /></NavLink>
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
        // console.log(users, posts);

        recomposeComments();

        return () => { };
    }, [users, posts, comments]);

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
            return <Badge color="outline-warning" pill className="mb-1">
                No reactions
            </Badge>;
        }
    }
    const recomposeComments = () => {
        let new_comments = [];
        for (let comment of comments) {
            let comment_item = {};
            // copy all key-values
            for (let key in comment) {
                if (comment[key] !== undefined) {
                    comment_item[key] = comment[key];
                }
            }

            // for old version: Aug 20
            if (comment_item['type'] === undefined) {
                comment_item['type'] = 'POST';
                comment_item['target_id'] = comment_item['post_id'];
            }


            // add new field 'user_name'
            comment_item['user_name'] = getUserNameById(comment.user_id);
            // add new field 'likes'
            comment_item['likes'] = `${comment.like_1_num},${comment.like_2_num},${comment.like_3_num},${comment.like_4_num},${comment.like_5_num},${comment.like_6_num}`;
            // add new field 'parent';
            comment_item['parent'] = { type: comment_item.type, target_id: comment_item.target_id };

            // put item to array
            new_comments.push(comment_item);
        }
        setData(new_comments);
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
    const getParentContent = ({ type, target_id }) => {
        if (type === 'POST') {
            for (let post of posts) {
                if (post.post_id === target_id) {
                    return <NavLink href={`/app/post/edit/${target_id}`}>{post.feed}</NavLink>;
                }
            }
            return <>
                <Badge color="outline-warning" pill className="mb-1"> Deleted </Badge>
            </>
        } else if (type === 'COMMENT') {
            for (let comment of comments) {
                if (comment.comment_id === target_id) {
                    return <NavLink href={`/app/comment/edit/${target_id}`}>{comment.comment}</NavLink>
                }
            }
            return <>
                <Badge color="outline-warning" pill className="mb-1"> Deleted </Badge>
            </>
        } else {
            return <>
                <Badge color="outline-danger" pill className="mb-1"> Unknown </Badge>
            </>
        }
    }

    const handleOnDelete = (post_id) => {
        setDelId(post_id);
        setDelModal(true);
    };
    const proceedDelete = async () => {
        // console.log('[delete now]', delId);

        setLoading(true);

        const res = await deleteCommentByIdRequest(delId);

        setLoading(false);

        setDelId(-1);

        if (res.status === true) {
            setDelModal(false);
            NotificationManager.success(res.message, 'Delete Post');
            loadAllCommentsAction();
        }
        else {
            NotificationManager.error(res.message, 'Delete Post');
        }
    };

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
                        <IntlMessages id="pages.comments" />
                    </h3>
                </Colxx>

                <Colxx xxs="12">
                    <ReactTableWithPaginationCard
                        cols={cols}
                        data={data}
                    />
                </Colxx>
            </Row>

            {/* Delete Modal */}
            <Modal
                isOpen={delModal}
                toggle={() => setDelModal(!delModal)}
                backdrop="static"
            >
                <ModalHeader>
                    Delete Comment
                </ModalHeader>
                <ModalBody>
                    <p>Are you sure to delete this comment?</p>

                    <Separator className="mb-5 mt-3" />
                    <div className="d-flex justify-content-end">
                        <Button
                            type="button"
                            color="primary"
                            className={`btn-shadow btn-multiple-state mr-2 ${
                                loading ? 'show-spinner' : ''
                                }`}
                            size="lg"
                            onClick={proceedDelete}
                        >
                            <span className="spinner d-inline-block">
                                <span className="bounce1" />
                                <span className="bounce2" />
                                <span className="bounce3" />
                            </span>
                            <span className="label">
                                Delete
                            </span>
                        </Button>{' '}
                        <Button
                            color="secondary"
                            onClick={() => setDelModal(false)}
                        >
                            <IntlMessages id="actions.cancel" />
                        </Button>
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
};

const mapStateToProps = ({ comments: commentApp, posts: postApp, users: userApp }) => {
    const { list: comments } = commentApp;
    const { list: posts } = postApp;
    const { list: users } = userApp;

    return {
        comments, posts, users
    };
};

export default connect(mapStateToProps, {
    loadAllCommentsAction: loadAllComments
})(CommentList);
