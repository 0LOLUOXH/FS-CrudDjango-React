import { useState } from 'react';
import { createCliente, createClienteJuridico, createClienteNatural } from '../api/clientes_api'


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

    async function handleSubmit (e) {
        e.preventDefault();
        
        if (tipoCliente === 'natural') {

            const res = await createCliente({
                'tipo': 'N',
                'telefono': clienteNatural.telefono});

            console.log('res', res);

            if (res) {
                console.log('Cliente creado:', res.id);
                const response =await createClienteNatural({
                    'cliente': res.id,
                    'nombre': clienteNatural.nombre,
                    'apellido': clienteNatural.apellido,
                    'cedula': clienteNatural.cedula,
                });

                console.log('Cliente Natural creado:', response);
            }

            // Aquí puedes enviar los datos a tu API
            limpiarFormularios();
        } else {
            const res = await createCliente({
                'tipo': 'J',
                'telefono': clienteJuridico.telefono});

            console.log('res', res);

            if (res) {
                console.log('Cliente creado:', res.id);
                const response =await createClienteJuridico({
                    'cliente': res.id,
                    'razon_social': clienteJuridico.razon_social,
                    'ruc': clienteJuridico.ruc,
                });

                console.log('Cliente Natural creado:', response);
            }
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