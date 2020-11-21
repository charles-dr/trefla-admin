import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  // Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
} from 'reactstrap';
import {
  AvForm,
  AvGroup,
  AvInput,
  // AvFeedback,
} from 'availity-reactstrap-validation';

import IntlMessages from '../../../helpers/IntlMessages';
import { NotificationManager } from '../../../components/common/react-notifications';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';
import { ReactTableWithPaginationCard } from '../../../containers/ui/ReactTableCards';

import { backupDBRequest, restoreBackupReqeust } from '../../../api/functions.api';

import {
  deleteBackupRequest,
  getDBBackupRequest,
  // moderateString,
  // transformTime,
  updateBackupNoteById,
} from '../../../utils';

const DBBackupList = ({ history, match }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [confirm, setConfirm] = useState(false);  // flag for delete modal
  const [delId, setDelId] = useState(-1);

  const [noteId, setNoteId] = useState(-1); // note modal
  const [noteModal, setNoteModal] = useState(false);

  const [restoreModal, setRestoreModal] = useState(false);
  const [restoreId, setRestoreId] = useState(-1);

  const cols = [
    {
      Header: 'File',
      accessor: 'file',
      cellClass: 'list-item-heading w-30',
      Cell: (props) => <>
        <a href={props.value.url} target="_blank" rel="noopener noreferrer">{props.value.name}</a>
      </>,
    },
    {
      Header: 'Time',
      accessor: 'time',
      cellClass: 'text-muted  w-40',
      Cell: (props) => <>{localTime(props.value)}</>,
    },
    {
      Header: 'Note',
      accessor: 'note',
      cellClass: 'text-muted  w-25',
      Cell: (props) => <>{props.value}</>,
    },
    {
      Header: 'Actions',
      accessor: 'action',
      cellClass: 'text-muted  w-5',
      Cell: (props) => (
        <>
          <div className="tbl-actions">
            <i
              className="iconsminds-notepad info"
              title="Note"
              style={{ fontSize: 18 }}
              onClick={() => handleOnEdit(props.value.id)}
            />
            <a href={props.value.url} target="_blank" rel="noopener noreferrer">
              <i
                className="simple-icon-cloud-download success"
                title="Download"
                style={{ fontSize: 18 }}
              />
            </a>
            <i
              className="simple-icon-magic-wand refresh"
              title="Restore"
              style={{ fontSize: 18 }}
              onClick={() => restoreFirebase(props.value.id)}
            />
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
    loadBackupList();
    return () => { }
  }, [match]);
  const loadBackupList = () => {
    getDBBackupRequest()
      .then(list => {
        composeTableData(list);
      });
  }
  const composeTableData = (backups) => {
    // file, time, note
    let newArr = [];
    for (let backup of backups) {
      const item = {
        file: {
          name: backup.file,
          url: backup.url,
        },
        time: backup.time,
        note: backup.note,
        action: {
          id: backup.id,
          url: backup.url
        }
      };
      newArr.push(item);
    }
    setData(newArr);
  }
  const localTime = (timestamp) => {
    const $time = Number(timestamp) * 1000;
    const dt = new Date($time);
    return dt.toLocaleString();
  }
  const backupDatabase = async () => {
    setLoading(true);
    try {
      const res = await backupDBRequest();
      if (res.status === true) {
        NotificationManager.success('Generated new DB backup!', 'DB Backup');
        loadBackupList();
      } else {
        NotificationManager.error('Something went wrong', 'DB Backup');
      }
    } catch (e) {
      NotificationManager.error(e.message, 'DB Bacup');
    }
    setLoading(false);

  };
  const handleOnEdit = (id) => {
    setNoteId(id);
    setNoteModal(true);
  };
  const handleOnDelete = (id) => {
    setDelId(id);
    setConfirm(true);
  }
  const confirmDelete = async () => {
    try {
      const res = await deleteBackupRequest(delId);
      console.log(res);
      setConfirm(false);
      NotificationManager.success('You deleted a backup!', 'Delete Backup');
      loadBackupList();
    } catch (e) {
      NotificationManager.error(e.message, 'Delete Backup');
    }
  }
  const handleSaveNote = async (event, errors, values) => {
    setLoading(true);
    try {
      await updateBackupNoteById(noteId, values.note);
      setNoteModal(false);
      setNoteId(-1);
      loadBackupList();
      NotificationManager.success('Note has been updated!', 'Backup Note');
    } catch (e) {
      NotificationManager.error(e.message, 'Backup Note');
    }
    setLoading(false);
  }
  const getSelBackupNote = () => {
    for (let bkup of data) {
      if (bkup.action.id === noteId) {
        return bkup.note;
      }
    }
    return '';
  }
  const restoreFirebase = (id) => {
    setRestoreId(id);
    setRestoreModal(true);
  }
  const confirmRestore = async () => {
    setLoading(true);
    try {
      await restoreBackupReqeust(restoreId);
      NotificationManager.success('Restored backup successfully!', 'Restore Backup');
      setRestoreModal(false);
    } catch (e) {
      NotificationManager.error(e.message, 'Restore Backup');
    }
    setLoading(false);
  }
  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.db-backups" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <h3 className="mb-4">
            <IntlMessages id="pages.db-backups" />
          </h3>
        </Colxx>
        <Colxx className="d-flex justify-content-end" xxs={12}>
          <Button
            color="primary"
            className={`btn-shadow btn-multiple-state ${loading ? 'show-spinner' : ''}`}
            onClick={backupDatabase}
          >
            <span className="spinner d-inline-block">
              <span className="bounce1" />
              <span className="bounce2" />
              <span className="bounce3" />
            </span>
            <span className="label">
              <i className="simple-icon-plus mr-1" />New Backup
            </span>
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
        <ModalBody>Are you sure to remove this backup?</ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={confirmDelete}
            className={`btn-shadow btn-multiple-state mr-2 ${loading ? 'show-spinner' : ''}`}
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
          <Button color="secondary" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Note Modal */}
      <Modal
        isOpen={noteModal}
        toggle={() => setNoteModal(!noteModal)}
        backdrop="static"
      >
        <ModalHeader>Backup Note</ModalHeader>
        <ModalBody>
          <AvForm
            className="av-tooltip tooltip-label-right"
            onSubmit={(event, errors, values) =>
              handleSaveNote(event, errors, values)
            }
            model={{ note: getSelBackupNote() }}
          >
            <AvGroup>
              {/* <Label></Label> */}
              <AvInput
                type="textarea"
                name="note"
                id="note"
                required
              />
              {/* <AvFeedback>Please add your note!</AvFeedback> */}
            </AvGroup>

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
                  Save
                </span>
              </Button>{' '}
              <Button color="secondary" onClick={() => setNoteModal(false)}>
                <IntlMessages id="actions.cancel" />
              </Button>
            </div>
          </AvForm>
        </ModalBody>
      </Modal>

      {/* Confirm Restore Modal */}
      <Modal
        isOpen={restoreModal}
        toggle={() => setRestoreModal(!restoreModal)}
        backdrop="static"
      >
        <ModalHeader>Confirm</ModalHeader>
        <ModalBody>Are you sure to restore this backup?</ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            className={`btn-shadow btn-multiple-state mr-2 ${loading ? 'show-spinner' : ''}`}
            onClick={confirmRestore}>
            <span className="spinner d-inline-block">
              <span className="bounce1" />
              <span className="bounce2" />
              <span className="bounce3" />
            </span>
            <span className="label">
              Confirm
            </span>
          </Button>{' '}
          <Button color="secondary" onClick={() => setRestoreModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

const mapStateToProps = ({ langs: langApp }) => {
  return {

  };
};

export default connect(mapStateToProps, {
})(DBBackupList);
