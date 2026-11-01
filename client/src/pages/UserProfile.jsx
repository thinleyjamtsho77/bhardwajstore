import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import ProfileSidebar, { ProfileIcon } from '../components/ProfileSidebar';
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

  const breadcrumb = (
    <nav className="profile-breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      <span aria-hidden="true">›</span>
      <span aria-current="page">Profile</span>
    </nav>
  )

  return (
    <>
      {breadcrumb}

      <section className="user-profile" aria-labelledby="profile-heading">
        <ProfileSidebar />

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
    </>
  )
}

export default UserProfile