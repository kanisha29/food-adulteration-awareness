import { AlertTriangle, ShieldCheck, FlaskConical, HeartPulse, Lightbulb, Eye } from "lucide-react";
import { DISCLAIMER, fileUrl } from "../services/api.js";

const Block = ({ icon: I, title, children, tone }) => children ? (
  <section className={"detail-block " + (tone || "")}><h4><I size={18} /> {title}</h4><p>{children}</p></section>
) : null;

export default function FoodDetail({ food }) {
  const img = fileUrl(food.image);
  return (
    <div className="food-detail">
      <div className="detail-head">
        {img ? <img src={img} alt={food.name} /> : <div className="detail-icon">{food.icon}</div>}
        <div><span className="chip">{food.category}</span><h2>{food.name}</h2></div>
      </div>
      <section className="detail-block">
        <h4><AlertTriangle size={18} /> Common adulterants</h4>
        <ul className="adulterants">
          {food.adulterants.map((a) => <li key={a.id}><strong>{a.name}</strong>{a.description && <span>{a.description}</span>}</li>)}
          {!food.adulterants.length && <li>No adulterants listed yet.</li>}
        </ul>
      </section>
      <Block icon={Lightbulb} title="Why it happens">{food.why}</Block>
      <Block icon={Eye} title="Possible warning signs">{food.warning_signs}</Block>
      <Block icon={FlaskConical} title="Educational detection information">{food.detection}</Block>
      <Block icon={HeartPulse} title="Health concerns" tone="warn">{food.health_effects}</Block>
      <Block icon={ShieldCheck} title="Prevention tips">{food.prevention}</Block>
      <Block icon={ShieldCheck} title="Food safety recommendations">{food.recommendations}</Block>
      <div className="disclaimer">{DISCLAIMER}</div>
    </div>
  );
}
