import { Link } from 'react-router-dom'
import {Tabla} from '../components/tabla'

function producto (){
    return (
        <div>
            <Link to="/addproducto">
                <h1>
                    Agregar Producto
                </h1>
            </Link>
            <Tabla />
        </div>
    )
}

export default producto