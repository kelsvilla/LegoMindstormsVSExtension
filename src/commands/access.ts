import * as vscode from 'vscode';
import { getLineNumber } from './text';
import { CommandEntry } from './commandEntry';

// Accessibility Commands
export const accessCommands: CommandEntry[] = [
  {
    name: 'mind-reader.selectTheme',

    // callbacks can be inlined...
    callback: () => vscode.commands.executeCommand('workbench.action.selectTheme'),
  },

  {
    name: 'mind-reader.increaseFontScale',
    callback: increaseFontScale, // ...or factored out into separate functions below
  },

  {
    name: 'mind-reader.decreaseFontScale',
    callback: decreaseFontScale,
  },

  {
    name: 'mind-reader.resetFontScale',
    callback: resetFontScale,
  },

  {
    name: 'mind-reader.increaseEditorScale',
    callback: increaseEditorScale,
  },

  {
    name: 'mind-reader.decreaseEditorScale',
    callback: decreaseEditorScale,
  },

  {
    name: 'mind-reader.resetEditorScale',
    callback: resetEditorScale,
  },
  {
    name: 'mind-reader.voiceToText',
    callback: voiceToText,
},
{
  name:'mind-reader.suggestionFilter',
  callback:suggestionFilter,
}
];

function increaseFontScale(): void {
  vscode.commands.executeCommand('editor.action.fontZoomIn');
}

function decreaseFontScale(): void {
  vscode.commands.executeCommand('editor.action.fontZoomOut');
}

function resetFontScale(): void {
  vscode.commands.executeCommand('editor.action.fontZoomReset');
}

function increaseEditorScale(): void {
  vscode.commands.executeCommand('workbench.action.zoomIn');
}

function decreaseEditorScale(): void {
  vscode.commands.executeCommand('workbench.action.zoomOut');
}

function resetEditorScale(): void {
  vscode.commands.executeCommand('workbench.action.zoomReset');
}

async function voiceToText(): Promise<void> {
  vscode.window.showInformationMessage("Voice-To-Text Active");
  const ans = await vscode.window.showInputBox();
  if (ans === "Increase Font") {
    increaseFontScale();
  } else if ( ans === "Decrease Font") {
    decreaseFontScale();
  } else if ( ans === "Get Line Number") {
    getLineNumber();
  }
}

async function suggestionFilter() {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		return;
	}
	//gather suggestions from Language Server
	const completion = await vscode.commands.executeCommand<vscode.CompletionList[]>(
		'vscode.executeCompletionItemProvider',
		activeEditor.document.uri,
		activeEditor.selection.active,
	);
	//categorize suggestions
	var functions:vscode.QuickPickItem[] = [];
	var varibales:vscode.QuickPickItem[] = [];
	var attributes:vscode.QuickPickItem[] = [];
	/* although the text editor marks the following code as error,
	no issues are detected while running the program and generates expected items */
	for(var item of completion.items){
		if(item.kind ===2){
			functions.push(item);
		}
	}
	//test for the above bug
	console.log("List of functions: ");
	for(var i of functions)
	{
		console.log(i.label);
	}
	//show user options to select what type of suggestions they are looking for
	var options:vscode.QuickPickItem[] = [];
	const test:vscode.QuickPickItem = {
		alwaysShow:true,
		'label':"function",
	};
	options.push({label:'Attribute'});
	options.push(test);
	const kindQp = vscode.window.createQuickPick();
	kindQp.items = options;
	kindQp.show();
	kindQp.onDidAccept(()=>{
		var selectedKind = kindQp.selectedItems[0].label;
		const selectQp = vscode.window.createQuickPick();
		if(selectedKind==='function')
		{
			selectQp.items = functions;
		}
		selectQp.show();
		selectQp.onDidAccept(()=>{
		activeEditor.edit(editBuilder =>{
		editBuilder.replace(activeEditor.selection.active,selectQp.selectedItems[0].label);
		selectQp.dispose();
		});
	});
	kindQp.dispose();
	});

}



