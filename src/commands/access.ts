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
	var methods:vscode.QuickPickItem[] = [];
	var constructor:vscode.QuickPickItem[] = [];
  var fields:vscode.QuickPickItem[] = [];
  var variables:vscode.QuickPickItem[] = [];
  var classes:vscode.QuickPickItem[] = [];
  var interfaces:vscode.QuickPickItem[] = [];
  var modules:vscode.QuickPickItem[] = [];
  var property:vscode.QuickPickItem[] = [];
	/* although the text editor marks the following code as error,
	no issues are detected while running the program and generates expected items */
	for(var item of completion.items){
     if(item.kind===1){
      methods.push(item);
    }
		else if(item.kind ===2){
			functions.push(item);
		}

    else if(item.kind===3){
      constructor.push(item);
    }
    else if(item.kind===4){
      fields.push(item);
    }
    else if(item.kind===5){
      variables.push(item);
    }
    else if(item.kind===6){
      classes.push(item);
    }
    else if(item.kind===7){
      interfaces.push(item);
    }
    else if(item.kind===8){
      modules.push(item);
    }
    else if(item.kind===9){
      property.push(item);
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
  options.push({label:'Functions'});
	options.push({label:'Attribute'});
  options.push({label:'Constructor'});
  options.push({label:'Fields'});
  options.push({label:'Variables'});
  options.push({label:'Classes'});
  options.push({label:'Interfaces'});
  options.push({label:'Modules'});
  options.push({label:'Properties'});

	const kindQp = vscode.window.createQuickPick();
	kindQp.items = options;
	kindQp.show();
	kindQp.onDidAccept(()=>{
		var selectedKind = kindQp.selectedItems[0].label;
		const selectQp = vscode.window.createQuickPick();
		if(selectedKind==='Functions')
		{
			selectQp.items = functions;
		}
    else if(selectedKind==='Classes')
    {
      selectQp.items = classes;
    }
    else if(selectedKind==='Variables')
    {
      selectQp.items = variables;
    }
		selectQp.show();
		selectQp.onDidAccept(()=>{
		activeEditor.edit(editBuilder =>{
      /*fix-me
      Currently appends suggestions to the text already present.
      Replace and then insert.
      Maybe figuring out position can be helpful.
      */
		editBuilder.replace(activeEditor.selection.start,selectQp.selectedItems[0].label);
		selectQp.dispose();
		});
	});
	kindQp.dispose();
	});

}



