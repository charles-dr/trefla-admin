const string2Coordinate = function (str) {
  try {
    const tmp_arr = str.split(',');
    return { lat: Number(tmp_arr[0]), lng: Number(tmp_arr[1]) };
  } catch (error) {
    return { lat: 0.0, lng: 0.0 };
  }
};

const deg2rad = function (deg) {
  return deg * (Math.PI / 180);
};

const formatTwoDigits = (num) => {
  return num > 9 ? num : `0${num}`;
};

const getDistanceFromLatLonInMeter = function (location1, location2) {
  const lat1 = location1.lat;
  const lon1 = location1.lng;
  const lat2 = location2.lat;
  const lon2 = location2.lng;

  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d * 1000;
};

const getUserLastLocation = function (user) {
  try {
    const locationItem = user.location_array[user.location_array.length - 1];
    const tmp_arr = locationItem.split('&&');
    return string2Coordinate(tmp_arr[0]);
  } catch (error) {
    console.log('[error while getting user last location]', error);
    return { lat: 0, lng: 0 };
  }
};

const isPostNotificationAllowed = function (user) {
  return (
    user.isNotiFromNewPost === undefined || user.isNotiFromNewPost === true
  );
};

const convertTimeToString = (dt) => {
  if (!dt) {
    dt = new Date();
  }

  const y = dt.getFullYear();
  const m = formatTwoDigits(dt.getMonth() + 1);
  const d = formatTwoDigits(dt.getDate());
  const H = formatTwoDigits(dt.getHours());
  const i = formatTwoDigits(dt.getMinutes());
  const s = formatTwoDigits(dt.getSeconds());
  const tz = -dt.getTimezoneOffset();
  return `${y}-${m}-${d}-${H}-${i}-${s}:${tz}`;
};

const getDateSeed = (dt = null) => {
  if (!dt) {
    dt = new Date();
  }
  const y = dt.getFullYear();
  const m = formatTwoDigits(dt.getMonth() + 1);
  const d = formatTwoDigits(dt.getDate());
  const rand = Math.floor(Math.random() * 1000);
  return `${y}-${m}-${d}-${rand}`;
}

exports.convertTimeToString = convertTimeToString;
exports.deg2rad = deg2rad;
exports.getDateSeed = getDateSeed;
exports.string2Coordinate = string2Coordinate;
exports.getDistanceFromLatLonInMeter = getDistanceFromLatLonInMeter;
exports.getUserLastLocation = getUserLastLocation;
