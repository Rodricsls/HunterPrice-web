import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useToast } from "~/hooks/use-toast";
import hunter_white from "/hunter_white.png";

export default function LoginDialog({ isOpen, onClose }: { isOpen: boolean; onClose: (open: boolean) => void }) {
  const { toast } = useToast();
  const fetcher = useFetcher<{ error?: string; success?: boolean }>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fetcher.state === "submitting") {
      setLoading(true);
    } else if (fetcher.state === "idle") {
      setLoading(false);

      if (fetcher.data?.error) {
        toast({
          title: "Error al iniciar sesión",
          description: fetcher.data.error,
          variant: "destructive",
        });
      } else if (fetcher.data?.success) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "¡Bienvenido de nuevo!",
        });
        onClose(false); // Close the dialog after successful login
      }
    }
  }, [fetcher.state, fetcher.data, toast, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-xs bg-custompurple text-white p-8 rounded-lg shadow-lg">
      <div className="flex justify-center">
          <div className="w-40 h-40 bg-customorange rounded-full flex items-center justify-center absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img src={hunter_white} alt="Logo" className="w-26 h-16" />
          </div>
        </div>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold mt-12">Iniciar Sesión</DialogTitle>
        </DialogHeader>
        <fetcher.Form method="post" action="/auth/login" className="mt-4 space-y-4">
          <div>
            <Label htmlFor="email" className="block text-sm font-medium">
              Correo
            </Label>
            <Input id="email" name="email" type="email" placeholder="Correo" className="w-full bg-white text-black" required />
          </div>
          <div>
            <Label htmlFor="password" className="block text-sm font-medium">
              Contraseña
            </Label>
            <Input id="password" name="password" type="password" placeholder="Contraseña" className="w-full bg-white text-black" required />
          </div>
          {fetcher.data?.error && <p className="text-red-500 text-sm">{fetcher.data.error}</p>}
          <DialogFooter>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg font-medium ${
                loading ? "bg-gray-500" : "bg-customorange hover:bg-orange-500"
              }`}
            >
              {loading ? "Cargando..." : "Ingresar"}
            </button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}