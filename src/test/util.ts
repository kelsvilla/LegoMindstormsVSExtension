import * as vscode from "vscode";
import { LineToken, PylexSymbol, LexNode } from "../pylex";

/**
 * TODO: Eliminate need for me.
 * Recursively deparents a LexNode tree. Needed
 * because I wasn't able to iterate the circular parent-child
 * relationship by hand
 */
function deparent(root: null): null;
function deparent(root: LexNode): LexNode;
function deparent(root: any): any {
	if (root === null) {
		return root;
	} else {
		if (root.children() !== null) {
			return new LexNode(
				root.label,
				root.collapsibleState,
				root.token,
				root.children()!.map(deparent),
			);
		} else {
			return new LexNode(
				root.label,
				root.collapsibleState,
				root.token,
				null,
				null,
			);
		}
	}
}

/**
 * "Roots" a list of lexNodes to match the parser
 *
 * Required to properly test the output of the parser,
 * since the parent child-relationship can't be modeled
 * exhaustively otherwise
 */
function root(nodes: LexNode[] | null): LexNode {
	return new LexNode(
		"root",
		vscode.TreeItemCollapsibleState.None,
		null,
		nodes,
		null,
	);
}

/* short hand for returning an indentation token for a certain line and indentation */
function statement(
	linenr: number,
	indentLevel: number,
	text: string = "",
): LexNode {
	return new LexNode(
		PylexSymbol.STATEMENT,
		0,
		new LineToken(PylexSymbol.STATEMENT, linenr, indentLevel, text),
	);
}

/* short hand for returning an empty token for a certain line*/
function empty(linenr: number): LexNode {
	return new LexNode(
		PylexSymbol.EMPTY,
		0,
		new LineToken(PylexSymbol.EMPTY, linenr, 999999),
	);
}

export { deparent, root, statement as statement, empty };
