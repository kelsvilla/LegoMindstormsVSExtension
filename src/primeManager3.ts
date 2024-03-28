import {
	ByteLengthParser,
	InterByteTimeoutParser,
	SerialPort,
} from "serialport";
import { logger } from "./extension";
import * as vscode from "vscode";
import * as fs from "fs";
import path = require("path");
import { rootDir } from "./extension";
const { spawn } = require("child_process");
var os = require("os");

export default class HubManager3 {
	static CONTROL_A: string = "\x01"; // CTRL-A character
	static CONTROL_B: string = "\x02"; // CTRL-B character
	static CONTROL_C: string = "\x03"; // CTRL-C character
	static CONTROL_D: string = "\x04"; // CTRL-D character
	static CONTROL_E: string = "\x05"; // CTRL-E character
	static CONTROL_F: string = "\x06"; // CTRL-F character
	static ENTER: string = "\r\n"; // NEWLINE character
	static TAB: string = "\x09"; // TAB character

	public port: SerialPort;
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

	public async writeLine() {
		let response = await vscode.window.showInputBox({
			placeHolder: "Search query",
			prompt: "",
			value: "",
		});

		this.port.write(HubManager3.CONTROL_E);

		while (response) {
			this.port.write(`${response}\r\n`);
			response = await vscode.window.showInputBox({
				placeHolder: "Search query",
				prompt: "",
				value: "",
			});
		}

		this.port.write(HubManager3.CONTROL_D);
	}

	// /**
	//  * Handle a received data chunk from the serial port
	//  *
	//  * @param `data` Data received from serial port
	//  */
	// private async receiveData(data: string) {
	// 	// add data to buffer
	// 	this.receiveBuffer += data;

	// 	// get full lines in buffer

	// 	let msgs = this.receiveBuffer.split(/[\r>]/); // split by newline
	// 	this.receiveBuffer = msgs.pop()!; // store unhandled data

	// 	msgs = msgs.filter((x) => !x.match(/{"m":\d+,"p":/)); // drop sensor broadcast response spam

	// 	for (const msg of msgs) {
	// 		// check if message is actually json
	// 		if (!msg.includes("{")) {
	// 			continue;
	// 		}
	// 		// check if this msg is a response to a pending request
	// 		try {
	// 			let json: { [key: string]: any };

	// 			json = JSON.parse(msg);

	// 			let id = json["i"];
	// 			if (id && this.pendingRequests.has(id)) {
	// 				// a request is waiting on this response
	// 				let [resolve, reject] = this.pendingRequests.get(id) ?? [];

	// 				if (json["e"] && reject) {
	// 					// error
	// 					reject(Buffer.from(json["e"], "base64").toString());
	// 				} else if (resolve) {
	// 					resolve(json["r"]);
	// 				}

	// 				this.pendingRequests.delete(id);
	// 			} else if (json["m"]) {
	// 				// Print errors
	// 				const params = json["p"];
	// 				switch (json["m"]) {
	// 					case "user_program_error":
	// 						logger.error(
	// 							Buffer.from(params[3], "base64").toString(),
	// 						);
	// 						logger.error(
	// 							Buffer.from(params[4], "base64").toString(),
	// 						);
	// 						break;
	// 					case "runtime_error":
	// 						logger.error(
	// 							Buffer.from(params[3], "base64").toString(),
	// 						);
	// 						break;
	// 					case 2:
	// 						logger.info(`Battery at ${params[0]}V`);
	// 						break;
	// 				}
	// 				vscode.window.showErrorMessage("Program Error.");
	// 				console.log(`Program error: ${msg}`);
	// 			}
	// 		} catch (err) {
	// 			console.log("Could not parse JSON:", msg, err);
	// 		}
	// 	}
	// }

	/**
	 * Initializes a created HubManager with the current option settings
	 */
	public async init(): Promise<void> {
		try {
			this.port = new SerialPort({
				path: this.portPath,
				autoOpen: true,
				baudRate: 9600,
			});
			//this.port.open(() => {
			//	console.error("Error opening serial port");
			//});
		} catch (err) {
			// error during port opening
			throw err;
		}

		this.port.setEncoding("utf-8");

		// push lines received to data queue

		let mgr = this;
		// this.port.on("data", async (data) => {
		// 	console.log("DATA: ", data.toString("binary"));
		// 	//throw new Error("Not yet implemented")
		// 	//mgr.receiveData(data);
		// });
		this.port
			.pipe(new InterByteTimeoutParser({ interval: 50 }))
			.on("data", (data) => {
				if (data instanceof Buffer) console.log(data.toString("hex"));
				if (data instanceof Buffer) console.log(data.toString("utf-8"));
			});
		this.port.on("error", (error) => {
			console.error(error.message);
		});
		this.port.write(HubManager3.CONTROL_C);
	}

