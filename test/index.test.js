const {expect, test} = require('@oclif/test')
const { inspect } = require('util');
const cmd = require('..')

describe('scoring', () => {
  test
  .stderr()
  .do(() => cmd.run([]))
  .catch(error => {
    expect(error.message).to.contain('Missing 1 required arg')
  })
  .it('runs without input file')
})
