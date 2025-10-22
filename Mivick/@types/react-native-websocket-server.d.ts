declare module 'react-native-websocket-server' {
  export class WebSocketServer {
    constructor(options: { port: number });
    onconnection(callback: (socket: any) => void): void;
    close(): void;
  }
}
