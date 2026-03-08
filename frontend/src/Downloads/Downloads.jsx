import { useState, useEffect } from 'react';
import './Downloads.css';

const IcoDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoCalendar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoFile     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoRefresh  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 8 19 8"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const IcoSearch   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

const FILE_TYPES = {
    pdf:  { label:'PDF',   cls:'dl-type--pdf'   },
    xlsx: { label:'XLSX',  cls:'dl-type--xlsx'  },
    csv:  { label:'CSV',   cls:'dl-type--csv'   },
    xls:  { label:'XLS',   cls:'dl-type--xlsx'  },
    docx: { label:'DOCX',  cls:'dl-type--docx'  },
};

export default function Downloads() {
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 7));
    const [data,       setData]       = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [search,     setSearch]     = useState('');

    const fetchData = () => {
        setLoading(true);
        const [year, month] = filterDate.split('-');
        fetch(`http://127.0.0.1:8000/api/dashboard-data/?year=${year}&month=${month}`)
            .then(r => r.json())
            .then(json => { setData(json); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, [filterDate]);

    // Build a flat list of downloadable items from the API data
    const buildFiles = (report, monthLabel) => {
        if (!report?.found) return [];
        const files = [];
        const stages = [
            { key:'stage1', label:'Stage 1 (1–10)' },
            { key:'stage2', label:'Stage 2 (11–20)' },
            { key:'stage3', label:'Stage 3 (21–End)' },
        ];
        stages.forEach(s => {
            if (report[s.key]?.locality)
                files.push({ name:`${monthLabel} ${s.label} — Locality Report`, type:'xlsx', period:monthLabel, status:'ready' });
            if (report[s.key]?.gps)
                files.push({ name:`${monthLabel} ${s.label} — GPS Report`, type:'csv', period:monthLabel, status:'ready' });
        });
        if (report.final?.mis_status)
            files.push({ name:`${monthLabel} MIS Report`, type:'pdf', period:monthLabel, status:'ready' });
        if (report.final?.bill_approval)
            files.push({ name:`${monthLabel} Bill Report`, type:'pdf', period:monthLabel, status:'ready' });
        return files;
    };

    const allFiles = data ? [
        ...buildFiles(data.current?.data,  `${data.current?.month}  ${data.current?.year}`),
        ...buildFiles(data.previous?.data, `${data.previous?.month} ${data.previous?.year}`),
    ] : [];

    const filtered = allFiles.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

    const extClass = (type) => FILE_TYPES[type]?.cls || 'dl-type--default';
    const extLabel = (type) => FILE_TYPES[type]?.label || type?.toUpperCase() || 'FILE';

    return (
        <div className="cy-page dl-page">
            <div className="cy-topbar">
                <span className="cy-topbar-title">DOWNLOADS</span>
                <span className="cy-topbar-sub">// Report Files</span>
                <div className="cy-topbar-spacer" />
                <div className="dl-date-pick">
                    <IcoCalendar />
                    <input type="month" value={filterDate}
                        className="dl-month-input"
                        onChange={e => setFilterDate(e.target.value)} />
                </div>
                <button className="cy-btn" onClick={fetchData}><IcoRefresh /><span>REFRESH</span></button>
            </div>

            <div className="cy-body">
                <div className="cy-status">
                    <span><span className="cy-status-dot"/>ARCHIVE ONLINE</span>
                    <span>PERIOD // {filterDate}</span>
                    <span>{filtered.length} FILE{filtered.length !== 1 ? 'S':''} AVAILABLE</span>
                </div>

                {/* Search */}
                <div className="dl-search-row">
                    <div className="dl-search-wrap">
                        <span className="dl-search-ico"><IcoSearch /></span>
                        <input className="cy-input dl-search-input" placeholder="FILTER FILES..."
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                {/* Stats row */}
                {!loading && data && (
                    <div className="dl-stats-row">
                        <div className="cy-card dl-stat-card">
                            <span className="dl-stat-num">{allFiles.length}</span>
                            <span className="dl-stat-label">TOTAL FILES</span>
                        </div>
                        <div className="cy-card dl-stat-card">
                            <span className="dl-stat-num dl-stat-ok">{allFiles.filter(f=>f.type==='pdf').length}</span>
                            <span className="dl-stat-label">PDF REPORTS</span>
                        </div>
                        <div className="cy-card dl-stat-card">
                            <span className="dl-stat-num dl-stat-info">{allFiles.filter(f=>f.type==='xlsx'||f.type==='csv').length}</span>
                            <span className="dl-stat-label">DATA EXPORTS</span>
                        </div>
                        <div className="cy-card dl-stat-card">
                            <span className="dl-stat-num dl-stat-warn">{allFiles.filter(f=>f.status==='pending').length}</span>
                            <span className="dl-stat-label">PENDING</span>
                        </div>
                    </div>
                )}

                {/* File list */}
                <div className="cy-card dl-file-card">
                    <div className="cy-section">FILE ARCHIVE</div>

                    {loading ? (
                        <div className="cy-loader"><div className="cy-ring"/><span>LOADING ARCHIVE...</span></div>
                    ) : filtered.length === 0 ? (
                        <div className="dl-empty">
                            <IcoFile />
                            <span>{allFiles.length === 0 ? '// NO REPORTS FOUND FOR THIS PERIOD' : '// NO FILES MATCH FILTER'}</span>
                        </div>
                    ) : (
                        <div className="dl-file-list">
                            {filtered.map((file, i) => (
                                <div key={i} className="dl-file-row">
                                    <span className="dl-file-ico"><IcoFile /></span>
                                    <div className="dl-file-info">
                                        <span className="dl-file-name">{file.name}</span>
                                        <span className="dl-file-meta">{file.period}</span>
                                    </div>
                                    <span className={`cy-badge dl-type ${extClass(file.type)}`}>
                                        {extLabel(file.type)}
                                    </span>
                                    <span className="cy-badge cy-badge--ok dl-status">READY</span>
                                    <a
                                        href={`http://127.0.0.1:8000/api/download/?file=${encodeURIComponent(file.name)}`}
                                        className="cy-btn cy-btn--primary dl-dl-btn"
                                        download
                                    >
                                        <IcoDownload /><span>DOWNLOAD</span>
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
