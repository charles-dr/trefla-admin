import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
	Badge,
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	NavLink,
	Row,
} from 'reactstrap';
import Mailto from 'react-protected-mailto';

import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';

import { deleteReportByIdRequest, transformTime } from '../../../utils';
import { loadAllComments, loadAllReports } from '../../../redux/actions';
import { reactionImages } from '../../../constants/custom';

const CommentList = ({
	match,
	history,
	comments,
	posts,
	reports,
	users,
	loadAllReportsAction,
}) => {
	const [data, setData] = useState([]);
	const [delModal, setDelModal] = useState(false);
	const [delId, setDelId] = useState(-1);
	const [loading, setLoading] = useState(false);

	const cols = [
		{
			Header: 'User',
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
			Header: 'Reason',
			accessor: 'reason',
			cellClass: 'text-muted  w-20',
			Cell: (props) => <>{props.value}</>,
		},
		{
			Header: 'Target',
			accessor: 'parent',
			cellClass: 'text-muted w-25',
			Cell: (props) => <>{getParentContent(props.value)}</>,
		},
		{
			Header: 'Target Type',
			accessor: 'type',
			cellClass: 'text-muted  w-5',
			Cell: (props) => (
				<>
					{props.value === 'COMMENT' && (
						<Badge color="outline-info" pill className="mb-1">
							{' '}
              Comment{' '}
						</Badge>
					)}
					{props.value !== 'COMMENT' && (
						<Badge color="outline-primary" pill className="mb-1">
							{' '}
              Post{' '}
						</Badge>
					)}
				</>
			),
		},
		{
			Header: 'Time',
			accessor: 'time',
			cellClass: 'text-muted  w-10',
			Cell: (props) => <>{transformTime(props.value)}</>,
		},
		{
			Header: 'Actions',
			accessor: 'action',
			cellClass: 'text-muted  w-15',
			Cell: (props) => (
				<>
					<div className="tbl-actions">
						<a href={`mailto:${props.value.email}`}>
							<i
								className="iconsminds-envelope-2 warning"
								title="Mail to Reporter"
								style={{ fontSize: 18 }}
							/>
						</a>
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

	useEffect(() => {
		// console.log(users, posts);

		recomposeReports();

		return () => { };
	}, [users, posts, comments, reports, recomposeReports]);
	const recomposeReports = () => {
		const new_reports = [];
		for (const report of reports) {
			let report_item = {};
			// copy all key-values
			for (const key in report) {
				if (report[key] !== undefined) {
					report_item[key] = report[key];
				}
			}

			// add new field 'user_name'
			// report_item['user_name'] = getUserNameById(report.user_id);
			report_item['user'] = {
				id: report.user_id,
				name: getUserNameById(report.user_id),
			};

			// add new field 'parent';
			report_item['parent'] = {
				type: report_item.type,
				target_id: report_item.target_id,
			};

			report_item['action'] = {
				id: report.report_id,
				email: getEmailById(report.user_id),
			};

			// put item to array
			new_reports.push(report_item);
		}
		setData(new_reports);
	};
	const getUserNameById = (id) => {
		if (users.length > 0) {
			for (const user of users) {
				if (Number(user.user_id) === Number(id)) {
					return user.user_name;
				}
			}
		} else {
			return '';
		}
	};
	const getEmailById = (id) => {
		if (users.length > 0) {
			for (const user of users) {
				if (Number(user.user_id) == Number(id)) {
					return user.email;
				}
			}
		} else {
			return '';
		}
	};
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
		} if (type === 'COMMENT') {
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
	};

	const handleOnDelete = (id) => {
		console.log(id);
		setDelId(id);
		setDelModal(true);
	};
	const proceedDelete = async () => {
		// console.log('[delete now]', delId);

		setLoading(true);

		const res = await deleteReportByIdRequest(delId);

		setLoading(false);

		setDelId(-1);

		if (res.status === true) {
			setDelModal(false);
			NotificationManager.success(res.message, 'Delete Post');
			loadAllReportsAction();
		} else {
			NotificationManager.error(res.message, 'Delete Post');
		}
	};

	return (
		<>
			<Row>
				<Colxx xxs="12">
					<Breadcrumb heading="menu.reports" match={match} />
					<Separator className="mb-5" />
				</Colxx>
			</Row>

			<Row>
				<Colxx xxs="12">
					<h3 className="mb-4">
						<IntlMessages id="pages.reports" />
					</h3>
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
				<ModalHeader>Delete Comment</ModalHeader>
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

const mapStateToProps = ({
	comments: commentApp,
	posts: postApp,
	users: userApp,
	reports: reportApp,
}) => {
	const { list: comments } = commentApp;
	const { list: posts } = postApp;
	const { list: reports } = reportApp;
	const { list: users } = userApp;

	return {
		comments,
		posts,
		reports,
		users,
	};
};

export default connect(mapStateToProps, {
	loadAllReportsAction: loadAllReports,
})(CommentList);
