import * as vscode from "vscode";
//import * as SerialPort from 'serialport';
import { SerialPort } from "serialport";
import * as fs from "fs";

import { logger } from "./extension";
import { outputErrorMessage } from "./commands/text";

/**
 * Communication with the Hub takes place using a modified version of the JSON RPC 1.0 protocol:
 * https://en.wikipedia.org/wiki/JSON-RPC
 *
 * It is mostly the same, except that the field names are abbreviated to the first letter. So,
 *
 * FIELD  -> ABBREVIATION
 * ------ -> ----------
 * method -> m
 * params -> p
 * id     -> i
 * result -> r
 * error  -> e
 */

/**
 * @type RPCRequest an RPC request message
 *
 * @prop {string} `'m'` method to invoke.
 * @prop {Object?} `'p'` optional parameters for method.
 * @prop {string|null?} `'i'` optional request ID.
 */
type RPCRequest = {
	m: string;
	p?: Object;
	i?: string;
};

/**
 * @type RPCResponse an RPC response message
 *
 * @prop {any?} `'r'` RPC response body
 * @prop {Object?} `'e'` RPC error body (base64 encoded)
 * @prop {string|null} `'i'` required response ID.
 */
type RPCResponse = {
	r?: any;
	e?: Object;
	i: string | null;
};

/**
 * Manages sending and receiving of JSON Remote Procedure Call (JSON-RPC) protocol messages
 * to the Hub.
 */
export default class HubManager {
	private port: SerialPort;
	private receiveBuffer: string = ""; // buffer for in-flight messages
	private pendingRequests = new Map<
		string,
		[(result: any) => void, (error: string) => void]
	>(); // lists of requests that are still pending

	// ======================== INSTANCE METHODS ========================

	/**
	 * Private constructor, use static `create` + `init`
	 */
	private constructor(public portPath: string) {}

	public isOpen(): boolean {
		return this.port.isOpen;
	}

