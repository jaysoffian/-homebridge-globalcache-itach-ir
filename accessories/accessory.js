const uuid = require("uuid");

const { HomebridgeAccessory } = require("../base");

const sendData = require("../helpers/sendData");
const delayForDuration = require("../helpers/delayForDuration");
const catchDelayCancelError = require("../helpers/catchDelayCancelError");

class GlobalCacheiTachIRAccessory extends HomebridgeAccessory {
  constructor(log, config = {}) {
    if (!config.name) {
      config.name = "Unknown Accessory";
    }

    config.resendDataAfterReload = config.resendHexAfterReload;

    super(log, config);
    if (config.debug) {
      this.debug = true;
    }

    this.manufacturer = "Global Caché";
    this.model = "iTach IR";
    this.serialNumber = uuid.v4();

    //Set LogLevel
    switch (this.config.logLevel) {
      case "none":
        this.logLevel = 6;
        break;
      case "critical":
        this.logLevel = 5;
        break;
      case "error":
        this.logLevel = 4;
        break;
      case "warning":
        this.logLevel = 3;
        break;
      case "info":
        this.logLevel = 2;
        break;
      case "debug":
        this.logLevel = 1;
        break;
      case "trace":
        this.logLevel = 0;
        break;
      default:
        //default to 'info':
        if (this.config.logLevel !== undefined) {
          log(
            `\x1b[31m[CONFIG ERROR] \x1b[33mlogLevel\x1b[0m should be one of: trace, debug, info, warning, error, critical, or none.`
          );
        }
        this.logLevel = 2;
        break;
    }
    if (this.config.debug) {
      this.logLevel = Math.min(1, this.logLevel);
    }
    if (this.config.disableLogs) {
      this.logLevel = 6;
    }
  }

  performSetValueAction({ host, data, log, name, logLevel }) {
    sendData({ host, irData: data, log, name, logLevel });
  }

  reset() {
    // Clear multi-IR timeouts
    if (this.intervalTimeoutPromise) {
      this.intervalTimeoutPromise.cancel();
      this.intervalTimeoutPromise = null;
    }

    if (this.pauseTimeoutPromise) {
      this.pauseTimeoutPromise.cancel();
      this.pauseTimeoutPromise = null;
    }
  }

  async performSend(data, actionCallback) {
    const { logLevel, host, log, name } = this;

    if (data === undefined) {
      return;
    }

    if (typeof data === "string") {
      sendData({ host, irData: data, log, name, logLevel });
      return;
    }

    await catchDelayCancelError(async () => {
      // Iterate through each IR data in the array
      for (let index = 0; index < data.length; index++) {
        const { pause } = data[index];

        await this.performRepeatSend(data[index], actionCallback);

        if (pause) {
          this.pauseTimeoutPromise = delayForDuration(pause);
          await this.pauseTimeoutPromise;
        }
      }
    });
  }

  async performRepeatSend(parentData, actionCallback) {
    const { host, log, name, logLevel } = this;
    let { data, interval, sendCount } = parentData;

    sendCount = sendCount || 1;
    if (sendCount > 1) {
      interval = interval || 0.1;
    }

    // Iterate through each IR data in the array
    for (let index = 0; index < sendCount; index++) {
      sendData({ host, irData: data, log, name, logLevel });

      if (interval && index < sendCount - 1) {
        this.intervalTimeoutPromise = delayForDuration(interval);
        await this.intervalTimeoutPromise;
      }
    }
  }
}

module.exports = GlobalCacheiTachIRAccessory;