	public async close(): Promise<void> {
		this.port.close(console.error);
	}

	// /**
	//  * Send an RPC message. The corresponding Promise resolve
	//  * is saved into the `pendingRequests` map. When an inbound
	//  * message is found that matches an ID in `pendingRequests`,
	//  * the corresponding resolve is called. So, even though
	//  * the `resolve` call does not appear explicitly here, it *does*
	//  * get resolved at the appropriate time.
	//  *
	//  * @param `proc` Procedure to execute
	//  * @param `params` Optional parameters for the procedure
	//  * @param `id` The ID to use for the RPC message. Use null to indicate no ID/notification message.
	//  *             If neither a string or `null` is passed, an ID is automatically generated.
	//  */
	// public async send(request: string): Promise<string> {
	// 	this.pendingRequests.set(request["i"], [resolve, reject]);
	// 	this.port.write(JSON.stringify(request));
	// 	this.port.write("\r");
	// 	this.port.drain();
	// }

	public async uploadFile(
		file: string,
		slotid: string,
		name?: string,
		autoStart: boolean = false,
	) {
		const fileStats = fs.statSync(file);
		name = name || file;
		let dataStream = fs.createReadStream(file);
		const filePath = vscode.window.activeTextEditor!.document.uri.fsPath;
		const utilCode = fs
			.readFileSync(
				path.normalize(
					path.join(__dirname, "..", "src", "testcode.mpy"),
				),
			)
			.toString("utf-8");

		const fileContents = fs.readFileSync(filePath);

		//console.log(dirExists.toString());

		//const dirExists = 'def testfunction():\n\tprint("cool")\n\r\n';
		await writeAndDrain(
			this.port,
			HubManager3.CONTROL_A +
				HubManager3.CONTROL_E +
				"A" +
				HubManager3.CONTROL_A +
				utilCode +
				"\x04",
			// HubManager3.CONTROL_B +
			// `upload_program("${slotid}", ${fileStats.size})\x04` +
			// fileContents.toString("utf-8"),
			// `upload_program("${slotid}", ${fileStats.size})\r\n`,
		);

		//const normalizedProjectRoot = path
		//	.normalize(rootDir)
		//	.replace(`${path.sep}out`, "");
		//
		//const interpretor = path.join(
		//	normalizedProjectRoot,
		//	`voice-server-setup`,
		//	"venv",
		//	`${os.type() === "Darwin" ? "bin" : "Scripts"}`,
		//	"python",
		//);
		//
		//const server = spawn(interpretor, ["compiler.py", filePath]);

		await new Promise((resolve) => setTimeout(resolve, 5000));
		await writeAndDrain(
			this.port,
			HubManager3.CONTROL_A +
				HubManager3.CONTROL_E +
				"A" +
				HubManager3.CONTROL_A +
				`upload_program("${slotid}", ${fileStats.size})` +
				"\x04",
		);
		await writeAndDrain(this.port, fileContents);
		await writeAndDrain(this.port, HubManager3.CONTROL_B);
		//await writeAndDrain(this.port, fileContents);

		//for await (const data of dataStream) {
		//	if (!this.port.write(data)) this.port.drain();
		//}

		//if (autoStart) {
		//	return Promise.resolve(await this.programExecute(slotid));
		//}
	}

	// // ========================= Hub Methods =========================
	// //
	// // These methods each handle a single RPC method's communication.

	// /**
	//  * Execute a program that is saved on the hub
	//  *
	//  * @param `slotid` Slot ID of the program to run
	//  */
	// public async programExecute(slotid: number): Promise<RPCResponse> {
	// 	return new Promise(async (resolve) => {
	// 		let response = await this.send({
	// 			m: "program_execute",
	// 			p: {
	// 				slotid: slotid,
	// 			},
	// 		});

	// 		resolve(response);
	// 	});
	// }

	// /**
	//  * Terminate a currently running program
	//  */
	// public async programTerminate(): Promise<RPCResponse> {
	// 	return Promise.resolve(await this.send({ m: "program_terminate" }));
	// }

