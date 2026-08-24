import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";



interface StarRatingProps {
  rating: number; // Supports decimal (e.g., 4.5)
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-gray-300" />);
    }
  }

  return <div className="flex space-x-1">{stars}</div>;
};

export default StarRating;
