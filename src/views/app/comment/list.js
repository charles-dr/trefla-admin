import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Badge, Button, Modal, ModalHeader, ModalBody, NavLink, Row } from 'reactstrap';

import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';

import { deleteCommentByIdRequest, transformTime, menuPermission } from '../../../utils';
import { loadAllComments } from '../../../redux/actions';
import { reactionImages } from '../../../constants/custom';
import * as api from '../../../api';


const CommentList = ({ match, users, posts, permission, role, history, loadAllCommentsAction }) => {
  const [data, setData] = useState([]);
  const [refreshTable, setRefreshTable] = useState(0);
  const [delModal, setDelModal] = useState(false);
  const [delId, setDelId] = useState(-1);
  const [loading, setLoading] = useState(false);

  const cols = [
    {
      Header: 'User',
      accessor: 'user.user_name',
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
      accessor: 'target',
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
        {props.value === 1 && <Badge color="outline-success" pill className="mb-1"> True </Badge>}
        {props.value === 0 && <Badge color="outline-danger" pill className="mb-1"> False </Badge>}
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
      accessor: 'id',
      cellClass: 'text-muted  w-15',
      Cell: (props) => (
        <>
          <div className="tbl-actions">
            {menuPermission({role, permission}, 'comment.edit') && <NavLink
              href={`/#/app/comment/edit/${props.value}`}
              style={{ display: 'inline-block', padding: '0.5rem' }}
            ><i
                className="iconsminds-file-edit info"
                title="Edit"
                style={{ fontSize: 18 }}
              /></NavLink>
            }
            {menuPermission({role, permission}, 'comment.delete') && <i
              className="simple-icon-trash danger"
              title="Remove"
              style={{ fontSize: 18 }}
              onClick={() => handleOnDelete(props.value)}
            />}
          </div>
        </>
      ),
    },
  ];

  const loadData = ({ limit, page }) => {
    return api.r_loadCommentRequest({ page, limit, type: 'ALL' })
      .then(res => {
        const { data, pager, status, message } = res;
        if (status) {
          return {
            list: data.map(comment => ({
              ...comment,
              // add new field 'user_name'
              user_name: comment.user.user_name,
              // add new field 'likes'
              likes: `${comment.like_1_num},${comment.like_2_num},${comment.like_3_num},${comment.like_4_num},${comment.like_5_num},${comment.like_6_num}`,
              // add new field 'parent';
              parent: { type: comment.type, target_id: comment.target_id }
            })),
            pager,
          };
        } else {
          NotificationManager.error(message, 'Post');
        }
      });
  }

  const reloadTableContent = () => {
    setRefreshTable(refreshTable + 1);
  }

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

  const getParentContent = (parent) => {
    if (!parent) {
      return <Badge color="outline-warning" pill className="mb-1"> Deleted </Badge>
    }
    const { type, target_id, ...target } = parent;

    if (parent.feed) { // then post
      if (target) {
        return <NavLink href={`/#/app/post/edit/${parent.id}`}>{parent.feed}</NavLink>;
      } else {
        return <>
          <Badge color="outline-warning" pill className="mb-1"> Deleted </Badge>
        </>
      }
    } else if (parent.comment) { // then comment
      if (target) {
        return <NavLink href={`/#/app/comment/edit/${parent.id}`}>{parent.comment}</NavLink>
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

    const res = await api.r_deleteCommentByIdRequest(delId);

    setLoading(false);

    setDelModal(false);
    setDelId(-1);

    if (res.status === true) {
      NotificationManager.success(res.message, 'Delete Post');
      reloadTableContent();
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
            loadData={loadData}
            refresh={refreshTable}
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

const mapStateToProps = ({ auth }) => {
  const { permission, info: { role } } = auth;
  return {
    permission,
    role,
  };
};

export default connect(mapStateToProps, {
  loadAllCommentsAction: loadAllComments
})(CommentList);
