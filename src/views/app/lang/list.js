import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Badge, Button, Label, Modal, ModalHeader, ModalBody, Row } from 'reactstrap';
import {
    AvForm,
    AvField,
    AvGroup,
    AvInput,
    AvFeedback,
} from 'availity-reactstrap-validation';

import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';

import { getPostTableContent } from '../../../api/functions.api';
import { _firebase, transformTime } from '../../../utils';




const UserList = ({ history, match, langs }) => {
    const [pageLoaded, setPageLoaded] = useState(true);
    const [data, setData] = useState([]);
    const [modalDetails, setModalDetails] = useState(false);


    const cols = [
        {
            Header: 'Name',
            accessor: 'name',
            cellClass: 'list-item-heading w-25',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Code',
            accessor: 'code',
            cellClass: 'text-muted  w-15',
            Cell: (props) => <>{props.value}</>,
        },
        {
            Header: 'Last Update',
            accessor: 'update_time',
            cellClass: 'text-muted  w-25',
            Cell: (props) => <>{transformTime(props.value)}</>,
        },
        {
            Header: 'Active',
            accessor: 'active',
            cellClass: 'text-muted  w-5',
            Cell: (props) => <><Badge color={props.value==1 ? 'success' : 'danger'} pill className="mb-1">{props.value==1 ? 'Active' : 'Disabled'}</Badge></>,
        },
        {
            Header: 'Actions',
            accessor: 'user_id',
            cellClass: 'text-muted  w-10',
            Cell: (props) => (
                <>
                    <div className="tbl-actions">
                        <i
                            className="iconsminds-file-edit"
                            title="Edit"
                            style={{ fontSize: 18 }}
                            onClick={() => handleOnEdit(props.value)}
                        />
                        <i
                            className="simple-icon-trash"
                            title="Remove"
                            style={{ fontSize: 18 }}
                            onClick={() => handleOnDelete(props.value)}
                        />
                    </div>
                </>
            ),
        },
    ];

    useEffect(() => {
        // console.log(friends, users, posts);
        const tableRows = recomposeLangs();
        return () => { };
    }, [match, langs]);


    const recomposeLangs = () => {
        let new_langs = [];
        for (let lang of langs) {
            let lang_item = {};
            // copy all key-values
            for (let key in lang) {
                if (lang[key] !== undefined) {
                    lang_item[key] = lang[key];
                }
            }
            
            // put item to array
            new_langs.push(lang_item);
        }
        setData(new_langs);
    }
    const toAddPage = () => {
        history.push('/app/lang/add');
    }


    const openAddModal = () => {
        // console.log('[openAddModal]');
        // setModalDetails(true);
    };
    const handleOnEdit = (_id) => {
        // getSchoolById({ variables: { _id: _id, force: new Date().getTime().toString() } });
    };
    const handleOnDelete = (_id) => {
        // if (window.confirm('Are you sure to delete data?')) {
        //     deleteSchoolById({ variables: { _id: _id } });
        // }
    };

    const onSubmit = (event, errors, values) => {
        // console.log(errors);
        // console.log(values, unit);
        // if (errors.length === 0) {
        //     // submit
        //     if (unit._id === "") { addNewSchool({ variables: values}); }
        //     else { updateSchoolById({ variables: {...values, _id: unit._id }}); }
        // }
    };
    const handleOnChange = (e) => {
        // setUnit({ ...unit, [e.target.name]: e.target.value });
    };
    const handleOnCheck = (column, colIndex) => {
        console.log(column, colIndex);
    };

    return (
        <>
            <Row>
                <Colxx xxs="12">
                    <Breadcrumb heading="menu.languages" match={match} />
                    <Separator className="mb-5" />
                </Colxx>
            </Row>

            <Row>
                <Colxx xxs="12">
                    <h3 className="mb-4">
                        <IntlMessages id="pages.languages" />
                    </h3>
                </Colxx>

                <Colxx className="d-flex justify-content-end" xxs={12}>
                    <Button color="primary" className="mb-2" onClick={toAddPage}>
                        <i className="simple-icon-plus mr-1" />
                        <IntlMessages id="actions.add" />
                    </Button>{' '}
                </Colxx>

                <Colxx xxs="12">
                    <ReactTableWithPaginationCard
                        cols={cols}
                        data={data}
                    />
                </Colxx>
            </Row>
        </>
    );
};

const mapStateToProps = ({ langs: langApp }) => {
    const { list: langs } = langApp;

    return {
        langs
    };
};

export default connect(mapStateToProps)(UserList);
