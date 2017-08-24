'use strict'

import * as restify from 'restify'

import server from './restify-server'

import supportApi from '../api/support-api'
import authApi from '../api/auth-api'
import userApi from '../api/users-api'

import logger from '../log/logger'

export default () => server(restify)
                .map(server => authApi(server, ['/login', '/users', '/stop', '/ping', '/echo']).routes())
                .map(server => supportApi(server).routes())
                .map(server => userApi(server).routes())
