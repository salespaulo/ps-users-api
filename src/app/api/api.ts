"use strict"

import * as errors from 'restify-errors'
import * as restify from 'restify'

abstract class Api {
    protected UnauthorizedError = errors.UnauthorizedError
    protected NotFoundError = errors.NotFoundError
    protected BadRequest = errors.BadRequestError

    server: any

    constructor(server) {
        this.server = server
    };

    serverDestroy() {
        this.server.destroy()
    }

    abstract routes()
};

export default Api
