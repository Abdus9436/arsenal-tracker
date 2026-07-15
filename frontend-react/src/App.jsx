import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'

const API_BASE = '/api'

function getToken() {
    return localStorage.getItem('token')
}

function authHeaders() {
    return { 'Authorization': `Bearer ${getToken()}` }
}

function LoginPage({ onLoginSuccess }) {
    const [isRegistering, setIsRegistering] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    async function handleLogin() {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        if (response.ok) {
            const data = await response.json()
            localStorage.setItem('token', data.token)
            onLoginSuccess()
        } else {
            setError('Invalid email or password.')
        }
    }

   async function handleRegister() {
       if (!displayName || !email || !password) {
           setError('Please fill in all fields.')
           return
       }

       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
       if (!emailRegex.test(email)) {
           setError('Please enter a valid email address.')
           return
       }

       if (displayName.length < 3) {
           setError('Username must be at least 3 characters.')
           return
       }

       if (password.length < 6) {
           setError('Password must be at least 6 characters.')
           return
       }

       const response = await fetch(`${API_BASE}/users/register`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, password, displayName })
       })

       if (response.ok) {
           setSuccess('Account created! You can now log in.')
           setError('')
           setIsRegistering(false)
           setDisplayName('')
           setPassword('')
       } else {
           const data = await response.json()
           setError(data.error || 'Registration failed.')
       }
   }

    function toggle() {
        setIsRegistering(!isRegistering)
        setError('')
        setSuccess('')
        setEmail('')
        setPassword('')
        setDisplayName('')
        setShowPassword(false)
    }

    return (
        <>
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <h1 style={styles.headerTitle}>⚽ Arsenal Tracker</h1>
                    <p style={styles.headerSubtitle}>Predict the scores. Earn the points.</p>
                </div>
            </header>
            <div style={styles.loginWrapper}>
                <div style={styles.loginLeft}>
                    <h2 style={styles.loginTagline}>Your Arsenal. Your Predictions.</h2>
                    <p style={styles.loginDescription}>
                        Arsenal Tracker is a prediction league for Arsenal fans.
                        Pick the score before every match, earn points for correct
                        results, and compete with friends on the leaderboard.
                    </p>
                    <ul style={styles.loginFeatures}>
                        <li>⚽ Predict scores for every Arsenal fixture</li>
                        <li>🎯 3 points for exact score, 1 for correct outcome</li>
                        <li>🏆 Climb the leaderboard with your predictions</li>
                        <li>🥅 Penalty shootout predictions for knockout matches</li>
                    </ul>
                </div>
                <div style={styles.loginBox}>
                    <h2 style={styles.sectionTitle}>{isRegistering ? 'Register' : 'Login'}</h2>

                    {isRegistering && (
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Username"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleRegister()}
                        />
                    )}
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Email or username"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (isRegistering ? handleRegister() : handleLogin())}
                    />
                    <div style={styles.passwordWrapper}>
                        <input
                            style={{ ...styles.input, width: '100%', paddingRight: '40px' }}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    isRegistering ? handleRegister() : handleLogin()
                                }
                            }}
                        />
                        <button
                            style={styles.eyeButton}
                            onClick={() => setShowPassword(!showPassword)}
                            type="button"
                        >
                            {showPassword ? '🙈' : '👁'}
                        </button>
                    </div>
                    <button
                        style={styles.primaryButton}
                        onClick={isRegistering ? handleRegister : handleLogin}
                    >
                        {isRegistering ? 'Create Account' : 'Login'}
                    </button>

                    {error && <p style={styles.errorText}>{error}</p>}
                    {success && <p style={{ ...styles.errorText, color: '#66cc66' }}>{success}</p>}

                    <p style={styles.cardDetail}>
                        {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <span
                            onClick={toggle}
                            style={{ color: '#db0007', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {isRegistering ? 'Login' : 'Register'}
                        </span>
                    </p>
                </div>
            </div>
        </>
    )
}

function AppHeader({ onLogout }) {
    const [profile, setProfile] = useState({ displayName: '', initials: '', profilePicture: '' })
    const navigate = useNavigate()

    useEffect(() => {
        async function loadProfile() {
            const response = await fetch(`${API_BASE}/profile`, {
                headers: authHeaders()
            })
            if (response.ok) {
                const data = await response.json()
                setProfile(data)
            }
        }
        loadProfile()
    }, [])

    function getAvatarContent() {
        if (profile.profilePicture) {
            return <img src={profile.profilePicture} alt="avatar" style={styles.avatarImg} />
        }
        if (profile.initials) {
            return <span>{profile.initials.toUpperCase()}</span>
        }
        if (profile.displayName) {
            return <span>{profile.displayName.substring(0, 2).toUpperCase()}</span>
        }
        return <span>?</span>
    }

    const navLinkStyle = ({ isActive }) => ({
        ...styles.navLink,
        color: isActive ? '#ffffff' : '#aaaaaa',
        borderBottom: isActive ? '2px solid #db0007' : '2px solid transparent',
    })

    return (
        <>
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <h1 style={styles.headerTitle}>⚽ Arsenal Tracker</h1>
                    <p style={styles.headerSubtitle}>Predict the scores. Earn the points.</p>
                </div>
                <div style={styles.headerRight}>
                    <div
                        style={styles.avatar}
                        onClick={() => navigate('/profile')}
                        title="Edit profile"
                    >
                        {getAvatarContent()}
                    </div>
                    <button style={styles.logoutButton} onClick={onLogout}>Logout</button>
                </div>
            </header>
            <nav style={styles.nav}>
                <NavLink to="/" end style={navLinkStyle}>Predictions</NavLink>
                <NavLink to="/fixtures" style={navLinkStyle}>Fixtures</NavLink>
                <NavLink to="/leaderboard" style={navLinkStyle}>Leaderboard</NavLink>
                <NavLink to="/stats" style={navLinkStyle}>Stats</NavLink>
            </nav>
        </>
    )
}

function PredictionsPage() {
    const [fixtures, setFixtures] = useState([])
    const [predictions, setPredictions] = useState([])

    useEffect(() => {
        loadFixtures()
        loadPredictions()
    }, [])

    async function loadFixtures() {
        const response = await fetch(`${API_BASE}/fixtures`, {
            headers: authHeaders()
        })
        const data = await response.json()
        setFixtures(data)
    }

    async function loadPredictions() {
        const response = await fetch(`${API_BASE}/predictions`, {
            headers: authHeaders()
        })
        const data = await response.json()
        setPredictions(data)
    }

    async function deletePrediction(id) {
        const response = await fetch(`${API_BASE}/predictions/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        })
        if (response.ok) {
            loadPredictions()
        }
    }

    return (
        <div style={styles.mainContent}>
            <section>
                <h2 style={styles.sectionTitle}>How It Works</h2>
                <div style={styles.rulesCard}>
                    <div style={styles.rulesGrid}>
                        <div style={styles.ruleItem}>
                            <span style={styles.rulePoints}>3 pts</span>
                            <span style={styles.ruleLabel}>Exact score</span>
                            <span style={styles.ruleExample}>e.g. You predict 2-1, Arsenal win 2-1</span>
                        </div>
                        <div style={styles.ruleDivider} />
                        <div style={styles.ruleItem}>
                            <span style={styles.rulePoints}>1 pt</span>
                            <span style={styles.ruleLabel}>Correct outcome</span>
                            <span style={styles.ruleExample}>e.g. You predict 2-1, Arsenal win 3-0</span>
                        </div>
                        <div style={styles.ruleDivider} />
                        <div style={styles.ruleItem}>
                            <span style={styles.rulePoints}>0 pts</span>
                            <span style={styles.ruleLabel}>Wrong outcome</span>
                            <span style={styles.ruleExample}>e.g. You predict Arsenal win, they draw or lose</span>
                        </div>
                    </div>
                    <div style={styles.ruleNotes}>
                        <p style={styles.ruleNote}>📅 Predictions must be submitted before kickoff</p>
                        <p style={styles.ruleNote}>🔄 You can delete and re-predict any time before kickoff</p>
                        <p style={styles.ruleNote}>🥅 Knockout matches include an optional penalty shootout prediction</p>
                    </div>
                </div>
            </section>
            <PredictionForm fixtures={fixtures} onPredictionSubmitted={loadPredictions} />
            <PredictionsSection predictions={predictions} onDelete={deletePrediction} />
        </div>
    )
}

function PredictionForm({ fixtures, onPredictionSubmitted }) {
    const [fixtureId, setFixtureId] = useState('')
    const [predHome, setPredHome] = useState('')
    const [predAway, setPredAway] = useState('')
    const [predPenHome, setPredPenHome] = useState('')
    const [predPenAway, setPredPenAway] = useState('')
    const [message, setMessage] = useState('')

    const selectedFixture = fixtures.find(f => f.id === Number(fixtureId))
    const isKnockout = selectedFixture?.isKnockout === true

    async function handleSubmit() {
        if (!fixtureId || predHome === '' || predAway === '') {
            setMessage('Please fill in all fields.')
            return
        }

        const body = {
            fixtureId: Number(fixtureId),
            predHomeScore: Number(predHome),
            predAwayScore: Number(predAway),
        }

        if (isKnockout) {
            body.predPenaltiesHome = predPenHome !== '' ? Number(predPenHome) : null
            body.predPenaltiesAway = predPenAway !== '' ? Number(predPenAway) : null
        }

        const response = await fetch(`${API_BASE}/predictions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders()
            },
            body: JSON.stringify(body)
        })

        if (response.ok) {
            setMessage('Prediction submitted!')
            setPredHome('')
            setPredAway('')
            setPredPenHome('')
            setPredPenAway('')
            setFixtureId('')
            onPredictionSubmitted()
        } else {
            const error = await response.json()
            setMessage(error.error || 'Something went wrong.')
        }
    }

    return (
        <section>
            <h2 style={styles.sectionTitle}>Submit a Prediction</h2>
            <div style={styles.form}>
                <select
                    style={styles.input}
                    value={fixtureId}
                    onChange={e => setFixtureId(e.target.value)}
                >
                    <option value="">Select a fixture...</option>
                    {fixtures.map(fixture => (
                        <option key={fixture.id} value={fixture.id}>
                            {fixture.opponent} ({fixture.matchDate})
                        </option>
                    ))}
                </select>
                <input
                    style={styles.input}
                    type="number"
                    placeholder="Arsenal score"
                    min="0"
                    value={predHome}
                    onChange={e => setPredHome(e.target.value)}
                />
                <input
                    style={styles.input}
                    type="number"
                    placeholder="Opponent score"
                    min="0"
                    value={predAway}
                    onChange={e => setPredAway(e.target.value)}
                />
                {isKnockout && (
                    <>
                        <p style={styles.cardDetail}>If you think it goes to penalties, predict the shootout score:</p>
                        <input
                            style={styles.input}
                            type="number"
                            placeholder="Arsenal penalties"
                            min="0"
                            value={predPenHome}
                            onChange={e => setPredPenHome(e.target.value)}
                        />
                        <input
                            style={styles.input}
                            type="number"
                            placeholder="Opponent penalties"
                            min="0"
                            value={predPenAway}
                            onChange={e => setPredPenAway(e.target.value)}
                        />
                    </>
                )}
                <button style={styles.primaryButton} onClick={handleSubmit}>
                    Submit Prediction
                </button>
                {message && <p style={styles.cardDetail}>{message}</p>}
            </div>
        </section>
    )
}

