"use strict";

import server from './server/server'

process.env.NODE_ENV = process.env.NODE_ENV || 'localhost'
process.env.PORT = process.env.PORT || 8000

export default server()