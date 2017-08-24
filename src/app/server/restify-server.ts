"use strict";

// https://github.com/restify/plugins
const serverDestroy = require('server-destroy')

import * as plugins from 'restify-plugins'

import * as config from 'config'

import routes from './restify-routes'
import option from '../utils/option'
import logger from '../log/logger'

const NotInitServerError = Error

class RestifyServer {
    serverInfo = () => {
        return option(config.get('api'))
                .orElse({ name: 'unknown' })
    }

    listen = (server) => {
        return () => {
            logger.silly('_listen (server="', server, '")')
            server.listen(process.env.PORT, () => {
                server.info.running = true
                logger.info('# process.env.NODE_ENV=', process.env.NODE_ENV);
                logger.info('# process.env.PORT=', process.env.PORT);
                logger.info("## Running in", process.env.NODE_ENV, process.env.PORT);
            })

            return server
        }
    }

    from = createServer => {
        logger.silly('_doCreateServer (createServer="', createServer, '")')
        logger.info('Init Server="', this.serverInfo(), '"')

        if (!!server) return option(createServer(this.serverInfo()))
                                .filter(server => !!server.listen)
                                .map(server => Object.assign(server, { info: this.serverInfo() }))
                                .map(server => Object.assign(server, { xlisten: this.listen(server) } ));
        else throw new NotInitServerError('NotInitServerError')
    }

}

const server = new RestifyServer()

const throttleOpt = () => {
    return {
        burst: 100,
        rate: 50,
        ip: true,
        overrides: {
            '192.168.1.1': {
                rate: 0, // unlimited
                burst: 0
            }
        }
    }
}
const corsMiddleware = require('restify-cors-middleware')

const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['http://localhost:8000', 'http://localhost:8080'],
  allowHeaders: ['DMAPI-Authorization'],
  exposeHeaders: ['DMAPI-Authorization']
})

const uncaughtException = () => 
    (req, res, route, error) => {
        logger.error(`ServerError="${error}"`)
        res.send(error)
    }
const logRequest = () => 
    (req, res, next) => {
        logger.verbose(`Server date="${new Date()}" method="${req.method}" url="${req.url}"`)
        next()
    }

const enableDestroy = server => {
    serverDestroy(server)
    return server
}

export default restify => server.from(restify.createServer)
                            .map(server => server.pre(cors.preflight))
                            .map(server => server.use(cors.actual))
                            .map(server => server.use(plugins.acceptParser(server.acceptable)))
                            .map(server => server.use(plugins.dateParser()))
                            .map(server => server.use(plugins.queryParser()))
                            .map(server => server.use(plugins.jsonp()))
                            .map(server => server.use(plugins.gzipResponse()))
                            .map(server => server.use(plugins.bodyParser()))
                            .map(server => server.use(plugins.requestLogger()))
                            .map(server => server.use(plugins.conditionalRequest()))
                            .map(server => server.use(plugins.fullResponse()))
                            .map(server => server.use(plugins.throttle(throttleOpt())))
                            .map(server => server.xlisten())
                            .map(server => server.pre(restify.pre.userAgentConnection()))
                            .map(server => server.on('uncaughtException', uncaughtException()))
                            .map(server => server.use(logRequest()))
                            .map(server => enableDestroy(server))
                            .map(server => routes(server))
