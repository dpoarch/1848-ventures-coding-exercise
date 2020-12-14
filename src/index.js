const {Command, flags} = require('@oclif/command')
const readline = require('readline')
const fs = require('fs')

class ScoringCommand extends Command {
  static args = [
    { name: 'file', description: 'File containing the scores' }
  ]

  async run() {
    const {args, flags} = this.parse(ScoringCommand)
    let input = null

    if (args.file === undefined && Boolean(process.stdin.isTTY) === false) {
      input = process.stdin
    }

    if (args.file !== undefined) {
      if (fs.existsSync(args.file) === false) {
        this.error(`File ${args.file} does not exist`)
      }

      if (fs.existsSync(args.file) === true && fs.statSync(args.file).isDirectory() === true) {
        this.error(`File ${args.file} is a directory`)
      }

      input = fs.createReadStream(args.file)
    }

    if (input === null) {
      this.error(`No data to process`)
      return
    }

    const reader = readline.createInterface({
      input: input
    })

    let results = {}

    reader.on('line', (line) => {
      let lines = line.split(',').map(s => s.trim())

      let teamA = lines[0].match(/^(?<team>.+) (?<score>\d)$/)
      let teamB = lines[1].match(/^(?<team>.+) (?<score>\d)$/)

      if (results[teamA.groups.team] === undefined) {
        results[teamA.groups.team] = 0
      }

      if (results[teamB.groups.team] === undefined) {
        results[teamB.groups.team] = 0
      }

      if (teamA.groups.score === teamB.groups.score) {
        results[teamA.groups.team] += 1
        results[teamB.groups.team] += 1
      }

      if (teamA.groups.score > teamB.groups.score) {
        results[teamA.groups.team] += 3
      }

      if (teamA.groups.score < teamB.groups.score) {
        results[teamB.groups.team] += 3
      }
    })

    reader.on('close', () => {
      results = Object.entries(results).sort((a, b) => {
        if (a[1] > b[1]) return -1
        if (a[1] < b[1]) return 1

        return [a[0], b[0]].sort().reduce((o, s) => {
          if (s === a[0] && o === 0) return -1
          if (s === b[0] && o === 0) return 1
          return o
        }, 0)
      })

      results.forEach((v, i) => {
        this.log(`${i+1}. ${v[0]}, ${v[1]} pts`)
      })
    })
  }
}

ScoringCommand.description = `Describe the command here
...
Extra documentation goes here
`

ScoringCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({char: 'v'}),
  // add --help flag to show CLI version
  help: flags.help({char: 'h'}),
  name: flags.string({char: 'n', description: 'name to print'}),
}

module.exports = ScoringCommand
