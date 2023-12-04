import * as vscode from "vscode";

import { CommandEntry } from "./commands";

export class CommandItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly command: vscode.Command,
	) {
		super(label, vscode.TreeItemCollapsibleState.None);
	}
}

export default class CommandNodeProvider
	implements vscode.TreeDataProvider<CommandItem>
{
	private items: CommandItem[] = [];

	public constructor(commands: CommandEntry[]) {
		// build and cache command items
		for (const c of commands) {
			let humanReadable = c.name.replace(/^mind-reader\./, ""); // strip extensions name
			// Convert camelCaseText to Title Case Text
			humanReadable = humanReadable.replace(/([A-Z])/g, " $1");
			humanReadable =
				humanReadable.charAt(0).toUpperCase() + humanReadable.slice(1);

			this.items.push(
				new CommandItem(humanReadable, {
					title: humanReadable,
					command: c.name,
					tooltip: humanReadable,
				}),
			);
		}
	}

	public getTreeItem(item: CommandItem): vscode.TreeItem {
		return item;
	}

	public async getChildren(): Promise<CommandItem[]> {
		return Promise.resolve(this.items);
	}
}
