'use strict'

const FB: any =  require('fb')

import * as config from 'config'

import Service from './service'
import userService from './user-service'

const FacebookAuthUrlError = Error

FB.options({
    version: 'v2.10',
    appId: config.get('auth.facebook.id'),
    appSecret: config.get('auth.facebook.secret'),
    redirectUri: config.get('auth.facebook.redirectUrl'),
    scope: 'public_profile,email'
})

class FacebookService extends Service {

    authUrl = () => new Promise((resolve, reject) => resolve(FB.getLoginUrl()))

    getToken = code => new Promise((resolve, reject) => 
        FB.api('/oauth/access_token', {
            client_id: config.get('auth.facebook.id'),
            client_secret: config.get('auth.facebook.secret'),
            redirect_uri: config.get('auth.facebook.redirectUrl'),
            code: code
        }, resOAuth => {
            if (!resOAuth || resOAuth.error) reject(resOAuth.error || 'Facebook OAuth Acess Token Error="undefined"')
            else {
                FB.setAccessToken(resOAuth.access_token)
                FB.api('/me', { fields: ['name'] }, resMe => {
                    if (!resMe || resMe.error) reject(resMe.error || 'Facebook OAuth About Me Error="undefined"')
                    else {
                        FB.api('/me/picture?redirect=false', resPicture => {
                            if (!resPicture || !!resPicture.error) reject(resPicture.error || 'Facebook OAuth Picture Error="undefined"')
                            else {
                                const email = `${resMe.id}@facebook.com`

                                userService.findById(email)
                                .then(user => resolve(user))
                                .catch(err => {
                                    userService.insert(resMe.name, email, resOAuth.access_token, resPicture.data.url)
                                    .then(user => resolve(user))
                                    .catch(err => reject(err))
                                })
                            }
                        })
                    }
                })
            }
        })
    )
}

export default new FacebookService()