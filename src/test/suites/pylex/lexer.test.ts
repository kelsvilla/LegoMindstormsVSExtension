import * as assert from "assert";
import * as vscode from "vscode";
import { after } from "mocha";

import Lexer from "../../../pylex/lexer";
import LineToken from "../../../pylex/token";
import { EOFTOKEN, Symbol } from "../../../pylex/token";

suite("Lexer Test Suite", () => {
	after(() => {
		vscode.window.showInformationMessage("All tests passed!");
	});

	test("Empty String", () => {
		let l: Lexer = new Lexer("");
		assert.deepStrictEqual(l.currToken(), EOFTOKEN);
	});

	test("Undefined", () => {
		let l: Lexer = new Lexer(undefined);
		assert.deepStrictEqual(l.currToken(), EOFTOKEN);
	});

	test("Whitespace", () => {
		let s: string = "    ".repeat(4).repeat(4);
		let l: Lexer = new Lexer(s);
		assert.deepStrictEqual(
			l.currToken(),
			new LineToken(Symbol.EMPTY, 0, s.length / 4),
		);
	});

	test("Comment", () => {
		let l: Lexer = new Lexer("# this is a comment");
		assert.deepStrictEqual(
			l.currToken(),
			new LineToken(Symbol.COMMENT, 0, 0, "this is a comment"),
		);
	});

	test("Non-Whitespace with no construct", () => {
		let l: Lexer = new Lexer("foobar");
		assert.deepStrictEqual(
			l.currToken(),
			new LineToken(Symbol.STATEMENT, 0, 0, "foobar"),
		);
	});

	test("getIndent() accuracy, spaces", () => {
		for (var i = 0; i < 100; i++) {
			let l: Lexer = new Lexer("    ".repeat(i) + "foobar");
			assert.strictEqual(l.currToken().indentLevel, i);
		}
	});

	test("getIndent() accuracy, tabs", () => {
		for (var i = 0; i < 100; i++) {
			let l: Lexer = new Lexer("\t".repeat(i) + "foobar", {
				size: 4,
				hard: true,
			});
			assert.strictEqual(l.currToken().indentLevel, i);
		}
	});

	test("getIndent() accuracy, spaces with incomplete indentation", () => {
		let size: number = 4;
		for (var i = 0; i < 100; i++) {
			for (var j = 1; j <= 3; j++) {
				let l: Lexer = new Lexer(
					"    ".repeat(i) + " ".repeat(j) + "foobar",
					{ size: size, hard: false },
				);
				// TODO: Swap these out when fractional indentation is used
				//assert.strictEqual(l.currToken().indentLevel, i + (Math.round(j / size * 100) / 100));
				assert.strictEqual(l.currToken().indentLevel, i + 1);
			}
		}
	});

	test("class definition", () => {
		let l: Lexer = new Lexer("class Foobar(object):");
		assert.deepStrictEqual(
			l.currToken(),
			new LineToken(Symbol.CLASS, 0, 0, "Foobar"),
		);
	});

	test("function definition", () => {
		let l: Lexer = new Lexer("def Barbaz(this, that, andTheOther):");
		assert.deepStrictEqual(
			l.currToken(),
			new LineToken(Symbol.FUNCTION, 0, 0, "Barbaz"),
		);
	});

	test("if statement", () => {
		let l: Lexer = new Lexer("if True and bar == baz:");
		assert.deepStrictEqual(
			l.currToken(),
			new LineToken(Symbol.IF, 0, 0, "True and bar == baz"),
		);
	});

	test("elif statement", () => {
		let l: Lexer = new Lexer('elif name == "bar" and True:');
		assert.deepStrictEqual(
			l.currToken(),
			new LineToken(Symbol.ELIF, 0, 0, 'name == "bar" and True'),
		);
	});

	test("else statement", () => {
		let l: Lexer = new Lexer("else:");
		assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.ELSE, 0, 0));
	});

	test("for loop", () => {
		let l: Lexer = new Lexer("for pickle in pickleJars:");
		assert.deepStrictEqual(
			l.currToken(),
			new LineToken(Symbol.FOR, 0, 0, "pickle in pickleJars"),
		);
	});

	test("while loop", () => {
		let l: Lexer = new Lexer("while numCookies < capacity:");
		assert.deepStrictEqual(
			l.currToken(),
			new LineToken(Symbol.WHILE, 0, 0, "numCookies < capacity"),
		);
	});

	test("try statement", () => {
		let l: Lexer = new Lexer("try:");
		assert.deepStrictEqual(l.currToken(), new LineToken(Symbol.TRY, 0, 0));
	});

	test("except statement with attr", () => {
		let l: Lexer = new Lexer("except NameError:");
		assert.deepStrictEqual(
			l.currToken(),
			new LineToken(Symbol.EXCEPT, 0, 0, "NameError"),
		);
	});

	test("except statement with no attr", () => {
		let l: Lexer = new Lexer("except:");
		assert.deepStrictEqual(
			l.currToken(),
			new LineToken(Symbol.EXCEPT, 0, 0),
		);
	});

	test("finally statement", () => {
		let l: Lexer = new Lexer("finally:");
		assert.deepStrictEqual(
			l.currToken(),
			new LineToken(Symbol.FINALLY, 0, 0),
		);
	});

	test("with statement", () => {
		let l: Lexer = new Lexer("with open(file) as f:");
		assert.deepStrictEqual(
			l.currToken(),
			new LineToken(Symbol.WITH, 0, 0, "open(file) as f"),
		);
	});

	test("restart()", () => {
		let l: Lexer = new Lexer("with open(file as f:");
		l.restart("if is_old():");
		assert.deepStrictEqual(
			l.currToken(),
			new LineToken(Symbol.IF, 0, 0, "is_old()"),
		);
	});

	test("next() out of range", () => {
		let l: Lexer = new Lexer("foo = zaboomafoo");
		l.next();
		assert.throws(() => l.next());
	});

	test("retract() out of range", () => {
		let l: Lexer = new Lexer("next_token = lexer.next()");
		assert.throws(() => l.retract());
	});

	test("retract() validate argument", () => {
		let l: Lexer = new Lexer();

		// Negative
		assert.throws(() => l.retract(-1));

		// Zero, it doesn't make sense to retract 0 :P
		assert.throws(() => l.retract(0));
	});

	test("retract() 1-100", () => {
		let lines: string[] = Array.from(Array(100), (_, i) => "line" + i);
		let reference: LineToken[] = lines.map((_, i) => {
			return new LineToken(Symbol.STATEMENT, i, 0, `line${i}`);
		});

		for (var i = 0; i < 100; i++) {
			let l: Lexer = new Lexer(lines.join("\n"));

			// advance to EOF
			do {} while (l.next() !== EOFTOKEN);

			// try retract
			l.retract(i + 1);

			assert.deepStrictEqual(l.currToken(), reference[99 - i]);
		}
	});

	test("2 full lex and retract passes", () => {
		let lines: string[] = Array.from(Array(100), (_, i) => "line" + i);
		let reference: LineToken[] = lines.map((_, i) => {
			return new LineToken(Symbol.STATEMENT, i, 0, `line${i}`);
		});

		let l: Lexer = new Lexer(lines.join("\n"));

		// Twice
		for (var _ of [0, 1]) {
			// advance to EOF
			for (var i = 0; i < lines.length; i++) {
				assert.deepStrictEqual(l.currToken(), reference[i]);
				l.next();
			}

			// retract to start
			for (var i = lines.length - 1; i >= 0; i--) {
				l.retract();
				assert.deepStrictEqual(l.currToken(), reference[i]);
			}
		}
	});
});
