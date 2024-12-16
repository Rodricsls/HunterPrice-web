import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Key, useEffect, useState } from "react";
import LoginDialog from "~/components/LoginDialog";
import { getSession } from "~/utils/session.server";
import white_location from "/white_location.png";
import { Separator } from "@radix-ui/react-separator";
import ChartDialog from "~/components/ChartDialog";

const API_BASE_URL = "https://api.hunterprice.online/api";
import { useNavigate } from "@remix-run/react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";
import ProductCard from "~/components/ProductCard";

interface Store {
    id: string;
    name: string;
    nearestLocation: number | null; // Allow null for when the distance isn't calculated yet
    price: number | string;
    link: string;
  }

// Loader to fetch product details and ratings
export const loader: LoaderFunction = async ({ params, request }) => {
  const productId = params.productId;

  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  const userId = user?.id || 0;

  try {
    const [
      productResponse,
      ratingsResponse,
      userRatingResponse,
      recommendationsResponse,
    ] = await Promise.all([
      fetch(`${API_BASE_URL}/getSingleProduct/${productId}`).then((res) =>
        res.json()
      ),
      fetch(`${API_BASE_URL}/productRating/${productId}`).then((res) =>
        res.json()
      ),
      fetch(
        `${API_BASE_URL}/getUserRating/?productId=${productId}&userId=${userId}`
      ).then((res) => res.json()),
      fetch(`${API_BASE_URL}/recommendProducts/${userId}/${productId}`).then((res) =>
        res.json()
      ), // Fetch recommendations
    ]);

    const stores = Object.keys(productResponse.Tiendas).map((storeKey) => ({
      id: storeKey,
      name: productResponse.Tiendas[storeKey],
      price: productResponse.Precios[productResponse.Tiendas[storeKey]],
      link: productResponse.Referencias[productResponse.Tiendas[storeKey]],
      nearestLocation: null, // Placeholder
      coords: {
        lat: 0,
        lng: 0,
      },
    }));

    return json({
      productData: {
        productId: productResponse.productoid,
        name: productResponse.Nombre,
        description: `${productResponse.Caracteristicas.marca} - ${productResponse.Caracteristicas.categoria}`,
        imageUrl: productResponse.ImagenURL,
        stores,
      },
      ratingsData: {
        ratings: ratingsResponse.ratings,
        average: ratingsResponse.average,
        totalRatings: ratingsResponse.totalRatings,
        userRating: userRatingResponse.rating || 0,
      },
      recommendations: recommendationsResponse.recommendations, // Include recommendations
      isLoggedIn: !!user,
      userId: user?.id || 0,
    });
  } catch (error) {
    throw new Response("Error al cargar los datos del producto", { status: 500 });
  }
};

  

// Action to handle rating submission
export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const productId = params.productId;

  let userId = formData.get("userId") as string;
  const rating = formData.get("rating") as string;

  if (userId === "user-id") {
    const session = await getSession(request.headers.get("Cookie"));
    userId = session.get("user").id;
  }

  if (!productId || !userId || !rating) {
    return json({ error: "Faltan datos requeridos para enviar la calificación." }, { status: 400 });
  }

  if (userId === "0") {
    return json({ error: "Debes iniciar sesión para calificar este producto." }, { status: 403 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/rateProduct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, userId, rating }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json({ error: errorData.error || "Error al calificar el producto." }, { status: response.status });
    }

    return json({ message: "Calificación enviada con éxito." });
  } catch (error) {
    return json({ error: "Error inesperado al enviar la calificación." }, { status: 500 });
  }
};


