const Mutex = require("await-semaphore").Mutex;

const defaultHost = Symbol("defaultHost");
const devices = {};

const addHost = (name, host) => {
  devices[name] = {
    host: host,
    mutex: new Mutex(),
  };
};

const setDefaultHost = (host) => {
  addHost(defaultHost, host);
};

const getDevice = (host) => {
  if (host && !devices[host]) {
    addHost(host, host);
  }
  return devices[host || defaultHost];
};

module.exports = { getDevice, setDefaultHost };
