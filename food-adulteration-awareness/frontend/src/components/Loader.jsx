export default function Loader({ label = "Loading..." }) {
  return <div className="loader" role="status"><span className="spinner" /><span>{label}</span></div>;
}
