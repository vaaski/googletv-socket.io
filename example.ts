/* eslint-disable @typescript-eslint/no-non-null-assertion */

const statusText = document.querySelector<HTMLSpanElement>("#status")!

const initBtn = document.querySelector<HTMLButtonElement>("#init")!
const upBtn = document.querySelector<HTMLButtonElement>("#up")!
const downBtn = document.querySelector<HTMLButtonElement>("#down")!
const leftBtn = document.querySelector<HTMLButtonElement>("#left")!
const rightBtn = document.querySelector<HTMLButtonElement>("#right")!
const enterBtn = document.querySelector<HTMLButtonElement>("#enter")!
const backBtn = document.querySelector<HTMLButtonElement>("#back")!

/* eslint-enable @typescript-eslint/no-non-null-assertion */

const setupSocket = async () => {
  const module = await import("socket.io-client")
  const io = module.default
  const socket = io("http://localhost:3000")
  return socket
}

const setupKeyCodes = async () => {
  const module = await import("googletv/dist/proto/remotemessage.js")
  const { RemoteKeyCode } = module
  return RemoteKeyCode
}

const main = async () => {
  const socket = await setupSocket()
  const RemoteKeyCode = await setupKeyCodes()

  socket.on("secretCodeRequest", () => {
    const code = prompt("Enter pairing code")
    socket.emit("code", code)
  })

  socket.on("connect", () => (statusText.innerText = "connected"))
  socket.on("disconnect", () => (statusText.innerText = "disconnected"))

  initBtn.onclick = () => socket.emit("init")
  upBtn.onclick = () => socket.emit("key", RemoteKeyCode.KEYCODE_DPAD_UP)
  downBtn.onclick = () => socket.emit("key", RemoteKeyCode.KEYCODE_DPAD_DOWN)
  leftBtn.onclick = () => socket.emit("key", RemoteKeyCode.KEYCODE_DPAD_LEFT)
  rightBtn.onclick = () => socket.emit("key", RemoteKeyCode.KEYCODE_DPAD_RIGHT)
  enterBtn.onclick = () => socket.emit("key", RemoteKeyCode.KEYCODE_ENTER)
  backBtn.onclick = () => socket.emit("key", RemoteKeyCode.KEYCODE_BACK)
}
main()
