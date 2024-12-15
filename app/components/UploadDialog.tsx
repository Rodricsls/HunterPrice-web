import { Dialog, DialogContent } from "~/components/ui/dialog";
import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import hunter_white from "/hunter_white.png";

const API_BASE_URL = "https://api.hunterprice.online/api";

export default function UploadImageDialog({ isOpen, onClose }: { isOpen: boolean; onClose: (open: boolean) => void }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setShowConfirmation(true); // Show confirmation before sending
    }
  };

  const confirmUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/upload-image`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload the image");
        }

        const result = await response.json();
        console.log("Image uploaded successfully:", result);
        navigate(`/image/${encodeURIComponent(JSON.stringify(result))}`);
        // Optionally close the dialog after successful upload
        onClose(false);
        // Redirect to the home page after successful upload
      } catch (error) {
        console.error("Error uploading the image:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-xs bg-custompurple text-white p-8 rounded-lg shadow-lg">
         <div className="flex justify-center">
          <div className="w-40 h-40 bg-customorange rounded-full flex items-center justify-center absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img src={hunter_white} alt="Logo" className="w-26 h-16" />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center">
          <div className="w-full bg-[#252376] rounded-lg flex flex-col items-center justify-center py-8 px-4">
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#252376] font-bold text-2xl">
                +
              </div>
              <p className="mt-4 text-white font-bold text-lg">Seleccionar foto</p>
              <p className="text-sm text-gray-400 text-center mt-2">
                Arrastra y suelta o has clic para ingresar a tu ordenador.
                <br />
                300 MB máx.
              </p>
            </label>
            <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>

          {showConfirmation && (
            <div className="mt-4 bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-white mb-2">¿Estás seguro de enviar esta imagen?</p>
              <div className="flex space-x-4">
                <button
                  onClick={confirmUpload}
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-bold"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Sí"}
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-bold"
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
