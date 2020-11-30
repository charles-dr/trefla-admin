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
import * as api from '../../../api';

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
  const [refreshTable, setRefreshTable] = useState(0);

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
      accessor: 'from',
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
      accessor: 'to',
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
      accessor: 'emails',
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
      accessor: 'id',
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

  const loadData = ({ limit, page }) => {
    return api.r_loadIDTrasferRequest({ page, limit })
      .then(res => {
        const { data, pager, status } = res;
        if (status) {
          return {
            list: data.map(row => ({
              ...row,
              consent_emails: row.from.email,
            })),
            pager,
          };
        } else {

        }
      });
  }

  const reloadTableContent = () => {
    setRefreshTable(refreshTable + 1);
  }

  useEffect(() => {
    api.r_loadUserRequest({ page: 0, limit: 0, mode: 'SIMPLE'})
      .then(({data: users, status}) => {
        if (status) {
          const filtered = users.map((user, i) => ({
            label: `${user.user_name} (${user.email})`, value: user.id, key: i
          }));
          setVerifyUsers(filtered);
          if (filtered.length > 0) setVerifyUser(filtered[0]);        
        }
      })

    return () => { };
  }, [match]);

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
  const sendConsentEmailToUserA = async (id) => {
    setPreloading(true);

    const { status, message } = await api.r_sendConsentEmailRequest(id);

    setPreloading(false);

    if (status) {
      NotificationManager.success(message, 'ID Transfer');
    } else {
      NotificationManager.error(message, 'ID Transfer');
    }
  }
  const judgeRequest = async (id) => {
    
    const { data: noti, status } = await api.r_IDTransferByIdRequest(id);

    if (!status) {
      NotificationManager.error('Error while loading data!', 'ID Tranfer');
      return;
    }

    setJudgeInfo({ from: noti.from, to: noti.to, noti_id: noti.id });
    setVerified({ from: !!noti.from.card_verified, to: !!noti.to.card_verified });

    setJudgeModal(true);
  }
  const confirmJudgeIDTransfer = async () => {
    if (verified.from && verified.to) {
      NotificationManager.warning("Both user can't be verified at a time!", 'ID Transfer'); return;
    } else if (!verified.from && !verified.to) {
      NotificationManager.warning("Please select a user to be verified!", "ID Transfer"); return;
    }
    setLoading(true);

    const newOwnerId = verified.from ? judgeInfo.from.id : (verified.to ? judgeInfo.to.id : 0);
    const result = await api.r_verifyUserRequest({ id: newOwnerId});
    setLoading(false);

    if (result.status) {
      NotificationManager.success(result.message, 'ID Transfer');
    } else {
      NotificationManager.error(result.message, 'ID Transfer');
    }
  }
  const deleteIDTransfer = (id) => {
    setDeleteId(id);
    setDelModal(true);
  }
  const confirmDeleteIDTransfer = async () => {
    console.log(delId);
    setLoading(true);

    const { status, message } = await api.r_deleteIDTransferRequest(delId);
    
    setLoading(false);
    setDelModal(false);

    if (status) {
      NotificationManager.success(message, 'Delete ID Transfer Request');
    } else {
      NotificationManager.error(message, 'Delete ID Transfer Request');
    }
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
    if (!VTFromUser.card_number) {
      NotificationManager.warning('Origin user must have card number!'); return;
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
          {/* <Button color="primary" className="mb-2 mr-2" onClick={() => setAddVModal(true)}>
            <i className="simple-icon-plus mr-1" /> Verification
          </Button>{' '} */}

          {/* <Button color="primary" className="mb-2" onClick={() => setAddVTModal(true)}>
            <i className="simple-icon-plus mr-1" /> ID Transfer
          </Button>{' '} */}
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
                  {judgeInfo.from && <div className="mt-1 mb-2"><a href={`/app/user/edit/${judgeInfo.from.user_id}`} target="_blank" rel="noopener noreferrer">{judgeInfo.from.user_name}</a></div>}
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
                  {judgeInfo.to && <div className="mt-1 mb-2"><a href={`/app/user/edit/${judgeInfo.to.user_id}`} target="_blank" rel="noopener noreferrer">{judgeInfo.to.user_name}</a></div>}

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
