import { useState, useRef, useEffect } from 'react'
import api from '../utils/api'

const PIN_COLORS = {
  manual: '#44ff88',
  ai: '#ff6b5a',
  system: '#888',
  location: '#c8d8ff',
}

export default function MapPinEditor({ mapKey, mapUrl, locations, events, onUpdate, showSuccess }) {
  const mapRef = useRef(null)
  const [dragging, setDragging] = useState(null)
  const [selected, setSelected] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [addingType, setAddingType] = useState(null)

  const getPinPos = (e) => {
    const rect = mapRef.current.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
  }

  const handleMapClick = async (e) => {
    if (dragging) return
    if (!addingType) return
    const { x, y } = getPinPos(e)
    try {
      if (addingType === 'location') {
        const res = await api.post('/api/world/locations', { name: 'New Location', description: '', x_percent: x, y_percent: y, type: 'city' })
        onUpdate('location_add', res.data)
        setSelected(res.data)
        setSelectedType('location')
        setForm({ name: res.data.name, description: res.data.description || '', biography: res.data.biography || '', type: res.data.type, x_percent: x, y_percent: y })
        showSuccess('Location added! Edit details on the right.')
      } else if (addingType === 'event') {
        const res = await api.post('/api/world/events', { headline: 'New Event', summary: '', location_name: '', x_percent: x, y_percent: y, source_type: 'manual' })
        onUpdate('event_add', res.data)
        setSelected(res.data)
        setSelectedType('event')
        setForm({ headline: res.data.headline, summary: res.data.summary || '', location_name: res.data.location_name || '', x_percent: x, y_percent: y, source_type: res.data.source_type })
        showSuccess('Event added! Edit details on the right.')
      }
      setAddingType(null)
    } catch (err) { console.error(err) }
  }

  const handlePinMouseDown = (e, item, type) => {
    e.stopPropagation()
    setSelected(item)
    setSelectedType(type)
    if (type === 'location') {
      setForm({ name: item.name, description: item.description || '', biography: item.biography || '', type: item.type, x_percent: item.x_percent, y_percent: item.y_percent })
    } else {
      setForm({ headline: item.headline, summary: item.summary || '', location_name: item.location_name || '', x_percent: item.x_percent, y_percent: item.y_percent, source_type: item.source_type })
    }
    setDragging({ id: item.id, type })
  }

  const handleMouseMove = (e) => {
    if (!dragging) return
    const { x, y } = getPinPos(e)
    if (dragging.type === 'location') {
      onUpdate('location_move', { id: dragging.id, x_percent: x, y_percent: y })
    } else {
      onUpdate('event_move', { id: dragging.id, x_percent: x, y_percent: y })
    }
    setForm(p => ({ ...p, x_percent: x, y_percent: y }))
  }

  const handleMouseUp = async (e) => {
    if (!dragging) return
    const { x, y } = getPinPos(e)
    try {
      if (dragging.type === 'location') {
        await api.put(`/api/world/locations/${dragging.id}`, { x_percent: x, y_percent: y })
      } else {
        await api.put(`/api/world/events/${dragging.id}`, { x_percent: x, y_percent: y })
      }
    } catch (err) { console.error(err) }
    setDragging(null)
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    try {
      if (selectedType === 'location') {
        const res = await api.put(`/api/world/locations/${selected.id}`, form)
        onUpdate('location_update', res.data)
        showSuccess('Location saved!')
      } else {
        const res = await api.put(`/api/world/events/${selected.id}`, form)
        onUpdate('event_update', res.data)
        showSuccess('Event saved!')
      }
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!selected) return
    try {
      if (selectedType === 'location') {
        await api.delete(`/api/world/locations/${selected.id}`)
        onUpdate('location_delete', { id: selected.id })
      } else {
        await api.delete(`/api/world/events/${selected.id}`)
        onUpdate('event_delete', { id: selected.id })
      }
      setSelected(null)
      setForm({})
      showSuccess('Deleted!')
    } catch (err) { console.error(err) }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        if (selectedType === 'location') {
          const res = await api.post(`/api/world/locations/${selected.id}/image`, { image: reader.result })
          onUpdate('location_update', { ...selected, image_url: res.data.url })
          showSuccess('Image uploaded!')
        } else {
          const res = await api.post(`/api/world/events/${selected.id}/image`, { image: reader.result })
          onUpdate('event_update', { ...selected, image_url: res.data.url })
          showSuccess('Image uploaded!')
        }
      } catch (err) { console.error(err) }
    }
    reader.readAsDataURL(file)
  }

  const s = {
    wrap: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem', height: '500px' },
    mapWrap: { position: 'relative', background: '#050510', border: '1px solid #1a1a2e', overflow: 'hidden', cursor: addingType ? 'crosshair' : 'default', userSelect: 'none' },
    mapImg: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, pointerEvents: 'none' },
    pin: { position: 'absolute', transform: 'translate(-50%, -50%)', cursor: 'grab', zIndex: 10 },
    pinDot: { width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)' },
    panel: { background: '#0a0a12', border: '1px solid #1a1a2e', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    label: { fontFamily: 'monospace', fontSize: '0.6rem', color: '#888', letterSpacing: '0.2em', marginBottom: '0.2rem' },
    input: { background: '#050510', border: '1px solid #1a1a2e', color: '#e8e8e0', fontFamily: 'monospace', fontSize: '0.8rem', padding: '0.4rem 0.6rem', outline: 'none', width: '100%' },
    btn: { background: 'transparent', border: '1px solid #4fc3f7', color: '#4fc3f7', fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.15em', padding: '0.35rem 0.75rem', cursor: 'pointer' },
    dangerBtn: { background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.15em', padding: '0.35rem 0.75rem', cursor: 'pointer' },
    addBtn: (active) => ({ background: active ? 'rgba(79,195,247,0.15)' : 'transparent', border: `1px solid ${active ? '#4fc3f7' : '#333'}`, color: active ? '#4fc3f7' : '#888', fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.15em', padding: '0.3rem 0.65rem', cursor: 'pointer' }),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#888', letterSpacing: '0.2em' }}>ADD:</p>
        <button style={s.addBtn(addingType === 'location')} onClick={() => setAddingType(addingType === 'location' ? null : 'location')}>+ LOCATION PIN</button>
        <button style={s.addBtn(addingType === 'event')} onClick={() => setAddingType(addingType === 'event' ? null : 'event')}>+ EVENT PIN</button>
        {addingType && <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: '#4fc3f7', letterSpacing: '0.1em' }}>Click on map to place</p>}
      </div>

      <div style={s.wrap}>
        <div
          ref={mapRef}
          style={s.mapWrap}
          onClick={handleMapClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setDragging(null)}
        >
          {mapUrl
            ? <img src={mapUrl} alt="map" style={s.mapImg} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#333' }}>NO MAP IMAGE — Upload one above</p></div>
          }

          {locations.map(loc => (
            <div
              key={`loc-${loc.id}`}
              style={{ ...s.pin, left: `${loc.x_percent}%`, top: `${loc.y_percent}%`, zIndex: selected?.id === loc.id && selectedType === 'location' ? 20 : 10 }}
              onMouseDown={e => handlePinMouseDown(e, loc, 'location')}
            >
              <div style={{ ...s.pinDot, background: selected?.id === loc.id && selectedType === 'location' ? '#fff' : PIN_COLORS.location, boxShadow: selected?.id === loc.id ? '0 0 8px rgba(200,216,255,0.8)' : 'none' }} />
              <p style={{ position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)', fontFamily: 'monospace', fontSize: '0.45rem', color: 'rgba(200,216,255,0.7)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>{loc.name}</p>
            </div>
          ))}

          {events.map(ev => (
            <div
              key={`ev-${ev.id}`}
              style={{ ...s.pin, left: `${ev.x_percent}%`, top: `${ev.y_percent}%`, zIndex: selected?.id === ev.id && selectedType === 'event' ? 20 : 10 }}
              onMouseDown={e => handlePinMouseDown(e, ev, 'event')}
            >
              <div style={{ ...s.pinDot, background: selected?.id === ev.id && selectedType === 'event' ? '#fff' : PIN_COLORS[ev.source_type] || PIN_COLORS.manual, boxShadow: selected?.id === ev.id ? '0 0 8px rgba(68,255,136,0.8)' : 'none', borderRadius: '2px', transform: 'rotate(45deg)' }} />
            </div>
          ))}
        </div>

        <div style={s.panel}>
          {!selected && (
            <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#444', letterSpacing: '0.1em', marginTop: '1rem', textAlign: 'center' }}>// Click a pin to edit</p>
          )}
          {selected && selectedType === 'location' && (
            <>
              <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#c8d8ff', letterSpacing: '0.2em' }}>LOCATION</p>
              <div><p style={s.label}>NAME</p><input style={s.input} value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><p style={s.label}>DESCRIPTION</p><input style={s.input} value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div><p style={s.label}>BIOGRAPHY</p><textarea style={{ ...s.input, resize: 'vertical' }} rows={3} value={form.biography || ''} onChange={e => setForm(p => ({ ...p, biography: e.target.value }))} /></div>
              <div><p style={s.label}>TYPE</p>
                <select style={s.input} value={form.type || 'city'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {['city', 'landmark', 'ruin', 'dungeon', 'fortress', 'village'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><p style={s.label}>IMAGE</p><input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#888', cursor: 'pointer' }} /></div>
              <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: '#555' }}>x:{form.x_percent} y:{form.y_percent}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button style={s.btn} onClick={handleSave} disabled={saving}>{saving ? 'SAVING...' : 'SAVE'}</button>
                <button style={s.dangerBtn} onClick={handleDelete}>DELETE</button>
              </div>
            </>
          )}
          {selected && selectedType === 'event' && (
            <>
              <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#44ff88', letterSpacing: '0.2em' }}>EVENT</p>
              <div><p style={s.label}>HEADLINE</p><input style={s.input} value={form.headline || ''} onChange={e => setForm(p => ({ ...p, headline: e.target.value }))} /></div>
              <div><p style={s.label}>SUMMARY</p><textarea style={{ ...s.input, resize: 'vertical' }} rows={3} value={form.summary || ''} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} /></div>
              <div><p style={s.label}>LOCATION NAME</p><input style={s.input} value={form.location_name || ''} onChange={e => setForm(p => ({ ...p, location_name: e.target.value }))} /></div>
              <div><p style={s.label}>SOURCE TYPE</p>
                <select style={s.input} value={form.source_type || 'manual'} onChange={e => setForm(p => ({ ...p, source_type: e.target.value }))}>
                  <option value="manual">Manual (Canon)</option>
                  <option value="ai">AI (Ambient)</option>
                </select>
              </div>
              <div><p style={s.label}>IMAGE</p><input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#888', cursor: 'pointer' }} /></div>
              <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: '#555' }}>x:{form.x_percent} y:{form.y_percent}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button style={s.btn} onClick={handleSave} disabled={saving}>{saving ? 'SAVING...' : 'SAVE'}</button>
                <button style={s.dangerBtn} onClick={handleDelete}>DELETE</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}