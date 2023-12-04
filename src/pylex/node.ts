import * as vscode from "vscode";

import LineToken from "./token";

/* TODO: make accessing children and parent less tedious */
/* TODO: 'root.children()![i])' */
/**
 * A node in a Parse tree.
 */
export default class LexNode extends vscode.TreeItem {
	/**
	 * @param `label` A human-readable string describing this item
	 * @param `collapsibleState` {@link TreeItemCollapsibleState} of the tree item.
	 * @param `token` The token at this node.
	 * @param `_children` The children in this node's subtree.
	 * @param `_parent` The parent node of this node.
	 */
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly token: LineToken | null,
		private _children: LexNode[] | null = null,
		private _parent: LexNode | null = null,
	) {
		super(label, collapsibleState);
		this.tooltip = this.label;
		if (this.token && this.token.linenr >= 0) {
			this.tooltip += `: ${this.token.linenr + 1}`;
		}
	}

	/**
	 * @return The children of this node.
	 */
	children(): LexNode[] | null {
		return this._children;
	}

	/**
	 * @return The parent of this node.
	 */
	parent(): LexNode | null {
		return this._parent;
	}

	/**
	 * Adopt child nodes.
	 *
	 * @param `child` Array of nodes to adopt.
	 * @returns an updated version of itself
	 */
	adopt(children: LexNode[]): LexNode {
		let parentedChildren = children.map(
			(c) =>
				new LexNode(
					c.label,
					c.collapsibleState,
					c.token,
					c.children(),
					this,
				),
		);

		// Are there any other children?
		if (this._children) {
			// Yes...
			this._children = this._children.concat(children);
		} else {
			// No....
			this._children = parentedChildren;
		}
		return this;
	}

	/**
	 * Return the root path for this node.
	 *
	 * @return A path of parent nodes from this node to the root of the tree.
	 */
	rootPath(): LexNode[] {
		if (this._parent) {
			return [
				new LexNode(
					this.label,
					this.collapsibleState,
					this.token,
					this._children,
					this._parent,
				),
			].concat(this._parent.rootPath());
		} else {
			return [
				new LexNode(
					this.label,
					this.collapsibleState,
					this.token,
					this._children,
					this._parent,
				),
			];
		}
	}
}
