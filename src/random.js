import U from 'unusual'
import { times, join, pipe } from 'ramda'
import pkg from '../package.json'

export const random = new U(`${pkg.name}${pkg.version}`)

const ALPHABET = `abcdefghijklmnopqrstuvwxyz`
const NUMBERS = `0123456789`
export const letter = () => random.pick(ALPHABET)
export const number = () => random.pick(NUMBERS)

export const letters = pipe(times(letter), join(''))
export const numbers = pipe(times(number), join(''))
export const uniqId = () => letters(8) + '-' + numbers(4)
