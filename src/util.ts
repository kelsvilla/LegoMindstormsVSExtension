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
        const config = vscode.workspace.getConfiguration("accessibilityChecker");
        this.#config = ConfigSchema.parse(config);
        if (!this.#config) {
            throw new Error("Error retrieving config");
        }
        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration((event) => {
                if (event.affectsConfiguration("accessibilityChecker")) {
                    const config = vscode.workspace.getConfiguration("accessibilityChecker");
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
    operable: z.object({
        enoughTime: z.object({
            "Marquee element used": z.boolean(),
            "Meta refresh with a time-out is used": z.boolean(),
        }),
        keyboardAccessible: z.object({
            "onmousedown event missing onkeydown event": z.boolean(),
            "onmouseover event handler missing onfocus event handler": z.boolean(),
            "script not keyboard accessible - onmouse missing onblur": z.boolean(),
            "script not keyboard accessible - onmouseout missing onblur": z.boolean(),
        }),
        navigable: z.object({
            "Anchor contains no text.": z.boolean(),
            "Document missing title element": z.boolean(),
            "Header nesting - header following h1 is incorrect.": z.boolean(),
            "Header nesting - header following h2 is incorrect.": z.boolean(),
            "Header nesting - header following h3 is incorrect.": z.boolean(),
            "Header nesting - header following h4 is incorrect.": z.boolean(),
            "Header nesting - header following h5 is incorrect.": z.boolean(),
            "Include an href attribute to make text a hyperlink": z.boolean(),
            "There should only be one <h1> per page": z.boolean(),
            "title element is empty": z.boolean(),
        }),
    }),
    understandable: z.object({
        inputAssistance: z.object({
            "input element has more than one associated label": z.boolean(),
            "label text is empty": z.boolean(),
        }),
        readable: z.object({
            "document has invalid language code": z.boolean(),
            "document language not identified": z.boolean(),
        }),
    }),
    robust: z.object({
        compatible: z.object({
            "id attribute is not unique": z.boolean(),
        }),
    }),
    perceivable: z.object({
        adaptable: z.object({
            "button has no text in label.": z.boolean(),
            "Buttons should have button type": z.boolean(),
            "Include a caption for each table.": z.boolean(),
            "input element, type of 'checkbox', has no text in label.": z.boolean(),
            "input element, type of 'checkbox', missing an associated label.": z.boolean(),
            "input element, type of 'file', has no text in label.": z.boolean(),
            "input element, type of 'file', missing an associated label.": z.boolean(),
            "input element, type of 'password', has no text in label.": z.boolean(),
            "input element, type of 'password', missing an associated label.": z.boolean(),
            "input element, type of 'radio', has no text in label.": z.boolean(),
            "input element, type of 'radio', missing an associated label.": z.boolean(),
            "input element, type of 'text', missing an associated label.": z.boolean(),
            "input element, type of 'text', has no text in label.": z.boolean(),
            "Label text is empty for select statement.": z.boolean(),
            "select element missing an associated label.": z.boolean(),
            "Select elements should only have one associated label": z.boolean(),
            "textarea element missing an associated label.": z.boolean(),
            "Textarea elements should only have one associated label": z.boolean(),
        }),
        distinguishable: z.object({
            "b (bold) element used": z.boolean(),
            "bold element used": z.boolean(),
            "font used.": z.boolean(),
            "i (italic) element used": z.boolean(),
            "italic element used": z.boolean(),
            "Video and audio tags should have control attribute for pausing and volume": z.boolean(),
        }),
        textAlternatives: z.object({
            "Image used as anchor is missing valid Alt text.": z.boolean(),
            "img element missing alt attribute": z.boolean(),
            "input element has alt attribute": z.boolean(),
        }),
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