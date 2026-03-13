import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header.jsx';
import './Dashboard.css';

/* ── Icons (dashboard-only) ───────────────────────────────────────────── */
const IcoCheck    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoClock    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoPin      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoTime     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoToll     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><circle cx="12" cy="14" r="2"/></svg>;
const IcoChevron  = ({ open }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}><polyline points="6 9 12 15 18 9"/></svg>;
const IcoPlus     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

/* ── Main Component ────────────────────────────────────────────────────── */
export default function Dashboard() {
    const navigate = useNavigate();
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 7));
    const [data,       setData]       = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [mounted,    setMounted]    = useState(false);
    const [auditOpen,  setAuditOpen]  = useState(true);
    const [activeAudit, setActiveAudit] = useState(null);

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

    /* ── Audit Trips Section ─────────────────────────────────────────────── */
    const auditSubs = [
        {
            id: 'locality',
            icon: <IcoPin />,
            label: 'FIX LOCALITY',
            desc: 'Correct and update locality assignments for trip records',
            tag: 'GEO',
            path: '/locality-manager',
        },
        {
            id: 'gps',
            icon: <IcoTime />,
            label: 'ADD GPS TIME',
            desc: 'Attach and validate GPS timestamps to trip entries',
            tag: 'TIME',
            path: '/gps-checker',
        },
        {
            id: 'toll',
            icon: <IcoToll />,
            label: 'ADD TOLL DETAILS',
            desc: 'Enter toll booth data and expense records for each trip',
            tag: 'FINANCE',
            path: '/toll-details',
        },
    ];

    /* ── Render ──────────────────────────────────────────────────────────── */
    return (
        <div className={`db-root${mounted ? ' db-mounted' : ''}`}>
            {/* Background effects */}
            <div className="db-bg-grid" />
            <div className="db-bg-scan" />
            <div className="db-orb db-orb-1" />
            <div className="db-orb db-orb-2" />

            {/* ── Top Nav ───────────────────────────────────────────────── */}
            <Header
                filterDate={filterDate}
                onDateChange={setFilterDate}
            />

            {/* ── Page body ─────────────────────────────────────────────── */}
            <div className="db-body">

                {/* Status bar */}
                <div className="db-statusbar">
                    <span><span className="db-status-dot" /> SYSTEM ONLINE</span>
                    <span>PERIOD // {filterDate}</span>
                    <span>ENC: AES-256</span>
                </div>

                {/* ── Create Audit Trips ──────────────────────────────── */}
                <div className="db-audit-wrap">
                    <button className="db-audit-header" onClick={() => setAuditOpen(o => !o)}>
                        <span className="db-audit-header-left">
                            <span className="db-audit-tag">// MODULE</span>
                            <span className="db-audit-title">CREATE AUDIT TRIPS</span>
                        </span>
                        <span className="db-audit-header-right">
                            <span className="db-audit-count">{auditSubs.length} ACTIONS</span>
                            <IcoChevron open={auditOpen} />
                        </span>
                    </button>

                    {auditOpen && (
                        <div className="db-audit-body">
                            {auditSubs.map((sub) => (
                                <div
                                    key={sub.id}
                                    className={`db-audit-card${activeAudit === sub.id ? ' db-audit-card--active' : ''}`}
                                    onClick={() => { setActiveAudit(sub.id); navigate(sub.path); }}
                                >
                                    <span className="db-audit-card-corner db-audit-card-corner--tl" />
                                    <span className="db-audit-card-corner db-audit-card-corner--br" />
                                    <div className="db-audit-card-icon">{sub.icon}</div>
                                    <div className="db-audit-card-info">
                                        <span className="db-audit-card-label">{sub.label}</span>
                                        <span className="db-audit-card-desc">{sub.desc}</span>
                                    </div>
                                    <div className="db-audit-card-right">
                                        <span className="db-audit-card-tag">{sub.tag}</span>
                                        <span className="db-audit-card-action"><IcoPlus /> GO</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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