/* eslint-disable @typescript-eslint/naming-convention */
/* ^ allow uppercase enum */

/**
 * LineToken Symbol Types
 */
export enum Symbol {
	ASYNCFUNCTION = "async function",
	FUNCTION = "function",
	CLASS = "class",
	IF = "if",
	ELSE = "else",
	ELIF = "elif",
	FOR = "for",
	WHILE = "while",
	TRY = "try",
	EXCEPT = "except",
	FINALLY = "finally",
	WITH = "with",
	STATEMENT = "statement", // Indent token, contains non-empty code lines
	COMMENT = "Comment",
	EMPTY = "EMPTY", // empty line, used only to associate with the previous line
	INVALID = "INVALID",
	EOF = "EOF",
}
/**
 * @typedef {Object} TabInfo
 * @prop {number} size // The width of a tab in spaces
 * @prop {boolean} hard // Whether to use literal tab characters
 */
export type TabInfo = {
	size: number;
	hard: boolean;
};
/**
 * A token for a line in a Python file
 */
export default class LineToken {
	/**
	 * @param `type` The type of token for this line.
	 * @param `linenr` The line number (0-indexed)
	 * @param `indentLevel` The level of indentation.
	 * @param `attr` Additional item for tokens that might need it.
	 */
	constructor(
		public readonly type: Symbol,
		public readonly linenr: number,
		public readonly indentLevel: number,
		public readonly attr?: any, // Any additional things a token might need (class name, control conidition)
	) {}

	/**
	 * @return A string representation of the token
	 */
	toString(): string {
		return `${this.type}, linenr: ${this.linenr + 1}, indentLevel: ${
			this.indentLevel
		}, attr: ${this.attr}`;
	}
}

/**
 * The End-Of-File token
 *
 * EOFTOKEN is returned when `next()` is called
 * while the lexer is on the last token in the stream.
 */
const EOFTOKEN = new LineToken(Symbol.EOF, -1, -1);
export { EOFTOKEN };
