import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import laptop from "/laptop.png";
import UploadImageDialog from "~/components/UploadDialog";

export default function Info() {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility
  const navigate = useNavigate();

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-custompurple px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 max-w-5xl w-full text-white">
          {/* Left Section - Image */}
          <div className="flex justify-start w-full md:w-3/4">
            <img src={laptop} alt="Laptop" className="w-full h-auto" />
          </div>

          {/* Right Section - Text */}
          <div className="text-right md:text-right w-full md:w-3/4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              "Encuentra <span className="text-white text-5xl">TU PRODUCTO</span>
              <span className="text-white"> con una </span>
              <span className="text-customlile">IMAGEN"</span>
            </h2>
            <p className="text-sm md:text-base mb-4">
              Nuestra herramienta de búsqueda te ayuda a identificar productos
              similares y encontrar justo lo que necesitas, haciendo el proceso
              más fácil. <br />
              Sube la foto y deja que nuestra herramienta la identifique por ti
              y descubra artículos similares.
            </p>
            <p className="text-sm md:text-base mb-6">
              ¿Tienes una imagen del producto que buscas?
            </p>
            <button
              className="bg-white text-blue-900 py-2 px-6 rounded-md font-semibold hover:bg-gray-200 transition duration-300"
              onClick={openDialog}
            >
              Subir foto
            </button>
          </div>
        </div>
      </div>

      {/* Dialog Component */}
      <UploadImageDialog isOpen={isDialogOpen} onClose={closeDialog} />
    </>
  );
}
