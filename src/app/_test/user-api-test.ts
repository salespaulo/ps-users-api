"use strict"

import * as restify from 'restify';
import * as request from 'supertest';

import { assert } from 'chai';

import logger from '../log/logger'
import userService from '../service/user-service'

import serverMock from './server-mock'

const userEmail = 'users@test.com'
const userPassword = 'auth123'

const ID = 'users'

let userId = null
let token = null

describe('API TEST INTO /users', () => {
    before(() => serverMock.signin(ID)
        .then(t => token = t)
        .catch(err => logger.error(`Test signout error="${err}"`)))

    after(() => serverMock.signout(ID)
        .then(user => serverMock.shutdown())
        .catch(err => logger.error(`Test signout error="${err}"`)))

    describe('[POST]', () => {
        it('201', done => {
            request(serverMock.getServer())
                .post('/users')
                .set('DMAPI-Authorization', token)
                .field('name', 'User Test Api')
                .field('email', userEmail)
                .field('password', userPassword)
                .expect('Content-Type', /json/)
                .expect(201, done)
                .expect(res => {
                    userId = res.body.id
                    assert.isNotNull(userId)
                })
        })
    })

    describe('[DELETE]', () => {
        it('200', done => {
            request(serverMock.getServer())
                .delete('/users/' + userId)
                .set('DMAPI-Authorization', token)
                .expect('Content-Type', /json/)
                .expect(200, done)
        })
    })
})