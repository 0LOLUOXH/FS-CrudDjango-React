import { Link } from 'react-router-dom'

export function Navegation (){
    return (
        <div>
            <Link to="/">
                <h1>
                    Inicio
                </h1>
            </Link>
            <Link to="/compras">Compras</Link>
            <Link to="/ventas">Ventas</Link>
            <Link to="/producto">producto</Link>
            <Link to="/clientes">Clientes</Link>
        </div>
    )
}
