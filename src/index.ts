import { GoogleTV } from "googletv"
import { readFile, writeFile } from "node:fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const GOOGLE_TV_ADDR = "192.168.0.132"
const CERT_PATH = path.join(__dirname, "./pairing-cert.json")

let gtv: GoogleTV

try {
  const paired = await readFile(CERT_PATH)
  const certificate = JSON.parse(paired.toString()) as { cert: string; key: string }

  console.log("using existing pairing certificate")

  gtv = new GoogleTV(GOOGLE_TV_ADDR, { certificate })
} catch (e) {
  gtv = new GoogleTV(GOOGLE_TV_ADDR)
}

await gtv.init()
await writeFile(CERT_PATH, JSON.stringify(gtv.options.certificate))

console.log("works!")

export {}
