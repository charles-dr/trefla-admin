import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
} from 'reactstrap';

import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';

import { loadAllLangs } from '../../../redux/actions';
import {
  deleteLangByIdRequest,
  getLangInfoByIdRequest,
  getLangFileContentRequest,
  refreshLanguage,
  transformTime,
} from '../../../utils';

const UserList = ({ history, match, langs, loadAllLangsAction }) => {
  const [data, setData] = useState([]);
  const [confirm, setConfirm] = useState(false);
  const [delId, setDelId] = useState(-1);
  const [processing, setProcessing] = useState(false);

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
      accessor: 'lang_id',
      cellClass: 'text-muted  w-15',
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
              className="simple-icon-refresh refresh"
              title="Synchronize"
              style={{ fontSize: 18 }}
              onClick={() => refreshLangKeys(props.value)}
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
    recomposeLangs();
    return () => {};
  }, [match, langs, recomposeLangs]);

  const recomposeLangs = () => {
    const new_langs = [];
    for (const lang of langs) {
      const lang_item = {};
      // copy all key-values
      for (const key in lang) {
        if (lang[key] !== undefined) {
          lang_item[key] = lang[key];
        }
      }

      // put item to array
      new_langs.push(lang_item);
    }
    setData(new_langs);
  };
  const toAddPage = () => {
    history.push('/app/lang/add');
  };

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
        .then((res) => {
          console.log(res);
          if (res.status === true) {
            NotificationManager.success(res.message, 'Delete Language');
            loadAllLangsAction();
          } else {
            NotificationManager.warning(res.message, 'Delete Language');
          }
        })
        .catch((err) => {
          console.error(err);
          NotificationManager.warning(err.message, 'Delete Language');
        });
    } else {
      NotificationManager.warning(
        'No found language to delete!',
        'Delete Language'
      );
    }
  };
  const handleOnDownload = async (lang_id) => {
    const lang = await getLangInfoByIdRequest(lang_id);
    if (!lang) {
      NotificationManager.warning(
        'Not found language info!',
        'Download Language'
      );
    } else {
      const json_res = await getLangFileContentRequest(lang.code);

      if (json_res.status === true) {
        downloadAsFile(json_res.data, `${lang.code}.json`);
      } else {
        NotificationManager.warning(json_res.message, 'Download Language');
      }
    }
  };
  const downloadAsFile = (json, download_name) => {
    const res = JSON.stringify(json);
    const data = new Blob([res], { type: 'text/csv' });
    const csvURL = window.URL.createObjectURL(data);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', download_name);
    tempLink.click();
  };
  const refreshLangKeys = async (lang_id) => {
    console.log(lang_id, lang_id == 0, lang_id === 0);

    // no need to refresh English here.
    if (Number(lang_id) === 0) {
      NotificationManager.warning(
        'This is the default language!',
        'Sync Language'
      );
      return;
    }

    // lang object
    let lang_target = {};
    for (const lang of langs) {
      if (lang.lang_id === lang_id) {
        lang_target = lang;
      }
    }
    const lang_default = langs[0];

    setProcessing(true);

    const res = await refreshLanguage(lang_target, lang_default);

    setProcessing(false);

    if (res.status === true) {
      NotificationManager.success(res.message);
    } else {
      NotificationManager.error(res.message);
    }

    // console.log(lang_target);
  };
  const refreshAllLangs = async () => {
    setProcessing(true);
    try {
      for (const lang of langs) {
        if (Number(lang.lang_id) === 0) {
          continue;
        }

        await refreshLanguage(lang, langs[0]);
      }

      setProcessing(false);
      NotificationManager.success(
        'All languages are synchronized!',
        'Sync Language'
      );
    } catch (err) {
      console.log(err);
      setProcessing(false);
      NotificationManager.error(err.message, 'Sync Language');
    }
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
          <Button color="info" className="mb-2 mr-2" onClick={refreshAllLangs}>
            <i className="simple-icon-refresh mr-1" />
            Sync All Langs
          </Button>{' '}
          <Button color="primary" className="mb-2" onClick={toAddPage}>
            <i className="simple-icon-plus mr-1" />
            <IntlMessages id="actions.add" />
          </Button>{' '}
        </Colxx>

        <Colxx xxs="12">
          <ReactTableWithPaginationCard cols={cols} data={data} />
        </Colxx>
      </Row>

      {/* Confirm Delete */}
      <Modal
        isOpen={confirm}
        toggle={() => setConfirm(!confirm)}
        backdrop="static"
      >
        <ModalHeader>Confirm</ModalHeader>
        <ModalBody>Are you sure to remove this language?</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={deleteLanguage}>
            Ok
          </Button>{' '}
          <Button color="secondary" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Loading & Please wait */}
      <Modal
        isOpen={processing}
        toggle={() => setProcessing(!processing)}
        backdrop="static"
      >
        <ModalHeader>Alert</ModalHeader>
        <ModalBody>
          <span className="spinner d-inline-block">
            <span className="bounce1" />
            <span className="bounce2" />
            <span className="bounce3" />
          </span>
          Processing. Pleaset wait...
        </ModalBody>
      </Modal>
    </>
  );
};

const mapStateToProps = ({ langs: langApp }) => {
  const { list: langs } = langApp;

  return {
    langs,
  };
};

export default connect(mapStateToProps, {
  loadAllLangsAction: loadAllLangs,
})(UserList);
