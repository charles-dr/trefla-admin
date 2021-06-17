import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Badge, Button, Modal, ModalHeader, ModalBody, Row } from 'reactstrap';

import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';

import { transformTime, menuPermission } from '../../../utils';
import { reactionImages, typeIcons } from '../../../constants/custom';
import * as api from '../../../api';

const PostList = ({ match, history, posts, users, permission, role }) => {
  // const tableRef = React.useRef();
  const [delModal, setDelModal] = useState(false);
  const [delId, setDelId] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [refreshTable, setRefreshTable] = useState(0);

  const cols = [
    {
      Header: 'User',
      accessor: 'user',
      cellClass: 'list-item-heading w-15',
      Cell: (props) => <>{props.value ? 
        props.value.user_name || "" :
        <Badge color="danger" pill className="mb-1">
          Deleted
        </Badge>}</>,
    },
    {
      Header: 'Post Name',
      accessor: 'post_name',
      cellClass: 'text-muted  w-5',
      Cell: (props) => (
        <>
          {props.value && <span>{props.value}</span>}
          {!props.value && (
            <Badge color="warning" pill className="mb-1">
              Not Specified
            </Badge>
          )}
        </>
      ),
    },
    {
      Header: 'Content',
      accessor: 'feed',
      cellClass: 'text-muted  w-25',
      Cell: (props) => <>{props.value}</>,
    },
    {
      Header: 'Type',
      accessor: 'type',
      cellClass: 'text-muted  w-5',
      Cell: (props) => (
        <>
          <div
            className={`glyph-icon ${typeIcons[props.value]}`}
            style={{ fontSize: 20 }}
          ></div>
        </>
      ),
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
      Header: 'Active',
      accessor: 'active',
      cellClass: 'text-muted  w-5',
      Cell: (props) => (
        <>
          <Badge
            color={props.value === 1 ? 'success' : 'danger'}
            pill
            className="mb-1"
          >
            {props.value === 1 ? 'Active' : 'Disabled'}
          </Badge>
        </>
      ),
    },
    {
      Header: 'Actions',
      accessor: 'id',
      cellClass: 'text-muted  w-20',
      canSort: false,
      Cell: (props) => (
        <>
          <div className="tbl-actions">
            {menuPermission({role, permission}, 'post.edit') && <i
              className="iconsminds-file-edit info"
              title="Edit"
              style={{ fontSize: 18 }}
              onClick={() => handleOnEdit(props.value)}
            />}
            {menuPermission({role, permission}, 'post.delete') && <i
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

  const loadData = ({ limit, page, sortBy, sortDir }) => {
    return api.r_loadPostRequest({ page, limit, type: 'ALL', sort: { col: sortBy, desc: sortDir } })
      .then(res => {
        const { data, pager, status, message } = res;
        if (status) {
          return {
            list: data.map(post => ({
              ...post,
              likes: `${post.like_1_num},${post.like_2_num},${post.like_3_num},${post.like_4_num},${post.like_5_num},${post.like_6_num}`,
            })),
            pager,
          };
        } else {
          NotificationManager.error(message, 'Post');
        }
      });
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
        } 
            return <Badge color="warning" pill className="mb-1">
                No reactions
            </Badge>;
        
  };

  const handleOnEdit = (post_id) => {
    history.push(`/app/post/edit/${post_id}`);
  };

  const handleOnDelete = (post_id) => {
    setDelId(post_id);
    setDelModal(true);
  };

  const reloadTableContent = () => {
    setRefreshTable(refreshTable + 1);
  }

  const navigateToAddPage = () => {
    history.push('/app/post/add');
  };

  const proceedDelete = async () => {
    console.log('[delete now]', delId);

    setLoading(true);

    const res = await api.r_deletePostByIdRequest(delId);

    setLoading(false);

    setDelId(-1);

    if (res.status === true) {
      setDelModal(false);
      NotificationManager.success(res.message, 'Delete Post');
      reloadTableContent();
    } else {
      NotificationManager.error(res.message, 'Delete Post');
    }
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
          <Button color="primary" className="mb-2" onClick={navigateToAddPage}>
            <i className="simple-icon-plus mr-1" />
            <IntlMessages id="actions.add" />
          </Button>{' '}
        </Colxx>

        <Colxx xxs="12">
          <ReactTableWithPaginationCard 
            cols={cols} 
            loadData={loadData}
            refresh={refreshTable}
            defaultSortBy="post_time"
            />
        </Colxx>
      </Row>

      {/* Ban Modal */}
      <Modal
        isOpen={delModal}
        toggle={() => setDelModal(!delModal)}
        backdrop="static"
      >
        <ModalHeader>Delete Post</ModalHeader>
        <ModalBody>
          <p>Are you sure to delete this post?</p>

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
              <span className="label">Delete</span>
            </Button>{' '}
            <Button color="secondary" onClick={() => setDelModal(false)}>
              <IntlMessages id="actions.cancel" />
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

const mapStateToProps = ({ posts: postApp, users: userApp, auth }) => {
  const { permission, info: { role } } = auth;
  const { list: posts } = postApp;
  const { list: users } = userApp;

  return {
    users,
    posts,
    permission, role,
  };
};

export default connect(mapStateToProps, {

})(PostList);
