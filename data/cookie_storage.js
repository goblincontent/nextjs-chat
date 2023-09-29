//  cookie storage variable
let localProcessedCookie = null;

// getter
const getLocalCookie = () => localProcessedCookie;

// setter
const setLocalCookie = (cookie) => {
  localProcessedCookie = cookie;

	// lock the getLocalCookie function; 
  // its scope with the localProcessedCookie value will be saved
  // after the setLocalCookie function completes
  return getLocalCookie;
};

module.exports = {
  setLocalCookie,
  getLocalCookie,
};