import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import '../styles/user-profile.css';

const PHONE_PATTERN = /^\+?[0-9\s-]{6,20}$/

// Keep the existing authenticated profile endpoint and request payload.
async function profileRequest(options) {
  let res
  try {
    res = await fetch('/api/auth/me', options)
  } catch {
    throw new Error('Could not reach the server. Please try again.')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data.message || 'Something went wrong.')
    error.status = res.status
    throw error
  }
  return data
}

const loadProfile = () => profileRequest()

const saveProfile = ({ name, phone }) =>
  profileRequest({
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone: phone || null }),
  })

function ProfileIcon({ name, className = '' }) {
  const paths = {
    user: <path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"/>,
    details: <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    contact: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>,
    edit: <><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 6Z" /></>,
    arrow: <path d="m9 5 7 7-7 7" />,
  }

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
      {paths[name] || paths.user}
    </svg>
  )
}

function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 'U'
  return `${words[0][0]}${words.length > 1 ? words[words.length - 1][0] : ''}`.toUpperCase()
}

function ProfileDetails({ profile, onSaved }) {
  const [name, setName] = useState(profile.name ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [editing, setEditing] = useState(false)
  const nameInput = useRef(null)
  const editButton = useRef(null)
  const wasEditing = useRef(false)

  const savedName = profile.name ?? ''
  const savedPhone = profile.phone ?? ''
  const unchanged = name.trim() === savedName && phone.trim() === savedPhone

  useEffect(() => {
    if (editing) nameInput.current?.focus()
    else if (wasEditing.current) editButton.current?.focus()
    wasEditing.current = editing
  }, [editing])

  function startEditing() {
    setName(savedName)
    setPhone(savedPhone)
    setMessage('')
    setEditing(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (pending) return

    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedName) {
      setMessage('Please enter your name.')
      nameInput.current?.focus()
      return
    }
    if (trimmedPhone && !PHONE_PATTERN.test(trimmedPhone)) {
      setMessage('Please enter a valid phone number.')
      return
    }

    setPending(true)
    setMessage('')
    try {
      const updated = await saveProfile({ name: trimmedName, phone: trimmedPhone })
      onSaved(updated)
      setName(updated.name ?? '')
      setPhone(updated.phone ?? '')
      setEditing(false)
      setMessage('Your profile has been updated.')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setPending(false)
    }
  }

  function handleCancel() {
    setName(savedName)
    setPhone(savedPhone)
    setEditing(false)
    setMessage('Unsaved changes cancelled.')
  }

  return (
    <>

      <nav className="user-profile-breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      <span aria-hidden="true">›</span>
      <span aria-current="page">Profile</span>
    </nav>

      <div className="user-profile__body">
        <section className="user-profile__details" id="profile-details" aria-labelledby="personal-details-heading">
          <header className="user-profile__details-header">
            <div>
              <h3 id="personal-details-heading">Personal details</h3>
              <p>Your personal and contact information.</p>
            </div>
            {!editing && (
              <button ref={editButton} className="user-profile__edit" type="button" onClick={startEditing}>
                <ProfileIcon name="edit" />
                Edit profile
              </button>
            )}
          </header>

          {editing ? (
            <form className="user-profile__form" onSubmit={handleSubmit} aria-busy={pending}>
              <div className="user-profile__field">
                <label htmlFor="profile-name">Full name</label>
                <input
                  ref={nameInput}
                  id="profile-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  maxLength={100}
                  required
                  disabled={pending}
                  onChange={(event) => {
                    setName(event.target.value)
                    setMessage('')
                  }}
                />
              </div>

              <div className="user-profile__field" id="profile-contact">
                <label htmlFor="profile-email">Email address</label>
                <div className="user-profile__input-group">
                  <input id="profile-email" type="email" value={profile.email ?? ''} readOnly aria-describedby="profile-email-help" />
                  <small id="profile-email-help">Used to sign in. Your email cannot be changed here.</small>
                </div>
              </div>

              <div className="user-profile__field">
                <label htmlFor="profile-phone">Phone number <span>(optional)</span></label>
                <input
                  id="profile-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  maxLength={20}
                  disabled={pending}
                  onChange={(event) => {
                    setPhone(event.target.value)
                    setMessage('')
                  }}
                />
              </div>

              <div className="user-profile__actions">
                <button className="user-profile__primary" type="submit" disabled={pending || unchanged}>
                  {pending ? 'Saving…' : 'Save changes'}
                </button>
                <button className="user-profile__secondary" type="button" onClick={handleCancel} disabled={pending}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <dl className="user-profile__list">
              <div className="user-profile__row">
                <dt>Full name</dt>
                <dd>{savedName || <span className="user-profile__empty">Not provided</span>}</dd>
              </div>
              <div className="user-profile__row" id="profile-contact">
                <dt>Email address</dt>
                <dd>{profile.email || <span className="user-profile__empty">Not provided</span>}</dd>
              </div>
              <div className="user-profile__row">
                <dt>Phone number</dt>
                <dd>{savedPhone || <span className="user-profile__empty">Not provided</span>}</dd>
              </div>
              <div className="user-profile__row">
                <dt>Address</dt>
                <dd>{savedPhone || <span className="user-profile__empty">Not provided</span>}</dd>
              </div>
            </dl>
          )}
        </section>
        <p className="user-profile__message" role="status">{message}</p>
      </div>
      
    </>
  )
}

function UserProfile() {
  const { setUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

  // The signed login cookie identifies this user, as in the original component.
  useEffect(() => {
    let ignore = false

    loadProfile()
      .then((data) => {
        if (ignore) return
        setProfile(data)
        setUser(data)
      })
      .catch((err) => {
        if (ignore) return
        if (err.status === 401) setUser(null)
        setError(err.message)
      })

    return () => {
      ignore = true
    }
  }, [setUser])

  function handleSaved(updated) {
    setProfile(updated)
    setUser(updated)
  }

  return (
    <section className="user-profile" aria-labelledby="profile-heading">
      <aside className="user-profile__sidebar" aria-label="Account navigation">
        <div className="user-profile__sidebar-heading">
          <span className="user-profile__account-icon"><ProfileIcon name="user" /></span>
          <div>
            <p className="user-profile__sidebar-title">My Account</p>
            <p className="user-profile__sidebar-subtitle">Account settings</p>
          </div>
        </div>

        <p className="user-profile__nav-label">MY ACCOUNT</p>
        <nav className="user-profile__nav" aria-label="Profile sections">
          <a className="user-profile__nav-link user-profile__nav-link--active" href="#profile-overview" aria-current="page">
            <ProfileIcon name="user" />
            <span>Profile</span>
            <ProfileIcon name="arrow" className="user-profile__nav-arrow" />
          </a>
          <a className="user-profile__nav-link" href="#profile-details">
            <ProfileIcon name="details" />
            <span>Order History</span>
          </a>
          <a className="user-profile__nav-link" href="#profile-contact">
            <ProfileIcon name="contact" />
            <span>Wishlist</span>
          </a>
        </nav>
      </aside>

      <div className="user-profile__main">

        {!profile && !error && (
          <div className="user-profile__state"><p role="status">Loading your profile…</p></div>
        )}

        {error && !profile && (
          <div className="user-profile__state">
            <p className="user-profile__notice" role="alert">{error}</p>
            <div className="user-profile__actions">
              <button className="user-profile__secondary" type="button" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          </div>
        )}

        {profile && <ProfileDetails profile={profile} onSaved={handleSaved} />}
      </div>

      
    </section>
  )
}

export default UserProfile
