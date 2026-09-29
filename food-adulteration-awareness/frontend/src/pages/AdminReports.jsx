import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { api, fileUrl } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { STATUS } from "../config/categories.js";
import Modal from "../components/Modal.jsx";
import Loader from "../components/Loader.jsx";

export default function AdminReports() {
  const [filter, setFilter] = useState("");
  const [reports, setReports] = useState(null);
  const [sel, setSel] = useState(null);
  const [status, setStatus] = useState("pending");
  const [remarks, setRemarks] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const load = () => api.admin.reports(filter).then((r) => setReports(r.reports)).catch((e) => toast(e.message, "error"));
  useEffect(() => { setReports(null); load(); /* eslint-disable-next-line */ }, [filter]);

  const open = (r) => { setSel(r); setStatus(r.status); setRemarks(r.remarks || ""); };
  const save = async () => {
    setBusy(true);
    try { await api.admin.updateReport(sel.id, { status, remarks }); toast("Report updated."); setSel(null); load(); }
    catch (e) { toast(e.message, "error"); } finally { setBusy(false); }
  };

  return (
    <>
      <h1 className="admin-title">Report management</h1>
      <div className="chips">
        {[["", "All"], ...Object.entries(STATUS)].map(([k, l]) => <button key={k} className={"chip big" + (filter === k ? " active" : "")} onClick={() => setFilter(k)}>{l}</button>)}
      </div>
      {reports === null ? <Loader /> : !reports.length ? <div className="empty"><h3>No reports here</h3></div> : (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Product</th><th>Reporter</th><th>Date</th><th>Status</th><th className="right">Review</th></tr></thead>
            <tbody>{reports.map((r) => (
              <tr key={r.id}><td>{r.report_code}</td><td><b>{r.product}</b><small className="block muted">{r.brand}</small></td><td>{r.user_name}</td><td>{r.report_date}</td>
                <td><span className={"badge status-" + r.status}>{STATUS[r.status]}</span></td>
                <td className="right"><button className="btn btn-ghost btn-sm" onClick={() => open(r)}><Eye size={16} /> Open</button></td></tr>))}</tbody>
          </table>
        </div>
      )}
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.report_code || ""} wide>
        {sel && (
          <div className="review">
            <p><b>{sel.product}</b> {sel.brand && `(${sel.brand})`}</p>
            <p className="muted">{sel.location || "No location"} | {sel.report_date} | Contact: {sel.contact} | Reporter: {sel.user_name} ({sel.user_email})</p>
            <p>{sel.description}</p>
            {sel.images.map((im) => <a key={im} href={fileUrl(im)} target="_blank" rel="noreferrer"><img className="thumb-lg" src={fileUrl(im)} alt="Uploaded evidence" /></a>)}
            <div className="chips">{Object.entries(STATUS).map(([k, l]) => <button key={k} type="button" className={"chip big" + (status === k ? " active" : "")} onClick={() => setStatus(k)}>{l}</button>)}</div>
            <label className="field"><span>Remarks</span><textarea rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Visible to the reporter" /></label>
            <button className="btn btn-primary block" onClick={save} disabled={busy}>{busy ? "Saving..." : "Save changes"}</button>
          </div>
        )}
      </Modal>
    </>
  );
}
