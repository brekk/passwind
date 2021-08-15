import path from 'path'
import { pipe, map } from 'ramda'
import { fork } from 'fluture'
// import {hook} from 'ripjam/test'
import { reader } from './index'
const local = x => path.join(__dirname, x)
const localizer = fn => pipe(local, fn)

const localReader = map(localizer)(reader)

test('parse.css', done => {
  const parsedF = localReader.css('../fixture/example.css')
  fork(done)(result => {
    expect(result).toMatchSnapshot()
    done()
  })(parsedF)
})

test('parse.html', done => {
  const parsedF = localReader.html('../fixture/example.html')
  fork(done)(result => {
    expect(result).toMatchSnapshot()
    done()
  })(parsedF)
})
