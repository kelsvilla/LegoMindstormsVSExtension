import * as vscode from 'vscode';
//var player = require('play-sound')(opts= {});


function getReplaceIndex(line:string){
  /**
   * utility function to retrive the index of '.' in a given line
   * @param line the string in current line where the completion was requested
   */
        var position = line.search(/\./);
        if(position!==0){
          return position +1;
        }
        if(line.search('=')!==0){ return line.search('=') + 1;}

        //if '.' not found then return zero
        return 0;
}
//function to auto complete requested text
export async function suggestionFilter() {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		return;
	}
	//gather suggestions from Language Server
	const completion = await vscode.commands.executeCommand(
	'vscode.executeCompletionItemProvider',
	activeEditor.document.uri,
	activeEditor.selection.active,
) as vscode.CompletionList<vscode.CompletionItem>[];

  //get the current line where cursor is pointed
  var lineAt = activeEditor.selection.active;

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
	no issues are detected while running the program and generates expected results */

  //item.kind is a inbuilt property defined by the langugage server
  //fill the categories based on its kind
  for (var completionList of completion) {
    for (var item of completionList.items) {
      var quickPickItem: vscode.QuickPickItem = { label: item.label.toString() };
      if (item.kind === vscode.CompletionItemKind.Method) {
        methods.push(quickPickItem);
      } else if (item.kind === vscode.CompletionItemKind.Function) {
        functions.push(quickPickItem);
      } else if (item.kind === vscode.CompletionItemKind.Constructor) {
        constructor.push(quickPickItem);
      } else if (item.kind === vscode.CompletionItemKind.Field) {
        fields.push(quickPickItem);
      } else if (item.kind === vscode.CompletionItemKind.Variable) {
        variables.push(quickPickItem);
      } else if (item.kind === vscode.CompletionItemKind.Class) {
        classes.push(quickPickItem);
      } else if (item.kind === vscode.CompletionItemKind.Interface) {
        interfaces.push(quickPickItem);
      } else if (item.kind === vscode.CompletionItemKind.Module) {
        modules.push(quickPickItem);
      } else if (item.kind === vscode.CompletionItemKind.Property) {
        property.push(quickPickItem);
      }
    }
  }

	/*test for the above bug
	console.log("List of functions: ");
	for(var i of functions)
	{
		console.log(i.label);
	}*/
	//show user types of suggestions they are looking for
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
    else if(selectedKind==='Fields')
    {
      selectQp.items = fields;
    }
    else if(selectedKind==='Interfaces')
    {
      selectQp.items = interfaces;
    }
    else if(selectedKind==='Modules')
    {
      selectQp.items = modules;
    }
    else if(selectedKind==='Properties')
    {
      selectQp.items = property;
    }
    else if(selectedKind==='Constructor')
    {
      selectQp.items = constructor;
    }
    else if(selectedKind==='Attribute')
    {
      selectQp.items = methods;
    }
		selectQp.show();
		selectQp.onDidAccept(()=>{
		activeEditor.edit(editBuilder =>{
    const replacePosition = getReplaceIndex(activeEditor.document.lineAt(lineAt).text);
    var startPosition = new vscode.Position(lineAt.line,replacePosition);
    var endPosition = new vscode.Position(lineAt.line,activeEditor.document.lineAt(lineAt).text.length);
    var range = new vscode.Range(startPosition,endPosition);
    //delete first
    editBuilder.delete(range);
    //then replace
		editBuilder.replace(startPosition,selectQp.selectedItems[0].label);
		}).then(success=>{
      if(success){
        selectQp.dispose();
        /*the editor selects the entire texts that has been completed which causes the complete text to be replaced
        if we immediatedly start typing after completion. To solve this create a new selection with position marking
        the end of the completed text*/
        var postion = activeEditor.selection.end;
        activeEditor.selection = new vscode.Selection(postion, postion);
      }
    });
	});
	kindQp.dispose();
	});

}





