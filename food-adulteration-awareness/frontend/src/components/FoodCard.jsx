import { fileUrl } from "../services/api.js";

export default function FoodCard({ food, onClick }) {
  const img = fileUrl(food.image);
  return (
    <button className="card food-card" onClick={() => onClick(food)}>
      <div className="food-thumb" style={img ? { backgroundImage: `url("${img}")` } : undefined}>
        {!img && <span>{food.icon}</span>}
      </div>
      <div className="food-body">
        <span className="chip">{food.category}</span>
        <h3>{food.name}</h3>
        <p>{(food.why || "").slice(0, 90)}{(food.why || "").length > 90 ? "..." : ""}</p>
        <small>{food.adulterants?.length || 0} common adulterants</small>
      </div>
    </button>
  );
}
