import Navbar from "../components/layout/Navbar";

export default function Docs(){
  return (
    <div className="page-shell">
      <Navbar />
      <main className="container py-10">
        <h1 className="text-h2">Documentation</h1>
        <p className="text-body text-secondary mt-4">Getting started guides, accepted file formats, API reference, and FAQ.</p>
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="card-surface p-4">
            <h3 className="text-h5">Accepted File Formats</h3>
            <ul className="mt-2 text-body-sm">
              <li>.csv — timestamp_ms,lead_I,lead_II,lead_V1</li>
              <li>.mat — variables: ecg_I, ecg_II, ecg_V1, fs</li>
              <li>.edf — channels labeled I, II, V1</li>
            </ul>
          </div>
          <div className="card-surface p-4">
            <h3 className="text-h5">API Reference</h3>
            <p className="text-body-sm mt-2">See `/api/v1/auth`, `/api/v1/inference` endpoints.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
