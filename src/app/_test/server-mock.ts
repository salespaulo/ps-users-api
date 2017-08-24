"use strict";

import server from '../server/server';
import logger from '../log/logger'
import jwtService from '../service/jwt-service'
import userService from '../service/user-service'

const AppNotInitError = Error

import users from '../repository/users'

const USER_NAME = 'Token User'
const USER_PASSW = 'token'

const userEmail = id =>  `token${id}@test.com`

class ServerMock {
    private server: any = null

    constructor() {
        process.env.PORT = 8001
        this.server = server().get()
    }

    signin = id => new Promise((resolve, reject) => 
        userService.insert(USER_NAME, userEmail(id), USER_PASSW)
        .then(user => jwtService.sign({
                email: user['email'],
                session: user['session']
            })
            .then(token => resolve(`Bearer ${token}`))
            .catch(err => reject(err)))
        .catch(err => reject(err)))
    
    signout = id => new Promise((resolve, reject) =>
        userService.findByEmail(userEmail(id))
        .then(user => userService.delete(user['_id'])
            .then(returnUser => resolve(returnUser))
            .catch(err => reject(err)))
        .catch(err => reject(err)))

    shutdown() {
        const enableDestroy = require('server-destroy')
        enableDestroy(this.server.server)
        return this.server.server.destroy()
    }

    getServer = () => {
        if (!!this.server && !!this.server.close) return this.server.server
        throw new AppNotInitError('AppNotInitError app or app.close is undefinied')
    }
}

const serverMock = new ServerMock()

export { USER_NAME, USER_PASSW, userEmail }
export default serverMock
