import { useState, useEffect } from 'react';
import './VehicleList.css';

const IcoPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoTruck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcoFile  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoX     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default function VehicleList() {
    const [vehicles,   setVehicles]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [showForm,   setShowForm]   = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData,   setFormData]   = useState({
        vehicle_no: '', contact_no: '', cab_type: '', vehicle_ownership: '', rc_document: null
    });

    useEffect(() => { fetchVehicles(); }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res  = await fetch('http://127.0.0.1:8000/api/vehicles/');
            const data = await res.json();
            setVehicles(Array.isArray(data) ? data : data.results || []);
        } catch(e) { console.error(e); }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => { if (v !== null) fd.append(k, v); });
        try {
            const res    = await fetch('http://127.0.0.1:8000/api/vehicles/', { method:'POST', body:fd });
            const result = await res.json();
            if (res.ok) {
                setShowForm(false);
                setFormData({ vehicle_no:'', contact_no:'', cab_type:'', vehicle_ownership:'', rc_document:null });
                fetchVehicles();
            } else { alert('Error: '+result.error); }
        } catch(e) { console.error(e); }
    };

    const filtered = vehicles.filter(v =>
        v.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.contact_no?.includes(searchTerm)
    );

    return (
        <div className="cy-page vl-page">
            {/* Top bar */}
            <div className="cy-topbar">
                <span className="cy-topbar-title">VEHICLE LIST</span>
                <span className="cy-topbar-sub">// Fleet Tracker</span>
                <div className="cy-topbar-spacer" />
                <span className="cy-badge cy-badge--info">{filtered.length} UNITS</span>
                <button className={`cy-btn${showForm ? ' cy-btn--danger' : ' cy-btn--primary'} vl-add-btn`} onClick={()=>setShowForm(s=>!s)}>
                    {showForm ? <><IcoX /><span>CANCEL</span></> : <><IcoPlus /><span>ADD VEHICLE</span></>}
                </button>
            </div>

            <div className="cy-body">
                <div className="cy-status">
                    <span><span className="cy-status-dot"/>FLEET ONLINE</span>
                    <span>TOTAL UNITS // {vehicles.length}</span>
                </div>

                {/* Add form */}
                {showForm && (
                    <div className="cy-card vl-form-card">
                        <div className="cy-section">NEW VEHICLE ENTRY</div>
                        <form onSubmit={handleSubmit} className="vl-form">
                            <div className="vl-form-grid">
                                <div className="vl-field">
                                    <label className="vl-label">VEHICLE NO *</label>
                                    <input className="cy-input" required placeholder="e.g. MH12AB1234"
                                        value={formData.vehicle_no} onChange={e=>setFormData({...formData,vehicle_no:e.target.value})} />
                                </div>
                                <div className="vl-field">
                                    <label className="vl-label">CONTACT NO</label>
                                    <input className="cy-input" placeholder="e.g. 9876543210"
                                        value={formData.contact_no} onChange={e=>setFormData({...formData,contact_no:e.target.value})} />
                                </div>
                                <div className="vl-field">
                                    <label className="vl-label">CAB TYPE</label>
                                    <input className="cy-input" placeholder="e.g. Sedan / SUV"
                                        value={formData.cab_type} onChange={e=>setFormData({...formData,cab_type:e.target.value})} />
                                </div>
                                <div className="vl-field">
                                    <label className="vl-label">OWNERSHIP / VENDOR</label>
                                    <input className="cy-input" placeholder="Vendor Name"
                                        value={formData.vehicle_ownership} onChange={e=>setFormData({...formData,vehicle_ownership:e.target.value})} />
                                </div>
                                <div className="vl-field vl-field--full">
                                    <label className="vl-label">RC DOCUMENT (PDF / Image)</label>
                                    <input type="file" className="cy-input vl-file-input" accept="application/pdf,image/*"
                                        onChange={e=>setFormData({...formData,rc_document:e.target.files[0]})} />
                                </div>
                            </div>
                            <button type="submit" className="cy-btn cy-btn--primary vl-submit">
                                <IcoTruck /><span>SAVE VEHICLE</span>
                            </button>
                        </form>
                    </div>
                )}

                {/* Search */}
                <div className="vl-search-row">
                    <div className="vl-search-wrap">
                        <span className="vl-search-ico"><IcoSearch /></span>
                        <input className="cy-input vl-search-input" placeholder="SEARCH VEHICLE NO OR CONTACT..."
                            value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                    </div>
                </div>

                {/* Table */}
                <div className="cy-card">
                    <div className="cy-section">FLEET REGISTRY</div>
                    {loading ? (
                        <div className="cy-loader"><div className="cy-ring"/><span>LOADING FLEET DATA...</span></div>
                    ) : (
                        <div className="vl-table-wrap">
                            <table className="cy-table">
                                <thead>
                                    <tr><th>ID</th><th>VEHICLE NO</th><th>CONTACT</th><th>TYPE</th><th>OWNERSHIP</th><th>RC DOC</th></tr>
                                </thead>
                                <tbody>
                                    {filtered.length > 0 ? filtered.map(row => (
                                        <tr key={row.id}>
                                            <td className="vl-id">#{row.id}</td>
                                            <td className="vl-vno">{row.vehicle_no}</td>
                                            <td>{row.contact_no||'—'}</td>
                                            <td>{row.cab_type ? <span className="cy-badge cy-badge--info">{row.cab_type}</span> : '—'}</td>
                                            <td>{row.vehicle_ownership||row.ownership||'—'}</td>
                                            <td>
                                                {row.rc_document
                                                    ? <a href={`http://127.0.0.1:8000${row.rc_document}`} target="_blank" rel="noopener noreferrer" className="cy-btn vl-doc-btn"><IcoFile /><span>VIEW RC</span></a>
                                                    : <span className="vl-no-doc">// NO FILE</span>
                                                }
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="vl-empty">// NO VEHICLES FOUND</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
