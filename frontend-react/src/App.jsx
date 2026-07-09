import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'

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
                <h1 style={styles.headerTitle}>⚽ Arsenal Tracker</h1>
                <p style={styles.headerSubtitle}>Predict the scores. Earn the points.</p>
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

function NavBar({ onLogout }) {
    const navLinkStyle = ({ isActive }) => ({
        ...styles.navLink,
        color: isActive ? '#ffffff' : '#aaaaaa',
        borderBottom: isActive ? '2px solid #db0007' : '2px solid transparent',
    })

    return (
        <nav style={styles.nav}>
            <NavLink to="/" end style={navLinkStyle}>Predictions</NavLink>
            <NavLink to="/fixtures" style={navLinkStyle}>Fixtures</NavLink>
            <NavLink to="/leaderboard" style={navLinkStyle}>Leaderboard</NavLink>
            <button style={styles.logoutButton} onClick={onLogout}>Logout</button>
        </nav>
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
                            <tr key={entry.email}>
                                <td style={styles.td}>{index + 1}</td>
                                <td style={styles.td}>{entry.email}</td>
                                <td style={styles.td}>{entry.totalPoints}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {standings.length === 0 && <p style={{ marginTop: '16px' }}>No standings yet.</p>}
            </section>
        </div>
    )
}

function MainApp({ onLogout }) {
    return (
        <BrowserRouter>
            <header style={styles.header}>
                <h1 style={styles.headerTitle}>⚽ Arsenal Tracker</h1>
                <p style={styles.headerSubtitle}>Predict the scores. Earn the points.</p>
            </header>
            <NavBar onLogout={onLogout} />
            <Routes>
                <Route path="/" element={<PredictionsPage />} />
                <Route path="/fixtures" element={<FixturesPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
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
        marginLeft: 'auto',
        padding: '8px 16px',
        backgroundColor: 'transparent',
        color: '#aaaaaa',
        border: '1px solid #444444',
        borderRadius: '4px',
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
}