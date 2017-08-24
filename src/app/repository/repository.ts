'use strict'

import * as nano from 'nano'
import * as config from 'config'

import logger from '../log/logger'

const InitCouchdbError = Error

const couchdb = () => nano({
    url: config.get('db.host'),
    log: (id, args) => {
        logger.verbose(`[COUCHDB] id[${JSON.stringify(id)}] args[${JSON.stringify(args)}]`)
    }
})

const RepositoryError = Error 

export { RepositoryError }

export default dbname => new Promise((resolve, reject) => {
    const server = couchdb()

    if (!server) return reject(new InitCouchdbError())

    return server.db.create(dbname, (err, body) => {
        const db = server.db.use(dbname)
        db.find = selector => new Promise((res, rej) =>
            server.request({
                db: dbname,
                method: 'post',
                path: '/_find',
                body: {
                    selector: selector
                }
            }, (err, data) => {
                if (!!err) rej(err)
                else {
                    if (!!data.warning) logger.verbose(`[COUCHDB WARNING] DB ${dbname} find warning="${data.warning}"`)
                    res(data.docs)
                }
            })
        )
        resolve(db)
    })
})