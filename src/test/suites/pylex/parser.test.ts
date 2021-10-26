import * as assert from 'assert';
import * as vscode from 'vscode';
import { after } from 'mocha';
import { deparent, root } from '../../util';

import Parser from '../../../pylex/parser';
import LexNode from '../../../pylex/node';
import LineToken from '../../../pylex/token';
import { Symbol } from '../../../pylex/token';

type ParserTest = {
  name: string,
  input: string[],
  output: LexNode,
};

const tests: ParserTest[] = [
  {
    name: 'No Input',
    input: [ ],
    output: root(null),
  },

  {
    name: 'Single line without construct',
    input: [ 'foo = "Yellow M&Ms make me angry >:(' ],
    output: root(null),
  },

  {
    name: 'Single line with construct',
    input: [ 'for x of y:' ],
    output: root([
      new LexNode(
        'for x of y',
         vscode.TreeItemCollapsibleState.None,
         new LineToken(Symbol.FOR, 0, 0, 'x of y')
      )
    ]),
  },

  {
    name: 'Sequential lines, without construct',
    input: [
      'bar = "Blue M&Ms make me happy <:)"',
      'reba = "A hard working gal"'
    ],
    output: root(null),
  },

  {
    name: 'Sequential lines, with, then without construct',
    input: [
      'if radioshack:',
      '    print radioshack.hours',
      'billy = "Scrubbly Bubbles!"'
    ],
    output: root([
      new LexNode('if radioshack',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.IF, 0, 0, 'radioshack'))
    ])
  },

  {
    name: 'Sequential lines, without, then with construct',
    input: [
      'billy = "Scrubbly Bubbles!"',
      'if radioshack:',
      '    print radioshack.hours'
    ],
    output: root([
      new LexNode('if radioshack',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.IF, 1, 0, 'radioshack'))
    ])
  },

  {
    name: 'Sequential lines with constructs',
    input: [
      'if yummy:',
      '    print("HOoray!")',
      'elif just_ok:',
      '    print("Do you have anything else?")',
      'else:',
      '    print("You really eat this?")',
    ],
    output: root([
      new LexNode('if yummy',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.IF, 0, 0, 'yummy')),
      new LexNode('elif just_ok',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.ELIF, 2, 0, 'just_ok')),
      new LexNode('else',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.ELSE, 4, 0)),
    ])
  },

  {
    name: 'Singly Nested Block',
    input: [
      'if yummy:',
      '    if in_my_tummy:',
      '        exclaim("Scrumdiddlyumptious!")'
    ],
    output: root([
      new LexNode('if yummy',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.IF, 0, 0, 'yummy'),
        [
          new LexNode('if in_my_tummy',
            vscode.TreeItemCollapsibleState.None,
            new LineToken(Symbol.IF, 1, 1, 'in_my_tummy'))
        ]
      )
    ])
  },

  {
    name: 'Singly Nested Block, then Block',
    input: [
      'if yummy:',
      '    if in_my_tummy:',
      '        exclaim("Scrumdiddlyumptious!")',
      'else:',
      '    exclaim("DAESGUSTEN~)"'
    ],
    output: root([
      new LexNode('if yummy',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.IF, 0, 0, 'yummy'),
        [
          new LexNode('if in_my_tummy',
            vscode.TreeItemCollapsibleState.None,
            new LineToken(Symbol.IF, 1, 1, 'in_my_tummy'))
        ]
      ),
        new LexNode('else',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.ELSE, 3, 0),
      )
    ])
  },

  {
    name: 'Doubly Nested Block',
    input: [
      'if yummy:',
      '    if in_my_tummy:',
      '        if looks_like_a_mummy:',
      '            print("you have a spot on your tummy"',
      'else:',
      '    print("Food is food...")'
    ],
    output: root([
      new LexNode('if yummy',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.IF, 0, 0, 'yummy'),
        [
          new LexNode('if in_my_tummy',
            vscode.TreeItemCollapsibleState.None,
            new LineToken(Symbol.IF, 1, 1, 'in_my_tummy'),
            [
              new LexNode('if looks_like_a_mummy',
                vscode.TreeItemCollapsibleState.None,
                new LineToken(Symbol.IF, 2, 2, 'looks_like_a_mummy'))
            ]
          )
        ]
      ),
        new LexNode('else',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.ELSE, 4, 0),
      )
    ])
  },

  {
    name: 'Doubly Nested Block, with multiple indent resets',
    input: [
      'if yummy:',
      '    if in_my_tummy:',
      '        if looks_like_a_mummy:',
      '            print("you have a spot on your tummy"',
      '        else:',
      '            print("eek! a zombie!)',
      '    elif in_my_mouth:',
      '        print("ill be in my tummy soon!"',
      'else:',
      '    print("Food is food...")'
    ],
    output: root([
      new LexNode('if yummy',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.IF, 0, 0, 'yummy'),
        [
          new LexNode('if in_my_tummy',
            vscode.TreeItemCollapsibleState.None,
            new LineToken(Symbol.IF, 1, 1, 'in_my_tummy'),
            [
              new LexNode('if looks_like_a_mummy',
                vscode.TreeItemCollapsibleState.None,
                new LineToken(Symbol.IF, 2, 2, 'looks_like_a_mummy')),
              new LexNode('else',
                vscode.TreeItemCollapsibleState.None,
                new LineToken(Symbol.ELSE, 4, 2))
            ]
          ),
          new LexNode('elif in_my_mouth',
            vscode.TreeItemCollapsibleState.None,
            new LineToken(Symbol.ELIF, 6, 1, 'in_my_mouth'))
        ]
      ),
        new LexNode('else',
        vscode.TreeItemCollapsibleState.None,
        new LineToken(Symbol.ELSE, 8, 0)
      )
    ])
  }
];

suite('Parser Test Suite', () => {
  after(() => {
    vscode.window.showInformationMessage('All tests passed!');
  });

  for (var t of tests) {
    let currTest = t; // without this, all test calls get the last test
    test(currTest.name, () => {
      let result: LexNode = deparent(new Parser(currTest.input.join('\n')).parse());
      process.stdout.write(Object.entries(result).toString());

      assert.deepStrictEqual(result, currTest.output);
    });
  }
});
