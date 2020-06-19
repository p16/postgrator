/* global after, it, describe */
const assert = require('assert')
const Postgrator = require('../postgrator')

const path = require('path')
const migrationDirectory = path.join(__dirname, 'migrationFailureWhenCannotWriteOnSchemaVersionTable')

testConfig({
  migrationDirectory: migrationDirectory,
  driver: 'pg',
  host: 'localhost',
  port: 5432,
  database: 'postgrator',
  username: 'postgrator',
  password: 'postgrator',
})

function testConfig(config) {
  describe(`Driver: ${config.driver}`, function () {
    const postgrator = new Postgrator(config)
    postgrator.on('validation-started', (migration) => console.log(migration))
    postgrator.on('validation-finished', (migration) => console.log(migration))
    postgrator.on('migration-started', (migration) => console.log(migration))
    postgrator.on('migration-finished', (migration) => console.log(migration))

    it('Handles failed migrations', function () {
      return postgrator.migrate().catch((error) => {
        assert(error, 'Error expected from bad migration')
        assert(
          error.appliedMigrations,
          'appliedMigrations decorated on error object'
        )
        assert.strictEqual(
          postgrator.commonClient.connected,
          false,
          'client disconnected on error'
        )
      })
    })

    it('Does not apply migration content if writing on the schemaversion table fails', function () {
      return postgrator.runQuery("SELECT table_name FROM information_schema.tables where table_schema = 'public'").then((results) => {
        const names = results.rows.map(row => row.table_name)

        assert.strictEqual(names.includes('test_table'), false, 'The second migration table should not be present if the version can;t be written in the schemaversion table')
      })
    })

    it('Migrates down to 000', function () {
      return postgrator.migrate('00')
    })

    after(function () {
      return postgrator.runQuery('DROP TABLE schemaversion')
    })
  })
}
