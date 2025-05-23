const Inicio = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-slate-200 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <img
        src="https://ik.imagekit.io/jfcrjyrcq/fusion_solar_logo.jpg?updatedAt=1747926845910"
        alt="Logo Fusión Solar"
        className="w-52 md:w-64 rounded-xl shadow-lg mb-8"
      />

      {/* Título y bienvenida */}
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">
        Bienvenido, al sistema de inventario de Fusión Solar
      </h1>
      <p className="text-lg text-gray-600 text-center max-w-2xl mb-10">
        Este espacio está diseñado para brindarte una visión clara y sencilla del sistema. 
        Aquí podrás gestionar productos, consultar información y controlar el negocio en cualquier momento.
      </p>

      {/* Secciones informativas de ejemplo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">¿Qué puedes hacer aquí?</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Agregar o actualizar productos fotovoltaicos</li>
            <li>Revisar estados de stock, ventas o instalaciones</li>
            <li>Consultar detalles de ventas, compras y stock</li>
            <li>Administrar usuarios del sistema</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Sugerencias para comenzar</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Verifica el inventario antes de nuevas ventas</li>
            <li>Asegúrate de que los datos de contacto estén actualizados</li>
            <li>No olvides hacer respaldos regulares</li>
          </ul>
        </div>
      </div>

      {/* Pie de página */}
      <p className="text-sm text-gray-500 mt-12 text-center">
        Página de uso interno — Fusión Solar © {new Date().getFullYear()}
      </p>
    </div>
  );
};

export default Inicio;