function PredictionsSection({ predictions, onDelete }) {
    return (
        <section>
            <h2 style={styles.sectionTitle}>My Predictions</h2>
            {predictions.length === 0 && <p>No predictions yet.</p>}
            {predictions.map(prediction => (
                <div key={prediction.id} style={{ ...styles.card, borderLeftColor: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <strong>{prediction.fixtureOpponent}</strong>
                        {prediction.pointsEarned === null && (
                            <button
                                onClick={() => onDelete(prediction.id)}
                                style={styles.deleteButton}
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                    <span style={styles.cardDetail}>
                        Predicted: {prediction.predHomeScore} - {prediction.predAwayScore}
                    </span>
                    {prediction.predPenaltiesHome !== null && (
                        <span style={styles.cardDetail}>
                            Penalties: {prediction.predPenaltiesHome} - {prediction.predPenaltiesAway}
                        </span>
                    )}
                    <span style={styles.cardDetail}>
                        Points: {prediction.pointsEarned !== null ? prediction.pointsEarned : 'Pending'}
                    </span>
                </div>
            ))}
        </section>
    )
}

function FixturesPage() {
    const [fixtures, setFixtures] = useState([])

    useEffect(() => {
        async function load() {
            const response = await fetch(`${API_BASE}/fixtures`, {
                headers: authHeaders()
            })
            const data = await response.json()
            setFixtures(data)
        }
        load()
    }, [])

    return (
        <div style={styles.mainContent}>
            <section>
                <h2 style={styles.sectionTitle}>Fixtures</h2>
                {fixtures.length === 0 && <p>No fixtures yet.</p>}
                {fixtures.map(fixture => (
                    <div key={fixture.id} style={styles.card}>
                        <strong>{fixture.opponent}</strong>
                        <span style={styles.cardDetail}>
                            {fixture.matchDate} | {fixture.venue}
                        </span>
                        <span style={styles.cardDetail}>
                            Kickoff: {fixture.matchTime ? fixture.matchTime.substring(0, 5) + ' UTC' : 'TBC'}
                        </span>
                        {fixture.isKnockout && (
                            <span style={{ ...styles.cardDetail, color: '#db0007' }}>
                                ⚔ Knockout — penalty prediction available
                            </span>
                        )}
                        <span style={styles.cardDetail}>
                            Result: {fixture.actualHomeScore !== null
                                ? `${fixture.actualHomeScore} - ${fixture.actualAwayScore}`
                                : 'Not played yet'}
                        </span>
                    </div>
                ))}
            </section>
        </div>
    )
}

function LeaderboardPage() {
    const [standings, setStandings] = useState([])
    const [selectedProfile, setSelectedProfile] = useState(null)
    const [loadingProfile, setLoadingProfile] = useState(false)

    useEffect(() => {
        async function load() {
            const response = await fetch(`${API_BASE}/leaderboard`, {
                headers: authHeaders()
            })
            const data = await response.json()
            setStandings(data)
        }
        load()
    }, [])

    async function handleUserClick(displayName) {
        setLoadingProfile(true)
        const response = await fetch(`${API_BASE}/profile/public/${displayName}`, {
            headers: authHeaders()
        })
        if (response.ok) {
            const data = await response.json()
            setSelectedProfile(data)
        }
        setLoadingProfile(false)
    }

    function closeModal() {
        setSelectedProfile(null)
    }

    function getAvatarContent(profile) {
        if (profile.profilePicture) {
            return <img src={profile.profilePicture} alt="avatar" style={styles.avatarPreviewImg} />
        }
        const display = profile.initials || profile.displayName?.substring(0, 2) || '?'
        return <span style={{ fontSize: '1.5rem' }}>{display.toUpperCase()}</span>
    }

    return (
        <div style={styles.mainContent}>
            <section>
                <h2 style={styles.sectionTitle}>Leaderboard</h2>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Rank</th>
                            <th style={styles.th}>Player</th>
                            <th style={styles.th}>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((entry, index) => (
                            <tr key={entry.displayName} style={{ cursor: 'pointer' }}
                                onClick={() => handleUserClick(entry.displayName)}>
                                <td style={styles.td}>{index + 1}</td>
                                <td style={{ ...styles.td, color: '#db0007', textDecoration: 'underline' }}>
                                    {entry.displayName}
                                </td>
                                <td style={styles.td}>{entry.totalPoints}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {standings.length === 0 && <p style={{ marginTop: '16px' }}>No standings yet.</p>}
            </section>

            {selectedProfile && (
                <div style={styles.modalOverlay} onClick={closeModal}>
                    <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
                        <div style={styles.avatarPreview}>
                            {getAvatarContent(selectedProfile)}
                        </div>
                        <h3 style={{ color: '#ffffff', fontSize: '1.2rem' }}>
                            {selectedProfile.displayName || 'Unknown'}
                        </h3>
                        {selectedProfile.bio ? (
                            <p style={styles.cardDetail}>{selectedProfile.bio}</p>
                        ) : (
                            <p style={{ ...styles.cardDetail, fontStyle: 'italic' }}>No bio yet.</p>
                        )}
                        <button style={styles.primaryButton} onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}

            {loadingProfile && (
                <div style={styles.modalOverlay}>
                    <p style={{ color: '#ffffff' }}>Loading...</p>
                </div>
            )}
        </div>
    )
}

function ProfilePage() {
    const [profile, setProfile] = useState({
        displayName: '', email: '', bio: '', profilePicture: '', initials: ''
    })
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [passwordData, setPasswordData] = useState({
        currentPassword: '', newPassword: '', confirmPassword: ''
    })
    const [passwordMessage, setPasswordMessage] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteError, setDeleteError] = useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const navigate = useNavigate()
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEffect(() => {
        loadProfile()
    }, [])

    async function loadProfile() {
        const response = await fetch(`${API_BASE}/profile`, {
            headers: authHeaders()
        })
        if (response.ok) {
            const data = await response.json()
            setProfile(data)
        }
    }

    function handleImageUpload(e) {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 200000) {
            setError('Image must be under 200KB.')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setProfile(prev => ({ ...prev, profilePicture: reader.result }))
        }
        reader.readAsDataURL(file)
    }

    async function handleProfileSave() {
        setError('')
        setMessage('')

        const response = await fetch(`${API_BASE}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({
                displayName: profile.displayName,
                email: profile.email,
                bio: profile.bio,
                profilePicture: profile.profilePicture,
                initials: profile.initials
            })
        })

        if (response.ok) {
            setMessage('Profile updated successfully.')
        } else {
            const data = await response.json()
            setError(data.error || 'Failed to update profile.')
        }
    }

    async function handlePasswordChange() {
        setPasswordError('')
        setPasswordMessage('')

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match.')
            return
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters.')
            return
        }

        const response = await fetch(`${API_BASE}/profile/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })
        })

        if (response.ok) {
            setPasswordMessage('Password changed successfully.')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } else {
            const data = await response.json()
            setPasswordError(data.error || 'Failed to change password.')
        }
    }

    async function handleDeleteAccount() {
        const response = await fetch(`${API_BASE}/profile/account`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ password: deletePassword })
        })

        if (response.ok) {
            localStorage.removeItem('token')
            navigate('/')
            window.location.reload()
        } else {
            const data = await response.json()
            setDeleteError(data.error || 'Failed to delete account.')
        }
    }

    function getAvatarPreview() {
        if (profile.profilePicture) {
            return <img src={profile.profilePicture} alt="preview" style={styles.avatarPreviewImg} />
        }
        const display = profile.initials || profile.displayName?.substring(0, 2) || '?'
        return <span style={{ fontSize: '2rem' }}>{display.toUpperCase()}</span>
    }

    return (
        <div style={styles.mainContent}>
            <section>
                <h2 style={styles.sectionTitle}>Edit Profile</h2>
                <div style={styles.form}>
                    <div style={styles.avatarSection}>
                        <div style={styles.avatarPreview}>
                            {getAvatarPreview()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={styles.uploadLabel}>
                                Upload Photo (max 200KB)
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            {profile.profilePicture && (
                                <button
                                    style={{ ...styles.primaryButton, backgroundColor: 'transparent', color: '#ff6666', border: '1px solid #ff6666' }}
                                    onClick={() => setProfile(prev => ({ ...prev, profilePicture: '' }))}
                                >
                                    Remove Photo
                                </button>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={styles.cardDetail}>Initials (shown when no photo)</label>
                                <input
                                    style={{ ...styles.input, width: '60px', textAlign: 'center', textTransform: 'uppercase' }}
                                    type="text"
                                    maxLength={2}
                                    placeholder="AB"
                                    value={profile.initials}
                                    onChange={e => setProfile(prev => ({ ...prev, initials: e.target.value.toUpperCase() }))}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={styles.cardDetail}>Username</label>
                        <input
                            style={styles.input}
                            type="text"
                            value={profile.displayName}
                            onChange={e => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={styles.cardDetail}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            value={profile.email}
                            onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={styles.cardDetail}>Bio</label>
                        <textarea
                            style={{ ...styles.input, minHeight: '80px', resize: 'vertical', fontFamily: 'Arial, sans-serif' }}
                            placeholder="Tell others a bit about yourself..."
                            value={profile.bio}
                            onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        />
                    </div>

                    <button style={styles.primaryButton} onClick={handleProfileSave}>
                        Save Changes
                    </button>
                    {message && <p style={{ ...styles.errorText, color: '#66cc66' }}>{message}</p>}
                    {error && <p style={styles.errorText}>{error}</p>}
                </div>
            </section>

            <section>
                <h2 style={styles.sectionTitle}>Change Password</h2>
                <div style={styles.form}>
                    <div style={styles.passwordWrapper}>
                        <input
                            style={{ ...styles.input, width: '100%', paddingRight: '40px' }}
                            type={showCurrentPassword ? 'text' : 'password'}
                            placeholder="Current password"
                            value={passwordData.currentPassword}
                            onChange={e => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        />
                        <button style={styles.eyeButton} onClick={() => setShowCurrentPassword(!showCurrentPassword)} type="button">
                            {showCurrentPassword ? '🙈' : '👁'}
                        </button>
                    </div>

                    <div style={styles.passwordWrapper}>
                        <input
                            style={{ ...styles.input, width: '100%', paddingRight: '40px' }}
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="New password (min 6 characters)"
                            value={passwordData.newPassword}
                            onChange={e => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                        <button style={styles.eyeButton} onClick={() => setShowNewPassword(!showNewPassword)} type="button">
                            {showNewPassword ? '🙈' : '👁'}
                        </button>
                    </div>

                    <div style={styles.passwordWrapper}>
                        <input
                            style={{ ...styles.input, width: '100%', paddingRight: '40px' }}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={passwordData.confirmPassword}
                            onChange={e => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                        <button style={styles.eyeButton} onClick={() => setShowConfirmPassword(!showConfirmPassword)} type="button">
                            {showConfirmPassword ? '🙈' : '👁'}
                        </button>
                    </div>
                    <button style={styles.primaryButton} onClick={handlePasswordChange}>
                        Change Password
                    </button>
                    {passwordMessage && <p style={{ ...styles.errorText, color: '#66cc66' }}>{passwordMessage}</p>}
                    {passwordError && <p style={styles.errorText}>{passwordError}</p>}
                </div>
            </section>

            <section>
                <h2 style={{ ...styles.sectionTitle, color: '#ff4444', borderBottomColor: '#ff4444' }}>
                    Danger Zone
                </h2>
                <div style={{ ...styles.form, borderLeft: '4px solid #ff4444' }}>
                    <p style={styles.cardDetail}>
                        Deleting your account is permanent. All your predictions and points will be lost.
                    </p>
                    {!showDeleteConfirm ? (
                        <button
                            style={{ ...styles.primaryButton, backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444' }}
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            Delete My Account
                        </button>
                    ) : (
                        <>
                            <p style={{ ...styles.cardDetail, color: '#ff4444' }}>
                                Enter your password to confirm deletion:
                            </p>
                            <input
                                style={styles.input}
                                type="password"
                                placeholder="Your password"
                                value={deletePassword}
                                onChange={e => setDeletePassword(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    style={{ ...styles.primaryButton, backgroundColor: '#ff4444' }}
                                    onClick={handleDeleteAccount}
                                >
                                    Confirm Delete
                                </button>
                                <button
                                    style={{ ...styles.primaryButton, backgroundColor: 'transparent', color: '#aaaaaa', border: '1px solid #444444' }}
                                    onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError('') }}
                                >
                                    Cancel
                                </button>
                            </div>
                            {deleteError && <p style={styles.errorText}>{deleteError}</p>}
                        </>
                    )}
                </div>
            </section>
        </div>
    )
}

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function StatsPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function load() {
            const response = await fetch(`${API_BASE}/stats`, {
                headers: authHeaders()
            })
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            } else {
                setError('Failed to load stats.')
            }
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return <div style={styles.mainContent}><p style={styles.cardDetail}>Loading stats...</p></div>
    if (error) return <div style={styles.mainContent}><p style={styles.errorText}>{error}</p></div>
    if (!stats) return null

    const { total, home, away, season } = stats

    const formPills = total.form
        ? total.form.split(',').map((r, i) => (
            <span key={i} style={{
                ...styles.formPill,
                backgroundColor: r === 'W' ? '#2d7a2d' : r === 'D' ? '#555555' : '#7a2d2d'
            }}>
                {r}
            </span>
        ))
        : <span style={styles.cardDetail}>No form data yet</span>

    const barData = [
        { name: 'Goals Scored', value: total.goalsFor, fill: '#db0007' },
        { name: 'Goals Conceded', value: total.goalsAgainst, fill: '#444444' },
        { name: 'Goal Difference', value: total.goalDifference, fill: '#9b0005' },
    ]

    const recordData = [
        { name: 'Wins', Total: total.won, Home: home.won, Away: away.won },
        { name: 'Draws', Total: total.draw, Home: home.draw, Away: away.draw },
        { name: 'Losses', Total: total.lost, Home: home.lost, Away: away.lost },
    ]

    const pointsData = [
        { name: 'Home', points: home.points },
        { name: 'Away', points: away.points },
        { name: 'Total', points: total.points },
    ]

    return (
        <div style={styles.mainContent}>
            <section>
                <h2 style={styles.sectionTitle}>Season {season} — Overview</h2>
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <span style={styles.statValue}>{total.position}</span>
                        <span style={styles.statLabel}>League Position</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statValue}>{total.points}</span>
                        <span style={styles.statLabel}>Points</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statValue}>{total.playedGames}</span>
                        <span style={styles.statLabel}>Played</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statValue}>{total.won}</span>
                        <span style={styles.statLabel}>Wins</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statValue}>{total.draw}</span>
                        <span style={styles.statLabel}>Draws</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statValue}>{total.lost}</span>
                        <span style={styles.statLabel}>Losses</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statValue}>{total.goalsFor}</span>
                        <span style={styles.statLabel}>Goals Scored</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statValue}>{total.goalsAgainst}</span>
                        <span style={styles.statLabel}>Goals Conceded</span>
                    </div>
                    <div style={styles.statCard}>
                        <span style={styles.statValue}>+{total.goalDifference}</span>
                        <span style={styles.statLabel}>Goal Difference</span>
                    </div>
                </div>
            </section>

            <section>
                <h2 style={styles.sectionTitle}>Recent Form</h2>
                <div style={styles.card}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {formPills}
                    </div>
                    <span style={{ ...styles.cardDetail, marginTop: '8px' }}>Last 5 Premier League matches</span>
                </div>
            </section>

            <section>
                <h2 style={styles.sectionTitle}>Home vs Away</h2>
                <div style={styles.homeAwayGrid}>
                    <div style={styles.homeAwayCard}>
                        <h3 style={styles.homeAwayTitle}>🏠 Home</h3>
                        <div style={styles.homeAwayStat}><span style={styles.statValue}>{home.won}</span><span style={styles.cardDetail}>Wins</span></div>
                        <div style={styles.homeAwayStat}><span style={styles.statValue}>{home.draw}</span><span style={styles.cardDetail}>Draws</span></div>
                        <div style={styles.homeAwayStat}><span style={styles.statValue}>{home.lost}</span><span style={styles.cardDetail}>Losses</span></div>
                        <div style={styles.homeAwayStat}><span style={styles.statValue}>{home.goalsFor}</span><span style={styles.cardDetail}>Goals Scored</span></div>
                        <div style={styles.homeAwayStat}><span style={styles.statValue}>{home.goalsAgainst}</span><span style={styles.cardDetail}>Goals Conceded</span></div>
                        <div style={styles.homeAwayStat}><span style={styles.statValue}>{home.points}</span><span style={styles.cardDetail}>Points</span></div>
                    </div>
                    <div style={styles.homeAwayCard}>
                        <h3 style={styles.homeAwayTitle}>✈️ Away</h3>
                        <div style={styles.homeAwayStat}><span style={styles.statValue}>{away.won}</span><span style={styles.cardDetail}>Wins</span></div>
                        <div style={styles.homeAwayStat}><span style={styles.statValue}>{away.draw}</span><span style={styles.cardDetail}>Draws</span></div>
                        <div style={styles.homeAwayStat}><span style={styles.statValue}>{away.lost}</span><span style={styles.cardDetail}>Losses</span></div>
                        <div style={styles.homeAwayStat}><span style={styles.statValue}>{away.goalsFor}</span><span style={styles.cardDetail}>Goals Scored</span></div>
                        <div style={styles.homeAwayStat}><span style={styles.statValue}>{away.goalsAgainst}</span><span style={styles.cardDetail}>Goals Conceded</span></div>
                        <div style={styles.homeAwayStat}><span style={styles.statValue}>{away.points}</span><span style={styles.cardDetail}>Points</span></div>
                    </div>
                </div>
            </section>

            <section>
                <h2 style={styles.sectionTitle}>Goals Breakdown</h2>
                <div style={styles.card}>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                            <XAxis dataKey="name" tick={{ fill: '#aaaaaa', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#aaaaaa', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {barData.map((entry, index) => (
                                    <Cell key={index} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section>
                <h2 style={styles.sectionTitle}>Win / Draw / Loss Breakdown</h2>
                <div style={styles.card}>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={recordData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                            <XAxis dataKey="name" tick={{ fill: '#aaaaaa', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#aaaaaa', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff' }}
                            />
                            <Bar dataKey="Total" fill="#db0007" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Home" fill="#9b0005" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Away" fill="#444444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section>
                <h2 style={styles.sectionTitle}>Points — Home vs Away</h2>
                <div style={styles.card}>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={pointsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                            <XAxis dataKey="name" tick={{ fill: '#aaaaaa', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#aaaaaa', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444', color: '#fff' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="points"
                                stroke="#db0007"
                                strokeWidth={2}
                                dot={{ fill: '#db0007', r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    )
}

function MainApp({ onLogout }) {
    return (
        <BrowserRouter>
            <AppHeader onLogout={onLogout} />
            <Routes>
                <Route path="/" element={<PredictionsPage />} />
                <Route path="/fixtures" element={<FixturesPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!getToken())

    function handleLoginSuccess() {
        setIsLoggedIn(true)
    }

    function handleLogout() {
        localStorage.removeItem('token')
        setIsLoggedIn(false)
    }

    if (!isLoggedIn) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />
    }

    return <MainApp onLogout={handleLogout} />
}

const styles = {
    header: {
        backgroundColor: '#9b0005',
        padding: '20px 40px',
        borderBottom: '4px solid #ffffff',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: '2rem',
        color: '#ffffff',
    },
    headerSubtitle: {
        color: '#ffcccc',
        marginTop: '4px',
    },
    nav: {
        backgroundColor: '#111111',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '1px solid #2a2a2a',
    },
    navLink: {
        padding: '14px 16px',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'color 0.2s',
    },
    loginWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 100px)',
    },
    loginBox: {
        backgroundColor: '#1a1a1a',
        padding: '40px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '400px',
    },
    sectionTitle: {
        color: '#db0007',
        fontSize: '1.4rem',
        borderBottom: '2px solid #db0007',
        paddingBottom: '8px',
        marginBottom: '16px',
    },
    input: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #444444',
        backgroundColor: '#2a2a2a',
        color: '#ffffff',
        fontSize: '1rem',
    },
    primaryButton: {
        padding: '10px 20px',
        backgroundColor: '#9b0005',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        width: 'fit-content',
    },
    errorText: {
        color: '#ff6666',
        fontSize: '0.9rem',
    },
    mainContent: {
        maxWidth: '800px',
        margin: '40px auto',
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderLeft: '4px solid #db0007',
        padding: '14px 18px',
        borderRadius: '6px',
        marginBottom: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    cardDetail: {
        fontSize: '0.9rem',
        color: '#aaaaaa',
    },
    form: {
        backgroundColor: '#1a1a1a',
        padding: '20px',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '12px 16px',
        textAlign: 'left',
        borderBottom: '1px solid #2a2a2a',
        color: '#db0007',
        fontSize: '0.9rem',
        textTransform: 'uppercase',
    },
    td: {
        padding: '12px 16px',
        textAlign: 'left',
        borderBottom: '1px solid #2a2a2a',
    },
    logoutButton: {
        padding: '4px 12px',
        backgroundColor: 'transparent',
        color: '#ffffff',
        border: '1px solid #ffffff',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.75rem',
    },
    loginWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 100px)',
        gap: '60px',
        padding: '40px',
        maxWidth: '1000px',
        margin: '0 auto',
    },
    loginLeft: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    loginTagline: {
        fontSize: '1.8rem',
        color: '#ffffff',
        lineHeight: '1.3',
    },
    loginDescription: {
        color: '#aaaaaa',
        fontSize: '1rem',
        lineHeight: '1.7',
    },
    loginFeatures: {
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        color: '#cccccc',
        fontSize: '0.95rem',
        lineHeight: '1.5',
    },
    loginBox: {
        backgroundColor: '#1a1a1a',
        padding: '40px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '380px',
        flexShrink: 0,
    },
    passwordWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    eyeButton: {
        position: 'absolute',
        right: '10px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        padding: '0',
        color: '#aaaaaa',
    },
    deleteButton: {
        padding: '4px 8px',
        backgroundColor: 'transparent',
        color: '#000000',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1.1rem',
    },
    rulesCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: '6px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    rulesGrid: {
        display: 'flex',
        alignItems: 'center',
        gap: '0',
    },
    ruleItem: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        textAlign: 'center',
        padding: '0 16px',
    },
    ruleDivider: {
        width: '1px',
        height: '60px',
        backgroundColor: '#2a2a2a',
        flexShrink: 0,
    },
    rulePoints: {
        fontSize: '1.6rem',
        fontWeight: 'bold',
        color: '#db0007',
    },
    ruleLabel: {
        fontSize: '0.95rem',
        color: '#ffffff',
        fontWeight: '500',
    },
    ruleExample: {
        fontSize: '0.8rem',
        color: '#777777',
    },
    ruleNotes: {
        borderTop: '1px solid #2a2a2a',
        paddingTop: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    ruleNote: {
        fontSize: '0.85rem',
        color: '#aaaaaa',
    },
    headerLeft: {
        display: 'flex',
        flexDirection: 'column',
    },
    headerRight: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
    },
    avatar: {
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        backgroundColor: '#db0007',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        cursor: 'pointer',
        border: '2px solid #ffffff',
        overflow: 'hidden',
        flexShrink: 0,
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    avatarSection: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '20px',
    },
    avatarPreview: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#db0007',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        border: '2px solid #444444',
        overflow: 'hidden',
        flexShrink: 0,
    },
    avatarPreviewImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    uploadLabel: {
        padding: '8px 16px',
        backgroundColor: '#2a2a2a',
        color: '#ffffff',
        border: '1px solid #444444',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        textAlign: 'center',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalBox: {
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        width: '100%',
        maxWidth: '340px',
        border: '1px solid #2a2a2a',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
    },
    statCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: '6px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        border: '1px solid #2a2a2a',
    },
    statValue: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#db0007',
    },
    statLabel: {
        fontSize: '0.8rem',
        color: '#aaaaaa',
        textAlign: 'center',
    },
    formPill: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '0.85rem',
        color: '#ffffff',
    },
    homeAwayGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    homeAwayCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: '6px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        border: '1px solid #2a2a2a',
    },
    homeAwayTitle: {
        color: '#ffffff',
        fontSize: '1rem',
        marginBottom: '4px',
    },
    homeAwayStat: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #2a2a2a',
        paddingBottom: '8px',
    },
}