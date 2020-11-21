import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Badge,
  Button,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  Row,
} from 'reactstrap';

import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';
import {
  AvForm,
  AvGroup,
  AvInput,
  AvFeedback,
} from 'availity-reactstrap-validation';

import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';

import { deleteUserById, ru_toggleBanStatus } from '../../../utils';
import { loadAllUsers } from '../../../redux/actions';
import * as api from '../../../api';

const UserList = ({
  match,
  history,
  friends,
  posts,
  users,
  loadAllUsersAction,
}) => {
  const [data, setData] = useState([]);
  const [refreshTable, setRefreshTable] = useState(0);

  const [loading, setLoading] = useState(false);
  const [delId, setDeleteId] = useState(-1);
  const [modalDetails, setModalDetails] = useState(false);
  const [modalOptions, setModalOptions] = useState({
    comment: true,
    post: true,
    report: true,
    friend: true,
    chat: true,
  });

  const [banModal, setBanModal] = useState(false);
  const [banInfo, setBanInfo] = useState({ user_id: -1, active: 1 });
  // const [banReason, setBanReason] = useState('');

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
      Cell: (props) => (
        <>
          <div className="text-center">
            <img
              src={getUserAvatarUrl(props.value)}
              style={{ width: 50, height: 50, borderRadius: '50%' }}
              alt="User Profile"
            />
          </div>
        </>
      ),
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
      Cell: (props) => (
        <>
          {props.value.toString() === '1' && (
            <div className="text-center">
              <span
                className="glyph-icon iconsminds-female"
                style={{ fontSize: 18, color: '#16c5bd' }}
              />
            </div>
          )}
          {props.value.toString() !== '1' && (
            <div className="text-center">
              <span
                className="glyph-icon iconsminds-male"
                style={{ fontSize: 18, color: '#1675c5' }}
              />
            </div>
          )}
        </>
      ),
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
      accessor: 'action',
      cellClass: 'text-muted  w-10',
      Cell: (props) => (
        <>
          <div className="tbl-actions">
            <i
              className="iconsminds-file-edit info"
              title="Edit"
              style={{ fontSize: 18 }}
              onClick={() => handleOnEdit(props.value.user_id)}
            />
            <i
              className={`${
                props.value.active === 1
                  ? 'simple-icon-ban'
                  : 'simple-icon-energy'
              } ${props.value.active === 1 ? 'warning' : 'success'}`}
              title={`${props.value.active === 1 ? 'Ban' : 'Release'} User`}
              style={{ fontSize: 18 }}
              onClick={() => handleOnBanUser(props.value)}
            />
            <i
              className="simple-icon-trash danger"
              title="Remove"
              style={{ fontSize: 18 }}
              onClick={() => handleOnDelete(props.value.user_id)}
            />
          </div>
        </>
      ),
    },
  ];

  const loadData = ({ limit, page }) => {
    return api.r_loadUserRequest({ page, limit, type: 'ALL' })
      .then(res => {
        const { data, pager, status } = res;
        if (status) {
          return {
            list: data.map(user => ({
              ...user,
              image: {
                photo: user.photo,
                sex: user.sex,
                avatarIndex: user.avatarIndex,
              },
              action: {
                user_id: user.id,
                active: user.active,
              },
            })),
            pager,
          };
        } else {

        }
      });
  }

  const getUserAvatarUrl = ({ photo, sex, avatarIndex }) => {
    sex = sex.toString();
    if (photo) {
      return photo;
    }
    if (avatarIndex !== undefined && avatarIndex !== '') {
      return `/assets/avatar/${
        sex === '1' ? 'girl' : 'boy'
      }/${avatarIndex}.png`;
    }
    return `/assets/avatar/avatar_${sex === '1' ? 'girl2' : 'boy1'}.png`;
  };

  const formatCoordinate = (coord) => {
    if (!coord) return '';
    const arr = coord.split(',');
    return (
      <>
        <p>X: {arr[0]}</p>
        <p>Y: {arr[1]}</p>
      </>
    );
  };

  const reloadTableContent = () => {
    setRefreshTable(refreshTable + 1);
  }

  const openAddModal = () => {
    history.push('/app/user/add');
  };

  const handleOnEdit = (user_id) => {
    history.push(`/app/user/edit/${user_id}`);
  };

  const handleOnBanUser = (ban) => {
    setBanInfo(ban);
    setBanModal(true);
  };

  const onConfirmBan = async (event, errors, values) => {
    // console.log(event, errors, values);
    if ((banInfo.active === 1 && errors.length === 0) || banInfo.active !== 1) {
      // console.log(values);
      setLoading(true);
      const res = await ru_toggleBanStatus(
        banInfo,
        banInfo.active === 1 ? values.banReason : ''
      );
      console.log(res);
      setLoading(false);
      if (res.status === true) {
        NotificationManager.success(
          res.message,
          `${banInfo.active === 1 ? 'Ban' : 'Release'} User`
        );
        setBanModal(false);
        reloadTableContent();
        // loadAllUsersAction();
      } else {
        NotificationManager.error(
          res.message,
          `${banInfo.active === 1 ? 'Ban' : 'Release'} User`
        );
      }
    }
  };

  const handleOnDelete = (user_id) => {
    setModalDetails(true);
    setDeleteId(user_id);
  };

  const onConfirmDelete = async () => {
    console.log(delId, modalOptions);

    try {
      setLoading(true);
      const res = await api.r_deleteUserByIdRequest(delId, modalOptions); console.log('[res]', res)
      setLoading(false);
      if (res.status === true) {
        NotificationManager.success(res.message, 'Delete User');
        reloadTableContent();
        setModalDetails(false);
      } else {
        NotificationManager.error(res.message, 'Delete User');
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      NotificationManager.error('Something went wrong', 'Delete User');
    }
  };

  const getAllActive = () => {
    return (
      modalOptions.post &&
      modalOptions.comment &&
      modalOptions.report &&
      modalOptions.chat &&
      modalOptions.friend
    );
  };

  const setAllActive = (st) => {
    setModalOptions({
      comment: st,
      post: st,
      report: st,
      friend: st,
      chat: st,
    });
  };

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
            loadData={loadData}
            refresh={refreshTable}
            />
        </Colxx>
      </Row>

      {/* Delete Modal */}
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
            <h5>Delete together user's:</h5>
            <Colxx className="mb-4" xxs="12">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Label>All</Label>
                <Switch
                  className="custom-switch custom-switch-secondary"
                  checked={getAllActive()}
                  onChange={setAllActive}
                />
              </div>
            </Colxx>

            <Colxx className="mb-2" xxs="12">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Label>Posts</Label>
                <Switch
                  className="custom-switch custom-switch-secondary"
                  checked={modalOptions.post}
                  onChange={(st) =>
                    setModalOptions({ ...modalOptions, post: st })
                  }
                />
              </div>
            </Colxx>
            <Colxx className="mb-2" xxs="12">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Label>Comments</Label>
                <Switch
                  className="custom-switch custom-switch-secondary"
                  checked={modalOptions.comment}
                  onChange={(st) =>
                    setModalOptions({ ...modalOptions, comment: st })
                  }
                />
              </div>
            </Colxx>
            <Colxx className="mb-2" xxs="12">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Label>Reports</Label>
                <Switch
                  className="custom-switch custom-switch-secondary"
                  checked={modalOptions.report}
                  onChange={(st) =>
                    setModalOptions({ ...modalOptions, report: st })
                  }
                />
              </div>
            </Colxx>
            <Colxx className="mb-2" xxs="12">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Label>Chat</Label>
                <Switch
                  className="custom-switch custom-switch-secondary"
                  checked={modalOptions.chat}
                  onChange={(st) =>
                    setModalOptions({ ...modalOptions, chat: st })
                  }
                />
              </div>
            </Colxx>
            <Colxx className="mb-2" xxs="12">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Label>Friend</Label>
                <Switch
                  className="custom-switch custom-switch-secondary"
                  checked={modalOptions.friend}
                  onChange={(st) =>
                    setModalOptions({ ...modalOptions, friend: st })
                  }
                />
              </div>
            </Colxx>

            <Separator className="mb-5 mt-5" />
            <div className="d-flex justify-content-end">
              <Button
                type="submit"
                color="primary"
                className={`btn-shadow btn-multiple-state mr-2 ${
                  loading ? 'show-spinner' : ''
                }`}
                size="lg"
              >
                <span className="spinner d-inline-block">
                  <span className="bounce1" />
                  <span className="bounce2" />
                  <span className="bounce3" />
                </span>
                <span className="label">Delete</span>
              </Button>{' '}
              <Button color="secondary" onClick={() => setModalDetails(false)}>
                <IntlMessages id="actions.cancel" />
              </Button>
            </div>
          </AvForm>
        </ModalBody>
      </Modal>

      {/* Ban Modal */}
      <Modal
        isOpen={banModal}
        toggle={() => setBanModal(!banModal)}
        backdrop="static"
      >
        <ModalHeader>Ban User</ModalHeader>
        <ModalBody>
          <AvForm
            className="av-tooltip tooltip-label-right"
            onSubmit={(event, errors, values) =>
              onConfirmBan(event, errors, values)
            }
          >
            {banInfo.active === 1 && (
              <AvGroup>
                <Label>Ban Reason:</Label>
                <AvInput
                  type="textarea"
                  name="banReason"
                  id="banReason"
                  required
                />
                <AvFeedback>Please enter ban reason!</AvFeedback>
              </AvGroup>
            )}
            {banInfo.active !== 1 && (
              <label>Are you sure to release this user?</label>
            )}

            <Separator className="mb-5 mt-3" />
            <div className="d-flex justify-content-end">
              <Button
                type="submit"
                color="primary"
                className={`btn-shadow btn-multiple-state mr-2 ${
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
                  {banInfo.active === 1 ? 'Ban' : 'Release'}
                </span>
              </Button>{' '}
              <Button color="secondary" onClick={() => setBanModal(false)}>
                <IntlMessages id="actions.cancel" />
              </Button>
            </div>
          </AvForm>
        </ModalBody>
      </Modal>
    </>
  );
};

const mapStateToProps = ({
  friends: friendApp,
  posts: postApp,
  users: userApp,
}) => {
  const { list: posts } = postApp;
  const { list: users } = userApp;
  const { list: friends } = friendApp;

  return {
    friends,
    users,
    posts,
  };
};

export default connect(mapStateToProps, {
  loadAllUsersAction: loadAllUsers,
})(UserList);
