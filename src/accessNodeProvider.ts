import * as vscode from 'vscode';

// list of all actions
let actions: AccessAction[] = [];

class AccessAction extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly command: vscode.Command
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
  }
};

export default class AccessNodeProvider implements vscode.TreeDataProvider<AccessAction> {
  public getTreeItem(a: AccessAction): vscode.TreeItem {
    return a;
  }

  public async getChildren(): Promise<AccessAction[]> {
    if (actions.length === 0) {
      // fetch and cache mind-reader options
      let cmds: string[] = await vscode.commands.getCommands(true); // get non-builtin commands
      cmds = cmds.filter(x => x.startsWith('mind-reader')); // filter mind-reader commands

      cmds.forEach(c => {
        let humanReadable = c.replace(/^mind-reader\./, ''); // strip extensions name

        // Convert camelCaseText to Title Case Text
        humanReadable = humanReadable.replace(/([A-Z])/g, ' $1');
        humanReadable = humanReadable.charAt(0).toUpperCase() + humanReadable.slice(1);

        // add item to actions
        actions.push(new AccessAction(
          humanReadable,
          {
            title: humanReadable,
            command: c,
            tooltip: humanReadable
          }
        ));
      });
    }

    return Promise.resolve(actions);
  }
}
