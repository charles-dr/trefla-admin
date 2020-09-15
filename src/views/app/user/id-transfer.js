import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  NavLink,
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
import ImgsViewer from 'react-images-viewer';

import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';

import {
  deleteUserById,
  toggleBanStatus,
  updateUserProfile,
} from '../../../utils';
import { loadAllUsers } from '../../../redux/actions';

const VerificationList = ({
  match,
  history,
  friends,
  notifications,
  posts,
  users,
  loadAllUsersAction,
}) => {
  const [data, setData] = useState([]);

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
      Header: 'Transfer From',
      accessor: 'fromUser',
      cellClass: 'list-item-heading w-15',
      Cell: (props) => (
        <>
          <div className="text-center">
            <img
              src={getUserAvatarUrl(props.value)}
              style={{ width: 50, height: 50, borderRadius: '50%' }}
              alt={props.value.user_name} /> <br/>
            <Link to={`/app/user/edit/${props.value.user_id}`}>
              {props.value.user_name}
            </Link> <br/>
            
            <div><label><b>Email</b>:</label>{' '}{props.value.email}</div>
            <div><label><b>Card Number</b>:</label>{' '}{props.value.card_number}</div>
            {props.value.card_img_url && <img src={props.value.card_img_url}
              style={{maxWidth: 200}} 
              alt="ID Card" />}
          </div>
        </>
      ),
    },
    {
      Header: 'Transfer To',
      accessor: 'toUser',
      cellClass: 'list-item-heading w-10',
      Cell: (props) => (
        <>
          <div className="text-center">
            <img
              src={getUserAvatarUrl(props.value)}
              style={{ width: 50, height: 50, borderRadius: '50%' }}
              alt={props.value.user_name} /> <br/>
            <Link to={`/app/user/edit/${props.value.user_id}`}>
              {props.value.user_name}
            </Link> <br/>
            
            <div><label>Email:</label>{' '}{props.value.email}</div>
            <div><label>Card Number:</label>{' '}{props.value.card_number}</div>
            {props.value.card_img_url && <img src={props.value.card_img_url}
              style={{maxWidth: 200}} 
              alt="ID Card" />}
          </div>
        </>
      ),
    },
    // {
    //   Header: 'Active',
    //   accessor: 'active',
    //   cellClass: 'text-muted  w-5',
    //   Cell: (props) => (
    //     <>
    //       <Badge
    //         color={props.value === 1 ? 'success' : 'danger'}
    //         pill
    //         className="mb-1"
    //       >
    //         {props.value === 1 ? 'Active' : 'Disabled'}
    //       </Badge>
    //     </>
    //   ),
    // },
    // {
    //   Header: 'Verified',
    //   accessor: 'verified',
    //   cellClass: 'text-muted  w-5',
    //   Cell: (props) => (
    //     <>
    //       <Badge
    //         color={props.value === 1 ? 'outline-success' : 'outline-danger'}
    //         pill
    //         className="mb-1"
    //       >
    //         {props.value === 1 ? 'Verified' : 'Unverified'}
    //       </Badge>
    //     </>
    //   ),
    // },
    {
      Header: 'Actions',
      accessor: 'noti_id',
      cellClass: 'text-muted  w-10',
      Cell: (props) => (
        <>
          <div className="tbl-actions">
             {(
              <i
                className="iconsminds-mail-forward success"
                title="Consent Email"
                style={{ fontSize: 18 }}
                onClick={() => verifyUserById(props.value.user_id)}
              />
            )}
            {/*{props.value.verified && (
              <i
                className="iconsminds-turn-right-3 info"
                title="Tarnsfer Verification"
                style={{ fontSize: 18 }}
                onClick={() => TrasferVerification(props.value)}
              />
            )}
            {props.value.verified && (
              <i
                className="iconsminds-security-bug danger"
                title="Unverify Now"
                style={{ fontSize: 18 }}
                onClick={() => UnverifyUserById(props.value.user_id)}
              />
            )} */}
          </div>
        </>
      ),
    },
  ];

  useEffect(() => {
    recomposeIDTransfer();
    return () => {
      return true;
    };
  }, [match, users, notifications, recomposeIDTransfer]);

  useEffect(() => {

  }, [users]);

  useEffect(() => {
    console.log('[noti]', notifications);
  }, [notifications]);

  const recomposeIDTransfer = () => {
    let idTransfers = notifications.filter(noti => noti.type === '12');
    let format_data = [];
    for (let transfer of idTransfers) {
      let newItem = {};
      // copy all fields to new object
      Object.keys(transfer).forEach((key, i) => newItem[key] = transfer[key]);
      newItem.fromUser = getUserById(transfer.old_user_id);
      newItem.toUser = getUserById(transfer.user_id);
      format_data.push(newItem);
    }
    setData(format_data);
  };
  const getUserAvatarUrl = ({ photo, sex, avatarIndex }) => {
    if (photo) {
      return photo;
    }
    if (avatarIndex !== undefined && avatarIndex !== '') {
      return `/assets/avatar/${sex === '1' ? 'girl' : 'boy'
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

  const openAddModal = () => {
    history.push('/app/user/add');
  };
  const verifyUserById = async (user_id) => {
    try {
      // history.push(`/app/user/edit/${user_id}`);
      const usersF = users.filter((user) => user.user_id === user_id);
      console.log(usersF[0]);
      const profile = usersF[0];
      profile.verified = 1;

      const res = await updateUserProfile(profile);
      if (res.status === true) {
        NotificationManager.success('User has been verified', 'Verification');
        loadAllUsersAction();
      } else {
        NotificationManager.error(res.message, 'Verification');
      }
    } catch (err) {
      NotificationManager.error(
        'Error while updating verification!',
        'Verification'
      );
    }
  };
  const UnverifyUserById = async (user_id) => {
    try {
      const usersF = users.filter((user) => user.user_id === user_id);
      const profile = usersF[0];
      profile.verified = 0;

      const res = await updateUserProfile(profile);
      if (res.status === true) {
        NotificationManager.success('User has been unverified', 'Verification');
        loadAllUsersAction();
      } else {
        NotificationManager.error(res.message, 'Verification');
      }
    } catch (err) {
      NotificationManager.error(
        'Error while updating verification!',
        'Verification'
      );
    }
  };
  const TrasferVerification = (ban) => {
    NotificationManager.info('Coming soon');
  };
  const onConfirmBan = async (event, errors, values) => {
    // console.log(event, errors, values);
    if ((banInfo.active === 1 && errors.length === 0) || banInfo.active !== 1) {
      // console.log(values);
      setLoading(true);
      const res = await toggleBanStatus(
        banInfo,
        banInfo.active === 1 ? values.banReason : ''
      );
      setLoading(false);
      if (res.status === true) {
        NotificationManager.success(
          res.message,
          `${banInfo.active === 1 ? 'Ban' : 'Release'} User`
        );
        setBanModal(false);
        loadAllUsersAction();
      } else {
        NotificationManager.error(
          res.message,
          `${banInfo.active === 1 ? 'Ban' : 'Release'} User`
        );
      }
    }
  };
  const onConfirmDelete = async () => {
    console.log(delId, modalOptions);

    try {
      setLoading(true);
      const res = await deleteUserById(delId, modalOptions);
      setLoading(false);
      if (res.status === true) {
        NotificationManager.success(res.message, 'Delete User');
        loadAllUsersAction();
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
  const getUserById = (id) => {
    const filtered = users.filter(user => user.user_id === id);
    return filtered.length > 0 ? filtered[0] : {};
  }


  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.id-transfer" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>

      <Row>
        <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.id-transfer" />
          </h3>
        </Colxx>

        <Colxx className="d-flex justify-content-end" xxs={12}>
          <Button color="primary" className="mb-2" onClick={openAddModal}>
            <i className="simple-icon-plus mr-1" />
            <IntlMessages id="actions.add" />
          </Button>{' '}
        </Colxx>

        <Colxx xxs="12">
          <ReactTableWithPaginationCard cols={cols} data={data} />
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
                className={`btn-shadow btn-multiple-state mr-2 ${loading ? 'show-spinner' : ''
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
                className={`btn-shadow btn-multiple-state mr-2 ${loading ? 'show-spinner' : ''
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
  adminNotifications: { list: notifications }
}) => {
  const { list: posts } = postApp;
  const { list: users } = userApp;
  const { list: friends } = friendApp;

  return {
    friends,
    notifications,
    users,
    posts,
  };
};

export default connect(mapStateToProps, {
  loadAllUsersAction: loadAllUsers,
})(VerificationList);
