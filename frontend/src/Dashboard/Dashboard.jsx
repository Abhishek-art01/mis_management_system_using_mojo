import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

/* ── Icons ────────────────────────────────────────────────────────────── */
const IcoCheck    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoClock    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoCalendar = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoLayers   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
const IcoMap      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const IcoGps      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>;
const IcoDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoTruck    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcoLogout   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

/* ── Main Component ────────────────────────────────────────────────────── */
export default function Dashboard() {
    const navigate = useNavigate();
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 7));
    const [data,       setData]       = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [clock,      setClock]      = useState('--:--:--');
    const [mounted,    setMounted]    = useState(false);

    /* Clock */
    useEffect(() => {
        const tick = () => setClock(new Date().toTimeString().slice(0, 8));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    /* Mount animation trigger */
    useEffect(() => { setMounted(true); }, []);

    /* Fetch */
    useEffect(() => {
        setLoading(true);
        const [year, month] = filterDate.split('-');
        fetch(`http://127.0.0.1:8000/api/dashboard-data/?year=${year}&month=${month}`)
            .then(res => res.json())
            .then(json => { setData(json); setLoading(false); })
            .catch(() => setLoading(false));
    }, [filterDate]);

    /* ── Stage Pipeline ──────────────────────────────────────────────────── */
    const stages = (report) => [
        { id: 'S1', label: '1st – 10th',    sub: 'Initial Phase',  done: report?.stage1?.locality && report?.stage1?.gps },
        { id: 'S2', label: '11th – 20th',   sub: 'Mid Phase',      done: report?.stage2?.locality && report?.stage2?.gps },
        { id: 'S3', label: '21st – End',     sub: 'Final Phase',    done: report?.stage3?.locality && report?.stage3?.gps },
        { id: 'MIS',label: 'MIS Submit',     sub: 'Report Gen',     done: report?.final?.mis_status },
        { id: 'BILL',label: 'Bill Approval', sub: 'Finance',        done: report?.final?.bill_approval },
    ];

    const calcProgress = (report) => {
        if (!report?.found) return 0;
        if (report.progress !== undefined) return report.progress;
        const s = stages(report);
        return Math.round((s.filter(x => x.done).length / s.length) * 100);
    };

    /* ── Month Block ─────────────────────────────────────────────────────── */
    const MonthBlock = ({ sectionData, isCurrent, delay }) => {
        const { month, year, data: report } = sectionData;
        const pct = calcProgress(report);
        const stageList = stages(report);

        return (
            <div className={`db-card${isCurrent ? ' db-card--live' : ''}`} style={{ animationDelay: delay }}>
                {/* Card corner brackets */}
                <span className="db-corner db-corner--tl" />
                <span className="db-corner db-corner--br" />

                {/* Card header */}
                <div className="db-card-head">
                    <div className="db-card-title-group">
                        <span className="db-card-eyebrow">{isCurrent ? '// ACTIVE PERIOD' : '// PREVIOUS PERIOD'}</span>
                        <h2 className="db-card-month">{month} <em>{year}</em></h2>
                    </div>
                    <div className="db-card-badges">
                        {isCurrent && <span className="db-badge db-badge--live"><span className="db-pulse" />LIVE</span>}
                        {report?.found
                            ? <span className="db-badge db-badge--ok">DATA OK</span>
                            : <span className="db-badge db-badge--warn">NO DATA</span>
                        }
                    </div>
                </div>

                {/* Progress bar */}
                <div className="db-prog-wrap">
                    <div className="db-prog-meta">
                        <span className="db-prog-label">COMPLETION</span>
                        <span className="db-prog-pct">{pct}<span>%</span></span>
                    </div>
                    <div className="db-prog-track">
                        <div className="db-prog-fill" style={{ width: `${pct}%` }} />
                        <div className="db-prog-glow" style={{ left: `${pct}%` }} />
                    </div>
                </div>

                {/* Pipeline stages */}
                {report?.found ? (
                    <div className="db-pipeline">
                        {stageList.map((s, i) => (
                            <div key={s.id} className={`db-stage${s.done ? ' db-stage--done' : ''}`}>
                                <div className="db-stage-node">
                                    {s.done ? <IcoCheck /> : <span className="db-stage-dot" />}
                                </div>
                                {i < stageList.length - 1 && (
                                    <div className={`db-stage-line${s.done ? ' db-stage-line--done' : ''}`} />
                                )}
                                <div className="db-stage-info">
                                    <span className="db-stage-id">{s.id}</span>
                                    <span className="db-stage-label">{s.label}</span>
                                    <span className="db-stage-sub">{s.sub}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="db-empty">
                        <IcoClock />
                        <span>NO REPORT DATA — PERIOD NOT STARTED</span>
                    </div>
                )}

                {/* Sub-grid: locality + gps detail */}
                {report?.found && (
                    <div className="db-detail-grid">
                        {[
                            { label: 'STAGE 1 LOCALITY', val: report.stage1?.locality },
                            { label: 'STAGE 1 GPS',      val: report.stage1?.gps },
                            { label: 'STAGE 2 LOCALITY', val: report.stage2?.locality },
                            { label: 'STAGE 2 GPS',      val: report.stage2?.gps },
                            { label: 'STAGE 3 LOCALITY', val: report.stage3?.locality },
                            { label: 'STAGE 3 GPS',      val: report.stage3?.gps },
                            { label: 'MIS STATUS',       val: report.final?.mis_status },
                            { label: 'BILL APPROVAL',    val: report.final?.bill_approval },
                        ].map(item => (
                            <div key={item.label} className="db-detail-cell">
                                <span className="db-detail-label">{item.label}</span>
                                <span className={`db-detail-val${item.val ? ' db-detail-val--ok' : ''}`}>
                                    {item.val ? '✓ DONE' : '○ PEND'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    /* ── Render ──────────────────────────────────────────────────────────── */
    return (
        <div className={`db-root${mounted ? ' db-mounted' : ''}`}>
            {/* Background effects */}
            <div className="db-bg-grid" />
            <div className="db-bg-scan" />
            <div className="db-orb db-orb-1" />
            <div className="db-orb db-orb-2" />

            {/* ── Top Nav ───────────────────────────────────────────────── */}
            <nav className="db-nav">
                <div className="db-nav-brand">
                    <div>
                        <span className="db-nav-title"style={{ marginLeft: "40px" }}>MIS CONTROL CENTER</span>
                        <span className="db-nav-sub"></span>
                    </div>
                </div>

                <div className="db-nav-links">
                    {[
                        { icon: <IcoMap />,      label: 'LOCALITY', path: '/locality-manager' },
                        { icon: <IcoGps />,      label: 'GPS',      path: '/gps-checker'      },
                        { icon: <IcoTruck />,    label: 'VEHICLES', path: '/vehicle-list'     },
                        { icon: <IcoDownload />, label: 'DOWNLOADS',path: '/downloads'        },
                    ].map(n => (
                        <button key={n.label} className="db-nav-link" onClick={() => navigate(n.path)}>
                            {n.icon} {n.label}
                        </button>
                    ))}
                </div>

                <div className="db-nav-right">
                    <div className="db-date-pick">
                        <IcoCalendar />
                        <input
                            type="month"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                        />
                    </div>
                    <div className="db-clock">
                        <span className="db-clock-dot" />{clock}
                    </div>
                    <button className="db-logout" onClick={() => navigate('/')}>
                        <IcoLogout /> EXIT
                    </button>
                </div>
            </nav>

            {/* ── Page body ─────────────────────────────────────────────── */}
            <div className="db-body">

                {/* Status bar */}
                <div className="db-statusbar">
                    <span><span className="db-status-dot" /> SYSTEM ONLINE</span>
                    <span>PERIOD // {filterDate}</span>
                    <span>ENC: AES-256</span>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="db-loader">
                        <div className="db-loader-ring" />
                        <span>SYNCHRONIZING DATA...</span>
                    </div>
                ) : !data ? (
                    <div className="db-error">
                        <span className="db-error-code">ERR_NO_DATA</span>
                        <p>Failed to load dashboard data. Check Django server.</p>
                    </div>
                ) : (
                    <div className="db-grid">
                        <MonthBlock sectionData={data.current}  isCurrent={true}  delay="0.1s" />
                        <MonthBlock sectionData={data.previous} isCurrent={false} delay="0.25s" />
                    </div>
                )}
            </div>
        </div>
    );
}