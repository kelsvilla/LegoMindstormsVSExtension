import * as assert from "assert";
import * as vscode from "vscode";
import { before, after } from "mocha";

import * as command from "../../../commands/text";

import { join } from 'path';

function initFile(): string {
  const fileName = join(__dirname, "../../../hubManager.js");
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
        editor.selection = new vscode.Selection(i, 0, i, 0);
        let lineNumber = command.fetchLineNumber(vscode.window.activeTextEditor) - 1;
        assert.equal(lineNumber, i);
      }
  });

  test("Get indent", () => {
    editor.selection = new vscode.Selection(80, 0, 80, 0);
    let indentNum = command.getIndent();
    assert.equal(7, indentNum);
  });

  test("Get leading spaces", () => {
    editor.selection = new vscode.Selection(80, 0, 80, 0);
    assert.equal(28, command.fetchNumberOfLeadingSpaces(editor));
  });

  test("Get number of selected lines", () => {
    editor.selection = new vscode.Selection(80, 0, 85, 0);
    assert.equal(6, command.fetchNumberOfSelectedLines(editor));
  });

  test("Get line", () => {
    editor.selection = new vscode.Selection(80, 0, 80, 0);
    let currentLine = editor.document.lineAt(80);
    assert.notStrictEqual(currentLine, command.fetchLine(editor));
  });

  test("Move Cursor to Beginning", () => {
    editor.selection = new vscode.Selection(80, 0, 80, 0);
    command.moveCursorBeginning();
    assert.equal(0, editor.selection.active.line);
  });

  test("Move Cursor to End", () => {
    editor.selection = new vscode.Selection(80, 0, 80, 0);
    command.moveCursorEnd();
    assert.equal(369, editor.selection.active.line);
  });
});