const assert = require("node:assert");

const { getDevice } = require("./getDevice");
const { PromiseSocket } = require("promise-socket");

const PORT = 4998;

const sendData = async (host, irData) => {
  const [connectorAddress, commandId] = irData.split(",", 2);
  const sendir = Buffer.from(`sendir,${irData}\r`, "latin1");
  const completeir = Buffer.from(`completeir,${connectorAddress},${commandId}\r`, "latin1");
  const sock = new PromiseSocket();
  sock.setTimeout(10 * 1000);
  try {
    await sock.connect({
      host: host,
      port: PORT,
    });
    await sock.write(sendir);
    const resp = await sock.read(completeir.length);
    return completeir.equals(resp);
  } catch (e) {
    return e;
  } finally {
    sock.destroy();
  }
};

module.exports = async ({ host, irData, log, name, logLevel }) => {
  assert(
    irData && typeof irData === "string",
    `\x1b[31m[ERROR]: \x1b[0m${name} sendData (IR values are missing)`
  );

  const device = getDevice(host);
  if (!device) {
    return log(
      `\x1b[31m[ERROR] \x1b[0m${name} sendData (no host found; ensure host is configured`
    );
  }

  await device.mutex.use(async () => {
    const resp = await sendData(device.host, irData);
    if (logLevel <= 2) {
      log(`${name} sendData (${device.host}) ${irData}: ${resp}`);
    }
  });
};
