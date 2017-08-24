"use strict"

import * as jwt from 'jsonwebtoken'
import * as config from 'config'

import option from '../utils/option'

const encode = password => option(password)
                            .map(p => new Buffer(p).toString('base64'))
                            .orElse('')

const secret = option(config.get('jwt.secret'))
                .map(s => encode(s))
                .orElse(encode('secret'))

class JwtService {
    sign = data => new Promise((resolve, reject) => 
        jwt.sign(data, secret, (err, encoded) => {
            if (!!err) reject (err)
            else resolve(encoded)
        }))

    verify = token => new Promise((resolve, reject) => 
        jwt.verify(token, secret, (err, decoded) => {
            if (!!err) reject(err)
            else resolve(decoded)
        }))
}

export { secret }
export default new JwtService()
