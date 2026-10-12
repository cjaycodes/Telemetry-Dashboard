import { useState } from 'react'
import './App.css'

type IconName =
  | 'activity'
  | 'arrow'
  | 'bell'
  | 'box'
  | 'check'
  | 'chevron'
  | 'clock'
  | 'download'
  | 'globe'
  | 'menu'
  | 'more'
  | 'search'
  | 'settings'
  | 'signal'
  | 'zap'

type Range = '24 hours' | '7 days' | '30 days'

const chartData: Record<Range, number[]> = {
  '24 hours': [25, 30, 27, 37, 34, 43, 39, 47, 43, 56, 48, 53, 46, 57, 51, 66, 62, 72, 63, 76, 70, 81, 72, 85],
  '7 days': [30, 36, 32, 43, 39, 48, 44, 52, 49, 58, 53, 63, 59, 68, 62, 72, 68, 77, 70, 80, 76, 84, 78, 89],
  '30 days': [35, 31, 40, 36, 47, 42, 51, 46, 57, 52, 62, 56, 67, 63, 72, 66, 77, 72, 81, 74, 85, 79, 88, 83],
}

const labels: Record<Range, string[]> = {
  '24 hours': ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM', 'Now'],
  '7 days': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  '30 days': ['Sep 11', 'Sep 16', 'Sep 21', 'Sep 26', 'Oct 1', 'Oct 6', 'Oct 10'],
}

const events = [
  { device: 'Gateway — North wing', detail: 'Firmware updated to v2.4.1', time: '2 min ago', kind: 'success' },
  { device: 'Temperature sensor #04', detail: 'Signal strength returned to normal', time: '18 min ago', kind: 'success' },
  { device: 'Water pump — Unit B', detail: 'Unusual vibration detected', time: '42 min ago', kind: 'warning' },
  { device: 'Air quality sensor #12', detail: 'Device connected', time: '1 hr ago', kind: 'success' },
]

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }

  const paths: Record<IconName, React.ReactNode> = {
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="M3 8v9l9 5 9-5V8M12 13v9" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    chevron: <><path d="m7 10 5 5 5-5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.6-1.4-2.4L7.5 15a8 8 0 0 1 0-1.9L6.1 12l1.4-2.4 1.7.6a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 1.9Z" /></>,
    signal: <><path d="M2 12a15 15 0 0 1 20 0M5 15a10 10 0 0 1 14 0M8.5 18.5a5 5 0 0 1 7 0M12 22h.01" /></>,
    zap: <><path d="m13 2-3 8H5l6 12 3-8h5L13 2Z" /></>,
  }

  return <svg {...common}>{paths[name]}</svg>
}

