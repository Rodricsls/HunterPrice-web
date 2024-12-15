import { useNavigate } from "react-router-dom";

export default function CategoryCard({
  id,
  title,
  image,
}: {
  id: number;
  title: string;
  image: string;
}) {
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleClick = () => {
    navigate(`/category/${id}`); // Navigate to the category page
  };

  return (
    <div
      className="flex flex-col items-center p-3 rounded-lg transform transition-transform hover:scale-110 cursor-pointer"
      onClick={handleClick}
    >
      <div className="w-full h-[500px] bg-custompurple flex items-center justify-center rounded-md overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-[450px] w-auto object-contain"
        />
      </div>
      <p className="mt-6 text-xl font-bold text-center text-custompurple">
        {title}
      </p>
    </div>
  );
}
