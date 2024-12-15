import React, { useState } from "react";
import UploadImageDialog from "~/components/UploadDialog";

export default function UploadProductScreen() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E4E1F4]">
        <UploadImageDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      <div className="text-center">
        {/* Title */}
        <h1 className="text-[48px] font-extrabold text-black leading-tight mb-4">
          TU PRODUCTO
          <br />
          <span className="text-[28px] font-bold text-black">CON UNA </span>
          <span className="text-[48px] font-extrabold text-[#252376]">
            IMAGEN
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-[14px] text-black font-medium mb-8">
          Sube tu imagen o foto para encontrar tu producto.
        </p>

        {/* Upload Button */}
        <button
          onClick={handleOpenDialog}
          className="bg-[#252376] hover:bg-[#3836a7] text-white font-semibold py-4 px-28 rounded-2xl cursor-pointer transition text-[18px]"
        >
          Subir Foto
        </button>

        {/* Upload Image Dialog */}
        
      </div>
    </div>
  );
}
