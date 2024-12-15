import React from "react";
import { Link, useNavigate } from "@remix-run/react";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

interface ProductCardProps {
  image: string;
  brand: string;
  name: string;
  id: string;
  user: { id: string; nombre: string } | null; // User data from the session
}

const ProductCard: React.FC<ProductCardProps> = ({ image, brand, name, id, user }) => {
  const navigate = useNavigate();

  // Function to handle the click and call the API route
  const handleCardClick = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault(); // Prevent navigation to the product page immediately

    try {
      // Ensure user data exists
      if (user && user.id) {
        await fetch("https://api.hunterprice.online/api/logUserSearch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario_id: user.id,
            identifier: id,
          }),
        });
      }
    } catch (error) {
      console.error("Error logging user interaction:", error);
    }

    // Navigate to the product details page after logging
    navigate(`/product/${id}`);
  };

  return (
    <a
      href={`/product/${id}`} // Fallback for navigation if JS is disabled
      onClick={handleCardClick} // Handle click event
      className="block"
    >
      <Card
        className="w-full bg-black text-white rounded-xl overflow-hidden shadow-lg border-black border-8 cursor-pointer transition-transform transform hover:scale-105 min-h-[350px] max-h-[350px]"
      >
        {/* Product Image */}
        <div className="relative w-full aspect-w-1 aspect-h-1">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Brand Overlay */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center w-full">
            <div className="bg-black rounded-t-full px-4 py-1 w-3/4 text-center">
              <span className="text-xs sm:text-sm font-bold text-white">
                {brand.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        {/* Product Name */}
        <CardContent className="p-2 sm:p-4 text-center">
          <CardTitle className="text-sm sm:text-lg font-semibold">{name}</CardTitle>
        </CardContent>
      </Card>
    </a>
  );
};

export default ProductCard;
