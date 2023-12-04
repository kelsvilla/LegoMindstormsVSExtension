import * as assert from "assert";
import * as vscode from "vscode";
import { after } from "mocha";

import Parser from "../../../pylex/parser";
import LexNode from "../../../pylex/node";
import LineToken from "../../../pylex/token";
import { Symbol } from "../../../pylex/token";

import { root, statement } from "../../util";

/**
 * Test Descriptor
 */
type ParserTest = {
	name: string; // short name for the test
	input: string[]; // input lines for the test
	output: LexNode; // expected output. outputs are compared for token equality *only*
};

const tests: ParserTest[] = [
	{ name: "No Input", input: [], output: root(null) },
	{ name: "Single Empty Line", input: [""], output: root(null) },
	{
		name: "Single Whitespace Only Line",
		input: ["                    "], // length 20
		output: root([
			new LexNode(
				Symbol.EMPTY,
				0,
				new LineToken(Symbol.EMPTY, 0, 20 / 4),
			), // 4 spaces per indent
		]),
	},
	{
		name: "Single Comment Only Line",
		input: ["# this is a comment"],
		output: root([
			new LexNode(
				Symbol.EMPTY,
				0,
				new LineToken(Symbol.COMMENT, 0, 0, "this is a comment"),
			),
		]),
	},
	{
		name: "Single Non-Control Line",
		input: ["my_age = 42"],
		output: root([
			//statement(0, 0)
			new LexNode(
				"name",
				0,
				new LineToken(Symbol.STATEMENT, 0, 0, "my_age = 42"),
			),
		]),
	},
	{
		name: "Single Control Line",
		input: ["while True:"],
		output: root([
			new LexNode("", 0, new LineToken(Symbol.WHILE, 0, 0, "True")),
		]),
	},
	{
		name: "Sequential lines, without construct",
		input: [
			'bar = "Blue M&Ms make me happy <:)"',
			'reba = "A hard working gal"',
		],
		output: root([
			new LexNode(
				"name",
				0,
				new LineToken(
					Symbol.STATEMENT,
					0,
					0,
					'bar = "Blue M&Ms make me happy <:)"',
				),
			),
			new LexNode(
				"name",
				0,
				new LineToken(
					Symbol.STATEMENT,
					1,
					0,
					'reba = "A hard working gal"',
				),
			),
		]),
	},

	{
		name: "Sequential lines, with, then without construct",
		input: [
			"if radioshack:",
			"    print radioshack.hours",
			'billy = "Scrubbly Bubbles!"',
		],
		output: root([
			new LexNode(
				"if radioshack",
				0,
				new LineToken(Symbol.IF, 0, 0, "radioshack"),
				[
					new LexNode(
						"print radioshack.hours",
						0,
						new LineToken(
							Symbol.STATEMENT,
							1,
							1,
							"print radioshack.hours",
						),
					),
				],
			),
			new LexNode(
				'billy = "Scrubbly Bubbles!"',
				0,
				new LineToken(
					Symbol.STATEMENT,
					2,
					0,
					'billy = "Scrubbly Bubbles!"',
				),
			),
		]),
	},

	{
		name: "Sequential lines, without, then with construct",
		input: [
			'billy = "Scrubbly Bubbles!"',
			"if radioshack:",
			"    print radioshack.hours",
		],
		output: root([
			new LexNode(
				'billy = "Scrubbly Bubbles!"',
				0,
				new LineToken(
					Symbol.STATEMENT,
					0,
					0,
					'billy = "Scrubbly Bubbles!"',
				),
			),
			new LexNode(
				"if radioshack",
				0,
				new LineToken(Symbol.IF, 1, 0, "radioshack"),
				[
					new LexNode(
						"print radioshack.hours",
						0,
						new LineToken(
							Symbol.STATEMENT,
							2,
							1,
							"print radioshack.hours",
						),
					),
				],
			),
		]),
	},

	{
		name: "Sequential lines with constructs",
		input: [
			"if yummy:",
			'    print("HOoray!")',
			"elif just_ok:",
			'    print("Do you have anything else?")',
			"else:",
			'    print("You really eat this?")',
		],
		output: root([
			new LexNode(
				"if yummy",
				0,
				new LineToken(Symbol.IF, 0, 0, "yummy"),
				[statement(1, 1, 'print("HOoray!")')],
			),
			new LexNode(
				"elif just_ok",
				0,
				new LineToken(Symbol.ELIF, 2, 0, "just_ok"),
				[statement(3, 1, 'print("Do you have anything else?")')],
			),
			new LexNode("else", 0, new LineToken(Symbol.ELSE, 4, 0), [
				statement(5, 1, 'print("You really eat this?")'),
			]),
		]),
	},

	{
		name: "Singly Nested Block",
		input: [
			"if yummy:",
			"    if in_my_tummy:",
			'        exclaim("Scrumdiddlyumptious!")',
		],
		output: root([
			new LexNode(
				"if yummy",
				0,
				new LineToken(Symbol.IF, 0, 0, "yummy"),
				[
					new LexNode(
						"if in_my_tummy",
						0,
						new LineToken(Symbol.IF, 1, 1, "in_my_tummy"),
						[statement(2, 2, 'exclaim("Scrumdiddlyumptious!")')],
					),
				],
			),
		]),
	},

	{
		name: "Singly Nested Block, then Block",
		input: [
			"if yummy:",
			"    if in_my_tummy:",
			'        exclaim("Scrumdiddlyumptious!")',
			"else:",
			'    exclaim("DISGUSTING!")',
		],
		output: root([
			new LexNode(
				"if yummy",
				0,
				new LineToken(Symbol.IF, 0, 0, "yummy"),
				[
					new LexNode(
						"if in_my_tummy",
						0,
						new LineToken(Symbol.IF, 1, 1, "in_my_tummy"),
						[statement(2, 2, 'exclaim("Scrumdiddlyumptious!")')],
					),
				],
			),
			new LexNode("else", 0, new LineToken(Symbol.ELSE, 3, 0), [
				statement(4, 1, 'exclaim("DISGUSTING!")'),
			]),
		]),
	},

	{
		name: "Doubly Nested Block",
		input: [
			"if yummy:",
			"    if in_my_tummy:",
			"        if looks_like_a_mummy:",
			'            print("you have a spot on your tummy")',
			"else:",
			'    print("Food is food...")',
		],
		output: root([
			new LexNode(
				"if yummy",
				0,
				new LineToken(Symbol.IF, 0, 0, "yummy"),
				[
					new LexNode(
						"if in_my_tummy",
						0,
						new LineToken(Symbol.IF, 1, 1, "in_my_tummy"),
						[
							new LexNode(
								"if looks_like_a_mummy",
								0,
								new LineToken(
									Symbol.IF,
									2,
									2,
									"looks_like_a_mummy",
								),
								[
									statement(
										3,
										3,
										'print("you have a spot on your tummy")',
									),
								],
							),
						],
					),
				],
			),
			new LexNode("else", 0, new LineToken(Symbol.ELSE, 4, 0), [
				statement(5, 1, 'print("Food is food...")'),
			]),
		]),
	},

	{
		name: "Doubly Nested Block, with multiple indent resets > 1",
		input: [
			"if yummy:",
			"    if in_my_tummy:",
			"        if looks_like_a_mummy:",
			'            print("you have a spot on your tummy")',
			"        else:",
			'            print("eek! a zombie!")',
			"    elif in_my_mouth:",
			'        print("itll be in my tummy soon!")',
			"else:",
			'    print("Food is food...")',
		],
		output: root([
			new LexNode(
				"if yummy",
				0,
				new LineToken(Symbol.IF, 0, 0, "yummy"),
				[
					new LexNode(
						"if in_my_tummy",
						0,
						new LineToken(Symbol.IF, 1, 1, "in_my_tummy"),
						[
							new LexNode(
								"if looks_like_a_mummy",
								0,
								new LineToken(
									Symbol.IF,
									2,
									2,
									"looks_like_a_mummy",
								),
								[
									statement(
										3,
										3,
										'print("you have a spot on your tummy")',
									),
								],
							),
							new LexNode(
								"else",
								0,
								new LineToken(Symbol.ELSE, 4, 2),
								[statement(5, 3, 'print("eek! a zombie!")')],
							),
						],
					),
					new LexNode(
						"elif in_my_mouth",
						0,
						new LineToken(Symbol.ELIF, 6, 1, "in_my_mouth"),
						[statement(7, 2, 'print("itll be in my tummy soon!")')],
					),
				],
			),
			new LexNode("else", 0, new LineToken(Symbol.ELSE, 8, 0), [
				statement(9, 1, 'print("Food is food...")'),
			]),
		]),
	},
	{
		name: "Multiline Block",
		input: [
			"if yummy:",
			'    print("you have a spot on your tummy")',
			'    print("eek! a zombie!)',
			'    print("itll be in my tummy soon!")',
			"else:",
			'    print("Food is food...")',
		],
		output: root([
			new LexNode(
				"if yummy",
				0,
				new LineToken(Symbol.IF, 0, 0, "yummy"),
				[
					statement(1, 1, 'print("you have a spot on your tummy")'),
					statement(2, 1, 'print("eek! a zombie!)'),
					statement(3, 1, 'print("itll be in my tummy soon!")'),
				],
			),
			new LexNode("else", 0, new LineToken(Symbol.ELSE, 4, 0), [
				statement(5, 1, 'print("Food is food...")'),
			]),
		]),
	},
];

/* Checks for strict equality between the tokens of a lex node tree */
const checkEq = (reference: LexNode, subject: LexNode) => {
	if (!reference.children()) {
		// subject should also have no children
		assert.deepStrictEqual(subject.children(), null);
		return;
	}

	assert.notStrictEqual(subject.children(), null);
	assert.deepStrictEqual(
		reference.children()!.length,
		subject.children()!.length,
	);
	for (let i = 0; i < subject.children()!.length; i++) {
		// compare top level nodes
		assert.deepStrictEqual(
			reference.children()![i].token,
			subject.children()![i].token,
		);

		// compare all children
		checkEq(reference.children()![i], subject.children()![i]);
	}
};

suite("Parser Test Suite", () => {
	after(() => {
		vscode.window.showInformationMessage("All tests passed!");
	});

	for (var t of tests) {
		let currTest = t; // without this, all test calls get the last test
		test(currTest.name, () => {
			let result = new Parser(currTest.input.join("\n")).parse();
			checkEq(currTest.output, result);
		});
	}
});
