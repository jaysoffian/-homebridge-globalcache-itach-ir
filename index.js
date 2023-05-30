const GlobalCacheiTachIRPlatform = require("./platform");

module.exports = (homebridge) => {
  global.Service = homebridge.hap.Service;
  global.Characteristic = homebridge.hap.Characteristic;

  GlobalCacheiTachIRPlatform.setHomebridge(homebridge);

  homebridge.registerPlatform(
    "homebridge-globalcache-itach-ir",
    "GlobalCacheiTachIR",
    GlobalCacheiTachIRPlatform
  );
};
