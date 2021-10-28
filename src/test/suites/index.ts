import * as path from 'path';
import * as glob from 'glob';
import * as Mocha from 'mocha';

export function run(): Promise<void> {
  // Create the mocha test
  const mocha: Mocha = new Mocha({
    ui: 'tdd',
    color: true
  });

  const testsRoot: string = path.resolve(__dirname, '..');

  return new Promise((c, e) => {
    // Find files
    glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
      if (err) {
        return e(err);
      }

      // Add files to the test suite
      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run(failures => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c();
          }
        });
      } catch (err) {
        e(err);
      }
    });
  });
}