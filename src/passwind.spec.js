import path from 'path'
// import { pipe, map } from 'ramda'
import { fork } from 'fluture'
// import {hook} from 'ripjam/test'
import { cancel } from './parser'
import { passwind } from './core'
const local = x => path.join(__dirname, x)

const fixture = {
  css: local('../fixture/example.css'),
  smallCSS: local('../fixture/small-example.css'),
  html: local('../fixture/example.html'),
}

describe('passwind', () => {
  test('flatten', done => {
    fork(done)(result => {
      expect(result).toMatchSnapshot()
      done()
    })(passwind({ flatten: true }, fixture.css, fixture.html))
  })
  test('drop', done => {
    fork(done)(result => {
      expect(result).toMatchSnapshot()
      done()
    })(passwind({ drop: true }, fixture.css, fixture.html))
  })
})

test('cancel', () => {
  expect(cancel()).toBeFalsy()
})
