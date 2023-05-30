const ServiceManager = require("../helpers/serviceManager");
const delayForDuration = require("../helpers/delayForDuration");
const catchDelayCancelError = require("../helpers/catchDelayCancelError");
const GlobalCacheiTachIRAccessory = require("./accessory");

class SwitchAccessory extends GlobalCacheiTachIRAccessory {
  constructor(log, config = {}) {
    super(log, config);
  }

  setDefaults() {
    const { config } = this;

    config.offDuration = config.offDuration || 60;
    config.onDuration = config.onDuration || 60;

    if (
      config.enableAutoOn === undefined &&
      config.disableAutomaticOn === undefined
    ) {
      config.enableAutoOn = false;
    } else if (config.disableAutomaticOn !== undefined) {
      config.enableAutoOn = !config.disableAutomaticOn;
    }

    if (
      config.enableAutoOff === undefined &&
      config.disableAutomaticOff === undefined
    ) {
      config.enableAutoOff = false;
    } else if (config.disableAutomaticOff !== undefined) {
      config.enableAutoOff = !config.disableAutomaticOff;
    }
  }

  reset() {
    super.reset();

    this.stateChangeInProgress = true;

    // Clear Timeouts
    if (this.delayTimeoutPromise) {
      this.delayTimeoutPromise.cancel();
      this.delayTimeoutPromise = null;
    }

    if (this.autoOffTimeoutPromise) {
      this.autoOffTimeoutPromise.cancel();
      this.autoOffTimeoutPromise = null;
    }

    if (this.autoOnTimeoutPromise) {
      this.autoOnTimeoutPromise.cancel();
      this.autoOnTimeoutPromise = null;
    }

    if (
      this.serviceManager.getCharacteristic(Characteristic.On) === undefined
    ) {
      this.state.switchState = false;
      this.serviceManager.refreshCharacteristicUI(Characteristic.On);
    }
  }

  checkAutoOnOff() {
    this.reset();
    this.checkAutoOn();
    this.checkAutoOff();
  }

  async setSwitchState(irData) {
    const { data, host, log, name, logLevel, config, state, serviceManager } =
      this;
    this.stateChangeInProgress = true;
    this.reset();

    if (irData) {
      await this.performSend(irData);
    }

    if (config.stateless === true) {
      state.switchState = false;
      serviceManager.refreshCharacteristicUI(Characteristic.On);
    } else {
      this.checkAutoOnOff();
    }
  }

  async checkAutoOff() {
    await catchDelayCancelError(async () => {
      const { config, log, name, state, serviceManager } = this;
      let { disableAutomaticOff, enableAutoOff, onDuration } = config;

      if (state.switchState && enableAutoOff) {
        log(
          `${name} setSwitchState: (automatically turn off in ${onDuration} seconds)`
        );

        this.autoOffTimeoutPromise = delayForDuration(onDuration);
        await this.autoOffTimeoutPromise;

        serviceManager.setCharacteristic(Characteristic.On, false);
      }
    });
  }

  async checkAutoOn() {
    await catchDelayCancelError(async () => {
      const { config, log, name, state, serviceManager } = this;
      let { disableAutomaticOn, enableAutoOn, offDuration } = config;

      if (!state.switchState && enableAutoOn) {
        log(
          `${name} setSwitchState: (automatically turn on in ${offDuration} seconds)`
        );

        this.autoOnTimeoutPromise = delayForDuration(offDuration);
        await this.autoOnTimeoutPromise;

        serviceManager.setCharacteristic(Characteristic.On, true);
      }
    });
  }

  setupServiceManager() {
    const { data, name, config } = this;
    const { on, off } = data || {};

    this.serviceManager = new ServiceManager(
      name,
      Service.Switch,
      this.log
    );

    this.serviceManager.addToggleCharacteristic({
      name: "switchState",
      type: Characteristic.On,
      getMethod: this.getCharacteristicValue,
      setMethod: this.setCharacteristicValue,
      bind: this,
      props: {
        onData: on || data,
        offData: off || undefined,
        setValuePromise: this.setSwitchState.bind(this),
      },
    });
  }
}

module.exports = SwitchAccessory;
