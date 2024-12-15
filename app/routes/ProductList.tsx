import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import ProductCard from "~/components/ProductCard";
import { Skeleton } from "~/components/ui/skeleton";
import { getSession } from "~/utils/session.server";

const API_BASE_URL = "https://api.hunterprice.online/api";

interface Product {
  productoid: string;
  imagenurl: string;
  marca: { valor: string };
  nombreDisplay: string;
  _id: string;
}

interface LoaderData {
  initialProducts: Product[];
  hasNextPage: boolean;
  searchText: string;
  user: { id: string; nombre: string } | null;
}

// Loader to fetch initial products and user session
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const searchText = url.searchParams.get("searchText") || "";
  const page = 0; // First page
  const pageSize = 20; // Page size

  const response = await fetch(
    `${API_BASE_URL}/search/?searchText=${searchText}&page=${page}&pageSize=${pageSize}`
  );
  const data = await response.json();

  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user") || null;

  return json<LoaderData>({
    initialProducts: data.results || [],
    hasNextPage: data.hasNextPage || false,
    searchText,
    user,
  });
};

// ProductList Component
export default function ProductList() {
  const { initialProducts, hasNextPage: initialHasNextPage, user } = useLoaderData<LoaderData>();
  const [products, setProducts] = useState(initialProducts);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [nextPageAvailable, setNextPageAvailable] = useState(initialHasNextPage);
  const [searchParams] = useSearchParams();

  const fetchProducts = async (searchText: string, page = 0) => {
    setIsFetching(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/search/?searchText=${searchText}&page=${page}&pageSize=20`
      );
      const data = await response.json();
      if (page === 0) {
        setProducts(data.results || []); // Replace products for the first page
      } else {
        setProducts((prev) => [...prev, ...data.results]); // Append for subsequent pages
      }
      setNextPageAvailable(data.hasNextPage || false);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const searchText = searchParams.get("searchText") || "";
    fetchProducts(searchText); // Fetch products on search param change
    setPage(1); // Reset pagination
  }, [searchParams]);

  const fetchMoreProducts = () => {
    if (isFetching || !nextPageAvailable) return;
    const searchText = searchParams.get("searchText") || "";
    fetchProducts(searchText, page);
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        !isFetching &&
        nextPageAvailable
      ) {
        fetchMoreProducts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isFetching, nextPageAvailable, page, searchParams]);

  return (
    <div className="flex flex-col items-center px-4 py-8">
      {products.length === 0 && !isFetching && (
        <p className="text-center text-gray-500 text-lg font-medium mt-8">
          No se encontró ningún resultado en base a tu búsqueda.
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            id={product._id}
            image={product.imagenurl}
            brand={product.marca.valor}
            name={product.nombreDisplay}
            user={user} // Pass user session to ProductCard
          />
        ))}
        {isFetching &&
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              className="w-full bg-gray-300 rounded-xl shadow-lg border-8 border-black"
            />
          ))}
      </div>
    </div>
  );
}