	// /**
	//  * Get the storage status of the hub
	//  *
	//  * TODO: fill with actual example
	//  * slot
	//  * decoded name
	//  * size
	//  * last modified
	//  * project_id
	//  * type
	//  */
	// public async getStorageStatus(): Promise<RPCResponse> {
	// 	return Promise.resolve(await this.send({ m: "get_storage_status" }));
	// }

	// /**
	//  * Notify the Hub that a program write is about to occur.
	//  *
	//  * @param `name` Name of the program.
	//  * @param `name` Size of the program TODO: in bytes?
	//  * @param `slotID` Slot ID to write the program to
	//  * @param `created` Creation timestamp
	//  * @param `modified` Modified timestamp
	//  */
	// public async startWriteProgram(
	// 	name: string,
	// 	size: number,
	// 	slotID: number,
	// 	created: number,
	// 	modified: number,
	// ): Promise<RPCResponse> {
	// 	// file meta data
	// 	let stat = {
	// 		created: created,
	// 		modified: modified,
	// 		name: name,
	// 		type: "python", // always python
	// 		// eslint-disable-next-line @typescript-eslint/naming-convention
	// 		project_id: HubManager.randomID(16),
	// 	};

	// 	// return await this.send({
	// 		// i:"fye7",
	// 		// m:"start_write_program",
	// 		// p:{
	// 			// meta:{
	// 				// created:1580451544403,
	// 				// modified:1580614688346,
	// 				// name:"Project 93"
	// 			// },
	// 			// size:136,
	// 			// slotid:0}
	// 		// })

	// 	return Promise.resolve(
	// 		await this.send({
	// 			m: "start_write_program",
	// 			p: {
	// 				slotid: slotID,
	// 				size: size,
	// 				meta: stat,
	// 			},
	// 		}),
	// 	);
	// }

	// /**
	//  * Write a package chunk of a file
	//  *
	//  * @param `data` Chunk of data to write
	//  * @param `transferID` The transfer id for the current transfer
	//  */
	// public async writePackage(
	// 	data: string,
	// 	transferID: string,
	// ): Promise<RPCResponse> {
	// 	return Promise.resolve(
	// 		await this.send({
	// 			m: "write_package",
	// 			p: {
	// 				data: Buffer.from(data, "utf-8").toString("base64"),
	// 				transferid: transferID,
	// 			},
	// 		}),
	// 	);
	// }

	// /**
	//  * Move a program from slot `fromSlot` to slot `toSlot`.
	//  * TODO: verify
	//  * If the destination already has a program stored in it, the two programs
	//  * are swapped
	//  *
	//  * @param `fromSlot` slot to move from
	//  * @param `toSlot` slot to move to
	//  */
	// public async moveProgram(oldSlotID: number, newSlotID: number) {
	// 	return Promise.resolve(
	// 		await this.send({
	// 			m: "move_project",
	// 			p: {
	// 				// eslint-disable-next-line @typescript-eslint/naming-convention
	// 				old_slotid: oldSlotID,
	// 				// eslint-disable-next-line @typescript-eslint/naming-convention
	// 				new_slotid: newSlotID,
	// 			},
	// 		}),
	// 	);
	// }

	// /**
	//  * Delete a program from the slot on the Hub
	//  *
	//  * @param `slotID` the slot to delete
	//  */
	// public async deleteProgram(slotID: number) {
	// 	return Promise.resolve(
	// 		await this.send({
	// 			m: "remove_project",
	// 			p: {
	// 				slotid: slotID,
	// 			},
	// 		}),
	// 	);
	// }

	// /**
	//  * Get firmware info for the connected device
	//  */
	// public async getHubInfo() {
	// 	return Promise.resolve(
	// 		await this.send({
	// 			m: "get_hub_info",
	// 		}),
	// 	);
	// }

	// ======================== INSTANCE METHODS ========================

	public static async create(portPath: string): Promise<HubManager3> {
		try {
			let mgr = new HubManager3(portPath);
			await mgr.init();
			return mgr;
		} catch (err) {
			// could not connect to port
			throw err;
		}
	}

	/**
	 * Returns a list of serial devices
	 */
	public static async queryPorts() {
		// get all ports
		return await SerialPort.list();
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

async function writeAndDrain(
	port: SerialPort,
	data: string | Buffer,
	encoding?: "utf-8" | "binary",
) {
	return new Promise((resolve, reject) => {
		port.write(data, encoding ?? "utf-8");
		port.drain(resolve);
	});
}
