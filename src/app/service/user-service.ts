"use strict";

import { encode } from '../utils/crypto'

import option from '../utils/option'
import users from '../repository/users'

import Service from './service'

const getDomain = email => email.substring(email.lastIndexOf("@") + 1)

class UserService extends Service {

    findById = id => new Promise((resolve, reject) => 
        users.then((rep: any) => 
            rep.get(id, (err, user) => {
                if (!!err) reject(err)
                else resolve(user)
            }))
        .catch(error => reject(error)))

    findByEmail = email => new Promise((resolve, reject) => {
        option(email)
            .orThrow(this.newRequiredParametersError())

        users.then((rep: any) => {
            rep.find({
                email: {
                    $eq: email
                }
            }).then(docs => {
                if (docs.length > 0) resolve(docs[0])
                else reject(this.newNotFoundError('User', 'email', email))
            }).catch(err => reject(err))
        }).catch(err => reject(err))
    })

    login = (email, password) => new Promise((resolve, reject) => 
        this.findByEmail(email)
        .then(user => {
            const userPassword = user['password']
            if (userPassword === encode(password)) {
                resolve(user)
            } else {
                reject('Invalid email/password.')
            }
        }).catch(error => reject(error)))

    delete = id => new Promise((resolve, reject) => 
        this.findById(id)
        .then(user => {
            return users.then((rep: any) =>
                rep.destroy(id, user['_rev'], (err, user) => {
                    if (!!err) reject(err);
                    else resolve(user);
                })).catch(error => reject(error))
        }).catch(error => reject(error)))

    insert = (name: string, email: string, password: string, picture?: string) => 
        new Promise((resolve, reject) => {
            option(name)
                .and(email)
                .and(password)
                .orThrow(this.newRequiredParametersError())

            const emailProviderService = getDomain(email)

            users.then((rep: any) => 
                rep.insert({
                    name: name,
                    email: email,
                    emailProvider: email.substr(email.lastIndexOf('@'), email.length),
                    password: encode(password),
                    picture: picture || 'http://www.gravatar.com/avatar/?d=mysteryman&s=50',
                    session: { 
                        logged: false 
                    }
                }, (err, user) => {
                    if (!!err) reject(err);
                    else this.findById(user.id)
                            .then(returnUser => resolve(returnUser))
                            .catch(error => reject(error));
                }))
            .catch(error => reject(error))
        })
        
    update = (id, session, password?) => new Promise((resolve, reject) => {
        option(id)
            .and(session)
            .orThrow(this.newRequiredParametersError())

        return this.findById(id)
            .then(user => users.then((rep: any) => 
                rep.insert({
                    _id: user['_id'],
                    _rev: user['_rev'],
                    name: user['name'],
                    email: user['email'],
                    emailProvider: user['emailProvider'],
                    picture: user['picture'],
                    session: session,
                    password: !!password ? encode(password) : user['password']
                }, (err, user) => {
                    if (!!err) reject(err);
                    else this.findById(user.id)
                            .then(returnUser => resolve(returnUser))
                            .catch(error => reject(error));
                })).catch(error => reject(error)))
            .catch(error => reject(error))
    })

}

export default new UserService()