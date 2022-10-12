## setup

install and transpile

```bash
npm ci
```

start

```bash
npm start
```

then open :3000 in your browser, enter the hostname/ip of your googleTV and click init.

enter the code from the tv when prompted.

you can use the up/down/left/right/back/enter buttons to test the remote.

from here on out you can control the googletv over socket.io, it'll re-use the hostname and connection upon restart.

## flow

1. connect to socket
2. (register event handler for `secretCodeRequest` - for setup)
3. emit `init` with hostname/ip
4. listen for `init` from server
5. emit `key` event with [key code](#key-codes)
6. go crazy

## events

### client to server

| name   | args       | type   | description                                      |
| ------ | ---------- | ------ | ------------------------------------------------ |
| `init` | `hostname` | string | initialize the connection to the tv              |
| `code` | `code`     | string | enter the code from the tv                       |
| `key`  | `key`      | number | send a key to the tv (numeric format, see below) |

### server to client

| name                | args    | type                           | description                                       |
| ------------------- | ------- | ------------------------------ | ------------------------------------------------- |
| `init`              |         |                                | tv is initialized, also emitted when reconnecting |
| `secretCodeRequest` | `code`  | string                         | tv requests a pairing code                        |
| `power`             | `state` | boolean                        | tv is turned on/off                               |
| `currentApp`        | `app`   | string                         | tv changes app                                    |
| `volumeState`       | `state` | [object](#volume-state-object) | tv changes volume                                 |
| `error`             | `error` | string                         | error occurred                                    |
| `ready`             |         |                                | connection is ready¨                              |
| `unpaired`          |         |                                | tv is unpaired                                    |

#### volume state object

```ts
interface VolumeState {
  current: number
  max: number
  isMuted: boolean
}
```

#### key codes

see [here](https://github.com/hctrl/googletv/blob/b8387294ed03e6300e1bdf5f4889144c6571aeaf/src/proto/remotemessage.ts#L9)