	/**
	 * Handle a received data chunk from the serial port
	 *
	 * @param `data` Data received from serial port
	 */
	private async receiveData(data: string) {
		// add data to buffer
		this.receiveBuffer += data;

		// get full lines in buffer

		let msgs = this.receiveBuffer.split(/[\r>]/); // split by newline
		this.receiveBuffer = msgs.pop()!; // store unhandled data

		msgs = msgs.filter((x) => !x.match(/{"m":\d+,"p":/)); // drop sensor broadcast response spam

		for (const msg of msgs) {
			// check if message is actually json
			if (!msg.includes("{")) {
				continue;
			}
			// check if this msg is a response to a pending request
			try {
				let json: { [key: string]: any };

				json = JSON.parse(msg);

				let id = json["i"];
				if (id && this.pendingRequests.has(id)) {
					// a request is waiting on this response
					let [resolve, reject] = this.pendingRequests.get(id) ?? [];

					if (json["e"] && reject) {
						// error
						reject(Buffer.from(json["e"], "base64").toString());
					} else if (resolve) {
						resolve(json["r"]);
					}

					this.pendingRequests.delete(id);
				} else if (json["m"]) {
					// Print errors
					const params = json["p"];
					switch (json["m"]) {
						case "user_program_error":
							logger.error(
								Buffer.from(params[3], "base64").toString(),
							);
							logger.error(
								Buffer.from(params[4], "base64").toString(),
							);
							break;
						case "runtime_error":
							logger.error(
								Buffer.from(params[3], "base64").toString(),
							);
							break;
						case 2:
							logger.info(`Battery at ${params[0]}V`);
							break;
					}
					outputErrorMessage("Program Error.");
					console.log(`Program error: ${msg}`);
				}
			} catch (err) {
				console.log("Could not parse JSON:", msg, err);
			}
		}
	}

	/**
	 * Initializes a created HubManager with the current option settings
	 */
	public async init(): Promise<void> {
		try {
			this.port = new SerialPort({
				path: this.portPath,
				autoOpen: true,
				baudRate: 112500,
			});
		} catch (err) {
			// error during port opening
			throw err;
		}

		this.port.setEncoding("utf-8");

		// push lines received to data queue

		let mgr = this;
		this.port.on("data", (data) => {
			mgr.receiveData(data);
		});
	}

	public async close(): Promise<void> {
		this.port.close(console.error);
	}

	/**
	 * Send an RPC message. The corresponding Promise resolve
	 * is saved into the `pendingRequests` map. When an inbound
	 * message is found that matches an ID in `pendingRequests`,
	 * the corresponding resolve is called. So, even though
	 * the `resolve` call does not appear explicitly here, it *does*
	 * get resolved at the appropriate time.
	 *
	 * @param `proc` Procedure to execute
	 * @param `params` Optional parameters for the procedure
	 * @param `id` The ID to use for the RPC message. Use null to indicate no ID/notification message.
	 *             If neither a string or `null` is passed, an ID is automatically generated.
	 */
	public async send(request: RPCRequest): Promise<RPCResponse> {
		return new Promise((resolve, reject) => {
			if (request["i"] === undefined) {
				// generate an ID
				request["i"] = "mind-reader-" + HubManager.randomID();
			}

			// write JSON to port

			this.pendingRequests.set(request["i"], [resolve, reject]);
			this.port.write(JSON.stringify(request));
			this.port.write("\r");
			this.port.drain();
		});
	}

	public async uploadFile(
		file: string,
		slotid: number,
		name?: string,
		autoStart: boolean = false,
	) {
		const fileStats = fs.statSync(file);
		name = name || file;

		const ack: { [key: string]: any } = await this.startWriteProgram(
			name,
			fileStats.size,
			slotid,
			fileStats.birthtime.getTime(),
			fileStats.mtime.getTime(),
		);

		const blockSize = ack.blocksize;
		const transferid = ack.transferid;

		let dataStream = fs.createReadStream(file, {
			highWaterMark: blockSize,
		});
		for await (const data of dataStream) {
			await this.writePackage(data, transferid);
		}

		if (autoStart) {
			return Promise.resolve(await this.programExecute(slotid));
		}
	}

	// ========================= Hub Methods =========================
	//
	// These methods each handle a single RPC method's communication.

	/**
	 * Execute a program that is saved on the hub
	 *
	 * @param `slotid` Slot ID of the program to run
	 */
	public async programExecute(slotid: number): Promise<RPCResponse> {
		return new Promise(async (resolve) => {
			let response = await this.send({
				m: "program_execute",
				p: {
					slotid: slotid,
				},
			});

			resolve(response);
		});
	}

	/**
	 * Terminate a currently running program
	 */
	public async programTerminate(): Promise<RPCResponse> {
		return Promise.resolve(await this.send({ m: "program_terminate" }));
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
		return Promise.resolve(await this.send({ m: "get_storage_status" }));
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
		modified: number,
	): Promise<RPCResponse> {
		// file meta data
		let stat = {
			created: created,
			modified: modified,
			name: name,
			type: "python", // always python
			// eslint-disable-next-line @typescript-eslint/naming-convention
			project_id: HubManager.randomID(16),
		};

		return Promise.resolve(
			await this.send({
				m: "start_write_program",
				p: {
					slotid: slotID,
					size: size,
					meta: stat,
				},
			}),
		);
	}

	/**
	 * Write a package chunk of a file
	 *
	 * @param `data` Chunk of data to write
	 * @param `transferID` The transfer id for the current transfer
	 */
	public async writePackage(
		data: string,
		transferID: string,
	): Promise<RPCResponse> {
		return Promise.resolve(
			await this.send({
				m: "write_package",
				p: {
					data: Buffer.from(data, "utf-8").toString("base64"),
					transferid: transferID,
				},
			}),
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
				m: "move_project",
				p: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					old_slotid: oldSlotID,
					// eslint-disable-next-line @typescript-eslint/naming-convention
					new_slotid: newSlotID,
				},
			}),
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
				m: "remove_project",
				p: {
					slotid: slotID,
				},
			}),
		);
	}

	/**
	 * Get firmware info for the connected device
	 */
	public async getHubInfo() {
		return Promise.resolve(
			await this.send({
				m: "get_hub_info",
			}),
		);
	}

	// ======================== INSTANCE METHODS ========================

	public static async create(portPath: string): Promise<HubManager> {
		return new Promise(async (resolve) => {
			try {
				let mgr = new HubManager(portPath);
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
	 */
	public static async queryPorts() {
		// get all ports
		let ports = await SerialPort.list();

		// filter by manufacturer
		return Promise.resolve(ports);
	}

	/**
	 * Generate a random identifier consisting of lowercase
	 * letters, numbers, and underscores
	 *
	 * @param `len` The length of the string to generate
	 */
	static randomID(len: number = 4): string {
		let result = "";
		let characters = "abcdefghijklmnopqrstuvwxyz0123456789_";
		for (let i = 0; i < len; i++) {
			result += characters[Math.floor(Math.random() * characters.length)];
		}

		return result;
	}
}
