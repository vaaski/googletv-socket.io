/* eslint-disable @typescript-eslint/no-non-null-assertion */

const statusText = document.querySelector<HTMLSpanElement>("#status")!
const gtvStatus = document.querySelector<HTMLSpanElement>("#gtvstatus")!
const logContainer = document.querySelector<HTMLDivElement>("#messages")!

const addressInput = document.querySelector<HTMLInputElement>("#address")!

const initBtn = document.querySelector<HTMLButtonElement>("#init")!
const upBtn = document.querySelector<HTMLButtonElement>("#up")!
const downBtn = document.querySelector<HTMLButtonElement>("#down")!
const leftBtn = document.querySelector<HTMLButtonElement>("#left")!
const rightBtn = document.querySelector<HTMLButtonElement>("#right")!
const enterBtn = document.querySelector<HTMLButtonElement>("#enter")!
const backBtn = document.querySelector<HTMLButtonElement>("#back")!

/* eslint-enable @typescript-eslint/no-non-null-assertion */

const eventsToLog = ["power", "currentApp", "volumeState", "error", "ready", "unpaired"]

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

const logToPage = (event: string) => {
  return (...strings: any[]) => {
    console.log(event, ...strings)

    const stringify = (s: any) => JSON.stringify(s, null, 2)
    const message = `${event}: ${strings.map(stringify).join("; ")}`
    const pre = document.createElement("pre")
    pre.innerText = message
    logContainer.prepend(pre)
  }
}

addressInput.value = localStorage.getItem("address") ?? ""
addressInput.oninput = () => localStorage.setItem("address", addressInput.value)

const main = async () => {
  const socket = await setupSocket()
  const RemoteKeyCode = await setupKeyCodes()

  const initGTV = () => {
    return new Promise<void>(res => {
      if (!addressInput.value) return res()
      return socket.emit("init", addressInput.value, () => {
        gtvStatus.innerText = "initialized"
        res()
      })
    })
  }

  socket.on("secretCodeRequest", () => {
    const code = prompt("Enter pairing code")
    socket.emit("code", code)
  })

  socket.on("connect", () => (statusText.innerText = "connected"))
  socket.on("connect", initGTV)
  socket.on("disconnect", () => {
    statusText.innerText = "disconnected"
    gtvStatus.innerText = "not initialized"
  })

  for (const event of eventsToLog) {
    socket.on(event, logToPage(event))
  }

  initBtn.onclick = initGTV
  upBtn.onclick = () => socket.emit("key", RemoteKeyCode.KEYCODE_DPAD_UP)
  downBtn.onclick = () => socket.emit("key", RemoteKeyCode.KEYCODE_DPAD_DOWN)
  leftBtn.onclick = () => socket.emit("key", RemoteKeyCode.KEYCODE_DPAD_LEFT)
  rightBtn.onclick = () => socket.emit("key", RemoteKeyCode.KEYCODE_DPAD_RIGHT)
  enterBtn.onclick = () => socket.emit("key", RemoteKeyCode.KEYCODE_ENTER)
  backBtn.onclick = () => socket.emit("key", RemoteKeyCode.KEYCODE_BACK)
}
main()
