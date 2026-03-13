import './Layout.css';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/* ── Icons ─────────────────────────────────────────────────────────────── */
const IcoCalendar = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoMap      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const IcoGps      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>;
const IcoDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoTruck    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcoLogout   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

/* ── Nav link definitions ───────────────────────────────────────────────── */
const NAV_LINKS = [
    { icon: <IcoMap />,      label: 'LOCALITY',  path: '/locality-manager' },
    { icon: <IcoGps />,      label: 'GPS',       path: '/gps-checker'      },
    { icon: <IcoTruck />,    label: 'VEHICLES',  path: '/vehicle-list'     },
    { icon: <IcoDownload />, label: 'DOWNLOADS', path: '/downloads'        },
];

/* ══════════════════════════════════════════════════
   Header Component

   Props:
   - title        {string}   — override the brand title (default: 'MIS CONTROL CENTER')
   - showDatePick {bool}     — show/hide month filter (default: true)
   - filterDate   {string}   — controlled value 'YYYY-MM' (optional)
   - onDateChange {function} — callback when date changes (optional)
   - extraLinks   {array}    — add extra nav links: [{ icon, label, path }]
══════════════════════════════════════════════════ */
export default function Header({
    title        = 'MIS CONTROL CENTER',
    showDatePick = true,
    filterDate,
    onDateChange,
    extraLinks   = [],
}) {
    const navigate  = useNavigate();
    const location  = useLocation();

    /* Internal date state — used only if not controlled externally */
    const [localDate, setLocalDate] = useState(new Date().toISOString().slice(0, 7));
    const activeDate  = filterDate   ?? localDate;
    const handleDate  = onDateChange ?? setLocalDate;

    /* Live clock */
    const [clock, setClock] = useState('--:--:--');
    useEffect(() => {
        const tick = () => setClock(new Date().toTimeString().slice(0, 8));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const allLinks = [...NAV_LINKS, ...extraLinks];

    return (
        <nav className="hdr-nav">
            {/* ── Brand ─────────────────────────────────────────────────── */}
            <div className="hdr-brand">
                <div className="hdr-logo">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                    </svg>
                </div>
                <div>
                    <span className="hdr-title">{title}</span>
                    <span className="hdr-sub">// CONTROL SYSTEM</span>
                </div>
            </div>

            {/* ── Nav links ─────────────────────────────────────────────── */}
            <div className="hdr-links">
                {allLinks.map(n => (
                    <button
                        key={n.label}
                        className={`hdr-link${location.pathname === n.path ? ' hdr-link--active' : ''}`}
                        onClick={() => navigate(n.path)}
                    >
                        {n.icon} {n.label}
                    </button>
                ))}
            </div>

            {/* ── Right controls ────────────────────────────────────────── */}
            <div className="hdr-right">

                {/* Month picker */}
                {showDatePick && (
                    <div className="hdr-date-pick">
                        <IcoCalendar />
                        <input
                            type="month"
                            value={activeDate}
                            onChange={e => handleDate(e.target.value)}
                        />
                    </div>
                )}

                {/* Live clock */}
                <div className="hdr-clock">
                    <span className="hdr-clock-dot" />
                    {clock}
                </div>

                {/* Exit / logout */}
                <button className="hdr-logout" onClick={() => navigate('/')}>
                    <IcoLogout /> EXIT
                </button>
            </div>
        </nav>
    );
}