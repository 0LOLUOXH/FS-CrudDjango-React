import React, { useState, useEffect } from 'react';
import { ModeloSelect } from '../components/modelosandmarca';
import { createProducto } from '../api/producto_api';
import { fetchBodegas } from '../api/bodega_api';
import { useNavigate } from 'react-router-dom';

export function IngresarProducto (){

    const navegation = useNavigate();

    async function upproducto(producto) {
        const res = await createProducto(producto);
        navegation('/inventario')
        console.log('res', res);
    }

    const [Bodegas, setBodegas] = useState([]);

    useEffect(() => {
        async function getBodegas() {
            const res = await fetchBodegas();
            setBodegas(res);
        }

        getBodegas();
    }, [])

    const [producto, setProducto] = useState({
        nombre: '',
        modeloandmarca: '', 
        codigobodega: '',
        descripcion: '',
        cantidad: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const nuevoProducto = {
            ...producto,
            [name]: value,
        };
        
        if (name === 'bodega') {
            console.log('cambio de bodega')
            nuevoProducto.bodega = e.target.value
        }
        
        setProducto(nuevoProducto);
    };

    const handleModeloChange = (modeloId) => {
        setProducto(prev => ({
            ...prev,
            modelo: modeloId
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!producto.modelo) {
            alert('Por favor seleccione un modelo');
            return;
        }

        const productoParaEnviar = {
            ...producto,
            cantidad: Number(producto.cantidad),
            modeloandmarca: Number(producto.modelo),
            codigobodega: Number(producto.bodega),
        };

        console.log('Producto a guardar:', productoParaEnviar);
        console.log('Producto a guardar:', producto);

        upproducto(productoParaEnviar),

        // Resetear formulario
        setProducto({
            nombre: '',
            modeloandmarca: '', 
            codigobodega: '',
            descripcion: '',
            cantidad: '',
        });
    };

    return (
        <div className="container">
            <h1>Agregar Producto</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nombre:</label>
                    <input
                        type="text"
                        name="nombre"
                        value={producto.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Cantidad:</label>
                    <input
                        type="number"
                        name="cantidad"
                        value={producto.cantidad}
                        onChange={handleChange}
                        required
                        min="0"
                    />
                </div>
                
                <ModeloSelect onModeloChange={handleModeloChange} />
                                
                <div className="form-group">
                    <label>Descripción:</label>
                    <textarea
                    rows="3"
                        type="text"
                        name="descripcion"
                        value={producto.descripcion}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                
                <div>
                    <label>Bodega:</label>
                    <select 
                        name="bodega" 
                        onChange={handleChange}
                        value={producto.bodega}
                    >
                    <option value="">Seleccione una Bodega</option>
                    {Bodegas.map((bodega) => (
                        bodega.estado? <option key={`bodega-${bodega.id}`} value={bodega.id}>    {bodega.nombre}</option> : null    
                    ))}
                </select>
                </div>

                <button type="submit" >
                    Agregar producto
                </button>
            </form>
        </div>
    );
};
