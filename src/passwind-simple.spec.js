import path from 'path'
// import { pipe, map } from 'ramda'
import { fork } from 'fluture'
// import {hook} from 'ripjam/test'
import { passwind } from './index'
const local = x => path.join(__dirname, x)

const fixture = {
  css: local('../fixture/example.css'),
  smallCSS: local('../fixture/small-example.css'),
  html: local('../fixture/example.html'),
}

test('passwind - small case', done => {
  fork(done)(result => {
    expect(result).toMatchSnapshot()
    done()
  })(passwind({}, fixture.smallCSS, fixture.html))
})
