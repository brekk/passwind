import U from 'unusual'
import { times, join, pipe } from 'ramda'
import pkg from '../package.json'

export const random = new U(`${pkg.name}${pkg.version}`)

const ALPHABET = `abcdefghijklmnopqrstuvwxyz`
export const letter = () => random.pick(ALPHABET)

export const uniqId = () => pipe(times(letter), join(''))(8)
