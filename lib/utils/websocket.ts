import { EventEmitter } from 'events';

class WebSocketClient extends EventEmitter {
  private url: string;
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private token: string | null = null;
  private isConnecting = false;

  constructor() {
    super();
    // Check if we're in the browser
    const isBrowser = typeof window !== 'undefined';
    const wsHost = process.env.NEXT_PUBLIC_WS_URL || 
      (isBrowser ? window.location.origin.replace(/^http/, 'ws') : 'ws://localhost:3000');
    this.url = `${wsHost}/ws`;
  }

  setToken(token: string) {
    this.token = token;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'auth', token: this.token }));
    }
  }

  connect() {
    if (typeof window === 'undefined') {
      return; // Don't connect on server-side
    }

    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnecting = false;
        console.log('WebSocket connected');
        if (this.token) {
          this.ws?.send(JSON.stringify({ type: 'auth', token: this.token }));
        }
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data.payload);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        console.log('WebSocket disconnected, attempting to reconnect...');
        this.scheduleReconnect();
      };

    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.connect();
    }, 5000);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

const wsClient = new WebSocketClient();
export default wsClient;
