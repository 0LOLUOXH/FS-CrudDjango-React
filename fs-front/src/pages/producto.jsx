import { useState, useEffect } from 'react'
import {Tabla} from '../components/tabla'
import { IngresarProducto } from '../components/ingresarproducto'

//<Tabla />

function producto (){
    return (
        <div>
            <IngresarProducto />
        </div>
    )
}

export default producto