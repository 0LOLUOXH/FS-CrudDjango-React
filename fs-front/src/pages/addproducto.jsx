import React, { useState, useEffect } from 'react';
import { ModeloSelect } from '../components/modelosandmarca';
import { createProducto } from '../api/producto_api';
import { fetchBodegas } from '../api/bodega_api';

const AddProducto = () => {

    async function upproducto(producto) {
        const res = await createProducto(producto);
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
        preciounitario: '',
        ganancia: '',
        iva: '',
        codigobodega: '',
        descripcion: '',
        cantidad: '',
    });

    const calcularIVA = (precio, ganancia) => {
        const subtotal = parseFloat(precio || 0) + parseFloat(ganancia || 0);
        return (subtotal * 0.15).toFixed(2); // IVA del 15%
    };

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

        if (name === 'precio_unitario' || name === 'ganancia') {
            nuevoProducto.iva = calcularIVA(
                name === 'precio_unitario' ? value : producto.precio_unitario,
                name === 'ganancia' ? value : producto.ganancia
            );
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
            preciounitario: Number(producto.precio_unitario),
            ganancia: Number(producto.ganancia),
            iva: Number(producto.iva),
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
            preciounitario: '',
            ganancia: '',
            iva: '',
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
                    <label>Precio Unitario:</label>
                    <input
                        type="number"
                        name="precio_unitario"
                        value={producto.precio_unitario}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                    />
                </div>
                
                <div className="form-group">
                    <label>Ganancia:</label>
                    <input
                        type="number"
                        name="ganancia"
                        value={producto.ganancia}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label>IVA (15%):</label>
                    <input
                        type="text"
                        name="iva"
                        value={producto.iva || '0.00'}
                        readOnly
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
                        <option key={`bodega-${bodega.id}`} value={bodega.id}>
                            {bodega.nombre}
                        </option>
                    ))}
                </select>
                </div>

                <button type="submit" >
                    Agregar Producto
                </button>
            </form>
        </div>
    );
};

export default AddProducto;