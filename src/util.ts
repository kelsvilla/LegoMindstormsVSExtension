import * as fs from "fs";
import * as path from "path";
// import { AnyNode, Element } from "cheerio";
import * as vscode from "vscode";
import * as z from "zod";
import { readdirSync } from "fs";
import { join } from "path";

// export function isElement(node: AnyNode): node is Element {
//   return node.nodeType === NodeType.ELEMENT_NODE;
// }

// export enum NodeType {
//   ELEMENT_NODE = 1,
//   ATTRIBUTE_NODE = 2,
//   TEXT_NODE = 3,
//   PROCESSING_INSTRUCTION_NODE = 7,
//   COMMENT_NODE = 9,
// }

//Singleton class that allows for synchronized settings across the project with auto-updating
export class Configuration {
    static #_instance: any;
    #config!: ConfigType;

    constructor(context?: vscode.ExtensionContext) {
        if (!Configuration.#_instance) {
            if (context) {
                Configuration.#_instance = this;
                this.initialize(context);
            } else {
                throw new Error("Please initialize Configuration with a vscode context first.");
            }
        }
        return Configuration.#_instance;
    }

    static GetInstance(): Configuration {
        if (!Configuration.#_instance) {
            throw new Error("Please initialize Configuration with a vscode context first.");
        }
        return Configuration.#_instance;
    }

    //Called once upon creation of first instance
    initialize(context: vscode.ExtensionContext) {
        const config = vscode.workspace.getConfiguration("mind-reader");
        this.#config = ConfigSchema.parse(config);
        if (!this.#config) {
            throw new Error("Error retrieving config");
        }
        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration((event) => {
                if (event.affectsConfiguration("mind-reader")) {
                    const config = vscode.workspace.getConfiguration("mind-reader");
                    this.#config = ConfigSchema.parse(config);
                }
            })
        );
    }

    get(section?: string): ConfigType {
        return this.#config;
    }
}

export const ConfigSchema = z.object({
    textToSpeech: z.object({
        readingSpeed: z.number(),
        isEnabledOnStartup: z.boolean()
    }),
    get: z.function(),
});

export type ConfigType = z.infer<typeof ConfigSchema>;

export function Writeable(filepath: string, options: { append: boolean } = { append: false }) {
    const rootdir = path.dirname(__filename).replace(`${path.sep}dist`, "");
    filepath = `${rootdir}${path.sep}${filepath}`;
    if (!options.append && fs.existsSync(filepath)) fs.unlinkSync(filepath);
    const stream = fs.createWriteStream(filepath, { flags: "a" });
    return function pipe(data: string) {
        return new Promise((res, rej) => {
            stream.write(data, (error) => {
                error ? rej("error writing") : res("Success");
            });
        });
    };
}

export function walk(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true })
        .flatMap((file) => (file.isDirectory() ? walk(join(dir, file.name)) : join(dir, file.name)))
        .filter((file) => path.extname(file) === ".html");
}