import { RemoteKeyCode } from "googletv"

import { readFile, writeFile } from "node:fs/promises"
import path from "path"
import { fileURLToPath } from "url"

import { GoogleTV } from "googletv"
import { Server } from "socket.io"
import debug from "debug"

const log = debug("googletv-socket.io")

const port = parseInt(process.env.SOCKET_PORT ?? "3000")

const io = new Server({
  cors: { origin: "*" },
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const GOOGLE_TV_ADDR = "gtv"
const CERT_PATH = path.join(__dirname, "./pairing-cert.json")

let gtv: GoogleTV

try {
  const paired = await readFile(CERT_PATH)
  const certificate = JSON.parse(paired.toString()) as { cert: string; key: string }

  log("using existing pairing certificate")

  gtv = new GoogleTV(GOOGLE_TV_ADDR, { certificate })
} catch (e) {
  gtv = new GoogleTV(GOOGLE_TV_ADDR)
}

io.on("connection", socket => {
  log("new socket connection")
  socket.on("code", code => gtv.sendPairingCode(code))
  socket.on("init", async () => {
    await gtv.init()
    await writeFile(CERT_PATH, JSON.stringify(gtv.options.certificate))
  })
  socket.on("key", async (keycode: RemoteKeyCode) => {
    gtv.remote.sendKey(keycode)
    log.extend("key")(RemoteKeyCode[keycode])
  })
})

gtv.on("secretCodeRequest", () => {
  io.emit("secretCodeRequest")
})

io.listen(port)
log(`listening on ${port}`)

export {}
