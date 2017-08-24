"use strict"

import Api from './api'
import userService from '../service/user-service'
import logger from '../log/logger'

class UserApi extends Api {
    constructor(server) {
        super(server)
    }

    _response = (res, code, user) => res.send(code, {
        id: user._id,
        name: user.name,
        email: user._id,
        session: user.session
    })

    routes() {
        this.server.post('/users', (req, res, next) => 
            userService.insert(req.body.name, req.body.email, req.body.password)
                .then(user => {
                    this._response(res, 201, user);
                    next();
                }).catch(error => next(new this.BadRequest(error))))

        this.server.del('/users/:id', (req, res, next) => 
            userService.delete(req.params.id)
                .then(user => {
                    this._response(res, 200, user);
                    next();
                }).catch(error => next(new this.BadRequest(error))))

        return this.server
    };
};

export default server => new UserApi(server)