function buildPath(values: number[], width: number, height: number) {
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = height - (value / 100) * height
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function App() {
  const [range, setRange] = useState<Range>('24 hours')
  const [activeNav, setActiveNav] = useState('Overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('just now')
  const values = chartData[range]
  const linePath = buildPath(values, 720, 200)
  const lastPointY = 200 - (values[values.length - 1] / 100) * 200

  function exportReport() {
    const rows = [
      ['Device', 'Event', 'Time'],
      ...events.map(({ device, detail, time }) => [device, detail, time]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'pulse-telemetry-events.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const navItems: { label: string; icon: IconName }[] = [
    { label: 'Overview', icon: 'activity' },
    { label: 'Devices', icon: 'box' },
    { label: 'Alerts', icon: 'bell' },
    { label: 'Reports', icon: 'globe' },
  ]

  return (
    <div className="app-shell">
      <aside className={`sidebar${mobileNavOpen ? ' sidebar-open' : ''}`}>
        <a className="brand" href="#" aria-label="Pulse home">
          <span className="brand-mark"><Icon name="activity" size={21} /></span>
          <span>pulse<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <button className="workspace-switcher">
          <span className="workspace-avatar">A</span>
          <span className="workspace-name"><strong>Acme Industries</strong><small>Pro plan</small></span>
          <Icon name="chevron" size={16} />
        </button>

        <div className="nav-label">MENU</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ label, icon }) => (
            <button
              className={`nav-item${activeNav === label ? ' nav-item-active' : ''}`}
              key={label}
              onClick={() => { setActiveNav(label); setMobileNavOpen(false) }}
              aria-current={activeNav === label ? 'page' : undefined}
            >
              <Icon name={icon} size={18} />
              <span>{label}</span>
              {label === 'Alerts' && <span className="nav-count">3</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="plan-card">
            <div className="plan-icon"><Icon name="zap" size={16} /></div>
            <strong>You’re on track</strong>
            <p>Your devices are sending data as expected.</p>
            <div className="plan-progress"><span /></div>
            <small>78% of monthly event volume</small>
          </div>
          <button className="nav-item settings-link" onClick={() => setActiveNav('Settings')}>
            <Icon name="settings" size={18} /><span>Settings</span>
          </button>
          <div className="profile-row">
            <div className="profile-avatar">JD</div>
            <div className="profile-info"><strong>Jordan Davis</strong><small>Admin</small></div>
            <button className="icon-button profile-more" aria-label="Profile options"><Icon name="more" /></button>
          </div>
        </div>
      </aside>

      {mobileNavOpen && <button className="nav-backdrop" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button>
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <span className="live-indicator"><span />System operational</span>
            <button className="icon-button search-button" aria-label="Search"><Icon name="search" /></button>
            <button className="icon-button notification-button" aria-label="Notifications"><Icon name="bell" /><i /></button>
            <div className="topbar-avatar">JD</div>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> MONDAY, OCTOBER 10, 2026</div>
              <h1>Good morning, Jordan <span className="wave">✳</span></h1>
              <p className="page-subtitle">Here’s what’s happening across your connected devices.</p>
            </div>
            <button className="button button-secondary export-button" onClick={exportReport}><Icon name="download" size={16} /> Export report</button>
          </section>

          <section className="metrics-grid" aria-label="Key metrics">
            <article className="metric-card">
              <div className="metric-top"><span>Active devices</span><span className="metric-icon icon-blue"><Icon name="box" size={18} /></span></div>
              <div className="metric-value">1,284 <span className="metric-trend trend-positive"><Icon name="arrow" size={13} /> 8.2%</span></div>
              <div className="metric-caption">vs. previous 24 hours</div>
              <div className="mini-chart mini-blue"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span>Events today</span><span className="metric-icon icon-violet"><Icon name="activity" size={18} /></span></div>
              <div className="metric-value">48.2k <span className="metric-trend trend-positive"><Icon name="arrow" size={13} /> 12.6%</span></div>
              <div className="metric-caption">vs. previous 24 hours</div>
              <div className="mini-chart mini-violet"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span>Avg. response time</span><span className="metric-icon icon-teal"><Icon name="clock" size={18} /></span></div>
              <div className="metric-value">142 <small>ms</small><span className="metric-trend trend-positive"><Icon name="arrow" size={13} /> 4.3%</span></div>
              <div className="metric-caption">vs. previous 24 hours</div>
              <div className="mini-chart mini-teal"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span>Open alerts</span><span className="metric-icon icon-amber"><Icon name="bell" size={18} /></span></div>
              <div className="metric-value">03 <span className="metric-trend trend-neutral">2 need attention</span></div>
              <div className="metric-caption">1 critical · 2 warnings</div>
              <div className="alert-indicators"><span /><span /><span /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
          </section>

          <section className="content-grid">
            <article className="panel traffic-panel">
              <div className="panel-header">
                <div><h2>Event activity</h2><p>Incoming events across all devices</p></div>
                <div className="range-tabs" role="group" aria-label="Chart time range">
                  {(['24 hours', '7 days', '30 days'] as Range[]).map((item) => (
                    <button key={item} onClick={() => setRange(item)} className={range === item ? 'range-active' : ''} aria-pressed={range === item}>{item === '24 hours' ? '24h' : item}</button>
                  ))}
                </div>
              </div>
              <div className="chart-summary"><strong>48,291</strong><span className="chart-summary-change"><Icon name="arrow" size={13} /> 12.6%</span><span className="chart-summary-period">compared to previous period</span></div>
              <div className="chart-area">
                <div className="chart-y-labels"><span>10k</span><span>7.5k</span><span>5k</span><span>2.5k</span><span>0</span></div>
                <div className="chart-plot">
                  <div className="chart-gridlines"><i /><i /><i /><i /><i /></div>
                  <svg className="activity-chart" viewBox="0 0 720 200" preserveAspectRatio="none" role="img" aria-label={`Event activity over the last ${range}`}>
                    <defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4f7cff" stopOpacity=".2" /><stop offset="100%" stopColor="#4f7cff" stopOpacity="0" /></linearGradient></defs>
                    <path d={`${linePath} L 720 200 L 0 200 Z`} fill="url(#chart-fill)" />
                    <path d={linePath} fill="none" stroke="#4f7cff" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                    <circle cx="720" cy={lastPointY} r="5" fill="#fff" stroke="#4f7cff" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <div className="chart-x-labels">{labels[range].map((label) => <span key={label}>{label}</span>)}</div>
                </div>
              </div>
              <div className="chart-footer"><span><i className="legend-dot" /> Events received</span><span className="updated-time">Updated {lastUpdated}</span></div>
            </article>

            <article className="panel device-panel">
              <div className="panel-header"><div><h2>Device health</h2><p>Current connection status</p></div><button className="icon-button panel-more" aria-label="More device health options"><Icon name="more" /></button></div>
              <div className="health-overview">
                <div className="donut-chart"><div><strong>1,284</strong><span>Total devices</span></div></div>
                <div className="health-legend">
                  <div><i className="status-dot status-online" /><span>Online</span><strong>1,241</strong></div>
                  <div><i className="status-dot status-idle" /><span>Idle</span><strong>32</strong></div>
                  <div><i className="status-dot status-offline" /><span>Offline</span><strong>11</strong></div>
                </div>
              </div>
              <div className="health-divider" />
              <div className="connectivity-row"><span className="connectivity-icon"><Icon name="signal" size={16} /></span><span><strong>Network uptime</strong><small>Last 30 days</small></span><strong className="uptime-value">99.98%</strong></div>
              <div className="uptime-bars" aria-label="Network uptime over the last 30 days">{Array.from({ length: 30 }, (_, index) => <i key={index} className={index === 12 ? 'uptime-bar uptime-bar-warn' : 'uptime-bar'} />)}</div>
            </article>
          </section>

          <section className="panel events-panel">
            <div className="panel-header">
              <div><h2>Recent events</h2><p>A live feed of activity from your devices</p></div>
              <button className="button button-link" onClick={() => setActiveNav('Alerts')}>View all events <span>→</span></button>
            </div>
            <div className="events-table">
              <div className="events-table-head"><span>DEVICE</span><span>EVENT</span><span>TIME</span><span /></div>
              {events.map((event) => (
                <div className="event-row" key={event.device}>
                  <div className="event-device"><span className={`event-status event-${event.kind}`}>{event.kind === 'warning' ? <Icon name="bell" size={14} /> : <Icon name="check" size={14} />}</span><strong>{event.device}</strong></div>
                  <span className="event-detail">{event.detail}</span>
                  <span className="event-time">{event.time}</span>
                  <button className="icon-button event-more" aria-label={`Options for ${event.device}`}><Icon name="more" size={17} /></button>
                </div>
              ))}
            </div>
          </section>

          <footer className="page-footer"><span><span className="footer-status" /> All systems operational</span><span>Pulse telemetry <i>·</i> Last synced {lastUpdated}</span></footer>
        </div>
      </main>
    </div>
  )
}

export default App
