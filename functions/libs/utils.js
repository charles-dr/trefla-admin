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
    // console.log('[error while getting user last location]', error); // handled well
    return { lat: 0, lng: 0 };
  }
};

const getUserLocations = function (user) {
  try {
    let locations = [];
    if (user.location_array) {
      user.location_array.forEach((locItem) => {
        locations.push(string2Coordinate(locItem.split('&&')[0]));
      });
      return locations;
    } else {
      return [];
    }
  } catch (error) {
    return [];
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

const string2Timestamp = (str_time) => {
  const arr1 = str_time.split(':');
  const date_arr = arr1[0].split('-');
  const dt = new Date(
    Number(date_arr[0]),
    Number(date_arr[1]) - 1,
    Number(date_arr[2]),
    Number(date_arr[3]),
    Number(date_arr[4]),
    Number(date_arr[5])
  );
  const my_timezone = -dt.getTimezoneOffset();
  const time = dt.getTime();
  const timezoneOffset = Number(arr1[1]);
  const final_time =
    Math.floor(time / 1000) - (my_timezone - timezoneOffset) * 60;
  return final_time;
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
};

const checkPostLocationWithUser = (post, user, deltaTime, locationIndex) => {
  const postLocation = string2Coordinate(post.location_coordinate);
  const postTime = string2Timestamp(post.post_time);
  const userAroundRadius = user.radiusAround || 100;
  // console.log('[Around]', userAroundRadius);

  if (!user.location_array || !user.location_array.length) return true;

  // if index is set
  if (locationIndex || locationIndex === 0) {
    if (locationIndex < 0 || locationIndex > user.location_array.length - 1) {
      return false;
    } else {
      const currentArray = user.location_array[locationIndex].split('&&');
      // check around radius
      let userLocation = string2Coordinate(currentArray[0]);
      console.log(
        '[distance comparing]',
        getDistanceFromLatLonInMeter(postLocation, userLocation),
        userAroundRadius
      );
      
      if (
        getDistanceFromLatLonInMeter(postLocation, userLocation) >
        userAroundRadius
      ) {
        return false;
      }
      const givenTime = string2Timestamp(currentArray[1]);
      let nextLocationTime = Math.floor(new Date().getTime() / 1000);
      if (locationIndex < user.location_array.length - 1) {
        const nextArray = user.location_array[locationIndex + 1].split('&&');
        nextLocationTime = string2Timestamp(nextArray[1]);
      }
      return givenTime <= postTime && postTime <= nextLocationTime;
    }
  } else {
    for (let [index, locationItem] of user.location_array.entries()) {
      const itemMembers = locationItem.split('&&');
      // distance condition
      let userLocation = string2Coordinate(itemMembers[0]);
      // console.log(
      //   'Distance is ',
      //   getDistanceFromLatLonInMeter(postLocation, userLocation)
      // );
      if (
        getDistanceFromLatLonInMeter(postLocation, userLocation) >
        userAroundRadius
      ) {
        // console.log('[around] distance not match',);
        // return false;
        continue;
      }
      // console.log('[around] distance passed', getDistanceFromLatLonInMeter(postLocation, userLocation), userAroundRadius);
      // time condition
      const locationTime = string2Timestamp(itemMembers[1]);

      // get next location time
      let nextLocationTime = Math.floor(new Date().getTime() / 1000);
      if (index < user.location_array.length - 1) {
        const nextItemArray = user.location_array[index + 1].split('&&');
        nextLocationTime = string2Timestamp(nextItemArray[1]);
      }

      // postTime > locationTime
      if (locationTime <= postTime && postTime <= nextLocationTime) {
        return true;
      } else {
        continue;
      }
      // if (
      //   locationTime > postTime ||
      //   locationTime < postTime - deltaTime * 86400
      // ) {
      //   // console.log('[around] time not passed', postTime - locationTime)
      //   // return false;
      //   continue;
      // }
      // return true;
    }

    return false;
  }
};

exports.checkPostLocationWithUser = checkPostLocationWithUser;
exports.convertTimeToString = convertTimeToString;
exports.deg2rad = deg2rad;
exports.getDateSeed = getDateSeed;
exports.string2Coordinate = string2Coordinate;
exports.getDistanceFromLatLonInMeter = getDistanceFromLatLonInMeter;
exports.getUserLastLocation = getUserLastLocation;
