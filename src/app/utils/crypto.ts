"use strict"

import option from '../utils/option'

const encode = password => option(password)
                            .map(p => new Buffer(p).toString('base64'))
                            .orElse('')

const decode = encoded => option(encoded)
                            .map(p => Buffer.from(p, 'base64'))
                            .orElse('')

export { encode, decode }
