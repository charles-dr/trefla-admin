import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Button } from 'reactstrap';
import Switch from 'rc-switch';
import 'rc-switch/assets/index.css';

import IntlMessages from '../../helpers/IntlMessages';
import { NotificationManager } from '../common/react-notifications';
import { ru_updateUserProfile } from '../../utils';
import { loadAllUsers } from '../../redux/actions';

const UserSettings = ({ profile, loadAllUsersAction, ...props }) => {
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [prof, setProf] = useState(profile);

  useEffect(() => {
    setProf(profile);
    return () => {};
  }, [profile]);

  const analyzeSettings = () => {
    const fromPost = !(
      prof &&
      prof.isNotiFromNewPost !== undefined &&
      prof.isNotiFromNewPost === 0
    );
    const fromMessage = !(
      prof &&
      prof.isNotiFromChat !== undefined &&
      prof.isNotiFromChat === 0
    );
    const fromComment = !(
      prof &&
      prof.isNotiFromComment !== undefined &&
      prof.isNotiFromComment === 0
    );
    const fromReaction = !(
      prof &&
      prof.isNotiFromReaction !== undefined &&
      prof.isNotiFromReaction === 0
    );
    const fromFriend = !(
      prof &&
      prof.isNotiFromFriend !== undefined &&
      prof.isNotiFromFriend === 0
    );

    const fromAll =
      fromPost && fromMessage && fromComment && fromReaction && fromFriend;
    return {
      fromPost,
      fromMessage,
      fromComment,
      fromReaction,
      fromFriend,
      fromAll,
    };
  };

  const saveSettings = async () => {
    setLoading(true);
    const res = await ru_updateUserProfile(prof);
    if (res.status === true) {
      setLoading(false);
      NotificationManager.success('User has been updated!', 'User Settings');
      // loadAllUsersAction();
      history.push('/app/user');
    } else {
      setLoading(false);
      NotificationManager.error(res.message, 'User Settings');
    }
  };

  const bool2Int = st => (st ? 1 : 0);

  const setAllNotification = (st) => {
    st = bool2Int(st);
    setProf({
      ...prof,
      isNotiFromFriend: st,
      isNotiFromChat: st,
      isNotiFromComment: st,
      isNotiFromReaction: st,
      isNotiFromNewPost: st,
    });
  };

  const {
    fromPost,
    fromMessage,
    fromComment,
    fromReaction,
    fromFriend,
    fromAll,
  } = analyzeSettings();

  return (
    <div className={`mx-auto ${props.className}`} style={{ maxWidth: 768 }}>
      <SwitchGroup
        className="mb-5"
        active={fromAll}
        setActive={setAllNotification}
        label="All"
      />

      <SwitchGroup
        className="mb-3"
        active={fromPost}
        setActive={(st) => setProf({ ...prof, isNotiFromNewPost: bool2Int(st) })}
        label="Post"
      />

      <SwitchGroup
        className="mb-3"
        active={fromMessage}
        setActive={(st) => setProf({ ...prof, isNotiFromChat: bool2Int(st) })}
        label="Message"
      />

      <SwitchGroup
        className="mb-3"
        active={fromComment}
        setActive={(st) => setProf({ ...prof, isNotiFromComment: bool2Int(st) })}
        label="Comment"
      />

      <SwitchGroup
        className="mb-3"
        active={fromReaction}
        setActive={(st) => setProf({ ...prof, isNotiFromReaction: bool2Int(st) })}
        label="Reaction"
      />

      <SwitchGroup
        className="mb-3"
        active={fromFriend}
        setActive={(st) => setProf({ ...prof, isNotiFromFriend: bool2Int(st) })}
        label="Friend"
      />

      <div className="d-flex justify-content-end align-items-center">
        <Button
          type="submit"
          color="primary"
          className={`btn-shadow btn-multiple-state ${
            loading ? 'show-spinner' : ''
          }`}
          size="lg"
          onClick={saveSettings}
        >
          <span className="spinner d-inline-block">
            <span className="bounce1" />
            <span className="bounce2" />
            <span className="bounce3" />
          </span>
          <span className="label">
            <IntlMessages id="user.update" />
          </span>
        </Button>
      </div>
    </div>
  );
};

const SwitchGroup = ({ active, label, className, setActive }) => (
  <div
    className={className}
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <label>{label}</label>
    <Switch
      className="custom-switch custom-switch-secondary"
      checked={active}
      onChange={(st) => setActive(st)}
    />
  </div>
);

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {
  loadAllUsersAction: loadAllUsers,
})(UserSettings);
