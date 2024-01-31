import * as assert from "assert";
import * as vscode from "vscode";
import { before, after } from "mocha";

import { fetchLineNumber, returnIndent } from "../../../commands/text";

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
    initFile();
    for(let i = 0; i < 10; i++){
      fs.appendFileSync("testing.py", '\t.');
      editor.selection = new vscode.Selection(0, 0, 0, 0);
      let indentNum = returnIndent();
      console.log(indentNum);
      assert.equal(i, indentNum);
    }
  });
});