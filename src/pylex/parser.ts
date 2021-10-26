import * as vscode from 'vscode';

import { EOFTOKEN, Symbol, TabInfo } from './token';
import Lexer from './lexer';
import LexNode from './node';

/**
 * A parse tree generator
 */
export default class Parser {
  private lexer: Lexer;
  private currIndent: number;
  private root: LexNode; // Root of syntax tree

  /**
   * @param `text` Text to parse.
   * @param `tabFmt` A tab information descriptor
   */
  constructor (private text?: string, private tabFmt?: TabInfo) {}

  /**
   * Parse the passed text.
   *
   * @param `text` Text to parse. If undefined, use current value of `this.text`
   * @param `tabFmt` A tab information descriptor
   * @return A parse tree representing `text`.
   */
  parse(text?: string, tabFmt?: TabInfo): LexNode {
    if (text) {
      // save text
      this.text = text;
    } else {
      // default to this.text
      // this might still be undefined
      text = this.text;
    }

    if (tabFmt) {
      // save tabFmt
      this.tabFmt = tabFmt;
    } else {
      // default to this.tabFmt
      // this might still be undefined
      tabFmt = this.tabFmt;
    }

    // initialize root
    this.lexer = new Lexer(this.text, this.tabFmt);
    this.root = new LexNode(
      "root",
      vscode.TreeItemCollapsibleState.None,
      null,
      null,
      null
    );

    // parse children
    this.currIndent = 0;
    const children = this._parse(this.root);

    if (children.length > 0) {
      this.root.adopt(children);
    }
    return this.root;
  }

  private _parse(parent: LexNode | null): LexNode[] {
    let children: LexNode[] = [];
    while (this.lexer.currToken() !== EOFTOKEN) {
      if (this.lexer.currToken().indentLevel < this.currIndent) {
        // go up 1 level of recursion at a time to unravel properly
        this.currIndent--;
        return children;
      } else if (this.lexer.currToken().type === Symbol.INDENT) {
        // regular code, advance and stay in same block
        this.lexer.next();
        continue;
      } else {
        // new block starts here
        const label = this.lexer.currToken().type + (this.lexer.currToken().attr === undefined ? "" : " " + this.lexer.currToken().attr);
        let blockRoot = new LexNode(
          label,
          vscode.TreeItemCollapsibleState.None,
          this.lexer.currToken(),
          null,
          parent
        );
        this.lexer.next();
        this.currIndent++;
        const blockChildren = this._parse(blockRoot); // Recursively parse all child blocks
        if (blockChildren.length > 0) {
          blockRoot.adopt(blockChildren);
        }
        children.push(blockRoot);
      }
    }
    return children;
  }

  /**
   * Get an array of LexNodes representing the rootpath of LexNodes from the
   * passed line number to the root of the document. A list of "this" inside
   * "that" inside ... inside the document root.
   *
   * @param `lineNumber` The line number to query context for.
   * @return An array of LexNodes for the root path containing `lineNumber`
   */
  context(lineNumber: number): LexNode[] {
    if (!this.root.children()) {
      return [];
    }

    // Returns the LexNode that is the parent
    // of the queried line number
    let find = (root: LexNode): LexNode | undefined => {
      let prevChild: LexNode;
      for (var child of root.children()!) {
        if (lineNumber < child.token!.linenr) {
          if (prevChild!.children()) {
            return find(prevChild!);
          } else {
            return prevChild!;
          }
        } else {
          prevChild = child;
        }
      }
    };

    let target = find(this.root);
    return target!.rootPath();
  }
}
