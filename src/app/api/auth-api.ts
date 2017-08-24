"use strict"

import * as config from 'config'

import Api from './api'

import option from '../utils/option'

import googleService from '../service/google-service'
import facebookService from '../service/facebook-service'
import userService from '../service/user-service'
import jwtService from '../service/jwt-service'

const jwtHeader = option(config.get('jwt.header'))
                    .orElse('Authorization')

class AuthApi extends Api {
    private unless: string[] = ['/auth']

    constructor(server, unless?: string[]) {
        super(server);
        this.unless = this.unless.concat(unless)
    };

    private auth = (res, next, user) => {
        return jwtService.sign({
            name: user['name'],
            email: user['email'],
            session: user['session']
        }).then(token => {
            const newSession = user['session']
            newSession.logged = true
            newSession.token = token
            userService.update(user['_id'], newSession)
            .then(userUpdated => {
                res.send(200, { 
                    id: user['_id'],
                    name: user['name'],
                    email: user['_id'], 
                    companies: user['companies'], 
                    picture: user['picture'],
                    session: newSession 
                })
                next()
            })
            .catch(err => next(new this.BadRequest(err)))
        }).catch(err => next(new this.UnauthorizedError(err)))
}

    private getToken = header => 
        option(header)
            .filter(header => header.split(' ')[0] === 'Bearer')
            .map(header => header.split(' ')[1])
            .map(header => header.trim())
            .orElse('');

    private isUnless = path => this.unless.indexOf(path) > -1 || 
                                this.unless.some(uri => path.indexOf(uri) > -1)


    routes() {
        // auth filter
        this.server.pre((req, res, next) => {
            if (this.isUnless(req.path())) {
                next()
            } else {
                const header = jwtHeader.toString().toLowerCase()
                const reqHeader = req.headers[header];
                const token = this.getToken(reqHeader)

                jwtService.verify(token)
                .then(user => {
                    req.user = user
                    next()
                })
                .catch(err => next(new this.UnauthorizedError(err)))
            }
        })

        // auth routes
        this.server.get('/auth/facebook', (req, res, next) => {
            facebookService.authUrl()
            .then(url => {
                res.send(200, url)
                next()
            }).catch(err => next(this.UnauthorizedError(err)))
        })

        
        this.server.post('/auth/facebook', (req, res, next) => {
            const code = facebookService.getToken(req.body.code)
            .then(user => this.auth(res, next, user))
            .catch(err => next(new this.UnauthorizedError(err)))
        })

        this.server.get('/auth/google', (req, res, next) => {
            googleService.authUrl()
            .then(url => {
                res.send(200, url)
                next()
            }).catch(err => next(this.UnauthorizedError(err)))
        })

        this.server.post('/auth/google', (req, res, next) => {
            const code = googleService.getToken(req.body.code)
            .then(user => this.auth(res, next, user))
            .catch(err => next(new this.UnauthorizedError(err)))
        })

        this.server.post('/login', (req, res, next) => 
            userService.login(req.body.email, req.body.password)
            .then(user => this.auth(res, next, user))
            .catch(err => next(new this.UnauthorizedError(err))))

        return this.server;
    }

}

export default (server, unless) => new AuthApi(server, unless);
