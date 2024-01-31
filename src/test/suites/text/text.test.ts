import * as assert from "assert";
import * as vscode from "vscode";
import { after } from "mocha";

import { fetchLineNumber } from "../../../commands/text";

import * as fs from 'fs';
import { join } from 'path';

function syncWriteFile(filename: string, data: any) {
  /**
   * flags:
   *  - w = Open file for reading and writing. File is created if not exists
   *  - a+ = Open file for reading and appending. The file is created if not exists
   */
  fs.writeFileSync(filename, data, {
    flag: 'a+',
  });

}

const mainFile = vscode.Uri.file(join(__dirname, "testing.py"));
mainFile.scheme === 'file';
mainFile.path === join(__dirname, "testing.py");
mainFile.fragment === '';

suite("Text Command Test Suite", () => {
    after(() => {
		vscode.window.showInformationMessage("All tests passed!");
	});
    test("Get line number", () => {
        var fileName = join(__dirname, "testing.py");
        if(fs.existsSync(fileName)) {
            fs.unlinkSync(fileName);
        }
        for(let i = 1; i < 10; i++) {
            syncWriteFile(fileName, `${i}\n`);
        }
        syncWriteFile(fileName, "10");
        const contents = fs.readFileSync(join(__dirname, "testing.py"), 'utf-8');
        vscode.window.showTextDocument(mainFile);
        console.log(fetchLineNumber(vscode.window.activeTextEditor));
        console.log(contents);
	});




});