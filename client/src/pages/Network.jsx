import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { getUsers, getRequests, getConnections, sendRequest, acceptRequest, rejectRequest, removeConnection } from '../services/networkService'
import { getOrCreateConversation } from '../services/messageService'
import './Network.css'

const UserCard = ({ user, onAction }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(user.connectionStatus || 'none')

  const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=00dce3&color=041329`

  const handleConnect = async (e) => {
    e.stopPropagation()
    setLoading(true)
    try {
      await sendRequest(user._id)
      setStatus('pending_sent')
      if (onAction) onAction()
    } catch (err) {
      console.error('Connect error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async (e) => {
    e.stopPropagation()
    if (!window.confirm(`Disconnect from ${user.fullName}?`)) return
    setLoading(true)
    try {
      await removeConnection(user._id)
      setStatus('none')
      if (onAction) onAction()
    } catch (err) {
      console.error('Disconnect error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = async (e) => {
    e.stopPropagation()
    try {
      const response = await getOrCreateConversation(user._id)
      if (response.success) {
        navigate(`/messages/${response.conversation._id}`)
      }
    } catch (err) {
      console.error('Message error:', err)
    }
  }

  return (
    <div className="user-card" onClick={() => navigate(`/profile/${user._id}`)}>
      <div className="user-card-header">
        <img src={avatar} alt={user.fullName} className="user-card-avatar" />
        <div className="user-card-info">
          <h4 className="user-card-name">{user.fullName}</h4>
          <p className="user-card-title">{user.title || 'Member'}</p>
          {user.location && (
            <p className="user-card-location">
              <span className="material-symbols-outlined">location_on</span>
              {user.location}
            </p>
          )}
        </div>
      </div>

      {user.skills && user.skills.length > 0 && (
        <div className="user-card-skills">
          {user.skills.slice(0, 3).map((skill) => (
            <span key={skill._id || skill.name} className="user-card-skill">{skill.name}</span>
          ))}
          {user.skills.length > 3 && (
            <span className="user-card-skill-more">+{user.skills.length - 3}</span>
          )}
        </div>
      )}

      <div className="user-card-actions" onClick={e => e.stopPropagation()}>
        {status === 'none' && (
          <button className="network-btn network-btn-primary" onClick={handleConnect} disabled={loading}>
            <span className="material-symbols-outlined">person_add</span>
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        )}
        {status === 'pending_sent' && (
          <button className="network-btn network-btn-ghost" disabled>
            <span className="material-symbols-outlined">schedule</span>
            Pending
          </button>
        )}
        {status === 'connected' && (
          <>
            <button className="network-btn network-btn-secondary" onClick={handleMessage}>
              <span className="material-symbols-outlined">chat</span>
              Message
            </button>
            <button className="network-btn network-btn-disconnect" onClick={handleDisconnect} disabled={loading}>
              <span className="material-symbols-outlined">person_remove</span>
              {loading ? '...' : 'Disconnect'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}


const RequestCard = ({ request, onAction }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const sender = request.sender || {}
  const avatar = sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.fullName || 'User')}&background=00dce3&color=041329`

  const handleAccept = async () => {
    setLoading(true)
    try {
      await acceptRequest(sender._id)
      if (onAction) onAction()
    } catch (err) {
      console.error('Accept error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await rejectRequest(sender._id)
      if (onAction) onAction()
    } catch (err) {
      console.error('Reject error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="request-card">
      <div className="request-card-info" onClick={() => navigate(`/profile/${sender._id}`)}>
        <img src={avatar} alt={sender.fullName} className="request-avatar" />
        <div>
          <h4 className="request-name">{sender.fullName}</h4>
          <p className="request-title">{sender.title || 'Member'}</p>
          {sender.location && <p className="request-location">{sender.location}</p>}
        </div>
      </div>
      <div className="request-actions">
        <button className="network-btn network-btn-primary" onClick={handleAccept} disabled={loading}>Accept</button>
        <button className="network-btn network-btn-ghost" onClick={handleReject} disabled={loading}>Decline</button>
      </div>
    </div>
  )
}

const Network = () => {
  const [activeTab, setActiveTab] = useState('discover')
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      if (activeTab === 'discover') {
        const res = await getUsers(search)
        if (res.success) setUsers(res.users)
      } else if (activeTab === 'requests') {
        const res = await getRequests()
        if (res.success) setRequests(res.requests)
      } else if (activeTab === 'connections') {
        const res = await getConnections()
        if (res.success) setConnections(res.connections)
      }
    } catch (err) {
      console.error('Load network error:', err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, search])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div className="network-page">
      <Navbar />
      <main className="network-main">
        <div className="network-header">
          <h1 className="network-title">My Network</h1>
          <p className="network-subtitle">Discover people, build your professional network</p>
        </div>

        {/* Tabs */}
        <div className="network-tabs">
          <button className={`network-tab ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => { setActiveTab('discover'); setSearch(''); setSearchInput('') }}>
            <span className="material-symbols-outlined">explore</span>
            Discover
          </button>
          <button className={`network-tab ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            <span className="material-symbols-outlined">person_add</span>
            Requests
            {requests.length > 0 && <span className="tab-badge">{requests.length}</span>}
          </button>
          <button className={`network-tab ${activeTab === 'connections' ? 'active' : ''}`} onClick={() => setActiveTab('connections')}>
            <span className="material-symbols-outlined">people</span>
            Connections
          </button>
        </div>

        {/* Search Bar (only on Discover) */}
        {activeTab === 'discover' && (
          <form className="network-search" onSubmit={handleSearch}>
            <div className="network-search-input-wrapper">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Search by name, role, skills, location..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="network-search-input"
              />
            </div>
            <button type="submit" className="network-btn network-btn-primary">Search</button>
          </form>
        )}

        {/* Content */}
        <div className="network-content">
          {loading ? (
            <div className="network-loading">
              <div className="loader"></div>
            </div>
          ) : (
            <>
              {activeTab === 'discover' && (
                <>
                  {users.length === 0 ? (
                    <div className="network-empty">
                      <span className="material-symbols-outlined">search_off</span>
                      <h3>No users found</h3>
                      <p>Try a different search term</p>
                    </div>
                  ) : (
                    <div className="users-grid">
                      {users.map(user => (
                        <UserCard key={user._id} user={user} onAction={loadData} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'requests' && (
                <>
                  {requests.length === 0 ? (
                    <div className="network-empty">
                      <span className="material-symbols-outlined">inbox</span>
                      <h3>No pending requests</h3>
                      <p>When someone sends you a connection request, it'll appear here.</p>
                    </div>
                  ) : (
                    <div className="requests-list">
                      <h3 className="section-label">Pending Requests ({requests.length})</h3>
                      {requests.map(req => (
                        <RequestCard key={req._id} request={req} onAction={loadData} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'connections' && (
                <>
                  {connections.length === 0 ? (
                    <div className="network-empty">
                      <span className="material-symbols-outlined">hub</span>
                      <h3>No connections yet</h3>
                      <p>Start building your professional network. Discover people and send connection requests.</p>
                    </div>
                  ) : (
                    <div className="users-grid">
                      {connections.map(conn => (
                        <UserCard key={conn.user._id} user={{ ...conn.user, connectionStatus: 'connected' }} onAction={loadData} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default Network
