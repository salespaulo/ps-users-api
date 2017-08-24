'use strict'

import userService from '../service/user-service'

import option from '../utils/option'
import logger from '../log/logger'

class Routes {
    readonly server: any

    close = () => option(this.server).map(server => server.close())

    get = (path, callback) => this.server.get(path, callback)

    post = (path, callback) => this.server.post(path, callback)

    put = (path, callback) => this.server.put(path, callback)

    del = (path, callback) => this.server.del(path, callback)

    pre = callback => this.server.pre(callback)

    destroy = () => {
        this.server.info.running = false
        this.server.destroy()
    }

    info = () => this.server.info

    constructor(server) {
        this.server = server
        logger.silly('Init Server Routes server="', server, '"','" [OK]')
    }

}

export default server => new Routes(server)
