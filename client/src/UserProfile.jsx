import { useState } from 'react'

const demoProfile = {
  name: 'Demo Customer',
  email: 'customer@example.com',
  phone: '',
}

function UserProfile() {
  const [profile, setProfile] = useState(demoProfile)
  const [name, setName] = useState(demoProfile.name)
  const [phone, setPhone] = useState(demoProfile.phone)
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedName) {
      setMessage('Please enter your name.')
      return
    }

    setProfile({
      ...profile,
      name: trimmedName,
      phone: trimmedPhone,
    })

    setName(trimmedName)
    setPhone(trimmedPhone)
    setMessage('Preview updated. Changes are not saved to the database.')
  }

  function handleCancel() {
    setName(profile.name)
    setPhone(profile.phone)
    setMessage('Unsaved changes cancelled.')
  }

  return (
    <section aria-labelledby="profile-heading">
      <h2 id="profile-heading">User Profile</h2>

      <p>
        Demo profile: refreshing the page resets these details.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="profile-name">Name</label>
          <input
            id="profile-name"
            type="text"
            autoComplete="name"
            value={name}
            maxLength={100}
            required
            onChange={(event) => {
              setName(event.target.value)
              setMessage('')
            }}
          />
        </div>

        <div>
          <label htmlFor="profile-email">Email</label>
          <input
            id="profile-email"
            type="email"
            value={profile.email}
            readOnly
          />
        </div>

        <div>
          <label htmlFor="profile-phone">Phone (optional)</label>
          <input
            id="profile-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            maxLength={20}
            onChange={(event) => {
              setPhone(event.target.value)
              setMessage('')
            }}
          />
        </div>

        <button type="submit">Update preview</button>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </form>

      <p role="status">{message}</p>
    </section>
  )
}

export default UserProfile