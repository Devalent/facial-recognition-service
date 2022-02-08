import { EventEmitter } from 'events';
import * as jsonrpc from 'jsonrpc-lite';
import { Connection } from 'openvidu-node-client';
import Deferred from 'promise-deferred';
import URI from 'urijs';
import { WebSocket } from 'ws';

type RequestHandler = {
  deferred;
  timer:NodeJS.Timeout;
};

type Params = { [x:string]:string|boolean|number; };

const REQUEST_TIMEOUT = 3 * 1000;

export declare interface OpenViduWsClient {
  on(event:'notification', listener:(payload:jsonrpc.NotificationObject) => void):this;
  on(event:string, listener:Function): this;
}

export class OpenViduWsClient extends EventEmitter {
  readonly sessionId:string;

  private readonly ws:WebSocket;
  private readonly init;
  private num = 0;
  private readonly handlers:{ [x:number]:RequestHandler; } = {};

  constructor(private readonly connection:Connection) {
    super();

    const uri = URI(connection.token);
    const query = uri.search(true);

    this.sessionId = query['sessionId'];

    uri.host(process.env.OPENVIDU_HOST);
    uri.search({ sessionId: this.sessionId });
    uri.path('/openvidu');

    this.init = new Deferred();
    this.ws = new WebSocket(uri.toString());

    this.ws.on('open', () => {
      this.init.resolve();
    });

    this.ws.on('close', () => {
      this.init.reject(new Error('WebSocket disconnected.'));
    });

    this.ws.on('message', (data:Buffer) => {
      const message = jsonrpc.parse(data.toString('utf-8')) as jsonrpc.IParsedObject;

      switch (message.type) {
        case 'success':
        case 'error':
          this.notifyHandler(message);
          break;
        case 'invalid':
          console.warn(`Invalid payload: ${message.type}`, message.payload);
          break;
        case 'notification':
          this.emit('notification', message.payload);
          break;
        default:
          console.warn(`Invalid reponse type: ${message.type}`);
          break;
      }
    });
  }

  async dispose() {
    this.removeAllListeners();

    this.ws.close();
  }

  async request(method:string, params?:Params):Promise<any> {
    await this.init.promise;

    const id = this.num++;

    const payload = jsonrpc.request(id, method, params);

    const handler = this.createHandler(id);

    await new Promise((resolve, reject) => {
      this.ws.send(JSON.stringify(payload), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });

    const response = await handler.deferred.promise as jsonrpc.IParsedObject;

    switch (response.type) {
      case 'error':
        throw response.payload.error;
      case 'success':
        return response.payload.result;
      default:
        throw new Error(`Invalid reponse type: ${response.type}`);
    }
  }

  async notification(method:string, params?:Params):Promise<void> {
    await this.init.promise;

    const payload = jsonrpc.notification(method, params);

    await new Promise((resolve, reject) => {
      this.ws.send(JSON.stringify(payload), (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  private createHandler(num:number):RequestHandler {
    const deferred = new Deferred();
    const handler:RequestHandler = {
      deferred,
      timer: setTimeout(() => {
        deferred.reject(new Error(`Request #${num} has timed out.`));

        delete this.handlers[num];
      }, REQUEST_TIMEOUT),
    };

    if (this.handlers[num]) {
      throw new Error('Invalid request ID.');
    }

    this.handlers[num] = handler;

    return handler;
  }

  private notifyHandler(message:jsonrpc.IParsedObject) {
    const num = message.payload?.['id'];

    const handler = this.handlers[num];

    if (!handler) {
      return;
    }

    delete this.handlers[num];

    clearTimeout(handler.timer);

    handler.deferred.resolve(message);
  }
}
