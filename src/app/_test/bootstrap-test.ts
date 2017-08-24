"use strict";

import * as restify from 'restify'
import * as request from 'supertest'

import logger from '../log/logger'

import serverMock from './server-mock'

let token = null

describe('API TEST INTO', () => {
    describe('bootstrap', () => {

        describe('with auth', () => {
            beforeEach(() => serverMock.signin('bootstrap').then(t => token = t).catch(err => logger.error(`Test signin error="${err}"`)))
            afterEach(() => serverMock.signout('bootstrap').then(user => serverMock.shutdown()).catch(err => logger.error(`Test signout error="${err}"`)))

            it('/ 200 OK', done => {
                request(serverMock.getServer())
                    .get('/')
                    .set('DMAPI-Authorization', token)
                    .expect('Content-Type', /json/)
                    .expect(200, {
                        name: 'ps-users-api',
                        version: '1.0.0',
                        url: 'http://localhost:8000',
                        running: true
                    }, done);
            })
        })

        describe('without auth', () => {
            it('/ping 200 OK', done => {
                request(serverMock.getServer())
                    .get('/ping')
                    .expect('Content-Type', /json/)
                    .expect(200, '"pong"', done);
            })

            it('/echo 200 OK', done => {
                request(serverMock.getServer())
                    .get('/echo/Test')
                    .expect('Content-Type', /json/)
                    .expect(200, '"echo from value=Test"', done);
            })
        })
    })
})
