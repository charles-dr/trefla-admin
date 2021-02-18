/* eslint-disable global-require */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  // Label,
  Modal,
  ModalHeader,
  ModalBody,
  Row,
} from 'reactstrap';

// import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';
import {
  AvForm,
  // AvGroup,
  // AvInput,
  // AvFeedback,
} from 'availity-reactstrap-validation';
import ImgsViewer from 'react-images-viewer';

import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';

// import {
//   verifyUserByIdRequest
// } from '../../../api/functions.api';
// import {
//   deleteUserById,
//   // toggleBanStatus,
//   updateUserProfile,
// } from '../../../utils';
// import { loadAllUsers } from '../../../redux/actions';
import * as api from '../../../api';
import { menuPermission } from '../../../utils';

const NationalIDList = ({
  match,
  history,
  permission, role,
}) => {
  const [refreshTable, setRefreshTable] = useState(0);

  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line
  const [modalDetails, setModalDetails] = useState(false);
  const [modalOptions, setModalOptions] = useState({
    comment: true,
    post: true,
    report: true,
    friend: true,
    chat: true,
  });

  const [cardImgs, setCardImgs] = useState([]);
  const [currentImage, setCurrentImg] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  const [verifyModal, setVerifyModal] = useState(false);
  const [verifyInfo, setVerifyInfo] = useState({ mode: 0, user_id: -1, active: 1 }); // mode 0 - unverify, mode 1 - verify


  const cols = [
    {
      Header: 'Name',
      accessor: 'user',
      cellClass: 'list-item-heading w-15',
      Cell: (props) => (
        <>
          <Link to={`/app/user/edit/${props.value.id}`}>
            {props.value.name}
          </Link>
        </>
      ),
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
      Header: 'Card Number',
      accessor: 'card_number',
      cellClass: 'text-muted  w-5',
      Cell: (props) => <>{props.value}</>,
    },
    {
      Header: 'Card Image',
      accessor: 'card_img',
      cellClass: 'text-muted  w-5',
      Cell: (props) => (
        <>
          {!props.value.url && (
            <Badge color="dark" pill className="mb-1">
              No Image
            </Badge>
          )}
          {props.value.url && (
            <img
              src={props.value.url}
              alt="Card"
              onClick={() => showCardImage(props.value.user_id)}
              style={{ width: 100, height: 'auto', cursor: 'pointer' }}
            />
          )}
        </>
      ),
    },
    // {
    //     Header: 'Location',
    //     accessor: 'location_address',
    //     cellClass: 'text-muted  w-5',
    //     Cell: (props) => <>{props.value}</>,
    // },
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
      Header: 'Verified',
      accessor: 'verified',
      cellClass: 'text-muted  w-5',
      Cell: (props) => (
        <>
          <Badge
            color={props.value === 1 ? 'outline-success' : 'outline-danger'}
            pill
            className="mb-1"
          >
            {props.value === 1 ? 'Verified' : 'Unverified'}
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
            {(!props.value.verified && menuPermission({role, permission}, 'user.nationalId.verify')) && (
              <i
                className="iconsminds-security-check success"
                title="Verify Now"
                style={{ fontSize: 18 }}
                onClick={() => verifyUserById(props.value.user_id)}
              />
            )}
            {(props.value.verified  && menuPermission({role, permission}, 'user.nationalId.verify')) && (
              <i
                className="iconsminds-security-bug danger"
                title="Unverify Now"
                style={{ fontSize: 18 }}
                onClick={() => unverifyUserById(props.value.user_id)}
              />
            )}
          </div>
        </>
      ),
    },
  ];

  const loadData = ({ limit, page }) => {
    return api.r_loadCardRequest({ page, limit })
      .then(res => {
        const { data, pager, status } = res;
        if (status) {

          // const usersWithImg = data.filter(user => user.card_img_url);
          const imgObjects = data.filter(user => user.card_img_url).map(user => ({
            src: user.card_img_url,
            srcSet: [user.card_img_url],
            alt: user.id,
            caption: user.user_name,
          }));
          setCardImgs(imgObjects);

          return {
            list: data.map(user => ({
              ...user,
              image: {
                photo: user.photo,
                sex: user.sex,
                avatarIndex: user.avatarIndex,
              },
              card_img: {
                url: user.card_img_url,
                user_id: user.id,
              },
              action: {
                user_id: user.id,
                active: user.active,
                verified: user.card_verified === 1,
              },
              verified: user.card_verified,
              user: {
                id: user.id,
                name: user.user_name,
              },
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

  const getUserAvatarUrl = ({ photo, sex, avatarIndex }) => {
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

  const openAddModal = () => {
    history.push('/app/user/add');
  };

  const verifyUserById = async (user_id) => {
    setVerifyInfo({...verifyInfo, user_id: user_id, mode: 1}); // mode: target status
    setVerifyModal(true);
  }

  const confirmVerification = async () => {
    const user_id = verifyInfo.user_id;
    try {
      setLoading(true);
      const res = await api.r_verifyUserRequest({ id: user_id });
      setLoading(false);
      setVerifyModal(false);
      if (res.status === true) {
        NotificationManager.success('User has been verified!', 'Verification');
        reloadTableContent();
      } else {
        NotificationManager.error(res.message, 'Verification');
      }
    } catch (err) {
      NotificationManager.error('Error while updating verification!', 'Verification');
    }
  };

  const unverifyUserById = (user_id) => {
    setVerifyInfo({...verifyInfo, user_id: user_id, mode: 0});
    setVerifyModal(true);
  }

  const confirmUnverification = async () => {
    const user_id = verifyInfo.user_id;
    try {
      setLoading(true);
      const res = await api.r_unverifyUserRequest({ id: user_id }); //updateUserProfile(profile);
      setLoading(false);
      setVerifyModal(false);

      if (res.status === true) {
        NotificationManager.success('User has been unverified', 'Verification');
        reloadTableContent();
      } else {
        NotificationManager.error(res.message, 'Verification');
      }
    } catch (err) {
      NotificationManager.error('Error while updating verification!', 'Verification');
    }
  };

  const onConfirmVerification = async (event, errors, values) => {
    // console.log(event, errors, values);
    return verifyInfo.mode === 1 ? confirmVerification() : confirmUnverification();
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

  // Image Viewer
  const gotoPreviousImage = () => {
    const prevIndex = (cardImgs.length + currentImage - 1) % cardImgs.length;
    setCurrentImg(prevIndex);
  };

  const gotoNextImage = () => {
    setCurrentImg((cardImgs.length + currentImage + 1) % cardImgs.length);
  };

  const closeViewer = () => {
    setViewerOpen(false);
  };

  const showCardImage = (user_id) => {
    // get index
    setCurrentImg(getIndexInImgViewer(user_id));
    setViewerOpen(true);
  };

  const getIndexInImgViewer = (user_id) => {
    let index = 0;

    for (const [i, cardImg] of cardImgs.entries()) {
      if (cardImg.alt === user_id) {
        index = i;
        break;
      }
    }

    return index;
  };

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.national-ids" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>

      <Row>
        <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.national-ids" />
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

      <ImgsViewer
        imgs={cardImgs}
        currImg={currentImage}
        isOpen={viewerOpen}
        onClickPrev={gotoPreviousImage}
        onClickNext={gotoNextImage}
        onClose={closeViewer}
      />


      {/* Verify/Unverify Modal */}
      <Modal
        isOpen={verifyModal}
        toggle={() => setVerifyModal(!verifyModal)}
        backdrop="static"
      >
        <ModalHeader>
          {verifyInfo.mode === 1 ? 'Verify User' : 'Unverify User'}
        </ModalHeader>
        <ModalBody>
          <AvForm
            className="av-tooltip tooltip-label-right"
            onSubmit={(event, errors, values) =>
              onConfirmVerification(event, errors, values)
            }
          >

          <label>
            { verifyInfo.mode === 1 ? 'Are you sure to verify this user? Other accounts with same ID will be unverified!' : 'Are you sure to unverify this user?' }
          </label>

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
                  {verifyInfo.mode === 1 ? 'Verify' : 'Unverify'}
                </span>
              </Button>{' '}
              <Button color="secondary" onClick={() => setVerifyModal(false)}>
                <IntlMessages id="actions.cancel" />
              </Button>
            </div>
          </AvForm>
        </ModalBody>
      </Modal>
    </>
  );
};

const mapStateToProps = ({ auth }) => {
  const { permission, info: { role } } = auth;
  return { permission, role };
};

export default connect(mapStateToProps, {

})(NationalIDList);
