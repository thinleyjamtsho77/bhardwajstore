import { useState } from 'react'

const initialCategories = [
  { id: 1, name: 'Rice & Grains', isActive: true },
  { id: 2, name: 'Dairy', isActive: true },
  { id: 3, name: 'Snacks', isActive: true },
  { id: 4, name: 'Beverages', isActive: true },
]

function AdminCategories() {
  const [categories, setCategories] = useState(initialCategories)
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setMessage('Please enter a category name.')
      return
    }

    const duplicate = categories.some(
      (category) =>
        category.id !== editingId &&
        category.name.toLowerCase() === trimmedName.toLowerCase()
    )

    if (duplicate) {
      setMessage('This category name already exists.')
      return
    }

    if (editingId !== null) {
      setCategories((current) =>
        current.map((category) =>
          category.id === editingId
            ? { ...category, name: trimmedName }
            : category
        )
      )
      setMessage('Category updated in preview.')
    } else {
      setCategories((current) => [
        ...current,
        {
          id: Math.max(0, ...current.map((category) => category.id)) + 1,
          name: trimmedName,
          isActive: true,
        },
      ])
      setMessage('Category added in preview.')
    }

    setName('')
    setEditingId(null)
  }

  function handleEdit(category) {
    setEditingId(category.id)
    setName(category.name)
    setMessage('')
  }

  function handleCancel() {
    setEditingId(null)
    setName('')
    setMessage('Editing cancelled.')
  }

  function handleToggle(categoryId) {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? { ...category, isActive: !category.isActive }
          : category
      )
    )
    setMessage('Category status updated in preview.')
  }

  return (
    <section aria-labelledby="admin-categories-heading">
      <h2 id="admin-categories-heading">Manage Categories</h2>

      <p>
        Demo only: changes reset when this page is reopened or refreshed.
        Changes are not saved to the database.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="category-name">Category name</label>{' '}
        <input
          id="category-name"
          type="text"
          value={name}
          maxLength={100}
          required
          onChange={(event) => {
            setName(event.target.value)
            setMessage('')
          }}
        />

        <button type="submit">
          {editingId !== null ? 'Update category' : 'Add category'}
        </button>

        {editingId !== null && (
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </form>

      <p role="status">{message}</p>

      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <strong>{category.name}</strong>
            {' — '}
            {category.isActive ? 'Active' : 'Inactive'}
            {' '}
            <button
              type="button"
              onClick={() => handleEdit(category)}
              aria-label={`Edit ${category.name}`}
            >
              Edit
            </button>
            {' '}
            <button
              type="button"
              onClick={() => handleToggle(category.id)}
              aria-label={`${category.isActive ? 'Deactivate' : 'Activate'} ${category.name}`}
            >
              {category.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default AdminCategories