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
			Header: 'User',
			accessor: 'user',
			cellClass: 'list-item-heading w-15',
			Cell: (props) => (
				<>
					<Link to={`/#/app/user/edit/${props.value.id}`}>
						{props.value.user_name}
					</Link>
				</>
			),
		},
		{
			Header: 'Device Model',
			accessor: 'device_model',
			cellClass: 'text-muted  w-20',
			Cell: (props) => <>{props.value}</>,
		},
		{
			Header: 'Report',
			accessor: 'report',
			cellClass: 'text-muted  w-20',
			Cell: (props) => <>{props.value}</>,
		},
		{
			Header: 'Time',
			accessor: 'create_time',
			cellClass: 'text-muted  w-10',
			Cell: (props) => <>{formatTime(new Date(Number(props.value) * 1000), "Y-m-d H:i:s")}</>,
		},
    {
      Header: 'Fixed',
      accessor: 'fixed',
      cellClass: 'text-muted  w-5',
      Cell: (props) => (
        <>
          <Badge
            color={props.value === 1 ? 'success' : 'danger'}
            pill
            className="mb-1"
          >
            {props.value === 1 ? 'Fixed' : 'Pending'}
          </Badge>
        </>
      ),
    },
		{
			Header: 'Actions',
			accessor: 'action',
			cellClass: 'text-muted  w-15',
			Cell: (props) => (
				<>
					<div className="tbl-actions">
						{/* <a href={`mailto:${props.value.email}`}> */}
            <i
              className={`${
                props.value.self.fixed === 1
                  ? 'simple-icon-ban'
                  : 'simple-icon-check'
              } ${props.value.self.fixed === 1 ? 'warning' : 'success'}`}
              title={`${props.value.self.fixed === 1 ? 'Mark As Pending' : 'Mark As Fixed'}`}
              style={{ fontSize: 18 }}
              onClick={() => handleOnUpdateStatus(props.value.self)}
            />
						<i
						  className="iconsminds-envelope-2 info"
							title="Mail to Reporter"
              style={{ fontSize: 18 }}
              onClick={() => handleSendEmail(props.value.id)}
						/>
						{/* </a> */}
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
    return api.r_loadBugRequest({ page, limit })
      .then(res => {
        const { data, pager, status } = res;
        if (status) {
          return {
            list: data.map(bug => ({
              ...bug,
              action: {
                id: bug.id,
                email: bug.user.email,
                self: bug,
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
  
	const getParentContent = (target) => {
    if (!target) 
      return <Badge color="outline-danger" pill className="mb-1"> Unknown </Badge>;
    else if (target.feed) {
      return <NavLink href={`/#/app/post/edit/${target.id}`}>{target.feed}</NavLink>;
    } else if (target.comment) {
      return <NavLink href={`/#/app/comment/edit/${target.id}`}>{target.comment}</NavLink>;
    }
	};

	const handleOnDelete = (id) => {
		console.log(id);
		setDelId(id);
		setDelModal(true);
  };
  
	const proceedDelete = async () => {
		// console.log('[delete now]', delId);

		setLoading(true);

		const res = await api.r_deleteBugRequest(delId);

		setLoading(false);

		setDelId(-1);

		if (res.status === true) {
			setDelModal(false);
			NotificationManager.success(res.message, 'Delete Bug');
      reloadTableContent();
		} else {
			NotificationManager.error(res.message, 'Delete Bug');
		}
	};

  const handleSendEmail = (id) => {
    setDelId(id);
    setEmailModal(true);
  }

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

	return (
		<>
			<Row>
				<Colxx xxs="12">
					<Breadcrumb heading="menu.bugs" match={match} />
					<Separator className="mb-5" />
				</Colxx>
			</Row>

			<Row>
				<Colxx xxs="12">
					<h3 className="mb-4">
						<IntlMessages id="pages.bugs" />
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

      {/* Email Modal */}
      <Modal
        isOpen={emailModal}
        toggle={() => setEmailModal(!emailModal)}
        backdrop="static"
      >
        <ModalHeader>Email to Reporter</ModalHeader>
        <ModalBody>
          <AvForm
            className="av-tooltip tooltip-label-right"
            onSubmit={(event, errors, values) =>
              onConfirmEmail(event, errors, values)
            }
          >
              <AvGroup>
                <Label>Subject:</Label>
                <AvInput
                  type="text"
                  name="subject"
                  id="subject"
                  required
                />
                <AvFeedback>Please enter subject!</AvFeedback>
              </AvGroup>
              <AvGroup>
                <Label>Body:</Label>
                <AvInput
                  type="textarea"
                  name="body"
                  id="body"
                  required
                />
                <AvFeedback>Please enter content!</AvFeedback>
              </AvGroup>

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
                  Submit
                </span>
              </Button>{' '}
              <Button color="secondary" onClick={() => setEmailModal(false)}>
                <IntlMessages id="actions.cancel" />
              </Button>
            </div>
          </AvForm>
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
