import React, { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";

import tittle from "/tittle.png";
import white_search from "/white_search.png";
import white_fav from "/white_fav.png";
import white_camera from "/white_camera.png";
import white_category from "/white_category.png";

interface MainProps {
  scrollToCategories: () => void;
  scrollToInfo: () => void;
  scrollToFavorites: () => void;
}

export default function Main({ scrollToCategories, scrollToInfo, scrollToFavorites }: MainProps) {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<{ nombreDisplay: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();




  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchText.trim()) {
      navigate(`/ProductList?searchText=${encodeURIComponent(searchText)}`);
    }
  };

  const fetchSuggestions = async (query: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://api.hunterprice.online/api/autocomplete/${query}`);
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
    <div className="flex flex-col items-center min-h-screen bg-black text-white w-full">
      {/* Title Section */}
      <div className="flex items-center justify-center w-full max-w-lg mx-auto mt-10">
        <img src={tittle} alt="Titulo" className="w-11/12 max-w-md" />
      </div>

      {/* Search Bar */}
      <div className="relative w-4/5 md:w-3/4 lg:w-2/3 xl:w-2/5 mt-8">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4">
          <img className="w-6 h-6" src={white_search} alt="Lupa" />
        </span>
        <input
          type="text"
          placeholder="Buscar"
          value={searchText}
          onKeyDown={handleSearch}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full h-12 sm:h-16 pl-12 p-4 border border-white rounded-md bg-black text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {suggestions.length > 0 && (
          <ul className="absolute w-full bg-white text-black mt-2 rounded-md shadow-lg z-10">
            {suggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => setSearchText(item.nombreDisplay)}
                className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              >
                {item.nombreDisplay}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-6 mt-8">
        <NavigationButton onClick={scrollToCategories} icon={white_category} alt="Category" color="bg-orange-500" />
        <NavigationButton onClick={scrollToInfo} icon={white_camera} alt="Camera" color="bg-indigo-500" />
        <NavigationButton onClick={scrollToFavorites} icon={white_fav} alt="Favorites" color="bg-indigo-400" />
      </div>

      {/* Additional Section */}
      <p className="mt-10 text-center text-sm text-gray-400">
        Tienes una imagen del producto que buscas
      </p>
      <button className="mt-6 h-12 px-6 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition">
        Quiero saber mas
      </button>
    </div>
  );
}

const NavigationButton = ({
  onClick,
  icon,
  alt,
  color,
}: {
  onClick: () => void;
  icon: string;
  alt: string;
  color: string;
}) => (
  <button
    onClick={onClick}
    className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center ${color} rounded-full hover:bg-opacity-90 transition`}
  >
    <img className="w-8 h-7 sm:w-8 sm:h-8" src={icon} alt={alt} />
  </button>
);
