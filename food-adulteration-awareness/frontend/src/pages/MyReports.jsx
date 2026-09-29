import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, fileUrl } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { IMAGES } from "../config/images.js";
import { STATUS } from "../config/categories.js";
import PageHero from "../components/PageHero.jsx";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";

export default function MyReports() {
  const [reports, setReports] = useState(null);
  const [img, setImg] = useState(null);
  const toast = useToast();
  useEffect(() => { api.myReports().then((r) => setReports(r.reports)).catch((e) => { toast(e.message, "error"); setReports([]); }); /* eslint-disable-next-line */ }, []);
  return (
    <>
      <PageHero image={IMAGES.report} title="My Reports" subtitle="Everything you have submitted and where it stands." />
      <div className="container section">
        {reports === null ? <Loader /> : !reports.length ? (
          <div className="empty"><h3>No reports yet</h3><p>When you report a product it will appear here.</p><Link className="btn btn-primary" to="/report">Report a product</Link></div>
        ) : (
          <div className="stack">{reports.map((r) => (
            <article className="card report-row" key={r.id}>
              {r.images[0] ? <button className="thumb" onClick={() => setImg(fileUrl(r.images[0]))} aria-label="View submitted image"><img src={fileUrl(r.images[0])} alt="" /></button> : <div className="thumb none">No image</div>}
              <div className="report-info">
                <div className="row-between"><h3>{r.product}</h3><span className={"badge status-" + r.status}>{STATUS[r.status]}</span></div>
                <small className="muted">{r.report_code} | {r.report_date}{r.brand ? ` | ${r.brand}` : ""}</small>
                <p>{r.description}</p>
                {r.remarks && <div className="alert info"><b>Reviewer remarks:</b> {r.remarks}</div>}
              </div>
            </article>))}
          </div>
        )}
      </div>
      <Modal open={!!img} onClose={() => setImg(null)} title="Submitted image" wide>{img && <img className="full-img" src={img} alt="Submitted evidence" />}</Modal>
    </>
  );
}
