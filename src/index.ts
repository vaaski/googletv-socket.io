import type { GTV } from "googletv/types/index.js"

import { RemoteKeyCode } from "googletv"

import { readFile, writeFile } from "node:fs/promises"
import path from "path"
import { fileURLToPath } from "url"

import { GoogleTV } from "googletv"
import { createServer } from "node:http"
import express from "express"
import { Server } from "socket.io"
import debug from "debug"

const log = debug("googletv-socket.io")

const port = parseInt(process.env.SOCKET_PORT ?? "3000")
const name = process.env.REMOTE_NAME ?? "socket.io remote"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const exp = express()
const httpServer = createServer(exp)
const io = new Server(httpServer, { cors: { origin: "*" } })
exp.use(express.static(path.join(__dirname, "../dist")))

const SETTINGS_PATH = path.join(__dirname, "../settings.json")
interface Settings {
  hostname?: string
  cert?: GTV.Certificate
}
let settings: Settings = {}
const saveSettings = async () => {
  await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2))
}

let gtv: GoogleTV

const initGTV = async (address: string) => {
  if (gtv) return

  gtv = new GoogleTV(address, {
    certificate: settings.cert,
    clientName: name,
    serviceName: name,
  })

  gtv.on("secretCodeRequest", () => {
    io.emit("secretCodeRequest")
  })

  log("pre-init")
  await gtv.init()
  log("post-init")

  gtv.remote.on("power", state => io.emit("power", state))
  gtv.remote.on("currentApp", app => io.emit("currentApp", app))
  gtv.remote.on("volumeState", state => io.emit("volumeState", state))
  gtv.remote.on("error", error => io.emit("error", error))
  gtv.remote.on("ready", () => io.emit("ready"))
  gtv.remote.on("unpaired", () => io.emit("unpaired"))

  settings.cert = gtv.options.certificate
  settings.hostname = gtv.host

  await saveSettings()
}

io.on("connection", socket => {
  log("new socket connection")

  if (gtv) socket.emit("init")

  socket.on("code", code => gtv.sendPairingCode(code))
  socket.on("init", async (address: string) => {
    await initGTV(address)
    return io.emit("init")
  })

  socket.on("key", async (keycode: RemoteKeyCode) => {
    gtv.sendKey(keycode)
    log.extend("key")(`${RemoteKeyCode[keycode]} (${keycode})`)
  })
})

readFile(SETTINGS_PATH, "utf-8")
  .then(file => {
    if (file) settings = JSON.parse(file) as Settings
  })
  .catch(log)
  .then(() => {
    if (settings.cert && settings.hostname) initGTV(settings.hostname)
  })
  .then(() => {
    httpServer.listen(port)
    console.log(`listening on :${port}`)
  })

export {}
