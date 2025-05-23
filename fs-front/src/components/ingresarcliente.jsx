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
        limpiarFormularios();
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

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (tipoCliente === 'natural') {
            const res = await createCliente({
                'tipo': 'N',
                'telefono': clienteNatural.telefono
            });

            if (res) {
                await createClienteNatural({
                    'cliente': res.id,
                    'nombre': clienteNatural.nombre,
                    'apellido': clienteNatural.apellido,
                    'cedula': clienteNatural.cedula,
                });
            }
            limpiarFormularios();
        } else {
            const res = await createCliente({
                'tipo': 'J',
                'telefono': clienteJuridico.telefono
            });

            if (res) {
                await createClienteJuridico({
                    'cliente': res.id,
                    'razon_social': clienteJuridico.razon_social,
                    'ruc': clienteJuridico.ruc,
                });
            }
            limpiarFormularios();
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">Ingresar Cliente</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-gray-700 mb-2">
                            Tipo de cliente
                        </label>
                        <select
                            name="tipo_cliente"
                            value={tipoCliente}
                            onChange={handleTipoClienteChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="natural">Natural</option>
                            <option value="juridico">Jurídico</option>
                        </select>
                    </div>

                    {tipoCliente === 'natural' ? (
                        <>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={clienteNatural.nombre}
                                    onChange={handleNaturalChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    name="apellido"
                                    value={clienteNatural.apellido}
                                    onChange={handleNaturalChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Cédula
                                </label>
                                <input
                                    type="text"
                                    name="cedula"
                                    value={clienteNatural.cedula}
                                    onChange={handleNaturalChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={clienteNatural.telefono}
                                    onChange={handleNaturalChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="col-span-2">
                                <label className="block text-gray-700 mb-2">
                                    Razón Social
                                </label>
                                <input
                                    type="text"
                                    name="razon_social"
                                    value={clienteJuridico.razon_social}
                                    onChange={handleJuridicoChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    RUC
                                </label>
                                <input
                                    type="text"
                                    name="ruc"
                                    value={clienteJuridico.ruc}
                                    onChange={handleJuridicoChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={clienteJuridico.telefono}
                                    onChange={handleJuridicoChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-8">
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150"
                    >
                        Registrar Cliente
                    </button>
                </div>
            </form>
        </div>
    );
}