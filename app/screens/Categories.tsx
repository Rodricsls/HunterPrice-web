import shoe from '/shoe.png';
import mercado from '/mercado.png';
import tech from '/tech.png';
import CategoryCard from '../components/CategoryCard';

export default function Categories() {
  return (
    <div id="second-section" className="flex flex-col items-center justify-center min-h-screen bg-white pt-8 pb-4 px-4 ">
      {/* Título y subtítulo */}
      <div className="w-full text-center mt-8 mb-4">
        <h2 className="text-3xl font-bold text-purple-700">CATEGORÍAS</h2>
        <p className="text-lg text-gray-700">
          TU BÚSQUEDA <span className="font-bold text-purple-700">EMPIEZA</span> AQUÍ
        </p>
      </div>

      {/* Contenedor de categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-3 w-full max-w-screen-lg ">
        <CategoryCard title="TENIS" image={shoe} id={1}/>
        <CategoryCard title="SUPERMERCADO" image={mercado} id={2}/>
        <CategoryCard title="TECNOLOGÍA" image={tech} id={3}/>
      </div>
    </div>
  );
}
