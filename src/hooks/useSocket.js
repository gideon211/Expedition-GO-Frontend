/**
 * @file hooks/useSocket.js
 * @description Socket.IO hook for real-time communication with the backend.
 *   Connects when the user is authenticated, disconnects on logout.
 *   Provides a socket instance + helper hooks for events.
 *
 * Usage:
 *   const socket = useSocket();
 *   socket.emit('chat:message', { conversationId, content });
 *   socket.on('notification', (data) => ...);
 *
 * @see lib/auth.js for token retrieval
 */
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getApiBaseUrl, getAuthToken } from '@/lib/auth';

// Singleton socket instance so it's shared across the app
let globalSocket = null;
let globalSocketInitialized = false;
let subscribers = new Set();
let connectionState = 'disconnected'; // 'connected' | 'connecting' | 'disconnected' | 'error'

function notifySubscribers() {
  subscribers.forEach((fn) => fn(globalSocket, connectionState));
}

/**
 * Initialize or return the existing Socket.IO connection.
 * Call this once when the user authenticates.
 */
export async function initSocket() {
  if (globalSocketInitialized) return globalSocket;
  globalSocketInitialized = true;

  const token = await getAuthToken();
  if (!token) {
    connectionState = 'disconnected';
    notifySubscribers();
    return null;
  }

  const baseUrl = getApiBaseUrl().replace(/\/api$/, '') || 'http://localhost:5000';

  connectionState = 'connecting';
  notifySubscribers();

  globalSocket = io(baseUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    timeout: 10_000,
  });

  globalSocket.on('connect', () => {
    connectionState = 'connected';
    notifySubscribers();
  });

  globalSocket.on('disconnect', (reason) => {
    connectionState = 'disconnected';
    notifySubscribers();
  });

  globalSocket.on('connect_error', () => {
    connectionState = 'error';
    notifySubscribers();
  });

  globalSocket.on('auth:expired', () => {
    // Token expired — disconnect and let the parent reconnect after refresh
    globalSocket.disconnect();
    connectionState = 'disconnected';
    notifySubscribers();
  });

  return globalSocket;
}

/**
 * Disconnect the Socket.IO connection (e.g., on logout).
 */
export function disconnectSocket() {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
  globalSocketInitialized = false;
  connectionState = 'disconnected';
  notifySubscribers();
}

/**
 * React hook that provides the current socket instance.
 * Returns null if not connected.
 */
export function useSocket() {
  const [socket, setSocket] = useState(globalSocket);
  const [status, setStatus] = useState(connectionState);

  useEffect(() => {
    const handler = () => {
      setSocket(globalSocket);
      setStatus(connectionState);
    };
    subscribers.add(handler);
    return () => subscribers.delete(handler);
  }, []);

  return { socket, status, isConnected: status === 'connected' };
}

/**
 * React hook that listens to a socket event and calls the callback.
 * Automatically cleans up the listener on unmount.
 *
 * @param {string} event — event name to listen to (e.g. 'notification')
 * @param {Function} callback — handler for the event data
 */
export function useSocketEvent(event, callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handler = (...args) => callbackRef.current(...args);
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [socket, event]);
}
