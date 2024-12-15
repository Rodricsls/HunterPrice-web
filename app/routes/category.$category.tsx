import React, { useState, useEffect } from "react";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { LoaderFunction, json } from "@remix-run/node";
import ProductCard from "~/components/ProductCard";
import { Skeleton } from "~/components/ui/skeleton"; // Skeleton component
import { getSession } from "~/utils/session.server";

const API_BASE_URL = "https://api.hunterprice.online/api";

export const loader: LoaderFunction = async ({ params, request }) => {
  const category = params.category;
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user") || null;

  if (!category) {
    throw new Response("Category not provided", { status: 400 });
  }

  try {
    const [categoriesResponse, productsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/getSubcategories/${category}`),
      fetch(`${API_BASE_URL}/getProducts/${category}`),
    ]);

    const categoriesData = await categoriesResponse.json();
    const productsData = await productsResponse.json();

    return json({
      categories: [{ nombre: "Todo", id: 0 }, ...categoriesData],
      products: productsData,
      user,
    });
  } catch (error) {
    console.error("Error loading data:", error);
    throw new Response("Error loading data", { status: 500 });
  }
};

export default function CategoryList() {
  const { categories: initialCategories, products: initialProducts, user } = useLoaderData<{
    categories: { nombre: string; id: number }[];
    products: any[];
    user: any;
  }>();

  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState(0); // Track by `id`
  const [loading, setLoading] = useState(false);

  // Fetch products for a specific subcategory
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

  // Handle category selection
  const handleCategorySelect = (subcategoryId: number) => {
    setSelectedCategory(subcategoryId);
    if (subcategoryId === 0) {
      setFilteredProducts(products);
    } else {
      fetchSubcategoryProducts(subcategoryId);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Categories Bar */}
      <div className="sticky top-0 z-10 bg-purple-800 p-4">
        <div className="flex overflow-x-auto gap-4">
          {categories.map((category) => (
            <button
              key={category.id} // Use unique id as the key
              onClick={() => handleCategorySelect(category.id)}
              className={`px-4 py-2 rounded-full text-white font-semibold transition ${
                selectedCategory === category.id ? "bg-purple-600" : "hover:bg-purple-700"
              }`}
            >
              {category.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto p-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="w-full rounded-xl overflow-hidden shadow-lg border-8 cursor-pointer transition-transform transform hover:scale-105 min-h-[350px] max-h-[350px]" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.identifier || `product-${index}`} // Use unique key
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
    </div>
  );
}
