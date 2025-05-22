import React from "react"
import MUIDataTable from "mui-datatables";

const columns = [
 {
  name: "nombre",
  label: "Nombre",
  options: {
   filter: true,
   sort: false,
  }
 },
 {
  name: "nmodelo",
  label: "Modelo",
  options: {
   filter: true,
   sort: false,
  }
 },
 {
  name: "nmarca",
  label: "Marca",
  options: {
   filter: true,
   sort: false,
  }
 },
 {
  name: "descripcion",
  label: "Descripcion",
  options: {
   filter: true,
   sort: false,
  }
 },
 {
  name: "cantidad",
  label: "Cantidad",
  options: {
   filter: true,
   sort: false,
  }
 },

 
];



const options = {
  filterType: 'checkbox',
  selectableRows: 'none',
  

};


export function Tabla({ data }) {    
    return (
        <div>
            <h1>Tabla</h1>
            <MUIDataTable
                title={"Inventario de productos"}
                data={data}
                columns={columns}
                options={options}
            />
        </div>
    )
}