'use strict'

const google: any =  require('googleapis')

import * as config from 'config'

import Service from './service'
import userService from './user-service'

const client: any = new google.auth.OAuth2(
    config.get('auth.google.id'),
    config.get('auth.google.secret'),
    config.get('auth.google.redirectUrl'), 
    null)

google.options({
    auth: client
})

class GoogleService extends Service {
    private _setCredentials = (resolve, reject) => {
        return (err, tokens) => {
            if (!!err) reject(err)
            else {
                client.setCredentials(tokens)
                const oauth2 = google.oauth2('v2')
                
                oauth2.userinfo.v2.me.get((err, userinfo) => {
                    if (!!err) reject(err)
                    else {
                        userService.findById(userinfo.email)
                        .then(user => resolve(user))
                        .catch(err => {
                            userService.insert(userinfo.name, userinfo.email, tokens.access_token, userinfo.picture)
                            .then(user => resolve(user))
                            .catch(err => reject(err))
                        })
                    }
                })
            }
        }
    }

    authUrl = () => new Promise((resolve, reject) => 
        resolve(client.generateAuthUrl({
            access_type: 'offline',
            scope: [ 'profile', 'email' ]
        })))

    getToken = code => new Promise((resolve, reject) => 
            client.getToken(code, this._setCredentials(resolve, reject)))

}

export default new GoogleService()
