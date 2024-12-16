import { LoaderFunction, json } from "@remix-run/node";
import { getSession } from "~/utils/session.server";
import React, { useState, useEffect } from "react";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import ProductCard from "~/components/ProductCard";
import { Skeleton } from "~/components/ui/skeleton";
import CategoryPriceDialog from "~/components/CategoryChart";
import { Carousel } from "~/components/ui/carousel"; // Solo importa Carousel, no CarouselItem

const API_BASE_URL = "https://api.hunterprice.online/api";

export const loader: LoaderFunction = async ({ params, request }) => {
  const category = params.category;
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user") || null;

  if (!category) {
    throw new Response("Category not provided", { status: 400 });
  }

  return json({ category, user });
};

export default function CategoryList() {
  const { category, user } = useLoaderData<{ category: string; user: any }>();
  const [categories, setCategories] = useState<{ nombre: string; id: number }[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/getSubcategories/${category}`),
          fetch(`${API_BASE_URL}/getProducts/${category}`),
        ]);

        const categoriesData = await categoriesResponse.json();
        const productsData = await productsResponse.json();

        setCategories(categoriesData);

        const queryCategoryId = parseInt(searchParams.get("selectedCategory") || "0", 10);
        if (queryCategoryId && categoriesData.some((c: { id: number }) => c.id === queryCategoryId)) {
          setSelectedCategory(queryCategoryId);
          fetchSubcategoryProducts(queryCategoryId);
        } else if (categoriesData.length > 0) {
          const defaultCategory = categoriesData[0].id;
          setSelectedCategory(defaultCategory);
          fetchSubcategoryProducts(defaultCategory);
        }

        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [category, searchParams]);

  const fetchSubcategoryProducts = async (subcategoryId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/getProducts/${subcategoryId}`);
      const data = await response.json();
      setFilteredProducts(data);
    } catch (error) {
      console.error("Error fetching subcategory products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (subcategoryId: number) => {
    setSelectedCategory(subcategoryId);
    setFilteredProducts([]); // Limpia los productos actuales para evitar datos obsoletos
    setSearchParams({ selectedCategory: subcategoryId.toString() });
    fetchSubcategoryProducts(subcategoryId);
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Categories Carousel */}
      <div className="sticky top-0 z-10 bg-purple-800 p-4 scrollbar-hide">
        <Carousel className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <div key={category.id} className="flex-shrink-0">
              <button
                onClick={() => handleCategorySelect(category.id)}
                className={`px-4 py-2 rounded-full text-white font-semibold transition ${
                  selectedCategory === category.id ? "bg-purple-600" : "hover:bg-purple-700"
                }`}
              >
                {category.nombre}
              </button>
            </div>
          ))}
        </Carousel>
      </div>

      {/* Product List with Chart Button */}
      <div className="container mx-auto p-4">
        {/* Chart Button */}
        <div className="mb-4">
          <button
            onClick={() => setIsChartOpen(true)}
            className="px-4 py-2 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
          >
            Ver Gráfico de Precios
          </button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton
                key={index}
                className="w-full rounded-xl overflow-hidden shadow-lg border-8 cursor-pointer transition-transform transform hover:scale-105 min-h-[350px] max-h-[350px]"
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.identifier}
                user={user}
                image={product.imagenurl}
                brand={product.marca}
                name={product.nombreDisplay}
                id={product.identifier}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-4">No hay productos disponibles.</p>
        )}
      </div>

      {/* Price Chart Dialog */}
      {selectedCategory > 0 && (
        <CategoryPriceDialog
          categoryId={selectedCategory.toString()}
          isOpen={isChartOpen}
          onClose={() => setIsChartOpen(false)}
        />
      )}
    </div>
  );
}
