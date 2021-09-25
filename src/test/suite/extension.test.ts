import * as assert from 'assert';
import * as vscode from 'vscode';
import { after } from 'mocha';

suite('Dummy Test Suite', () => {
  after(() => {
    vscode.window.showInformationMessage('All tests passed!');
  });

  test('Dummy Test', () => {
    assert.strictEqual(0 === 0, true);
  });
});
