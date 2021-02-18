import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
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
// import Mailto from 'react-protected-mailto';
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

import { deleteReportByIdRequest, transformTime, formatTime } from '../../../utils';
import { loadAllReports } from '../../../redux/actions';
import * as api from '../../../api';
// import { reactionImages } from '../../../constants/custom';

const CommentList = ({
	match,
	history,
}) => {
  const [refreshTable, setRefreshTable] = useState(0);
	const [delModal, setDelModal] = useState(false);
	const [delId, setDelId] = useState(-1);
  const [updateModal, setUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [emailModal, setEmailModal] = useState(false);


	const cols = [
		{
			Header: 'Name',
			accessor: 'user',
			cellClass: 'list-item-heading w-15',
			Cell: (props) => (
				<>
					<Link to={`/app/admin/edit/${props.value.id}`}>
						{props.value.user_name}
					</Link>
				</>
			),
		},
		{
			Header: 'Email',
			accessor: 'email',
			cellClass: 'text-muted  w-20',
			Cell: (props) => <>{props.value}</>,
		},
    {
      Header: 'Image',
      accessor: 'avatar',
      cellClass: 'list-item-heading w-10',
      Cell: (props) => (
        <>
          <div className="">
            <img
              src={getAdminAvatar(props.value)}
              style={{ width: 50, height: 50, borderRadius: '50%' }}
              alt="User Profile"
            />
          </div>
        </>
      ),
    },
		{
			Header: 'Created At',
			accessor: 'create_time',
			cellClass: 'text-muted  w-10',
			Cell: (props) => <>{formatTime(new Date(Number(props.value) * 1000), "Y-m-d H:i:s")}</>,
		},
		{
			Header: 'Updated At',
			accessor: 'update_time',
			cellClass: 'text-muted  w-10',
			Cell: (props) => <>{formatTime(new Date(Number(props.value) * 1000), "Y-m-d H:i:s")}</>,
		},
		{
			Header: 'Actions',
			accessor: 'action',
			cellClass: 'text-muted  w-15',
			Cell: (props) => (
				<>
					<div className="tbl-actions">
            <Link to={`/app/admin/edit/${props.value.id}`}>
            <i
              className={`iconsminds-file-edit info`}
              title={`Edit`}
              style={{ fontSize: 18 }}
              onClick={() => handleOnUpdateStatus(props.value.self)}
            />
            </Link>
						<i
							className="simple-icon-trash danger"
							title="Remove"
							style={{ fontSize: 18 }}
							onClick={() => handleOnDelete(props.value.id)}
						/>
					</div>
				</>
			),
		},
	];

  const loadData = ({ limit, page }) => {
    return api.r_loadEmployeeRequest({ page, limit })
      .then(res => {
        const { data, pager, status } = res;
        if (status) {
          return {
            list: data.map(admin => ({
              ...admin,
              user: {
                user_name: admin.user_name,
                id: admin.id,
              },
              action: {
                id: admin.id,
                email: admin.email,
                self: admin,
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

  const getAdminAvatar = ( avatar ) => {
    if (avatar) return avatar;
    return `/assets/avatar/avatar_boy1.png`;
  };

	const handleOnDelete = (id) => {
		console.log(id);
		setDelId(id);
		setDelModal(true);
  };
  
	const proceedDelete = async () => {
		// console.log('[delete now]', delId);

		setLoading(true);

		const res = await api.r_deleteEmployeeRequest(delId);

		setLoading(false);

		setDelId(-1);

		if (res.status === true) {
			setDelModal(false);
			NotificationManager.success(res.message, 'Delete Employee');
      reloadTableContent();
		} else {
			NotificationManager.error(res.message, 'Delete Employee');
		}
	};

  const onConfirmEmail = async (event, errors, values) => {
    // console.log('[form values]', event, errors, values);
    if (!errors.length) {
      setLoading(true);
      const res = await api.r_sendEmail2Bugger(delId, values);
      setLoading(false);
      setDelId(-1);

      if (res.status) {
        setEmailModal(false);
        NotificationManager.success(res.message, 'Email to Reporter');
      } else {
        NotificationManager.error(res.message, 'Email to Reporter');
      }
    }
  }

  const handleOnUpdateStatus = (bug) => {
    delete bug.user;
    // console.log('[bug]', bug);
    setUpdateData(bug);
    setUpdateModal(true);
  }

  const confirmUpdateStatus = async (event, errors, values) => {
    const newData = { ...updateData, fixed: 1 - updateData.fixed };
    if (!errors || !errors.length) {
      setLoading(true);
      const res = await api.r_updateBugRequest(newData);
      setLoading(false);
      setUpdateData({});

      if (res.status) {
        setUpdateModal(false);
        NotificationManager.success(res.message, 'Update Status');
        reloadTableContent();
      } else {
        NotificationManager.error(res.message, 'Update Status');
      }
    }
  }

  const navigateToAddPage = () => {
    history.push('/app/admin/add');
  };

	return (
		<>
			<Row>
				<Colxx xxs="12">
					<Breadcrumb heading="menu.administrators" match={match} />
					<Separator className="mb-5" />
				</Colxx>
			</Row>

			<Row>
				<Colxx xxs="12">
					<h3 className="mb-4">
						<IntlMessages id="pages.admins" />
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
           />
				</Colxx>
			</Row>

			{/* Delete Modal */}
			<Modal
				isOpen={delModal}
				toggle={() => setDelModal(!delModal)}
				backdrop="static"
			>
				<ModalHeader>Delete Bug</ModalHeader>
				<ModalBody>
					<p>Are you sure to delete this bug?</p>

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


			{/* Update Modal */}
			<Modal
				isOpen={updateModal}
				toggle={() => setUpdateModal(!updateModal)}
				backdrop="static"
			>
				<ModalHeader>Update Status</ModalHeader>
				<ModalBody>
					<p>Are you sure to update status of this bug?</p>

					<Separator className="mb-5 mt-3" />
					<div className="d-flex justify-content-end">
						<Button
							type="button"
							color="primary"
							className={`btn-shadow btn-multiple-state mr-2 ${
								loading ? 'show-spinner' : ''
								}`}
							size="lg"
							onClick={confirmUpdateStatus}
						>
							<span className="spinner d-inline-block">
								<span className="bounce1" />
								<span className="bounce2" />
								<span className="bounce3" />
							</span>
							<span className="label">Update</span>
						</Button>{' '}
						<Button color="secondary" onClick={() => setUpdateModal(false)}>
							<IntlMessages id="actions.cancel" />
						</Button>
					</div>
				</ModalBody>
			</Modal>

		</>
	);
};

const mapStateToProps = ({ }) => {

	return {};
};

export default connect(mapStateToProps, {
	loadAllReportsAction: loadAllReports,
})(CommentList);
