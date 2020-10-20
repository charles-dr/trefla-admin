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
  Row,
} from 'reactstrap';

import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';
import {
  AvForm,
} from 'availity-reactstrap-validation';
import Select from 'react-select';
import { Lines } from 'react-preloaders';


import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';
import CustomSelectInput from '../../../components/common/CustomSelectInput';

import { judgeIDTransferRequest, sendConsentEmail } from '../../../api/functions.api';
import {
  addVerificationRequest,
  addIDTransferRequest,
  deleteAdminNotiByIdRequest,
} from '../../../utils';
import { loadAllUsers, loadAllAdminNotiAction } from '../../../redux/actions';


const IDTransferList = ({
  match,
  history,
  friends,
  notifications,
  posts,
  users,
  loadAllUsersAction,
  loadAllAdminNotiAction$,
}) => {
  // Table Data
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [preloading, setPreloading] = useState(false);

  // for Delete Modal
  const [delId, setDeleteId] = useState(-1);
  const [delModal, setDelModal] = useState(false);

  // for Judge Modal
  const [judgeModal, setJudgeModal] = useState(false);
  const [judgeInfo, setJudgeInfo] = useState({ from: false, to: false, noti_id: 0 });
  const [verified, setVerified] = useState({ from: false, to: false });

  // Verification & ID Transfer Add Modal
  const [verifyUsers, setVerifyUsers] = useState([]);
  const [verifyUser, setVerifyUser] = useState(null);
  const [addVModal, setAddVModal] = useState(false);

  const [VTFromUser, setVTFromUser] = useState(null);
  const [VTToUser, setVTToUser] = useState(null);
  const [addVTModal, setAddVTModal] = useState(false);


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
              alt={props.value.user_name} /> <br />
            <Link to={`/app/user/edit/${props.value.user_id}`}>
              {props.value.user_name}
            </Link> <br />

            <div><label><b>Email</b>:</label>{' '}{props.value.email}</div>
            <div><label><b>Card Number</b>:</label>{' '}{props.value.card_number}</div>
            <div className="mb-1">
              <Badge
                color={props.value.card_verified === 1 ? 'outline-success' : 'outline-danger'}
                pill
                className="mb-1"
              >
                {props.value.card_verified === 1 ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
            {props.value.card_img_url && <img src={props.value.card_img_url}
              style={{ maxWidth: 200 }}
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
              alt={props.value.user_name} /> <br />
            <Link to={`/app/user/edit/${props.value.user_id}`}>
              {props.value.user_name}
            </Link> <br />

            <div><label>Email:</label>{' '}{props.value.email}</div>
            <div><label>Card Number:</label>{' '}{props.value.card_number}</div>
            <div className="mb-1">
              <Badge
                color={props.value.card_verified === 1 ? 'outline-success' : 'outline-danger'}
                pill
                className="mb-1"
              >
                {props.value.card_verified === 1 ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
            {props.value.card_img_url && <img src={props.value.card_img_url}
              style={{ maxWidth: 200 }}
              alt="ID Card" />}
          </div>
        </>
      ),
    },
    {
      Header: 'Consent Email',
      accessor: 'consent_emails',
      cellClass: 'list-item-heading w-10',
      Cell: (props) => (
        <>
          {props.value.length === undefined || props.value.length === 0 && <Badge color="outline-danger" pill>Never Sent</Badge>}
          {props.value.length !== undefined && props.value.length > 0 && <Badge color="outline-success" pill>{props.value.length} Times</Badge>}
        </>
      )
    },
    {
      Header: 'Actions',
      accessor: 'noti_id',
      cellClass: 'text-muted  w-10',
      Cell: (props) => (
        <>
          <div className="tbl-actions">
            {(
              <i
                className="iconsminds-mail-forward info"
                title="Consent Email"
                style={{ fontSize: 18 }}
                onClick={() => sendConsentEmailToUserA(props.value)}
              />
            )}
            {(
              <i
                className="iconsminds-scale success"
                title="Judge"
                style={{ fontSize: 18 }}
                onClick={() => judgeRequest(props.value)}
              />
            )}
            {(
              <i
                className="simple-icon-trash danger"
                title="Delete Request"
                style={{ fontSize: 18 }}
                onClick={() => deleteIDTransfer(props.value)}
              />
            )}
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
    const filtered = users.map((user, i) => ({
      label: `${user.user_name} (${user.email})`, value: user.user_id, key: i
    }));
    setVerifyUsers(filtered);
    if (filtered.length > 0) setVerifyUser(filtered[0]);
    return () => { };
  }, [match, users]);

  const recomposeIDTransfer = () => {
    let idTransfers = notifications.filter(noti => noti.type === '12');
    let format_data = [];
    for (let transfer of idTransfers) {
      let newItem = {};
      // copy all fields to new object
      Object.keys(transfer).forEach((key, i) => newItem[key] = transfer[key]);
      newItem.fromUser = getUserById(transfer.old_user_id);
      newItem.toUser = getUserById(transfer.user_id);
      newItem.consent_emails = transfer.consent_emails || [];
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
  const sendConsentEmailToUserA = (id) => {
    setPreloading(true);
    sendConsentEmail({ noti_id: id })
      .then(res => {
        setPreloading(false);
        NotificationManager.success(res.message, 'ID Transfer');
        loadAllAdminNotiAction$();
      })
      .catch(err => {
        setPreloading(false);
        NotificationManager.error(err.message, 'ID Transfer');
      });
  }
  const judgeRequest = (id) => {
    const tempNotis = notifications.filter(noti => noti.noti_id === id);

    if (tempNotis.length === 0) {
      // no matches
      NotificationManager.error('Not found the notification!', 'ID Transfer'); return;
    }
    const notification = tempNotis[0];

    // set ban info
    const fromUser = getUserById(notification.old_user_id);
    const toUser = getUserById(notification.user_id);

    setJudgeInfo({ from: fromUser, to: toUser, noti_id: id });
    setVerified({ from: !!fromUser.card_verified, to: !!toUser.card_verified });

    setJudgeModal(true);
  }
  const confirmJudgeIDTransfer = () => {
    if (verified.from && verified.to) {
      NotificationManager.warning("Both user can't be verified at a time!", 'ID Transfer'); return;
    } else if (!verified.from && !verified.to) {
      NotificationManager.warning("Please select a user to be verified!", "ID Transfer"); return;
    }
    setLoading(true);
    judgeIDTransferRequest({
      noti_id: judgeInfo.noti_id, verified: {
        from: verified.from === true ? 1 : 0,
        to: verified.to === true ? 1 : 0,
      }
    })
      .then(res => {
        setLoading(false);
        if (res.status === true) {
          NotificationManager.success(res.message, 'ID Transfer');
          setJudgeModal(false);
          loadAllUsersAction();
        } else {
          NotificationManager.error(res.message, 'ID Transfer');
        }
      })
      .catch(error => {
        setLoading(false);
        console.log(error.message);
        NotificationManager.error('Something went wrong!', 'ID Transfer');
      });
  }
  const deleteIDTransfer = (id) => {
    setDeleteId(id);
    setDelModal(true);
  }
  const confirmDeleteIDTransfer = () => {
    console.log(delId);
    setLoading(true);
    deleteAdminNotiByIdRequest(delId) 
      .then(res => {
        setLoading(false);
        setDelModal(false):
        if (res.status === true) {
          NotificationManager.success('ID transfer request deleted!', 'Delete ID Transfer Request');
          setAddVTModal(false);
          loadAllAdminNotiAction$();
        } else {
          NotificationManager.error('Failed to delete ID transfer request!', 'Delete ID Transfer Request')
        }
      })
      .catch(error => {
        console.log('[Del ID Transfer]', error.message);
        setLoading(false);
        setDelModal(false):
        NotificationManager.error('Something went wrong!', 'Delete ID Transfer Request');
      });
  }
  const confirmAddVerificationReq = () => {
    setLoading(true);
    addVerificationRequest(getNewNotificationId(), verifyUser.value)
      .then(res => {
        setLoading(false);
        if (res.status === true) {
          NotificationManager.success(res.message, 'Add Verification Request');
          loadAllAdminNotiAction$();
          setAddVModal(false);
        }
      })
      .catch(error => {
        setLoading(false);
        console.log('[add verification request]', error.message);
        NotificationManager.error('Something went wrong', 'Add Verification Request');
      });
  }
  const confirmAddIDTransferReq = () => {
    console.log(VTFromUser, VTToUser);
    if (!VTFromUser || !VTToUser) {
      NotificationManager.warning('Please select both users!', 'Add ID Transfer Request'); return;
    }

    setLoading(true);
    addIDTransferRequest(getNewNotificationId(), VTFromUser.value, VTToUser.value)
      .then(res => {
        setLoading(false);
        if (res.status === true) {
          NotificationManager.success(res.message, 'Add ID Transfer Request');
          loadAllAdminNotiAction$();
          setAddVTModal(false);
        }
      })
      .catch(error => {
        setLoading(false);
        console.log('[add ID Transfer request]', error.message);
        NotificationManager.error('Something went wrong!', 'Add ID Transfer Request');
      });
  }

  const openAddModal = () => {
    history.push('/app/user/add');
  };
  const getUserById = (id) => {
    const filtered = users.filter(user => user.user_id === id);
    return filtered.length > 0 ? filtered[0] : {};
  }
  const getNewNotificationId = () => {
    let newId = -1;
    for (const noti of notifications) {
      newId = noti.noti_id > newId ? noti.noti_id : newId;
    }
    return newId + 1;
  };


  return (
    <>
      <Lines
        background='blur'
        color="#fff"
        customLoading={preloading}
        time={0}
      />
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
          <Button color="primary" className="mb-2 mr-2" onClick={() => setAddVModal(true)}>
            <i className="simple-icon-plus mr-1" /> Verification
          </Button>{' '}

          <Button color="primary" className="mb-2" onClick={() => setAddVTModal(true)}>
            <i className="simple-icon-plus mr-1" /> ID Transfer
          </Button>{' '}
        </Colxx>

        <Colxx xxs="12">
          <ReactTableWithPaginationCard cols={cols} data={data} />
        </Colxx>
      </Row>

      {/* Delete Modal */}
      <Modal
        isOpen={delModal}
        toggle={() => setDelModal(!delModal)}
        backdrop="static"
      >
        <ModalHeader>Delete ID Transfer</ModalHeader>
        <ModalBody>
          <AvForm
            className="av-tooltip tooltip-label-right"
          >
            <h5>Are you sure to delete it?</h5>

            <Separator className="mb-5 mt-5" />
            <div className="d-flex justify-content-end">
              <Button
                type="button"
                color="primary"
                className={`btn-shadow btn-multiple-state mr-2 ${loading ? 'show-spinner' : ''
                  }`}
                size="lg"
                onClick={confirmDeleteIDTransfer}
              >
                <span className="spinner d-inline-block">
                  <span className="bounce1" />
                  <span className="bounce2" />
                  <span className="bounce3" />
                </span>
                <span className="label">Confirm</span>
              </Button>{' '}
              <Button color="secondary" onClick={() => setDelModal(false)}>
                <IntlMessages id="actions.cancel" />
              </Button>
            </div>
          </AvForm>
        </ModalBody>
      </Modal>

      {/* Judge Modal */}
      <Modal
        isOpen={judgeModal}
        toggle={() => setJudgeModal(!judgeModal)}
        backdrop="static"
      >
        <ModalHeader>ID Transfer</ModalHeader>
        <ModalBody>
          <AvForm
            className="av-tooltip tooltip-label-right"
          >

            <Row>
              {/* From User */}
              <Colxx xxs="6">

                <div className="text-center">
                  {judgeInfo.from && <img src={getUserAvatarUrl(judgeInfo.from)} alt="Old User" style={{ width: 50, height: 50, borderRadius: '50%' }} />}
                  {judgeInfo.from && <div className="mt-1 mb-2"><a href={`/app/user/edit/${judgeInfo.from.user_id}`} target="_blank">{judgeInfo.from.user_name}</a></div>}
                </div>
                <Label>Verified</Label>
                <Switch
                  className="custom-switch custom-switch-secondary"
                  checked={verified.from}
                  onChange={(st) => setVerified({ ...verified, from: st })}
                />
                {/* <AvGroup>
                  <Label>Ban Reason:</Label>
                  <AvInput
                    type="textarea"
                    name="banReason"
                    id="banReason"
                    required
                  />
                  <AvFeedback>Please enter ban reason!</AvFeedback>
                </AvGroup> */}
              </Colxx>

              {/* To User */}
              <Colxx xxs="6">
                <div className="text-center">
                  {judgeInfo.to && <img src={getUserAvatarUrl(judgeInfo.to)} alt="Old User" style={{ width: 50, height: 50, borderRadius: '50%' }} />}
                  {judgeInfo.to && <div className="mt-1 mb-2"><a href={`/app/user/edit/${judgeInfo.to.user_id}`} target="_blank">{judgeInfo.to.user_name}</a></div>}

                </div>
                <Label>Verified</Label>
                <Switch
                  className="custom-switch custom-switch-secondary"
                  checked={verified.to}
                  onChange={(st) => setVerified({ ...verified, to: st })}
                />
              </Colxx>
            </Row>

            <Separator className="mb-5 mt-3" />
            <div className="d-flex justify-content-end">
              <Button
                type="submit"
                color="primary"
                className={`btn-shadow btn-multiple-state mr-2 ${loading ? 'show-spinner' : ''
                  }`}
                size="lg"
                onClick={confirmJudgeIDTransfer}
              >
                <span className="spinner d-inline-block">
                  <span className="bounce1" />
                  <span className="bounce2" />
                  <span className="bounce3" />
                </span>
                <span className="label">
                  Confirm
                </span>
              </Button>{' '}
              <Button color="secondary" onClick={() => setJudgeModal(false)}>
                <IntlMessages id="actions.cancel" />
              </Button>
            </div>
          </AvForm>
        </ModalBody>
      </Modal>

      {/* Verification Test Modal */}
      <Modal
        isOpen={addVModal}
        toggle={() => setAddVModal(!addVModal)}
        backdrop="static"
      >
        <ModalHeader>Verification Request Simulation</ModalHeader>
        <ModalBody>
          <AvForm
            className="av-tooltip tooltip-label-right"
          >

            <label>User</label>
            <Select
              components={{ Input: CustomSelectInput }}
              className="react-select"
              classNamePrefix="react-select"
              placeholder="Select user..."
              value={verifyUser}
              onChange={setVerifyUser}
              options={verifyUsers}
            />

            <Separator className="mb-5 mt-5" />
            <div className="d-flex justify-content-end">
              <Button
                type="button"
                color="primary"
                className={`btn-shadow btn-multiple-state mr-2 ${loading ? 'show-spinner' : ''
                  }`}
                size="lg"
                onClick={confirmAddVerificationReq}
              >
                <span className="spinner d-inline-block">
                  <span className="bounce1" />
                  <span className="bounce2" />
                  <span className="bounce3" />
                </span>
                <span className="label">Confirm</span>
              </Button>{' '}
              <Button color="secondary" onClick={() => setAddVModal(false)}>
                <IntlMessages id="actions.cancel" />
              </Button>
            </div>
          </AvForm>
        </ModalBody>
      </Modal>

      {/* ID Transfer Test Modal */}
      <Modal
        isOpen={addVTModal}
        toggle={() => setAddVTModal(!addVTModal)}
        backdrop="static"
      >
        <ModalHeader>ID Transfer Request Simulation</ModalHeader>
        <ModalBody>
          <AvForm
            className="av-tooltip tooltip-label-right"
          >

            <div className="mb-4">
              <label>From</label>
              <Select
                components={{ Input: CustomSelectInput }}
                className="react-select"
                classNamePrefix="react-select"
                placeholder="Select origin user..."
                value={VTFromUser}
                onChange={setVTFromUser}
                options={verifyUsers}
              />
            </div>

            <div>
              <label>To</label>
              <Select
                components={{ Input: CustomSelectInput }}
                className="react-select"
                classNamePrefix="react-select"
                placeholder="Select new user..."
                value={VTToUser}
                onChange={setVTToUser}
                options={verifyUsers}
              />
            </div>
            <Separator className="mb-5 mt-5" />
            <div className="d-flex justify-content-end">
              <Button
                type="button"
                color="primary"
                className={`btn-shadow btn-multiple-state mr-2 ${loading ? 'show-spinner' : ''
                  }`}
                size="lg"
                onClick={confirmAddIDTransferReq}
              >
                <span className="spinner d-inline-block">
                  <span className="bounce1" />
                  <span className="bounce2" />
                  <span className="bounce3" />
                </span>
                <span className="label">Confirm</span>
              </Button>{' '}
              <Button color="secondary" onClick={() => setAddVTModal(false)}>
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
  loadAllAdminNotiAction$: loadAllAdminNotiAction,
})(IDTransferList);
