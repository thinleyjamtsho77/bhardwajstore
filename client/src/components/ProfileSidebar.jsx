import { NavLink } from 'react-router';

const ICON_PATHS = {
  user: <path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" />,
  details: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  contact: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  edit: <path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 6Z" />,
  arrow: <path d="m9 5 7 7-7 7" />,
};

export function ProfileIcon({ name, className = '' }) {
  return (
    <svg
      className={`user-profile__icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[name] || ICON_PATHS.user}
    </svg>
  );
}

const DEFAULT_NAV_ITEMS = [
  { to: '/profile', label: 'Profile', icon: 'user' },
  { to: '/order-history', label: 'Order History', icon: 'details' },
  { to: '/wishlist', label: 'Wishlist', icon: 'contact' },
];

export default function AccountSidebar({
  title = 'My Account',
  subtitle = 'Account settings',
  navLabel = 'MY ACCOUNT',
  navItems = DEFAULT_NAV_ITEMS,
}) {
  return (
    <aside className="user-profile__sidebar" aria-label="Account navigation">
      <div className="user-profile__sidebar-heading">
        <span className="user-profile__account-icon">
          <ProfileIcon name="user" />
        </span>
        <div>
          <p className="user-profile__sidebar-title">{title}</p>
          <p className="user-profile__sidebar-subtitle">{subtitle}</p>
        </div>
      </div>

      <p className="user-profile__nav-label">{navLabel}</p>
      <nav className="user-profile__nav" aria-label="Profile sections">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `user-profile__nav-link${isActive ? ' user-profile__nav-link--active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <ProfileIcon name={icon} />
                <span>{label}</span>
                {isActive && <ProfileIcon name="arrow" className="user-profile__nav-arrow" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}