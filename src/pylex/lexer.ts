"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const token_1 = require("./token");
/**
 * List of recognition patterns, in order of priority
 * The first item is a recognition pattern, used to recognize the token
 * the second item is the token type
 */
const rules = [
    {
        pattern: /^\s*def\s+(?<attr>[a-zA-Z_][a-zA-Z0-9_]*)\(/,
        type: token_1.Symbol.FUNCTION
    },
    {
        pattern: /^\s*class\s+(?<attr>[a-zA-Z_][a-zA-Z0-9_]*)/,
        type: token_1.Symbol.CLASS
    },
    {
        pattern: /^\s*if\s+(?<attr>[^:]+):\s*/,
        type: token_1.Symbol.IF
    },
    {
        pattern: /^\s*elif\s+(?<attr>[^:]+):\s*$/,
        type: token_1.Symbol.ELIF
    },
    {
        pattern: /^\s*else\s*:/,
        type: token_1.Symbol.ELSE
    },
    {
        pattern: /^\s*for\s+(?<attr>[^:]+):\s*$/,
        type: token_1.Symbol.FOR
    },
    {
        pattern: /^\s*while\s+(?<attr>[^:]+):\s*$/,
        type: token_1.Symbol.WHILE
    },
    {
        pattern: /^\s*try\s*:/,
        type: token_1.Symbol.TRY
    },
    {
        pattern: /^\s*except(\s*(?<attr>[^:]+))?:\s*$/,
        type: token_1.Symbol.EXCEPT
    },
    {
        pattern: /^\s*finally\s*:\s*$/,
        type: token_1.Symbol.FINALLY
    },
    {
        pattern: /^\s*with\s+(?<attr>[^:]+):\s*$/,
        type: token_1.Symbol.WITH
    },
];
/**
 * Line-By-Line Lexer
 */
class Lexer {
    /**
     * @param `text` The text to lex.
     * @param `tabFmt` A tab information descriptor
     */
    constructor(text, tabFmt) {
        this.tabFmt = tabFmt;
        this.textLines = []; // array of text lines
        this.pos = 0;
        this._currToken = token_1.EOFTOKEN;
        // default is 4 wide expanded tabs
        this.tabFmt = Object.assign({ size: 4, hard: false }, tabFmt);
        if (text) {
            // normalize linefeeds
            text = text.replace('\r\n', '\n');
        }
        this.restart(text);
    }
    /**
     * Calculates indentation level for a line. If using soft tabs,
     * indent level rounds up (so, tabSize+1 spaces is 2 levels,
     * 2*tabSize+1 is 3, etc.)
     *
     * @param `text` The line of text.
     * @param `tabFmt` A tab information descriptor.
     * @return The indent of `text` with consideration for `tabFmt`.
     */
    static getIndent(text, tabFmt) {
        let leadingSpace = text.length - text.trimLeft().length;
        let indent;
        if (tabFmt.hard) {
            // used tabs
            indent = leadingSpace;
        }
        else {
            // use spaces
            indent = Math.ceil(leadingSpace / tabFmt.size);
        }
        return indent;
    }
    /**
     * Calculates leading spaces for a line. 
     * This method uses arithmetic to calculate the number of leading spaces
     *  
     * @param `text` The line of text.
     * @return The number of leading spaces of `text`.
     */
    static getLeadingSpacesByArithmetic(textLine) {
        const leadingSpaces = textLine.text.length - textLine.text.trimStart().length;

        return leadingSpaces;
    }
    /**
     * Calculates leading spaces for a line. 
     * This method finds the index position of the first non-whitespace character
     * Since the index is built using a 0-index, the position of this character
     * will equal the number of spaces preceding the character.
     *  
     * @param `text` The line of text.
     * @return The number of leading spaces of `text` with respect to the index position of the first non-whitespace character.
     */
    static getLeadingSpacesByIndex(textLine) {
        const indexNum = textLine.firstNonWhitespaceCharacterIndex;

        return indexNum;
    }
    /**
     * Restart lexer with new text.
     *
     * @param `text` The new text to lex.
     */
    restart(text) {
        this.pos = 0;
        this._currToken = token_1.EOFTOKEN; // if no input, already on EOFTOKEN
        if (text) {
            this.textLines = text.split('\n');
            this.next(); // advance to the first token
        }
    }
    /**
     * @return the current {@link LineToken}.
     */
    currToken() { return this._currToken; }
    /**
     * Advance the position in the token stream.
     *
     * @return The new current token, after advancing
     */
    next() {
        if (this._currToken === token_1.EOFTOKEN && this.pos > this.textLines.length) {
            throw new Error('Cannot advance past end');
        }
        // Until a LineToken is found, or EOF
        while (this.pos < this.textLines.length) {
            let line = this.textLines[this.pos];
            let indent = Lexer.getIndent(line, this.tabFmt);
            let token;
            for (var r of rules) {
                // Does line match pattern?
                let match = line.match(r.pattern);
                if (match) {
                    // Yes...
                    if (match.groups) {
                        token = new _1.LineToken(r.type, this.pos, indent, match.groups["attr"]);
                    }
                    else {
                        token = new _1.LineToken(r.type, this.pos, indent);
                    }
                    this._currToken = token;
                    this.pos++;
                    return this.currToken();
                }
            }
            // No rules matched
            // TODO: move to rules
            if (/^\s*(#.*)?$/.test(line)) {
                // "empty" line
                token = new _1.LineToken(token_1.Symbol.EMPTY, this.pos, 999999);
            }
            else {
                // This is an INDENT token
                token = new _1.LineToken(token_1.Symbol.INDENT, this.pos, indent);
            }
            this._currToken = token;
            this.pos++;
            return this.currToken();
        }
        // Didn't return, must be EOF
        this._currToken = token_1.EOFTOKEN;
        this.pos++;
        return this.currToken();
    }
    /**
     * Move backwards in the token stream
     *
     * @param `n` The number of positions to retract.
     * @return The new current token after retracting.
     */
    retract(n = 1) {
        if (this.pos - 1 - n < 0) {
            // -1 because this.pos is currently on the next token
            throw new RangeError('Cannot retract past start');
        }
        if (n <= 0) {
            throw new RangeError('Retract distance must be positive');
        }
        if (this.pos - n === 0) {
            // just restart
            this.pos = 0;
            return this.next();
        }
        let c = n + 1;
        while (c > 0) {
            this.pos--;
            while (/^\s*(#.*)?$/.test(this.textLines[this.pos])) {
                // Skip empty lines
                this.pos--;
            }
            c--;
        }
        return this.next();
    }
}
exports.default = Lexer;
//# sourceMappingURL=lexer.js.map
