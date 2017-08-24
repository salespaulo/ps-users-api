"use strict"

import * as restify from 'restify';
import * as request from 'supertest';

import { assert } from 'chai';

import logger from '../log/logger'
import userService from '../service/user-service'

import serverMock from './server-mock'

import { USER_NAME, USER_PASSW, userEmail } from './server-mock'

const ID = 'auth'

let token = null

describe('API TEST INTO /login', () => {
    before(() => serverMock.signin(ID)
        .then(t => token = t)
        .catch(err => logger.error(`Test signout error="${err}"`)))

    after(() => serverMock.signout(ID)
        .then(user => serverMock.shutdown())
        .catch(err => logger.error(`Test signout error="${err}"`)))

    describe('[POST]', () => {
        it('200', done => {
            request(serverMock.getServer())
                .post('/login')
                .field('email', userEmail(ID))
                .field('password', USER_PASSW)
                .expect('Content-Type', /json/)
                .expect(200, done)
        })

        it('401 all invalid', done => {
            request(serverMock.getServer())
                .post('/login')
                .field('email', 'x')
                .field('password', 'x')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })

        it('401 only password invalid', done => {
            request(serverMock.getServer())
                .post('/login')
                .field('email', userEmail(ID))
                .field('password', 'x')
                .expect('Content-Type', /json/)
                .expect(401, done)
        })
    })
})