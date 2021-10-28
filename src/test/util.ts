import * as vscode from 'vscode';

import LexNode from '../pylex/node';

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
        null
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
    null
  );
}


export {
  deparent,
  root,
};
