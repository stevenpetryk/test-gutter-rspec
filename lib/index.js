'use babel'

import childProcess from 'child_process'
import concat from 'concat-stream'

export default {
  config: {
    command: {
      type: 'string',
      title: 'RSpec Command',
      default: 'rspec %f',
      description: 'The command to run for your specs. `%f` will be replaced with the file path. ' +
        'SPEC_OPTS is used to force RSpec to output as JSON, so overriding `--format` will cause ' +
        'an error.'
    }
  },

  provideTestRunner () {
    return {
      test: this._test.bind(this),
      grammars: [
        'source.ruby.rspec'
      ]
    }
  },

  _test (editor) {
    const projectPath = editor.project.getPaths()[0]
    const file = editor.buffer.file.path

    return new Promise((resolve, reject) => {
      var terminal = childProcess.spawn('bash')
      terminal.stdout.pipe(concat((output) => this._handleOutput(output, resolve)))
      terminal.stdin.write(this._getCommand(projectPath, file))
      terminal.stdin.end()
    })
  },

  _getCommand (projectPath, spec) {
    var command = atom.config.get('test-gutter-rspec.command')
    command = command.replaceAll('%f', spec)

    return `cd ${projectPath} && SPEC_OPTS="-f json" ${command}\n`
  },

  _handleOutput (output, callback) {
    var result = JSON.parse(output.toString())
    callback(result.examples)
  }
}
