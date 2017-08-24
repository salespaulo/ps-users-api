'use strict'

import Api from './api'

class SupportApi extends Api {

    constructor(server: any) {
        super(server)
    }

    routes() {
        const that = this

        this.server.get('/', (req, res, next) => {
            res.send(200, this.server.info())
            return next()
        })

        this.server.get('/ping', (req, res, next) => {
            res.send(200, 'pong')
            return next()
        })

        this.server.get('/echo/:value', (req, res, next) => {
            res.send(200, 'echo from value=' + req.params.value)
            return next()
        })

        this.server.get('/stop', (req, res, next) => {
            res.send(200, that.server.info())
            setTimeout(that.server.destroy, 500, 'stopserver')
            return next()
        })

        return this.server
    }
}

export default (server) => new SupportApi(server)