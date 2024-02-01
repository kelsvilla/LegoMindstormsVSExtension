import * as assert from "assert";
import * as vscode from "vscode";
import { before, after } from "mocha";

import { fetchLineNumber, getIndent } from "../../../commands/text";

import * as fs from 'fs';
import { join } from 'path';

function syncWriteFile(filename: string, data: any) {
  fs.writeFileSync(filename, data, {
      flag: 'a+',
  });
}

function initFile(): string {
  const fileName = join(__dirname, "testing.py");
  if (fs.existsSync(fileName)) {
    fs.unlinkSync(fileName);
  }
  return fileName;
}

suite("Text Command Test Suite", () => {
  let editor: vscode.TextEditor;

  before(async () => {
    var fileName = initFile();
    syncWriteFile(fileName, '');
    const document = await vscode.workspace.openTextDocument(fileName);
    editor = await vscode.window.showTextDocument(document);
  });

  after(() => {
      vscode.window.showInformationMessage("All tests passed!");
  });

  test("Get line number", () => {
      for(let i = 0; i <= 10; i++){
        syncWriteFile("testing.py", '\n');
        editor.selection = new vscode.Selection(i, 0, i, 0);
        let lineNumber = fetchLineNumber(vscode.window.activeTextEditor) - 1;
        assert.equal(lineNumber, i);
      }
  });
  test("Get indent", () => {
    for(let i = 1; i <= 10; i++){
      fs.unlinkSync("testing.py");
      for(let j = 0; j < i; j++){
        syncWriteFile("testing.py", " ");
      }
      syncWriteFile("testing.py", "flavor");
      editor.selection = new vscode.Selection(0, 1, 0, 1);
      console.log(vscode.window.activeTextEditor?.document.getText());
      let indentNum = getIndent();
      console.log(indentNum);
      assert.equal(i, indentNum);
    }
  });
});