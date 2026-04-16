import { useEffect, useMemo, useRef, useState } from 'react'

const venueAddress = 'Silica Events Place, 6th Floor, Kaija Building, 7836 Makati Avenue corner B. Valdez, Poblacion, Makati City'
const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
const heroImagePath = `${import.meta.env.BASE_URL}wedding.jpg`

function loadGoogleMapsApi(key) {
  return new Promise((resolve, reject) => {
    const fail = () => reject(new Error('Google Maps failed to load. Check your API key and network.'))

    if (window.google?.maps) {
      resolve(window.google.maps)
      return
    }

    const existingScript = document.querySelector('script[data-google-maps-api]')
    if (existingScript) {
      if (window.google?.maps) {
        resolve(window.google.maps)
        return
      }

      if (existingScript.dataset.loaded === 'true') {
        fail()
        return
      }

      existingScript.addEventListener('load', () => {
        if (window.google?.maps) resolve(window.google.maps)
        else fail()
      })
      existingScript.addEventListener('error', fail)
      return
    }

    const callbackName = '__reactGoogleMapsApiCallback'
    window[callbackName] = () => {
      if (window.google?.maps) {
        resolve(window.google.maps)
      } else {
        fail()
      }
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=${callbackName}`
    script.async = true
    script.defer = true
    script.dataset.googleMapsApi = 'true'
    script.dataset.loaded = 'false'
    script.onerror = () => fail()
    script.onload = () => {
      script.dataset.loaded = 'true'
    }
    document.head.appendChild(script)
  })
}

function MapSection({ address }) {
  const mapRef = useRef(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!googleMapsKey || googleMapsKey === 'YOUR_API_KEY_HERE') {
      setStatus('fallback')
      return
    }

    loadGoogleMapsApi(googleMapsKey)
      .then((maps) => {
        const geocoder = new maps.Geocoder()
        geocoder.geocode({ address }, (results, statusCode) => {
          if (statusCode !== 'OK' || !results?.length) {
            setError('Unable to locate the venue on Google Maps.')
            setStatus('error')
            return
          }

          const location = results[0].geometry.location
          const map = new maps.Map(mapRef.current, {
            center: location,
            zoom: 16,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            gestureHandling: 'greedy'
          })

          const marker = new maps.Marker({
            map,
            position: location,
            title: address
          })

          const infoWindow = new maps.InfoWindow({
            content: `<div class="map-info"><strong>Wedding Venue</strong><p>${address}</p></div>`
          })
          infoWindow.open({ anchor: marker, map })
          setStatus('ready')
        })
      })
      .catch((err) => {
        setError(err.message)
        setStatus('error')
      })
  }, [address])

  const fallbackMapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`

  return (
    <section className="map-section">
      <div className="map-frame">
        {status === 'loading' && <div className="map-placeholder">Loading map…</div>}
        {status === 'error' && <div className="map-placeholder map-error">{error}</div>}
        {status === 'fallback' && (
          <iframe
            title="Venue map"
            src={fallbackMapUrl}
            className="map-canvas"
            loading="lazy"
          />
        )}
        {status !== 'fallback' && <div ref={mapRef} className="map-canvas" />}
      </div>
    </section>
  )
}

function App() {
  const [guests, setGuests] = useState(0)
  const [attend, setAttend] = useState('Yes')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [guestNames, setGuestNames] = useState([])
  const [feedback, setFeedback] = useState(null)

  const guestInputs = useMemo(() => Array.from({ length: guests }, (_, index) => index + 1), [guests])

  useEffect(() => {
    setGuestNames((prev) => Array.from({ length: guests }, (_, index) => prev[index] || ''))
  }, [guests])

  function handleGuestNameChange(index, value) {
    setGuestNames((current) => {
      const next = [...current]
      next[index] = value
      return next
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!name.trim()) {
      setFeedback({ type: 'error', text: 'Please enter your full name.' })
      return
    }

    if (guests < 0 || guests > 10) {
      setFeedback({ type: 'error', text: 'Guests must be between 0 and 10.' })
      return
    }

    for (let i = 0; i < guests; i += 1) {
      if (!guestNames[i]?.trim()) {
        setFeedback({ type: 'error', text: `Please provide the name for Guest ${i + 1}.` })
        return
      }
    }

    setFeedback({
      type: 'success',
      text: `Thank you, ${name}! Your RSVP has been recorded. We look forward to seeing you.`
    })

    console.log('RSVP Submission:', {
      name,
      guests,
      attend,
      guestNames,
      message,
      venueAddress,
      submittedAt: new Date().toISOString()
    })

    setName('')
    setGuests(0)
    setAttend('Yes')
    setGuestNames([])
    setMessage('')
  }

  return (
    <div className="page-wrapper">
      <header className="top-banner">
        <p>You're Invited!</p>
      </header>

      <main className="invitation-card">
        <section className="hero">
          <p className="small-text">Please join us for the celebration of</p>
          <h1 className="couple-names">Sadie & Caleb</h1>
          <p className="tagline">Love, laughter, and happily ever after</p>
        </section>

        <div className="hero-image-wrapper">
          <img
            src={heroImagePath}
            alt="Wedding couple at the beach"
            className="hero-image"
          />
        </div>

        <section className="details">
          <div className="detail-item">
            <h3>Wedding Date & Time</h3>
            <p>Saturday, June 14, 2026 · 4:30 PM</p>
          </div>

          <div className="detail-item">
            <h3>Venue</h3>
            <p>{venueAddress}</p>
          </div>

          <div className="detail-item">
            <h3>Dress Code</h3>
            <p>Semi-Formal</p>
          </div>
        </section>

        <MapSection address={venueAddress} />

        <section className="welcome-message">
          <p>
            We’re excited to share this moment with you. Join us for a chill, intimate evening filled with good food, music, and meaningful connections.
          </p>
        </section>

        <section className="rsvp-section">
          <h2>RSVP</h2>
          <form onSubmit={handleSubmit} className="rsvp-form" autoComplete="off">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              required
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <label htmlFor="guests">Number of Guests</label>
            <input
              id="guests"
              name="guests"
              type="number"
              min="0"
              max="10"
              value={guests}
              onChange={(event) => setGuests(Math.max(0, Math.min(10, Number(event.target.value))))}
            />

            <div id="guestDetailsContainer" className="guest-details">
              {guestInputs.map((index) => (
                <div key={index} className="guest-row">
                  <label htmlFor={`guestName${index}`}>{`Guest ${index} Name`}</label>
                  <input
                    type="text"
                    id={`guestName${index}`}
                    name={`guestName${index}`}
                    placeholder={`Guest ${index} name`}
                    required
                    value={guestNames[index - 1] || ''}
                    onChange={(event) => handleGuestNameChange(index - 1, event.target.value)}
                  />
                </div>
              ))}
            </div>

            <label>Will you attend?</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="attend"
                  value="Yes"
                  checked={attend === 'Yes'}
                  onChange={() => setAttend('Yes')}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="attend"
                  value="No"
                  checked={attend === 'No'}
                  onChange={() => setAttend('No')}
                />
                No
              </label>
            </div>

            <label htmlFor="message">Message for the Newlyweds</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              placeholder="Drop your wishes for us!"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />

            <button type="submit" className="btn-primary">Submit RSVP</button>
          </form>

          <div id="feedback" className={`feedback ${feedback?.type || ''}`} aria-live="polite">
            {feedback?.text}
          </div>
        </section>
      </main>

      <footer className="footer-note">
        <p>Thank you for being part of our story. We can’t wait to see you!</p>
      </footer>
    </div>
  )
}

export default App