export default function ProductDetails({ params }: { params: any }) {
  
  const { productData, ratingsData, isLoggedIn, userId, recommendations } = useLoaderData<{
    productData: any;
    ratingsData: any;
    isLoggedIn: boolean;
    userId:any;
    recommendations: any;
  }>();
  const actionData = useActionData<{ message?: string; error?: string }>();
  const [selectedRating, setSelectedRating] = useState(ratingsData.userRating || 0);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [storesWithLocation, setStoresWithLocation] = useState(productData.stores);
  const [isLiked, setIsLiked] = useState<boolean | null>(null); // Initialize as null to indicate loading state
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility
  const [isHydrated, setIsHydrated] = useState(false);
  const navigate = useNavigate();

  // Verify if the product is liked when the component mounts
  useEffect(() => {
    const verifyLikeStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/verifyLike/${userId}/${productData.productId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to verify like status");
        }

        const data = await response.json();
        setIsLiked(data.liked);
      } catch (error) {
        console.error("Error verifying like status:", error);
        setIsLiked(false); // Default to not liked if there's an error
      }
    };
    verifyLikeStatus();
  }, [userId, productData.productId]);

  // Handle like and dislike actions
  const handleLikeToggle = async () => {
    try {
      const endpoint = isLiked ? `${API_BASE_URL}/dislikeProduct` : `${API_BASE_URL}/likeProduct`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId: productData.productId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isLiked ? "dislike" : "like"} product`);
      }

      setIsLiked((prev) => !prev); // Toggle the liked state
    } catch (error) {
      console.error(`Error handling ${isLiked ? "dislike" : "like"} action:`, error);
    }
  };

  useEffect(() => {
    setIsHydrated(true); // Ensure the component only renders tooltips after hydration
  }, []);

  const handleClick = (tienda: string, lat: number, lng: number) => {
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        navigate(`/map/${encodeURIComponent(tienda)}?longitud=${encodeURIComponent(longitude)}&latitud=${encodeURIComponent(latitude)}&destLng=${encodeURIComponent(lng)}&destLat=${encodeURIComponent(lat)}`);
      }, (error) => {
        console.error("Error al obtener la ubicación:", error);
      });
    }
    
  };

  const handleRating = (e: React.FormEvent) => {
    if (!isLoggedIn) {
      e.preventDefault(); // Prevent the form from submitting
      setIsLoginDialogOpen(true);
    }
  };

  const getPercentage = (count: number) => {
    const total = ratingsData.totalRatings || 1;
    return ((count / total) * 100).toFixed(1);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const updatedStores = await Promise.all(
              productData.stores.map(async (store: { id: any; name: any }) => {
                const response = await fetch(
                  `${API_BASE_URL}/nearest-location/?tienda=${store.id}&longitud=${longitude}&latitud=${latitude}`
                );
                const data = await response.json();
                console.log("Llamando al api: ",data);

                return { ...store, nearestLocation: data.distanceInKm , coords:{longitude: data.longitud, latitude: data.latitud} };
              })
            );

            setStoresWithLocation(updatedStores);
          } catch (error) {
            console.error("Error fetching nearest location:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, [productData.stores]);

  

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8 max-w-screen-xl">
  {/* Product Details Section */}
  <div className="flex flex-col lg:flex-row gap-8">
    {/* Product Image */}
    <div className="relative flex-1 flex">
      {/* Image */}
      <img
        src={productData.imageUrl}
        alt={productData.name}
        className="w-full h-3/4 max-w-lg lg:max-w-xl rounded-lg shadow-md object-contain"
      />

      {/* Button with Tooltip */}
      <div className="absolute top-4 right-4">
        {isHydrated && (
           <TooltipProvider>
           <Tooltip>
             <TooltipTrigger>
               <button
                 className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-600 focus:outline-none shadow-md"
                 onClick={() => setIsDialogOpen(true)} // Open the dialog
               >
                 <svg
                   xmlns="http://www.w3.org/2000/svg"
                   className="h-6 w-6"
                   fill="none"
                   viewBox="0 0 24 24"
                   stroke="currentColor"
                   strokeWidth="2"
                 >
                   <path
  stroke="currentColor"
  fill="none"
  strokeWidth="2"
  d="M2 18 L6 10 L10 14 L14 6 L18 12"
/>

                 </svg>
               </button>
             </TooltipTrigger>
             <TooltipContent>
               <p>Click to view chart</p>
             </TooltipContent>
           </Tooltip>
         </TooltipProvider>
        )}
      </div>
    </div>
    <ChartDialog isOpen={isDialogOpen} onClose={setIsDialogOpen} productId={productData.productId} />
    {/* Product Details */}
    <div className="flex-1 bg-black text-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between w-full">
        {/* Product Name */}
        <h1 className="text-3xl w-3/4 font-bold uppercase text-center lg:text-left">
          {productData.name}
        </h1>

        {/* Heart Button */}
        <button
          className="p-2 rounded-full bg-black hover:bg-gray-700 transition"
          onClick={handleLikeToggle}
          disabled={isLiked === null}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-8 h-8 ${
              isLiked ? "text-red-500" : "text-gray-400"
            } transition`}
            fill={isLiked ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isLiked
                  ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  : "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              }
            />
          </svg>
        </button>
      </div>
      <p className="mt-4 text-gray-400 text-center lg:text-left">
        {productData.description}
      </p>

      <Separator className="my-4 w-full h-[1px] bg-white" />

      {/* Stores Section */}
      <h2 className="text-xl mt-5">Tiendas</h2>
      <div className="mt-2 grid gap-4 grid-cols-1 lg:grid-cols-1">
        {storesWithLocation.map((store: any) => (
          <div
            key={store.id}
            className="flex items-center justify-between px-4 bg-black rounded-lg gap-4"
          >
            {/* Location Icon */}
            <div
              className="flex items-center justify-center w-16 h-16"
              onClick={() => {
                handleClick(
                  store.id,
                  store.coords.longitude,
                  store.coords.latitude
                );
              }}
            >
              <img
                src={white_location}
                alt="Location Icon"
                className="w-6 h-8"
              />
            </div>

            {/* Store Details */}
            <div className="flex flex-grow items-center justify-between gap-4">
              {/* Store Name */}
              <div className="flex items-center justify-center bg-customgray px-6 py-4 rounded-lg text-white text-sm font-bold min-w-[135px] text-center">
                {store.name.toUpperCase()}
              </div>

              {/* Distance */}
              <div className="flex items-center justify-center bg-customgray px-6 py-4 rounded-lg text-white text-sm font-bold min-w-[100px] text-center">
                {store.nearestLocation !== null
                  ? `${store.nearestLocation} km`
                  : "Calculando distancia..."}
              </div>

              {/* Price */}
              <div className="flex items-center justify-center bg-customgray px-6 py-4 rounded-lg text-white text-sm font-bold min-w-[110px] text-center">
                {typeof store.price === "number"
                  ? `Q${store.price.toFixed(2)}`
                  : `Q${store.price}`}
              </div>

              {/* Action Button */}
              <a
                href={store.link}
                className="bg-orange-500 hover:bg-orange-600 px-6 py-4 rounded-lg text-white text-sm font-bold min-w-[120px] text-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ir a tienda
              </a>
            </div>
          </div>
        ))}
      </div>
      <Separator className="mt-8 w-full h-[1px] bg-white" />
       {/* Ratings Section */}
       <h2 className="text-xl mt-5">Ranking</h2>
        <div className="mt-4 mr-4 flex flex-row items-center justify-between">
          {/* Stars */}
          <div className="flex items-center bg-white px-4 py-1 rounded-xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedRating(star)}
                className={`w-12 h-12 text-5xl font-bold ${
                  star <= selectedRating ? "text-orange-400" : "text-black"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          {/* Submit Rating */}
          <Form method="post" onSubmit={handleRating} className="mt-4">
            <input type="hidden" name="rating" value={selectedRating} />
            <input type="hidden" name="userId" value={isLoggedIn ? "user-id" : "0"} />
            <button
              type="submit"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg"
            >
              Calificar
            </button>
          </Form>
        </div>

        {/* Ratings Breakdown */}
        <h2 className="text-xl  mt-5">
          Resumen de la calificación del público
        </h2>
        <div className="mt-6 flex flex-col lg:flex-row gap-6">
        {/* Rating Breakdown Bars */}
        <div className="flex flex-col space-y-4 flex-grow">
          {ratingsData.ratings.map((rating: { calificacion: string; count: number }) => (
            <div key={rating.calificacion} className="flex items-center space-x-4">
              {/* Rating Number */}
              <span className="text-lg font-bold text-white">{rating.calificacion}</span>
              {/* Progress Bar */}
              <div className="flex-grow h-4 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${getPercentage(rating.count)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center bg-customgray rounded-lg p-6 text-white">
          <p className="text-6xl font-bold">
            {isNaN(Number(ratingsData.average)) ? "0.0" : Number(ratingsData.average).toFixed(1)}
          </p>
          <p className="text-gray-400 text-lg">
            ({ratingsData.totalRatings || 0} calificaciones)
          </p>
        </div>
        </div>
    </div>
  </div>
  <Separator className="mt-8 w-full h-[1px] bg-gray-800" />
  {/* Carousel Section */}
  <div >
    <h2 className="text-4xl font-bold">Similares</h2>
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full max-w-4xl mx-auto mt-4"
    >
      <CarouselContent className="flex p-2">
        {recommendations.map(
          (product: {
            identifier: string;
            imagenurl: string;
            marca: any;
            nombreDisplay: any;
            nombre: any;
          }) => (
            <CarouselItem
              key={product.identifier}
              className="flex-shrink-0 w-[80%] sm:w-1/2 md:w-1/3 lg:w-1/4 md:basis-1/2 lg:basis-1/3"
            >
              <div className="p-1">
                <ProductCard
                  image={product.imagenurl}
                  brand={product.marca || "Sin marca"}
                  name={product.nombreDisplay || product.nombre}
                  id={product.identifier}
                  user={null}
                />
              </div>
            </CarouselItem>
          )
        )}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
</div>

  );
}
