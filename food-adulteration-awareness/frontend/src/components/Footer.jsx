import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container foot-in">
        <div>
          <div className="brand light"><Leaf size={20} /> FoodSafe</div>
          <p>Food Adulteration Awareness System. Learn, check and report.</p>
        </div>
        <div className="foot-links">
          <Link to="/foods">Foods</Link><Link to="/checker">Checker</Link><Link to="/awareness">Awareness</Link>
          <Link to="/report">Report</Link><Link to="/admin/login">Admin</Link>
        </div>
      </div>
      <div className="container foot-note">For awareness and education only. This site does not replace laboratory testing.</div>
    </footer>
  );
}
