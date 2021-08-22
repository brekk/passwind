import { fork } from 'fluture'
import { cssWithCancel, htmlWithCancel } from './parser'

test('cssWithCancel', done => {
  const canceller = () => {}
  fork(raw => {
    expect(raw.message).toEqual(
      'PostCSS received null instead of CSS string',
    )
    done()
  })(done)(cssWithCancel(canceller, null))
})

describe('htmlWithCancel', () => {
  test('non-string input', done => {
    const canceller = () => {}
    fork(raw => {
      expect(raw.message).toEqual('Expected an html string')
      done()
    })(done)(htmlWithCancel(canceller, null))
  })
  test('non-string input', done => {
    const canceller = () => {}
    fork(raw => {
      expect(raw.message).toEqual(
        "Cannot read property 'content' of undefined",
      )
      done()
    })(done)(htmlWithCancel(canceller, ''))
  })
})
