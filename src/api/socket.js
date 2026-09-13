import { io } from 'socket.io-client'
import { deepConvertKeys, snakeToCamel } from '../utils/caseConverter'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null

/**
 * Get or create the shared socket instance.
 * autoConnect=false — we explicitly connect after login.
 */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'], // skip polling fallback for speed
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    // Debug logs (helpful in dev — remove for production)
    socket.on('connect', () => console.log('🔌 Socket connected:', socket.id))
    socket.on('disconnect', (reason) => console.log('❌ Socket disconnected:', reason))
    socket.on('connect_error', (err) => console.error('Socket connection error:', err.message))
  }
  return socket
}

/** Open the WebSocket connection. */
export function connectSocket() {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

/** Close the WebSocket connection. */
export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect()
  }
}

/**
 * Subscribe to a socket event with automatic snake_case → camelCase conversion.
 * Returns an unsubscribe function.
 */
export function onSocketEvent(eventName, handler) {
  const s = getSocket()
  const wrapped = (payload) => handler(deepConvertKeys(payload, snakeToCamel))
  s.on(eventName, wrapped)
  return () => s.off(eventName, wrapped)
}
