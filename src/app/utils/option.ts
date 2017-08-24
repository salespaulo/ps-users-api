"use strict"

const option = (value) => new Option(value)

class Option {
    nextOption: Option

    readonly value: any

    constructor(value: any) {
        if (!value) this.value = undefined
        else this.value = value
    }

    private _and() {
        return (another: any): Option => {
            return this.flatmap((opThis: Option) => {
                const anotherOption = option(another)
                anotherOption.nextOption = opThis
                return anotherOption
            }).orElse(None)
        }
    }

    and = this._and()

    private _or() {
        return (another: any): Option => {
            return this.flatmap((opThis: Option) => {
                const anotherOption = option(another)
                anotherOption.nextOption = opThis
                return anotherOption
            }).orElse(this)
        }
    }

    or = this._or()

    private _empty() {
        return  () => None
    }

    empty = this._empty()

    private _get() {
        return () => this.value
    }

    get = this._get()

    private _isEmpty() {
        return () => this.value === undefined
    }

    isEmpty = this._isEmpty()

    private _orElse() {
        return (another: any) => this.isEmpty() ? another : this.get()
    }

    orElse = this._orElse()

    private _orThrow() {
        return (e: Error) => {
            if (this.isEmpty()) throw e
            else return this.get()
        }
    }

    orThrow = this._orThrow()

    private _map() {
        return f => this.isEmpty() ? None : new Option(f(this.get()))
    }

    map = this._map()

    private _flatmap() {
        return f => this.map(value => f(option(value)))
    }

    flatmap = this._flatmap()

    private _filter() {
         return p => ( this.isEmpty() || p(this.get()) ) ? this : None
    }

    filter = this._filter()

}

export default option

const None = new Option(undefined)
