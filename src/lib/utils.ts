import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function toHex(byte: number) {
  return byte.toString(16).padStart(2, "0")
}

export function generateClientId() {
  const cryptoApi = typeof globalThis !== "undefined" ? globalThis.crypto : undefined

  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID()
  }

  if (typeof cryptoApi?.getRandomValues === "function") {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80

    return [
      Array.from(bytes.slice(0, 4), toHex).join(""),
      Array.from(bytes.slice(4, 6), toHex).join(""),
      Array.from(bytes.slice(6, 8), toHex).join(""),
      Array.from(bytes.slice(8, 10), toHex).join(""),
      Array.from(bytes.slice(10, 16), toHex).join(""),
    ].join("-")
  }

  return `fallback-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}
