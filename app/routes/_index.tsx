import { useState, useRef, useEffect } from "react";
import { useActionData, useLoaderData, Form, useSearchParams, useNavigate } from "@remix-run/react";
import { LoaderFunction, json, ActionFunction, redirect } from "@remix-run/node";
import { getSession, destroySession } from "~/utils/session.server";

import LoginDialog from "~/components/LoginDialog";
import SignupDialog from "~/components/SignDialog";
import { Button } from "~/components/ui/button";

import Main from "~/screens/Main";
import Categories from "~/screens/Categories";
import Info from "~/screens/Info";
import Favorites from "~/screens/Favorites";
import hunter_black from "/hunter_black.png";
import hunter_white from "/hunter_white.png";
import white_search from "/white_search.png";
import white_fav from "/white_fav.png";
import white_home from "/white_home.png";
import white_camera from "/white_camera.png";
import white_category from "/white_category.png";
import white_banner2 from "/white_banner2.png";

// Loader for getting user session
export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");
  return json({ user });
};

// Action for logging out
export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};

export default function Index() {
  const { user } = useLoaderData<{ user: { nombre: string, id:string } | null }>();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<{ nombreDisplay: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const favoritesRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const [searchParams] = useSearchParams();

  const handleNavigation = (section: string) => {
    navigate(`/?section=${section}`);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchText.trim()) {
      navigate(`/ProductList?searchText=${encodeURIComponent(searchText)}`);
    }
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to the section based on the "section" query parameter
  useEffect(() => {
    const section = searchParams.get("section");
    if (section === "main") scrollToSection(mainRef);
    if (section === "categories") scrollToSection(categoriesRef);
    if (section === "info") scrollToSection(infoRef);
    if (section === "favorites") scrollToSection(favoritesRef);
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <img className="h-8 w-auto" src={hunter_black} alt="HunterPrice" />
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Button
                  onClick={() => setIsSignupOpen(true)}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600"
                >
                  Registrarse
                </Button>
                <Button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-600"
                >
                  Iniciar Sesion
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm">Hola, {user.nombre}</p>
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

      {/* Dialogs */}
      <LoginDialog isOpen={isLoginOpen} onClose={setIsLoginOpen} />
      <SignupDialog isOpen={isSignupOpen} onClose={setIsSignupOpen} />

      {/* Main Content */}
      <main className="flex-grow bg-gray-100">
        <section ref={mainRef}>
          <Main
            scrollToCategories={() => scrollToSection(categoriesRef)}
            scrollToInfo={() => scrollToSection(infoRef)}
            scrollToFavorites={() => scrollToSection(favoritesRef)}
          />
        </section>

        <section ref={categoriesRef} className="relative">
          {/* Sticky Header */}
          <div className="sticky top-0 z-50 bg-black">
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
                {[white_home, white_category, white_camera, white_fav].map(
                  (icon, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        index === 0
                          ? scrollToSection(mainRef)
                          : index === 1
                          ? scrollToSection(categoriesRef)
                          : index === 2
                          ? scrollToSection(infoRef)
                          : scrollToSection(favoritesRef)
                      }
                      className="p-2"
                    >
                      <img className="w-6 h-6" src={icon} alt={`Icon ${index}`} />
                    </button>
                  )
                )}
              </div>
        </div>
      </header>
          </div>

          {/* Categories Section */}
          <div className="bg-white">
            <Categories />
          </div>
        </section>

        <section ref={infoRef}>
          <Info />
        </section>
        <section ref={favoritesRef}>
          <Favorites user={user} />
        </section>
      </main>

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
