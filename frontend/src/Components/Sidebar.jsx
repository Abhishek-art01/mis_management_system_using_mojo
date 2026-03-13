import { createContext, useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';

/* ── Sidebar Context (built-in, no separate file needed) ─────────────── */
const SidebarContext = createContext();

export function SidebarProvider({ children }) {
    const [open, setOpen] = useState(true);
    return (
        <SidebarContext.Provider value={{ open, setOpen }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}

/* ── Icons ───────────────────────────────────────────────────────────── */
const IcoLayers  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
const IcoDash    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IcoMap     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const IcoTruck   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcoGps     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>;
const IcoDl      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoLogout  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoChevron = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;

/* ── Nav items ───────────────────────────────────────────────────────── */
const NAV = [
    { label: 'DASHBOARD',    sub: 'Control Center', icon: <IcoDash />,  path: '/dashboard'        },
    { label: 'LOCALITY MGR', sub: 'Zone Mapping',   icon: <IcoMap />,   path: '/locality-manager' },
    { label: 'VEHICLE LIST', sub: 'Fleet Tracker',  icon: <IcoTruck />, path: '/vehicle-list'     },
    { label: 'GPS CHECKER',  sub: 'Signal Monitor', icon: <IcoGps />,   path: '/gps-checker'      },
    { label: 'DOWNLOADS',    sub: 'Report Files',   icon: <IcoDl />,    path: '/downloads'        },
];

/* ── Sidebar Component ───────────────────────────────────────────────── */
export default function Sidebar() {
    const { open, setOpen } = useSidebar();
    const [clock, setClock] = useState('--:--:--');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const tick = () => setClock(new Date().toTimeString().slice(0, 8));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const close = () => setOpen(false);

    return (
        <>
            {/* Hamburger toggle */}
            <button
                className={`sb-trigger${open ? ' sb-trigger--open' : ''}`}
                style={{ left: open ? 278 : 16 }}
                onClick={() => setOpen(o => !o)}
            >
                {open ? '✕' : '☰'}
            </button>

            {/* Sidebar panel */}
            <aside className={`sb-panel${open ? ' sb-panel--open' : ''}`}>
                <div className="sb-bg-grid" />
                <div className="sb-scan" />
                <span className="sb-corner sb-corner--tr" />
                <span className="sb-corner sb-corner--bl" />

                {/* Header */}
                <div className="sb-head">
                    <div className="sb-logo"><IcoLayers /></div>
                    <div>
                        <span className="sb-brand-name">NEXUS OS</span>
                        <span className="sb-brand-sub">MIS SYSTEM // v4.2</span>
                    </div>
                </div>

                {/* Status */}
                <div className="sb-status">
                    <span className="sb-dot" />
                    <span>ONLINE</span>
                    <span className="sb-clock">{clock}</span>
                </div>

                <div className="sb-rule"><span>// NAV MODULES</span></div>

                {/* Nav links */}
                <nav className="sb-nav">
                    {NAV.map(item => {
                        const active = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sb-link${active ? ' sb-link--on' : ''}`}
                                onClick={close}
                            >
                                {active && <span className="sb-bar" />}
                                <span className="sb-link-ico">{item.icon}</span>
                                <span className="sb-link-body">
                                    <span className="sb-link-lbl">{item.label}</span>
                                    <span className="sb-link-sub">{item.sub}</span>
                                </span>
                                <span className="sb-chevron"><IcoChevron /></span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="sb-foot">
                    <div className="sb-rule"><span>// SESSION</span></div>
                    <button className="sb-logout" onClick={() => { close(); navigate('/'); }}>
                        <IcoLogout />
                        <span className="sb-link-body">
                            <span className="sb-link-lbl">EXIT SYSTEM</span>
                            <span className="sb-link-sub">Terminate Session</span>
                        </span>
                    </button>
                    <p className="sb-enc">ENC: AES-256 // SECURE</p>
                </div>
            </aside>
        </>
    );
}