module.exports = {
  scripts: {
    lint: 'eslint . --fix',
    rollup: 'rollup -c rollup.config.js',
    build: 'nps rollup',
    bundle: 'nps build',
    test: {
      script: 'jest',
      description: 'test stuff',
      snapshot: 'nps "test -u"',
      coverage: 'nps "test --coverage"',
      watch: 'nps "test --watchAll"',
    },
    care: 'nps lint test bundle',
    precommit: 'nps test bundle',
  },
}
