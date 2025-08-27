import { useState } from 'react'

export default function SearchBar({ onSearch, onFilter, onSort, loading = false }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    location: ''
  })
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('DESC')

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const handleSortChange = (field) => {
    const newOrder = sortBy === field && sortOrder === 'ASC' ? 'DESC' : 'ASC'
    setSortBy(field)
    setSortOrder(newOrder)
    onSort(field, newOrder)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({ status: '', type: '', location: '' })
    setSortBy('created_at')
    setSortOrder('DESC')
    onSearch('')
    onFilter({ status: '', type: '', location: '' })
    onSort('created_at', 'DESC')
  }

  const hasActiveFilters = searchTerm || filters.status || filters.type || filters.location

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              disabled={loading}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              disabled={loading}
            >
              <option value="">All Types</option>
              <option value="internship">Internship</option>
              <option value="job">Job</option>
              <option value="research">Research</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="Filter by location..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="filter-group">
            <label className="form-label">Sort By</label>
            <div className="sort-buttons">
              <button
                type="button"
                className={`btn btn-sm ${sortBy === 'created_at' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleSortChange('created_at')}
                disabled={loading}
              >
                Date {sortBy === 'created_at' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${sortBy === 'title' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleSortChange('title')}
                disabled={loading}
              >
                Title {sortBy === 'title' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${sortBy === 'closing_date' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleSortChange('closing_date')}
                disabled={loading}
              >
                Closing {sortBy === 'closing_date' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="filters-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={clearFilters}
              disabled={loading}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
