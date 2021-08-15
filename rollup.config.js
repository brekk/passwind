import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
// import shebang from 'rollup-plugin-add-shebang'
import pkg from './package.json'

const external = (
  pkg && pkg.dependencies ? Object.keys(pkg.dependencies) : []
).concat([`path`, `url`, `fs`])

const plugins = [
  json(),
  resolve({ preferBuiltins: true }),
  commonjs()
]

const build = (input, name) => [
  {
    input,
    external,
    output: [
      { name, file: name + '.js', format: 'cjs', exports: 'auto' },
      { name, file: name + '.mjs', format: 'esm' }
    ],
    plugins
  }
]

const toBuild = [...build(`src/index.js`, pkg.name)]

export default toBuild
