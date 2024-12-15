import React from "react";
import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";
import ProductCard from "~/components/ProductCard";
import { Skeleton } from "~/components/ui/skeleton";
import { getSession } from "~/utils/session.server";

interface Product {
  identifier: string;
  imagenurl: string;
  nombreDisplay: string;
  nombrecaracteristica: string;
  valor: string;
}

export const loader: LoaderFunction = async ({ params, request }) => {
  // Simulating params retrieval; replace with actual logic
  const productsParam = params.search;
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (!productsParam) {
    throw new Response("Products parameter missing", { status: 400 });
  }


  const products: Product[] = JSON.parse(decodeURIComponent(productsParam));

  return json({ products, user });
};

export default function ProductsPage() {
    const { products, user }: { products: Product[]; user: any } = useLoaderData<{
        products: Product[];
        user: any;
      }>();

  return (
    <div className="flex flex-col items-center px-4 py-8">
      {/* Empty State */}
      {products.length === 0 && (
        <p className="text-center text-gray-500 text-lg font-medium mt-8">
          No se encontró ningún resultado en base a tu búsqueda.
        </p>
      )}

      {/* Grid Display */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
        {products.map((product) => (
          <ProductCard
            key={product.identifier}
            user={user} // Pass user to the ProductCard
            id={product.identifier}
            image={product.imagenurl}
            brand={product.valor} // Using `valor` as the brand
            name={product.nombreDisplay}
          />
        ))}

        {/* Render Skeletons Only If Products Are Missing */}
        {products.length === 0 &&
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