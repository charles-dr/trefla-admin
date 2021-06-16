import * as api from '../api';

export const ru_updateUserProfile = async (profile, avatarFile = null, cardFile = null) => {
  const { id: user_id } = profile;

  return Promise.all([
    avatarFile ? api.r_uploadFileRequest(avatarFile) : null,
    cardFile ? api.r_uploadFileRequest(cardFile) : null,
  ])
    .then(([uploadAvatar, uploadCard]) => {
      if (uploadAvatar && uploadAvatar.status) {
        profile.photo = uploadAvatar.url;
      }
      if (uploadCard && uploadCard.status) {
        profile.card_img_url = uploadCard.url;
      }
      return api.r_updateUserRequest(user_id, profile);
    })
};

export const ru_addUserProfile = async (profile, avatarFile = null, cardFile = null) => {
  return Promise.all([
    avatarFile ? api.r_uploadFileRequest(avatarFile) : null,
    cardFile ? api.r_uploadFileRequest(cardFile) : null,
  ])
    .then(([uploadAvatar, uploadCard]) => {
      if (uploadAvatar && uploadAvatar.status) {
        profile.photo = uploadAvatar.url;
      }
      if (uploadCard && uploadCard.status) {
        profile.card_img_url = uploadCard.url;
      }
      return api.r_addUserRequest(profile);
    })
};

export const ru_toggleBanStatus = async ({ active, user_id }, banReason) => {
  let updateData = {};
  updateData.active = 1 - Number(active);
  updateData.ban_reason = banReason;
  updateData.ban_reply = '';
  return api.r_updateUserRequest(user_id, updateData)
    .then(res => {
      if (res.status) {
        return {
          status: true,
          message: updateData.active === 1 ? 'You banned the user!' : 'You released the user!'
        };
      } else {
        return {
          status: false,
          message: 'Failed to update user!'
        };
      }
    })
    .catch(error => {
      return {
        status: false,
        message: 'Failed to update user!'
      };
    })
}
