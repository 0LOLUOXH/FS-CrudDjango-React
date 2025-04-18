import { Link } from 'react-router-dom'
import { Inventario } from '../components/inventario'

function producto (){
    return (
        <div>
            <Link to="/addproducto">
                <h1>
                    Agregar Producto
                </h1>
            </Link>
            <Inventario/>
        </div>
    )
}

export default producto