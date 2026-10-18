import { useEffect, useRef, useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/equipments';
const statuses = { Available: 'Disponible', Assigned: 'Asignado', Maintenance: 'En mantenimiento' };
const emptyForm = { serialNumber: '', model: '', category: 'Laptop', status: 'Available' };
function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    laptop: <><rect x="5" y="4" width="14" height="12" rx="2"/><path d="M2 20h20l-3-4H5z"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
    tool: <><path d="m14 7 3 3 4-4a7 7 0 0 1-9 9l-6 6-3-3 6-6a7 7 0 0 1 9-9z"/></>,
    trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5 8a8 8 0 0 1 13-3l2 3M4 16l2 3a8 8 0 0 0 13-3"/></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.laptop}</svg>;
}
async function request(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'No se pudo completar la operación.');
  return data;
}
export default function App() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const createDialog = useRef(null);
  const deleteDialog = useRef(null);
  async function load() {
    setLoading(true); setError('');
    try {
      const data = await request(API_URL);
      if (!Array.isArray(data)) throw new Error('La respuesta del inventario no es válida.');
      setEquipments(data);
    } catch (err) { setError(err instanceof TypeError ? 'No pudimos conectar con el servidor. Comprueba que esté encendido e intenta de nuevo.' : err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  function openCreate() { setForm(emptyForm); setNotice(''); createDialog.current.showModal(); }
  async function createEquipment(event) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const item = await request(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, serialNumber: form.serialNumber.trim(), model: form.model.trim() }) });
      setEquipments(items => [item, ...items]); createDialog.current.close(); setNotice('Equipo agregado correctamente.');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function removeEquipment() {
    setDeleting(true); setError('');
    try {
      await request(`${API_URL}/${pendingDelete.id}`, { method: 'DELETE' });
      setEquipments(items => items.filter(item => item.id !== pendingDelete.id));
      deleteDialog.current.close(); setNotice('Equipo eliminado correctamente.');
    } catch (err) { setError(err.message); }
    finally { setDeleting(false); }
  }
  const visible = equipments.filter(item => (filter === 'all' || item.status === filter) && `${item.model} ${item.serialNumber} ${item.category}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const stats = [
    { title: 'Total de equipos', value: equipments.length, icon: 'laptop', tone: 'blue', caption: 'Activos en tu inventario' },
    { title: 'Disponibles', value: equipments.filter(x => x.status === 'Available').length, icon: 'check', tone: 'green', caption: 'Listos para asignar' },
    { title: 'Asignados', value: equipments.filter(x => x.status === 'Assigned').length, icon: 'user', tone: 'violet', caption: 'Actualmente en uso' },
    { title: 'En mantenimiento', value: equipments.filter(x => x.status === 'Maintenance').length, icon: 'tool', tone: 'amber', caption: 'En revisión o reparación' },
  ];
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#"><span className="brand-mark"><Icon name="grid"/></span>AssetFlow<span className="brand-dot">.</span></a>
      <div className="workspace"><span className="workspace-avatar">AF</span><div>Mi espacio de trabajo<small>Gestión de activos</small></div></div>
      <p className="nav-label">ESPACIO DE TRABAJO</p>
      <nav><a href="#inventario" className="nav-active" aria-current="page"><Icon name="grid"/> Inventario <span>{equipments.length}</span></a></nav>
      <div className="sidebar-tip"><span className="tip-icon"><Icon name="laptop"/></span><strong>Cada equipo, en su lugar.</strong><p>Un inventario organizado empieza con información actualizada.</p><button onClick={openCreate}>Registrar un equipo <Icon name="arrow" size={16}/></button></div>
      <div className="sidebar-footer"><span className="footer-dot"/> AssetFlow · Inventario de TI</div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><span>Espacio de trabajo <span className="breadcrumb-divider">/</span> <strong>Inventario</strong></span><span className="workspace-tag">AF</span></header>
      <main id="inventario">
        <div className="page-heading"><div><p className="eyebrow">CONTROL Y ORGANIZACIÓN</p><h1>Tu inventario, bajo control<span>.</span></h1><p>Todos tus equipos en un solo lugar. Menos pendientes, más claridad.</p></div><button className="primary" onClick={openCreate}><Icon name="plus" size={18}/> Nuevo equipo</button></div>
        {error && <div role="alert" className="message error">{error}<button onClick={load} disabled={loading}>Reintentar</button></div>}
        {notice && <div role="status" className="message success">{notice}<button aria-label="Cerrar aviso" onClick={() => setNotice('')}><Icon name="close" size={16}/></button></div>}
        <section className="stats" aria-label="Resumen del inventario">{stats.map(stat => <article className="stat-card" key={stat.title}><div className="stat-top"><span>{stat.title}</span><span className={`stat-icon ${stat.tone}`}><Icon name={stat.icon}/></span></div><strong>{loading ? '—' : stat.value}</strong><p>{stat.caption}</p></article>)}</section>
        <section className="inventory-panel"><div className="panel-title"><div><h2>Equipos <span>{equipments.length}</span></h2><p>Consulta y administra los activos de tu organización.</p></div><button className="icon-button" aria-label="Actualizar inventario" title="Actualizar inventario" onClick={load} disabled={loading}><Icon name="refresh"/></button></div>
          <div className="toolbar"><label className="search"><Icon name="search" size={18}/><input placeholder="Buscar por equipo, serie o categoría…" aria-label="Buscar equipos" value={query} onChange={e => setQuery(e.target.value)}/></label><label className="filter"><span>Estado</span><select aria-label="Filtrar por estado" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Todos los estados</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
          <div className="table-scroll"><table><thead><tr><th>Equipo</th><th>Número de serie</th><th>Categoría</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>
            {loading ? <tr><td colSpan="5"><div className="empty-state"><span className="loading-ring"/>Cargando tu inventario…</div></td></tr> : visible.length ? visible.map(item => <tr key={item.id}><td><div className="equipment-cell"><span className="equipment-icon"><Icon name="laptop"/></span><div><strong>{item.model}</strong><small>Equipo de inventario</small></div></div></td><td><span className="serial">{item.serialNumber}</span></td><td>{item.category || 'General'}</td><td><span className={`badge ${item.status}`}><i/>{statuses[item.status] || item.status}</span></td><td><button className="delete-button" aria-label={`Eliminar ${item.model}`} title="Eliminar equipo" onClick={() => { setPendingDelete(item); deleteDialog.current.showModal(); }}><Icon name="trash" size={17}/></button></td></tr>) : <tr><td colSpan="5"><div className="empty-state"><span className="empty-icon"><Icon name="laptop" size={30}/></span><strong>{error ? 'No se pudo cargar el inventario' : equipments.length ? 'No encontramos coincidencias' : 'Tu inventario empieza aquí'}</strong><p>{error ? 'Revisa la conexión e intenta actualizar.' : equipments.length ? 'Prueba otra búsqueda o cambia el estado.' : 'Registra tu primer equipo y empieza a organizar tus activos.'}</p>{!error && <button className="secondary" onClick={equipments.length ? () => { setQuery(''); setFilter('all'); } : openCreate}>{equipments.length ? 'Limpiar filtros' : 'Agregar primer equipo'}</button>}</div></td></tr>}
          </tbody></table></div><div className="table-footer"><span>{loading ? 'Cargando…' : `${visible.length} de ${equipments.length} equipos`}</span><span>Un lugar para cada activo.</span></div>
        </section><footer className="page-footer">AssetFlow <span>Hecho para mantener todo en orden.</span></footer>
      </main>
    </div>
    <dialog ref={createDialog} className="modal" onCancel={e => { if (saving) e.preventDefault(); }}><form onSubmit={createEquipment}><div className="modal-heading"><div><p className="eyebrow">INVENTARIO</p><h2>Nuevo equipo</h2></div><button type="button" className="icon-button" aria-label="Cerrar" disabled={saving} onClick={() => createDialog.current.close()}><Icon name="close"/></button></div><p className="modal-intro">Agrega los datos del equipo para registrarlo en tu inventario.</p><label>Modelo o descripción<input autoFocus required maxLength={150} value={form.model} placeholder="Ej. MacBook Pro 14 pulgadas" onChange={e => setForm({ ...form, model: e.target.value })}/></label><label>Número de serie<input required maxLength={100} value={form.serialNumber} placeholder="Ej. EQ-1004" onChange={e => setForm({ ...form, serialNumber: e.target.value })}/></label><div className="form-columns"><label>Categoría<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{['Laptop', 'Monitor', 'Escritorio', 'Periférico', 'General'].map(x => <option key={x}>{x}</option>)}</select></label><label>Estado<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>{error && <p role="alert" className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="secondary" disabled={saving} onClick={() => createDialog.current.close()}>Cancelar</button><button className="primary" disabled={saving || !form.model.trim() || !form.serialNumber.trim()}>{saving ? 'Guardando…' : 'Guardar equipo'}</button></div></form></dialog>
    <dialog ref={deleteDialog} className="modal small-modal" onCancel={e => { if (deleting) e.preventDefault(); }}><h2>¿Eliminar este equipo?</h2><p className="modal-intro">Se eliminará <strong>{pendingDelete?.model}</strong> del inventario. Esta acción no se puede deshacer.</p>{error && <p role="alert" className="form-error">{error}</p>}<div className="modal-actions"><button className="secondary" disabled={deleting} onClick={() => deleteDialog.current.close()}>Cancelar</button><button className="danger" disabled={deleting} onClick={removeEquipment}>{deleting ? 'Eliminando…' : 'Eliminar equipo'}</button></div></dialog>
  </div>;
}
