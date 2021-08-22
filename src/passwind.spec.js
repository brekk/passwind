import path from 'path'
// import { pipe, map } from 'ramda'
import { fork } from 'fluture'
// import {hook} from 'ripjam/test'
import { cancel } from './parser'
import { passwind } from './index'
const local = x => path.join(__dirname, x)

const fixture = {
  css: local('../fixture/example.css'),
  smallCSS: local('../fixture/small-example.css'),
  html: local('../fixture/example.html'),
}

test('passwind', done => {
  fork(done)(result => {
    expect(result).toMatchSnapshot()
    done()
  })(passwind(fixture.css, fixture.html))
})

test('cancel', () => {
  expect(cancel()).toBeFalsy()
})
