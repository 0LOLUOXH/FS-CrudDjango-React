import { Link } from 'react-router-dom'
import {Tabla} from '../components/tabla'
import { Inventario } from '../components/inventario'

function producto (){
    return (
        <div>
            <Link to="/addproducto">
                <h1 class="bg-indigo-600 hover:not-focus:bg-indigo-700">
                    Agregar Producto
                </h1>
            </Link>
            <Inventario />
            <Tabla />
        </div>
    )
}

export default producto