import { useState, useEffect } from 'react'
import {Tabla} from '../components/tabla'
import { Inventario } from '../components/inventario'
import { IngresarProducto } from '../components/ingresarproducto'

//<Inventario />
//<Tabla />

function producto (){
    return (
        <div>
            <IngresarProducto />
        </div>
    )
}

export default producto