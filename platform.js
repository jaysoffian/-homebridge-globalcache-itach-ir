const { HomebridgePlatform } = require("./base");
const npmPackage = require("./package.json");
const Accessory = require("./accessories");
const { setDefaultHost } = require("./helpers/getDevice");

const classTypes = {
  light: Accessory.Light,
  outlet: Accessory.Outlet,
  switch: Accessory.Switch,
};

let homebridgeRef;

const GlobalCacheiTachIRPlatform = class extends HomebridgePlatform {
  constructor(log, config = {}) {
    super(log, config, homebridgeRef);
  }

  addAccessories(accessories) {
    const { config, log, logLevel } = this;

    log(
      `\x1b[35m[INFO]\x1b[0m Running Homebridge Global Caché iTach IR Plugin version \x1b[32m${npmPackage.version}\x1b[0m`
    );

    setDefaultHost(config.host);

    if (!config.accessories) {
      config.accessories = [];
    }

    // Iterate through the config accessories
    config.accessories.forEach((accessory) => {
      if (!accessory.type) {
        throw new Error(
          "Each accessory must be configured with a \"type\". e.g. \"switch\""
        );
      }

      if (accessory.disabled) {
        return;
      }

      if (!classTypes[accessory.type]) {
        throw new Error(
          `homebridge-globalcache-itach-ir doesn't support accessories of type "${accessory.type}".`
        );
      }

      const homeKitAccessory = new classTypes[accessory.type](log, accessory);

      if (logLevel <= 1) {
        log(
          `\x1b[34m[DEBUG]\x1b[0m Adding Accessory ${accessory.type} (${accessory.subType})`
        );
      }

      accessories.push(homeKitAccessory);
    });
  }
};

GlobalCacheiTachIRPlatform.setHomebridge = (homebridge) => {
  homebridgeRef = homebridge;
};

module.exports = GlobalCacheiTachIRPlatform;
