import * as vscode from 'vscode';
import * as SerialPort from 'serialport';
import * as fs from 'fs';
import { performance } from 'perf_hooks';

/**
 * @type RPCRequest an RPC request message
 *
 * @prop {string} `'m'` method to invoke.
 * @prop {Object?} `'p'` optional parameters for method.
 * @prop {string|null?} `'i'` optional request ID.
 */
type RPCRequest = {
  'm': string;
  'p'?: Object;
  'i'?: string;
};

/**
 * @type RPCResponse an RPC response message
 *
 * @prop {any?} `'r'` RPC response body
 * @prop {Object?} `'e'` RPC error body
 * @prop {string|null} `'i'` required response ID.
 */
type RPCResponse = {
  'r'?: any;
  'e'?: Object;
  'i': string | null;
};

/**
 * @type HubOptions Connection options
 *
 * @prop {boolean=} `magic` automatically try and find a suitable port to connect. Defaults to `true`
 * @prop {string=} `port` port to use if `magic` is disabled. Defaults to `'/dev/ttyACM0'`.
 * @prop {number|null=}  `timeout` how long to wait for responses from the Hub.
 */
type HubOptions = {
  magic?: boolean;
  port?: string;
  timeout?: number | null;
};

/**
 * Manages sending and receiving of JSON Remote Procedure Call (JSON-RPC) protocol messages
 * to the Hub.
 */
export default class HubManager {
  private port: SerialPort;
  private receiveQueue: string[] = []; // queue of received messages to handle
  public responses: RPCResponse[] = []; // list of messages returned to the user

  // ======================== INSTANCE METHODS ========================

  /**
   * Private constructor, use static `create` + `init`
   */
  private constructor(public options: HubOptions) { }

  /**
   * Initializes a created HubManager with the current option settings
   */
  public async init(): Promise<void> {
    try {
      this.port = new SerialPort(
        this.options.port!,
        {
          autoOpen: true,
          baudRate: 112500,
        }
      );
    } catch (err) {
      // error during port opening
      throw err;
    }

    this.port.setEncoding('utf-8');

    // push lines received to data queue

    let rl = this.port.pipe(new SerialPort.parsers.Readline({delimiter: '\r'}));
    rl.on('data', data => this.receiveQueue.push(data));
  }

  public async close(): Promise<void> {
    this.port.close(console.error);
  }

  /**
   * Send an RPC message and get the corresponding response.
   *
   * @param `proc` Procedure to execute
   * @param `params` Optional parameters for the procedure
   * @param `id` The ID to use for the RPC message. Use null to indicate no ID/notification message.
   *             If neither a string or `null` is passed, an ID is automatically generated.
   */
  // TODO: make send take a single RPCRequest argument, made inline in each function
  public async send(request: RPCRequest): Promise<RPCResponse> {
    return new Promise(resolve => {
      if (request['i'] === undefined) {
        // generate an ID
        request['i'] = 'mind-reader-' + HubManager.randomID();
      }

      // write JSON to port
      this.port.write(JSON.stringify(request));
      this.port.write('\r', async () => {
        if (request['i']) {
          // expecting a response
          let response = await this.recv(request['i']);
          resolve(response);
        }
      });
    });
  }

  /**
   * Receive an RPC message.
   *
   * @param `id` The id to match received messages against. Use `null` to match *all* messages
   */
  public async recv(id: string | null): Promise<RPCResponse> {
    let index = 0; // index into receive qeueue
    let startTime = performance.now();

    return new Promise(async (resolve) => {
      // used for non-blocking "wait-until" behavior
      let rcv = () => {
        let elapsedTime = performance.now() - startTime;
        if (this.options.timeout !== null && elapsedTime >= this.options.timeout!) {
          return resolve({
            'e': 'Timed out while receiving message',
            'i': id
          });
        }

        // check that there is more data in the queue
        if (index < this.receiveQueue.length) {
          // get next message in queue
          let r = this.receiveQueue[index];
          index++;

          try {
            let j = JSON.parse(r);


            // check for matching id
            if (id === null || 'i' in j && j['i'] === id) {
              let response: RPCResponse;
              // is response an error?
              if ('e' in j) {
                // decode error from base64
                let error = JSON.parse(Buffer.from(j['e'], 'base64').toString('ascii'));

                response = {
                  'i': id,
                  'e': error
                };

                this.responses.push(response);
                return resolve(response);
              } else {
                response = j;
              }

              // trim start of queue (just processed)
              this.receiveQueue = this.receiveQueue.slice(index);

              // return response object
              this.responses.push(response);
              return resolve(response);
            } else {
              // not at end of queue, eager retry
              setTimeout(rcv, 0);
            }
          } catch (err) {
            // TODO: parse print statements somehow
            //console.debug('Could not parse json response: "' + r + '"');

            // not at end of queue, eager retry
            setTimeout(rcv, 0);
          }
        } else {
          // no more data in queue, wait
          // before attempting again
          setTimeout(rcv, 1000);
        }

      };

      rcv();
    });
  }

  public async uploadFile(file: string, slotid: number, name?: string, autoStart: boolean = false) {
    const data = fs.readFileSync(file, 'utf8');
    const size = data.length;
    name = name || file;
    const now = performance.now();

    const ack = await this.startWriteProgram(name, size, slotid, now, now);
    const blockSize = ack['r'].blocksize;
    const transferid = ack['r'].transferid;

    const numBlocks = Math.ceil(size / blockSize);

    for (let i = 0; i < numBlocks; i++) {
      const dataChunk = data.substring(i*blockSize, i*blockSize + blockSize);
      await this.writePackage(dataChunk, transferid);
    }

    if (autoStart) {
      return Promise.resolve(await this.programExecute(slotid));
    }
  }

