import React, { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLoaderData, Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import hunter_black from "/hunter_black.png";
import hunter_white from "/hunter_white.png";
import white_search from "/white_search.png";
import white_home from "/white_home.png";
import white_category from "/white_category.png";
import white_camera from "/white_camera.png";
import white_fav from "/white_fav.png";
import white_banner2 from "/white_banner2.png";


interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children}: LayoutProps) {
  const { user } = useLoaderData<{ user: { id: string; nombre: string } | null }>();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<{ nombreDisplay: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);


  const handleNavigation = (section: string) => {
    navigate(`/?section=${section}`);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchText.trim()) {
      navigate(`/ProductList?searchText=${encodeURIComponent(searchText)}`);
    }
  };

  const fetchSuggestions = async (query: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://api.hunterprice.online/api/autocomplete/${query}`,{mode:'cors'});
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchText.trim()) {
      setSuggestions([]);
      return;
    }

    const debounce = setTimeout(() => {
      fetchSuggestions(searchText);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchText]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Primary Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <img className="h-8 w-auto" src={hunter_black} alt="HunterPrice" />
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Button
                  onClick={() => console.log("Open Signup Modal")}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600"
                >
                  Registrarse
                </Button>
                <Button
                  onClick={() => console.log("Open Login Modal")}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600"
                >
                  Iniciar Sesión
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm">Hola, {user?.nombre}</p>
                <Form method="post">
                  <Button
                    type="submit"
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Cerrar Sesión
                  </Button>
                </Form>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sticky Secondary Header */}
      <header className="sticky top-0 z-50 bg-black">
        <div className="container mx-auto flex items-center justify-between py-4">
          <img className="h-8 w-auto" src={hunter_white} alt="HunterPrice" />
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4">
              <img className="w-6 h-6" src={white_search} alt="Buscar" />
            </span>
            <input
              type="text"
              placeholder="Buscar"
              value={searchText}
              onFocus={()=>{setIsFocused(true)}}
              onBlur={()=>{setIsFocused(false)}}
              onKeyDown={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-12 pl-12 p-4 border rounded-md bg-black text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {suggestions.length > 0 && isFocused && (
              <ul className="absolute w-full bg-white text-black mt-2 rounded-md shadow-lg z-10">
                {suggestions.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setSearchText(item.nombreDisplay);
                      navigate(`/ProductList?searchText=${encodeURIComponent(item.nombreDisplay)}`);
                    }}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  >
                    {item.nombreDisplay}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Navigation Icons */}
          <div className="flex space-x-4">
            <button onClick={() => handleNavigation("main")} className="p-2">
              <img className="w-6 h-6" src={white_home} alt="Home" />
            </button>
            <button onClick={() => handleNavigation("categories")} className="p-2">
              <img className="w-6 h-6" src={white_category} alt="Categories" />
            </button>
            <button onClick={() => handleNavigation("info")} className="p-2">
              <img className="w-6 h-6" src={white_camera} alt="Info" />
            </button>
            <button onClick={() => handleNavigation("favorites")} className="p-2">
              <img className="w-6 h-6" src={white_fav} alt="Favorites" />
            </button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-black text-white py-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">© 2024 HunterPrice. Todos los derechos reservados.</p>
          <img className="w-40 md:w-64" src={white_banner2} alt="Variacion3" />
        </div>
      </footer>
    </div>
  );
}
