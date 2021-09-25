import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "mind-reader" is now active!');
  vscode.window.showInformationMessage('Mind_Reader is loaded!')

	let disposable = vscode.commands.registerCommand('mind-reader.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Mind_Reader!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
