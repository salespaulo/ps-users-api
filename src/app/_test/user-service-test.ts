'use strict'

import userService from '../service/user-service'
import serverMock from './server-mock'
import logger from '../log/logger'

const email = 'tokenuserservice@test.com'

describe('API TEST INTO user-service', () => {
    describe('findByEmail', () => {
        before(() => serverMock.signin('userservice')
            .then(token => logger.verbose(`Test User Service Signin token="${token}`))
            .catch(err => logger.error(`Test User Service Signin error="${err}`)))

        after(() => serverMock.signout('userservice')
            .then(user => logger.verbose(`Test User Service Signout user="${user}`))
            .catch(err => logger.error(`Test User Service Signout error="${err}`)))

        it('get by ' + email, done => {
            userService.findByEmail(email)
            .then(user => {
                done()
            })
            .catch(err => done(err))
        })
    })
})