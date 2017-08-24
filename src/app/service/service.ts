'use-strict'

const NotFoundError = Error
const RequiredParametersError = Error 

export default abstract class Service {

    newRequiredParametersError = () => new RequiredParametersError('Any parameter is empty')
    newNotFoundError = (name, key, value?) => new NotFoundError(`Not Found resource="${name}" to="${key}" value="${value}"`)

}