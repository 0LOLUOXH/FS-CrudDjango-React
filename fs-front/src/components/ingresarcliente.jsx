import { useState } from 'react';

export function Ingresar_Cliente() {
    const [tipoCliente, setTipoCliente] = useState('natural');
    
    // Estados iniciales
    const initialNatural = {
        nombre: '',
        apellido: '',
        cedula: '',
        telefono: ''
    };
    
    const initialJuridico = {
        razon_social: '',
        ruc: '',
        telefono: ''
    };
    
    const [clienteNatural, setClienteNatural] = useState(initialNatural);
    const [clienteJuridico, setClienteJuridico] = useState(initialJuridico);

    // Función para limpiar todos los formularios
    const limpiarFormularios = () => {
        setClienteNatural(initialNatural);
        setClienteJuridico(initialJuridico);
    };

    const handleTipoClienteChange = (e) => {
        setTipoCliente(e.target.value);
        limpiarFormularios(); // Limpia ambos al cambiar
    };

    const handleNaturalChange = (e) => {
        const { name, value } = e.target;
        setClienteNatural({
            ...clienteNatural,
            [name]: value
        });
    };

    const handleJuridicoChange = (e) => {
        const { name, value } = e.target;
        setClienteJuridico({
            ...clienteJuridico,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (tipoCliente === 'natural') {
            console.log('Cliente Natural enviado:', clienteNatural);
            // Aquí puedes enviar los datos a tu API
            limpiarFormularios();
        } else {
            console.log('Cliente Jurídico enviado:', clienteJuridico);
            // Aquí puedes enviar los datos a tu API
            limpiarFormularios();
        }
    };

    return (
        <div>
            <h1>Ingresar Cliente</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Tipo de cliente:
                    <select 
                        name="tipo_cliente" 
                        value={tipoCliente} 
                        onChange={handleTipoClienteChange}
                    >
                        <option value="natural">Natural</option>
                        <option value="juridico">Jurídico</option>
                    </select>
                </label>
                <br />

                {tipoCliente === 'natural' ? (
                    <>
                        <label>
                            Nombre:
                            <input 
                                type="text" 
                                name="nombre" 
                                value={clienteNatural.nombre}
                                onChange={handleNaturalChange}
                                required
                            />
                        </label>
                        <br />
                        <label>
                            Apellido:
                            <input 
                                type="text" 
                                name="apellido" 
                                value={clienteNatural.apellido}
                                onChange={handleNaturalChange}
                                required
                            />
                        </label>
                        <br />
                        <label>
                            Cédula:
                            <input 
                                type="text" 
                                name="cedula" 
                                value={clienteNatural.cedula}
                                onChange={handleNaturalChange}
                                required
                            />
                        </label>
                        <br />
                        <label>
                            Teléfono:
                            <input 
                                type="tel" 
                                name="telefono" 
                                value={clienteNatural.telefono}
                                onChange={handleNaturalChange}
                                required
                            />
                        </label>
                        <br />
                    </>
                ) : (
                    <>
                        <label>
                            Razón Social:
                            <input 
                                type="text" 
                                name="razon_social" 
                                value={clienteJuridico.razon_social}
                                onChange={handleJuridicoChange}
                                required
                            />
                        </label>
                        <br />
                        <label>
                            RUC:
                            <input 
                                type="text" 
                                name="ruc" 
                                value={clienteJuridico.ruc}
                                onChange={handleJuridicoChange}
                                required
                            />
                        </label>
                        <br />
                        <label>
                            Teléfono:
                            <input 
                                type="tel" 
                                name="telefono" 
                                value={clienteJuridico.telefono}
                                onChange={handleJuridicoChange}
                                required
                            />
                        </label>
                        <br />
                    </>
                )}

                <button type="submit">Enviar</button>
            </form>
        </div>
    );
}