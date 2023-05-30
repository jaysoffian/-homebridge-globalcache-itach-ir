# Homebridge Global Caché iTach IR

## Introduction

This [Homebridge](https://github.com/nfarina/homebridge) plugin supports sending IR commands via [Global Caché](https://www.globalcache.com) iTach IR products:

- WF2IR
- IP2IR
- IP2IR-P

## Documentation

This plugin is based on the [Homebridge Broadlink RM Pro](https://github.com/kiwi-cam/homebridge-broadlink-rm) plugin so start with [its documentation](https://broadlink.kiwicam.nz).

Important differences:

- No automatic discovery. You must manually provide the hostname or IP address of your iTach device.
- No IR learning.
- No MQTT.
- No ping/arp support.
- Only the following accessory types are supported:
  - switch
  - outlet
  - light
- Instead of a `hosts` array, add a single `host: <hostname or ip address>` at the top of the platform config. This is the default host that any accessories that don't have the own `host: <hostname or ip address>` will use.
- The "data" strings must adhere to the [iTach API `sendir` syntax](https://www.globalcache.com/files/docs/API-iTach.pdf), less the `sendir,` prefix. e.g.

  ```json
  {
      "name": "Accessory Name",
      "type": "switch",
      "data": {
          "on": "1:1,0,38000,1,1,129,65,16,...",
          "off": "1:1,1,38000,1,1,129,65,16,...",
      }
  }
  ```

  i.e. `<connectoraddress>,<ID>,<frequency>,<repeat>,<offset>,<on1>, <off1>,<on2>,<off2>,....,<onN>,<offN>`

  - `<connectoraddress>`: `1:1`, `1:2`, or `1:3` to send the command via IR port 1, 2, or 3.
  - `<ID>`: a value between 0-65535.

  Hint: Sign up for [Global Caché's Control Tower](https://irdb.globalcache.com) and have the codes e-mailed to you. It's a huge database and this is easier than learning all the codes.

### Sample Config

```json
{
  "platforms": [
    {
      "platform": "GlobalCacheiTachIR",
      "logLevel": "debug",
      "host": "192.168.1.100",
      "accessories": [
        {
          "name": "Denon AVR",
          "type": "switch",
          "data": {
            "on": "1:1,0,38000,1,1,129,65,16,16,16,16,16,49,16,16,16,49,16,16,16,49,16,16,16,16,16,49,16,16,16,16,16,49,16,49,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,49,16,16,16,49,16,16,16,16,16,16,16,16,16,16,16,49,16,16,16,16,16,49,16,16,16,16,16,49,16,16,16,16,16,16,16,49,16,49,16,16,16,16,16,49,16,16,16,16,16,16,16,2846",
            "off": "1:1,1,38000,1,1,10,30,10,70,10,30,10,30,10,30,10,30,10,70,10,30,10,70,10,70,10,70,10,70,10,30,10,30,10,30,10,1657,10,30,10,70,10,30,10,30,10,30,10,70,10,30,10,70,10,30,10,30,10,30,10,30,10,70,10,70,10,70,10,1657"
          }
        }
      ],
      "_bridge": {
        "username": "AA:BB:CC:DD:EE:FF",
        "port": 12345
      }
    }
  ]
}
```

## Credits

This plugin is based on <https://github.com/kiwi-cam/homebridge-broadlink-rm>. I removed most of its accessory types and adapted the remaining code to work with the Global Caché iTach protocol.