  // ========================= Hub Methods =========================
  // TODO: only spike is supported rn -> m_strType
  //
  // These methods each handle a single RPC method's communication.

  /**
   * Execute a program that is saved on the hub
   *
   * @param `slotid` Slot ID of the program to run
   */
  public async programExecute(slotid: number): Promise<RPCResponse> {
    return Promise.resolve(
      await this.send({
        'm': 'program_execute',
        'p': {
          'slotid': slotid
        }
      })
    );
  }

  /**
   * Terminate a currently running program
   */
  public async programTerminate(): Promise<RPCResponse> {
    return Promise.resolve(
      await this.send({ 'm': 'program_terminate' })
    );
  }

  /**
   * Get the storage status of the hub
   *
   * TODO: fill with actual example
   * slot
   * decoded name
   * size
   * last modified
   * project_id
   * type
   */
  public async getStorageStatus(): Promise<RPCResponse> {
    return Promise.resolve(
      await this.send({ 'm': 'get_storage_status' })
    );
  }

  /**
   * Notify the Hub that a program write is about to occur.
   *
   * @param `name` Name of the program.
   * @param `name` Size of the program TODO: in bytes?
   * @param `slotID` Slot ID to write the program to
   * @param `created` Creation timestamp
   * @param `modified` Modified timestamp
   */
  public async startWriteProgram(
    name: string,
    size: number,
    slotID: number,
    created: number,
    modified: number
  ): Promise<RPCResponse> {
    // file meta data
    let stat  = {
      'created': created,
      'modified': modified,
      'name': name,
      'type': 'python', // always python
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'project_id': '50uN1ZaRpHj2', // TODO: check this
    };

    return Promise.resolve(
      await this.send({
        'm': 'start_write_program',
        'p': {
          'slotid': slotID,
          'size': size,
          'meta': stat
        }
      })
    );
  }

  /**
   * Write a package chunk of a file
   *
   * @param `data` Chunk of data to write
   * @param `transferID` The transfer id for the current transfer
   */
  public async writePackage(data: string, transferID: string): Promise<RPCResponse> {
    return Promise.resolve(
      await this.send({
        'm': 'write_package',
        'p': {
          'data': Buffer.from(data, 'utf-8').toString('base64'),
          'transferid': transferID
        }
      })
    );
  }

  /**
   * Move a program from slot `fromSlot` to slot `toSlot`.
   * TODO: verify
   * If the destination already has a program stored in it, the two programs
   * are swapped
   *
   * @param `fromSlot` slot to move from
   * @param `toSlot` slot to move to
   */
  public async moveProgram(oldSlotID: number, newSlotID: number) {
    return Promise.resolve(
      await this.send({
        'm': 'move_project',
        'p': {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'old_slotid': oldSlotID,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'new_slotid': newSlotID
        }
      })
    );
  }

  /**
   * Delete a program from the slot on the Hub
   *
   * @param `slotID` the slot to delete
   */
  public async deleteProgram(slotID: number) {
    return Promise.resolve(
      await this.send({
        'm': 'remove_project',
        'p': {
          'slotid': slotID
        }
      })
    );
  }

  /**
   * Get firmware info for the connected device
   */
  public async getHubInfo() {
    return Promise.resolve(
      await this.send({
        'm': 'get_hub_info'
      })
    );
  }

  // ======================== INSTANCE METHODS ========================

  public static async create(options?: HubOptions): Promise<HubManager> {
    return new Promise(async (resolve) => {
      // merge passed options into default options
      options = {
        port: '/dev/ttyACM0',
        magic: true,
        timeout: 2500,
        ...options
      };

      let mgr: HubManager;

      // try to detect port automatically
      if (options.magic) {
        const availablePorts = await HubManager.queryPorts();

        // get paths from port information
        const portPaths = availablePorts.map(x => x.path);

        if (portPaths.length > 0) {
          // try to establish connections to found ports
          for (const port of portPaths) {
            try {
              mgr = new HubManager({ ...options, port });
              await mgr.init();

              return resolve(mgr);
            } catch (err) {
              // could not connect to port, try next port
              continue;
            }
          }
        }

        // TODO: better error, this will do for now
        vscode.window.showErrorMessage('Mind_Reader: Magic is enabled but no ports were found. Is the Hub plugged in and turned on');
      }

      // magic disabled or failed, try normally
      try {
        mgr = new HubManager(options);
        await mgr.init();

        return resolve(mgr);
      } catch (err) {

        // could not connect to port
        throw err;
      }

    });
  }

  /**
   * Returns a list of serial devices
   * advertising their manufacturer
   * as `LEGO System A/S`
   */
  public static async queryPorts() {
    // get all ports
    let ports = await SerialPort.list();

    // filter by manufacturer
    ports = ports.filter(x => x.manufacturer === 'LEGO System A/S');
    return Promise.resolve(ports);
  }

  /**
   * Generate a random identifier consisting of lowercase
   * letters, numbers, and underscores
   *
   * @param `len` The length of the string to generate
   */
  static randomID(len: number = 4): string {
    let result = '';
    let characters = 'abcdefghijklmnopqrstuvwxyz0123456789_';
    for (let i = 0; i < len; i++) {
      result += characters[Math.floor(Math.random() * characters.length)];
    }

    return result;
  };
}
