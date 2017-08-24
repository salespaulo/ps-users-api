'use strict'

import repository from './repository'
import { RepositoryError } from './repository'

export default repository('users').catch(error => {
        throw new RepositoryError(`Users Database error="${error}"`)
    })

