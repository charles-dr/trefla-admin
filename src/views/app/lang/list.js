import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Badge, Button, Modal, ModalHeader, ModalBody, ModalFooter, Row } from 'reactstrap';

import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';

import { loadAllLangs } from '../../../redux/actions';
import { deleteLangByIdRequest, getLangInfoByIdRequest, getLangFileContentRequest, transformTime } from '../../../utils';


const UserList = ({ history, match, langs, loadAllLangsAction }) => {

    const [pageLoaded, setPageLoaded] = useState(true);
    const [data, setData] = useState([]);
    const [modalDetails, setModalDetails] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [delId, setDelId] = useState(-1);


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
            Cell: (props) => <><Badge color={props.value == 1 ? 'success' : 'danger'} pill className="mb-1">{props.value == 1 ? 'Active' : 'Disabled'}</Badge></>,
        },
        {
            Header: 'Actions',
            accessor: 'lang_id',
            cellClass: 'text-muted  w-10',
            Cell: (props) => (
                <>
                    <div className="tbl-actions">
                        <i
                            className="iconsminds-file-edit info"
                            title="Edit"
                            style={{ fontSize: 18 }}
                            onClick={() => handleOnEdit(props.value)}
                        />
                        <i
                            className="simple-icon-cloud-download success"
                            title="Download"
                            style={{ fontSize: 18 }}
                            onClick={() => handleOnDownload(props.value)}
                        />
                        <i
                            className="simple-icon-trash danger"
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

    const handleOnEdit = (lang_id) => {
        history.push(`/app/lang/edit/${lang_id}`);
    };
    const handleOnDelete = (lang_id) => {
        setDelId(lang_id);
        setConfirm(true);
    };
    const deleteLanguage = () => {
        if (delId > -1) {

            setConfirm(false);
            setDelId(-1);

            deleteLangByIdRequest(delId)
                .then(res => {
                    console.log(res);
                    if (res.status === true) {
                        NotificationManager.success(res.message, 'Delete Language');
                        loadAllLangsAction();
                    } else {
                        NotificationManager.warning(res.message, 'Delete Language');
                    }
                })
                .catch(err => {
                    console.error(err);
                    NotificationManager.warning(err.message, 'Delete Language');
                })
        } else {
            NotificationManager.warning('No found language to delete!', 'Delete Language');
        }
    }
    const handleOnDownload = async (lang_id) => {
        const lang = await getLangInfoByIdRequest(lang_id);
        if (!lang) {
            NotificationManager.warning('Not found language info!', 'Download Language');
            return;
        } else {
            const json_res = await getLangFileContentRequest(lang.code);

            if (json_res.status === true) {
                downloadAsFile(json_res.data, `${lang.code}.json`);
            } else {
                NotificationManager.warning(json_res.message, 'Download Language');
            }
        }
    }
    const downloadAsFile = (json, download_name) => {
        const res = JSON.stringify(json);
        var data = new Blob([res], { type: 'text/csv' });
        var csvURL = window.URL.createObjectURL(data);
        let tempLink = document.createElement('a');
        tempLink.href = csvURL;
        tempLink.setAttribute('download', download_name);
        tempLink.click();
    }


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

            <Modal
                isOpen={confirm}
                toggle={() => setConfirm(!confirm)}
                backdrop={'static'}
            >
                <ModalHeader>Confirm</ModalHeader>
                <ModalBody>
                    Are you sure to remove this language?
                  </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={deleteLanguage}>
                        Ok
                    </Button>{' '}
                    <Button
                        color="secondary"
                        onClick={() => setConfirm(false)}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

const mapStateToProps = ({ langs: langApp }) => {
    const { list: langs } = langApp;

    return {
        langs
    };
};

export default connect(mapStateToProps, {
    loadAllLangsAction: loadAllLangs,
})(UserList);
