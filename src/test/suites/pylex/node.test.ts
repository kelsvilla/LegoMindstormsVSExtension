import * as assert from "assert";
import * as vscode from "vscode";
import { after } from "mocha";
import { deparent } from "../../util";

import LineToken from "../../../pylex/token";
import { Symbol } from "../../../pylex/token";
import LexNode from "../../../pylex/node";

suite("LexNode Test Suite", () => {
	after(() => {
		vscode.window.showInformationMessage("All tests passed!");
	});

	test("children() of leaf", () => {
		let n: LexNode = new LexNode(
			"leafLexNode",
			vscode.TreeItemCollapsibleState.None,
			new LineToken(Symbol.STATEMENT, 0, 0),
		);
		assert.strictEqual(n.children(), null);
	});

	test("children() of internal node", () => {
		let children: LexNode[] = [
			new LexNode(
				"leafLexNode1",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, 2, 1),
			),
			new LexNode(
				"leafLexNode2",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, 3, 1),
			),
			new LexNode(
				"leafLexNode3",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, 4, 1),
			),
			new LexNode(
				"leafLexNode4",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, 5, 1),
			),
			new LexNode(
				"leafLexNode5",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, 6, 1),
			),
		];

		let parent: LexNode = new LexNode(
			"internalLexNode",
			vscode.TreeItemCollapsibleState.None,
			new LineToken(Symbol.FUNCTION, 0, 0, "foobar"),
			children,
		);

		assert.notStrictEqual(parent.children(), null);
		assert.notStrictEqual(parent.children(), []);
		assert.strictEqual(parent.children()!.length, children.length);
		for (var i = 0; i < children.length; i++) {}
		assert.strictEqual(parent.children()![i], children[i]);
	});

	test("adopt() to empty", () => {
		let children: LexNode[] = [
			new LexNode(
				"leafLexNode1",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, 2, 1),
			),
			new LexNode(
				"leafLexNode2",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, 3, 1),
			),
			new LexNode(
				"leafLexNode3",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, 4, 1),
			),
			new LexNode(
				"leafLexNode4",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, 5, 1),
			),
			new LexNode(
				"leafLexNode5",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, 6, 1),
			),
		];

		let testParent: LexNode = new LexNode(
			"internalLexNode",
			vscode.TreeItemCollapsibleState.None,
			new LineToken(Symbol.FUNCTION, 1, 0, "foobar"),
		);

		let referenceParent: LexNode = new LexNode(
			"internalLexNode",
			vscode.TreeItemCollapsibleState.None,
			new LineToken(Symbol.FUNCTION, 1, 0, "foobar"),
			children,
		);

		// parentify reference childdren
		referenceParent = new LexNode(
			referenceParent.label,
			referenceParent.collapsibleState,
			referenceParent.token,
			referenceParent
				.children()!
				.map(
					(c) =>
						new LexNode(
							c.label,
							c.collapsibleState,
							c.token,
							null,
							referenceParent,
						),
				),
		);

		testParent.adopt(children);

		assert.deepStrictEqual(deparent(testParent), deparent(referenceParent));
	});

	test("adopt() to !empty", () => {
		let children1: LexNode[] = [
			new LexNode(
				"leafLexNode1",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, 2, 1),
			),
		];

		let children2: LexNode[] = [
			new LexNode(
				"leafLexNode2",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, 3, 1),
			),
			new LexNode(
				"leafLexNode3",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, 4, 1),
			),
		];

		let testParent: LexNode = new LexNode(
			"internalLexNode",
			vscode.TreeItemCollapsibleState.None,
			new LineToken(Symbol.FUNCTION, 1, 0, "foobar"),
			children1,
		);

		let referenceParent: LexNode = new LexNode(
			"internalLexNode",
			vscode.TreeItemCollapsibleState.None,
			new LineToken(Symbol.FUNCTION, 1, 0, "foobar"),
			children1.concat(children2),
		);

		testParent.adopt(children2);

		assert.deepStrictEqual(deparent(testParent), deparent(referenceParent));
	});

	test("tooltip without line number", () => {
		let testTooltip: string | vscode.MarkdownString | undefined =
			new LexNode(
				"leafLexNode",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, -1, -11),
			).tooltip;
		let referenceTooltip: string = "leafLexNode";
		assert.notStrictEqual(testTooltip, undefined);
		assert.strictEqual(testTooltip, referenceTooltip);
	});

	test("tooltip with line number", () => {
		let testTooltip: string | vscode.MarkdownString | undefined =
			new LexNode(
				"leafLexNode",
				vscode.TreeItemCollapsibleState.None,
				new LineToken(Symbol.WHILE, 6, 1),
			).tooltip;
		let referenceTooltip: string = "leafLexNode: 7"; // 7 because it's 0 indexed in memory, but editor lines start at 1
		assert.notStrictEqual(testTooltip, undefined);
		assert.strictEqual(testTooltip, referenceTooltip);
	});
});
