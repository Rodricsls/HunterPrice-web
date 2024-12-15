import React, { useEffect, useState } from "react";
import ProductCard from "~/components/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";

const API_BASE_URL = "https://api.hunterprice.online/api";

export default function Favorites({ user }: { user: { id: string; nombre: string } | null }) {
  const [products, setProducts] = useState<any[]>([]); // Default to an empty array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const endpoint = user
          ? `${API_BASE_URL}/getUserLikedProducts/${user.id}`
          : `${API_BASE_URL}/getMostViewed`;

        const response = await fetch(endpoint);
        const data = await response.json();

        // Adjust to handle the `likedProducts` structure
        if (Array.isArray(data.likedProducts)) {
          setProducts(data.likedProducts); // Use `likedProducts` from the response
        } else if (Array.isArray(data)) {
          setProducts(data); // For most viewed products
        } else {
          console.error("Unexpected API response format:", data);
          setProducts([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]); // Fallback to an empty array
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  if (loading) {
    return <p className="text-center text-gray-500 mt-4">Cargando...</p>;
  }

  if (products.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-4">
        {user
          ? "Aún no tienes productos en tus favoritos."
          : "No hay productos más vistos disponibles."}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 w-full max-w-4xl px-6">
        <h2 className="text-5xl font-extrabold text-customorange">
          {user ? "FAVORITOS" : "LO MÁS VISTO"}
        </h2>
        <h3 className="text-lg font-semibold">
          {user ? "TU COLECCIÓN PERSONAL" : "PRODUCTOS POPULARES"}
        </h3>
      </div>

      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full max-w-4xl mx-auto"
      >
        <CarouselContent className="flex p-2">
          {products.map((product) => (
            <CarouselItem
              key={product.identifier} // Ensure unique key
              className="flex-shrink-0 w-[80%] sm:w-1/2 md:w-1/3 lg:w-1/4 md:basis-1/2 lg:basis-1/3"
            >
              <div className="p-1">
                <ProductCard
                  image={product.imagenurl}
                  brand={product.marca}
                  name={product.nombreDisplay}
                  id={product.identifier}
                  user={user}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
