const request = require("request");

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function (callback) {
  const url = "https://api.ipify.org?format=json";
  // use request to fetch IP address from JSON API
  request(url, (error, response, body) => {
    if (error) {
      return callback(error, null);
    }
    if (response.statusCode !== 200) {
      callback(
        Error(`Status Code ${response.statusCode} for IP: ${body}`),
        null
      );
      return;
    }
    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
};
const ip = "66.183.71.227";
const fetchCoordsByIP = function (ip, callback) {
  request(
    `https://api.freegeoip.app/json/${ip}?apikey=dd05e260-9672-11ec-a102-f1ef2c090f14`,
    (error, response, body) => {
      if (error) {
        return callback(error, null);
      }
      const lat = JSON.parse(body).latitude;
      const long = JSON.parse(body).longitude;

      // const { latitude, longitude } = JSON.parse(body);
      return callback(null, { lat, long });
      // return callback(null, {lat: lat, long: long})
    }
  );
};

const lat = 49.1297;
const long = -123.1658;
const fetchISSFlyOverTimes = function (coords, callback) {
  request(
    `https://iss-pass.herokuapp.com/json/?lat=${lat}&lon=${long}`,
    (error, response, body) => {
      if (error) {
        return callback(error, null);
      }
      if (response.statusCode !== 200) {
        callback(
          Error(
            `status code ${response.statusCode} when fetching ISS passtimes ${body}`
          ),
          null
        );
        return;
      }
      const data = JSON.parse(body).response;
      callback(null, data);
    }
  );
};

// iss.js

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function (callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};

module.exports = {
  nextISSTimesForMyLocation,
};
