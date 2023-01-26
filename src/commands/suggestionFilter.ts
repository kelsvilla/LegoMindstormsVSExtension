import * as vscode from 'vscode';

function getReplaceIndex(line:string){
        const position = line.search(/\./);
        if(position!==0){
          return position +1;
        }
        return 0;
}
export async function suggestionFilter() {
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
  var lineAt = activeEditor.selection.active;
  console.log("sussgestion at line:",lineAt);
  console.log(activeEditor.document.lineAt(lineAt).text);
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
    //todo -- harish
    //follow the above if else pattern and complete the rest
		selectQp.show();
		selectQp.onDidAccept(()=>{
		activeEditor.edit(editBuilder =>{
    const replacePosition = getReplaceIndex(activeEditor.document.lineAt(lineAt).text);
    var startPosition = new vscode.Position(lineAt.line,replacePosition);
    var endPosition = new vscode.Position(lineAt.line,activeEditor.document.lineAt(lineAt).text.length);
    var range = new vscode.Range(startPosition,endPosition);
    editBuilder.delete(range);
		editBuilder.replace(startPosition,selectQp.selectedItems[0].label);
		selectQp.dispose();
		}).then(success=>{
      if(success){
        var postion = activeEditor.selection.end;
        activeEditor.selection = new vscode.Selection(postion, postion);
      }
    });
	});
	kindQp.dispose();
	});

}





