import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '../config';
import { Link } from 'react-router-dom';
import { LangContext } from '../i18n';

function EstadoBadge({ estado }) {
  if (estado === 'aprobado') return <span className="badge-si">Publicada</span>;
  if (estado === 'rechazado') return <span className="badge-no">Rechazada</span>;
  return <span className="badge-wait">Pendiente</span>;
}

function primerNombre(nombre) {
  return ((nombre || '').trim().split(/\s+/)[0]) || '';
}

function ColaRevision({ cola, moderar }) {
  const cartas = cola.cartas || [];
  const videos = cola.videos || [];
  const pendientesC = cartas.filter(c => c.estado === 'pendiente');
  const rechazadasC = cartas.filter(c => c.estado === 'rechazado');
  const pendientesV = videos.filter(v => v.estado === 'pendiente');
  const rechazadosV = videos.filter(v => v.estado === 'rechazado');
  return (
    <div className="mod-queue">
      <p className="mod-lead">
        Las cartas, fotos y videos nuevos no aparecen en el sitio hasta que los apruebes.
        Si rechazas, escribe el motivo: la familia lo ve en su panel. El teléfono y la foto familiar no se publican nunca.
      </p>

      <h2 className="mod-h">Cartas en espera ({pendientesC.length})</h2>
      {pendientesC.length === 0 && (
        <p className="mod-empty">No hay cartas esperando revisión.</p>
      )}
      {pendientesC.map(n => (
        <article className="mod-card" key={`c-${n.id}`}>
          <header className="mod-head">
            <div>
              <strong>{n.nombre}</strong>
              <EstadoBadge estado="pendiente" />
            </div>
            <span>{[n.provincia, n.region].filter(Boolean).join(', ')}{n.edad ? ` · ${n.edad} años` : ''} · {n.fecha}</span>
          </header>
          <p className="mod-publico">En el sitio se verá como <strong>{primerNombre(n.nombre)}</strong>. Sin apellido, sin teléfono y sin foto familiar.</p>
          {n.carta_texto && <p className="mod-carta">“{n.carta_texto}”</p>}
          {n.carta_foto && (
            <figure>
              <figcaption>Foto de la carta · se publica si apruebas</figcaption>
              <img src={n.carta_foto} alt="Carta escrita a mano" />
            </figure>
          )}
          {n.video_url && (
            <figure>
              <figcaption>Video del niño · se publica si apruebas la carta</figcaption>
              <video src={n.video_url} controls playsInline preload="metadata" />
            </figure>
          )}
          {n.foto_familia && (
            <figure className="mod-privada">
              <figcaption>Foto familiar · no se publica</figcaption>
              <img src={n.foto_familia} alt="Foto familiar, solo para revisión" />
            </figure>
          )}
          <p className="mod-privado">WhatsApp familiar, solo admin: {n.whatsapp || 'no dejó número'}</p>
          <div className="mod-actions">
            <button type="button" className="btn-aprobar" onClick={() => moderar('carta', n.id, 'aprobar')}>Aprobar y publicar</button>
            <button type="button" className="btn-rechazar" onClick={() => moderar('carta', n.id, 'rechazar')}>Rechazar</button>
            <Link to={`/carta/${n.id}`}>Vista previa</Link>
          </div>
        </article>
      ))}

      <h2 className="mod-h">Videos en espera ({pendientesV.length})</h2>
      {pendientesV.length === 0 && <p className="mod-empty">No hay videos esperando revisión.</p>}
      {pendientesV.map(v => (
        <article className="mod-card" key={`v-${v.id}`}>
          <header className="mod-head">
            <div>
              <strong>{v.autor}</strong>
              <EstadoBadge estado="pendiente" />
            </div>
            <span>{v.de === 'nino' ? 'Del niño' : 'Del padrino o la madrina'} · carta de {v.nino_nombre} · {v.fecha}</span>
          </header>
          {v.texto && <p className="mod-carta">{v.texto}</p>}
          {v.video_url && <video src={v.video_url} controls playsInline preload="metadata" />}
          <div className="mod-actions">
            <button type="button" className="btn-aprobar" onClick={() => moderar('video', v.id, 'aprobar')}>Aprobar video</button>
            <button type="button" className="btn-rechazar" onClick={() => moderar('video', v.id, 'rechazar')}>Rechazar</button>
          </div>
        </article>
      ))}

      {(rechazadasC.length > 0 || rechazadosV.length > 0) && (
        <>
          <h2 className="mod-h">Rechazados</h2>
          {rechazadasC.map(n => (
            <article className="mod-card mod-card-rech" key={`rc-${n.id}`}>
              <header className="mod-head">
                <div><strong>{n.nombre}</strong><EstadoBadge estado="rechazado" /></div>
                <span>{n.motivo_rechazo}</span>
              </header>
              <div className="mod-actions">
                <button type="button" className="btn-aprobar" onClick={() => moderar('carta', n.id, 'aprobar')}>Publicar de todos modos</button>
              </div>
            </article>
          ))}
          {rechazadosV.map(v => (
            <article className="mod-card mod-card-rech" key={`rv-${v.id}`}>
              <header className="mod-head">
                <div><strong>Video de {v.autor}</strong><EstadoBadge estado="rechazado" /></div>
                <span>{v.motivo_rechazo} · {v.nino_nombre}</span>
              </header>
              <div className="mod-actions">
                <button type="button" className="btn-aprobar" onClick={() => moderar('video', v.id, 'aprobar')}>Publicar de todos modos</button>
              </div>
            </article>
          ))}
        </>
      )}
    </div>
  );
}

export default function Admin() {
  const { t } = useContext(LangContext);
  const [data, setData] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [admins, setAdmins] = useState({ super_admin: '', admins: [] });
  const [nuevoAdmin, setNuevoAdmin] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [tab, setTab] = useState('revision');
  const [cola, setCola] = useState({ cartas: [], videos: [] });

  const cargar = () => {
    axios.get(API+'/api/admin').then(r => setData(r.data)).catch(() => setData({ error: true }));
    axios.get(API+'/api/moderacion').then(r => setCola(r.data)).catch(()=>{});
    axios.get(API+'/api/historial').then(r => setHistorial(r.data)).catch(()=>{});
    axios.get(API+'/api/mensajes-privados').then(r => setMensajes(r.data)).catch(()=>{});
    axios.get(API+'/api/admins').then(r => setAdmins(r.data)).catch(()=>{});
  };

  const moderar = async (tipo, id, accion) => {
    let motivo = '';
    if (accion === 'rechazar') {
      motivo = window.prompt('Motivo del rechazo. La familia lo verá en su panel:');
      if (motivo === null) return;
      if (!motivo.trim()) { alert('Escribe el motivo del rechazo.'); return; }
    }
    const url = tipo === 'video' ? `${API}/api/videos/${id}/moderar` : `${API}/api/ninos/${id}/moderar`;
    try {
      await axios.post(url, { accion, motivo });
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo guardar la revisión.');
    }
  };
  useEffect(() => { cargar(); }, []);

  const agregarAdmin = async (e) => {
    e.preventDefault();
    if (!nuevoAdmin.trim()) return;
    try {
      const r = await axios.post(`${API}/api/admins`, { email: nuevoAdmin.trim() });
      setNuevoAdmin('');
      cargar();
      alert(r.data.mensaje || 'Listo');
    } catch (err) { alert(err.response?.data?.error || 'No se pudo agregar.'); }
  };
  const quitarAdmin = async (a) => {
    if (!window.confirm(`¿Quitar como administrador a ${a.email}?`)) return;
    await axios.delete(`${API}/api/admins/${a.id}`).catch(err => alert(err.response?.data?.error || 'No se pudo quitar.'));
    cargar();
  };

  const exportarCSV = (filas, columnas, nombreArchivo) => {
    const esc = (v) => {
      const s = (v === null || v === undefined) ? '' : String(v);
      return '"' + s.replace(/"/g, '""') + '"';
    };
    const header = columnas.map(c => esc(c.label)).join(',');
    const body = filas.map(f => columnas.map(c => esc(f[c.key])).join(',')).join('\n');
    // BOM para que Excel respete tildes y ñ
    const csv = '﻿' + header + '\n' + body;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreArchivo}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const eliminarPadrino = async (p) => {
    if (!window.confirm(`¿Eliminar al padrino "${p.nombre}" (${p.email})?\nEl niño que apadrinaba volverá a "busca padrino".`)) return;
    await axios.delete(`${API}/api/padrinos/${p.id}`).catch(err => alert(err.response?.data?.error || 'No se pudo eliminar.'));
    cargar();
  };

  const eliminarNino = async (n) => {
    const motivo = window.prompt(
      `Eliminar a "${n.nombre}" de ${n.provincia}.\n\nEsto borra su carta, fotos y comentarios, pero quedará registrado en el Historial.\n\nMotivo (ej: Regalo entregado):`,
      'Regalo entregado'
    );
    if (motivo === null) return; // canceló
    await axios.delete(`${API}/api/ninos/${n.id}`, { data: { motivo } }).catch(err => alert(err.response?.data?.error || 'No se pudo eliminar.'));
    cargar();
  };

  if (!data) return <p className="loading">Cargando panel…</p>;
  if (data.error) return <p className="loading">No se pudo cargar el panel. Vuelve a iniciar sesión e inténtalo de nuevo.</p>;

  const filtrados = data.ninos.filter(n =>
    n.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.provincia?.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.region?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="admin-page">
      <h1>Panel admin</h1>

      <div className="stats">
        <div className="stat-card"><h3>{data.total_ninos}</h3><p>{t.admin_total}</p></div>
        <div className="stat-card"><h3>{data.total_padrinos}</h3><p>{t.admin_padrinos}</p></div>
        <div className="stat-card"><h3 style={{color:'var(--red)'}}>{data.sin_padrino}</h3><p>{t.admin_sin_padrino}</p></div>
        <div className="stat-card"><h3>{data.en_revision || 0}</h3><p>{t.admin_revision}</p></div>
        <div className="stat-card">
          <h3 style={{color:'var(--green)'}}>{data.total_ninos > 0 ? Math.round((data.total_padrinos / data.total_ninos) * 100) : 0}%</h3>
          <p>Cobertura</p>
        </div>
      </div>

      {/* TABS */}
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'revision' ? 'active' : ''}`} onClick={() => setTab('revision')}>
          Revisión ({data.en_revision || 0})
        </button>
        <button className={`admin-tab ${tab === 'ninos' ? 'active' : ''}`} onClick={() => setTab('ninos')}>
          Niños ({data.total_ninos})
        </button>
        <button className={`admin-tab ${tab === 'padrinos' ? 'active' : ''}`} onClick={() => setTab('padrinos')}>
          Padrinos ({data.total_padrinos})
        </button>
        <button className={`admin-tab ${tab === 'mensajes' ? 'active' : ''}`} onClick={() => setTab('mensajes')}>
          Mensajes ({mensajes.length})
        </button>
        <button className={`admin-tab ${tab === 'historial' ? 'active' : ''}`} onClick={() => setTab('historial')}>
          Historial ({historial.length})
        </button>
        <button className={`admin-tab ${tab === 'admins' ? 'active' : ''}`} onClick={() => setTab('admins')}>
          🔑 Administradores
        </button>
      </div>

      {tab === 'revision' && (
        <ColaRevision cola={cola} moderar={moderar} />
      )}

      {tab === 'ninos' && (
        <>
          <div style={{display:'flex', gap:'0.6rem', marginBottom:'1rem', alignItems:'center', flexWrap:'wrap'}}>
            <input
              className="filtro-buscar"
              style={{flex:1, minWidth:200}}
              placeholder="🔍 Buscar niño, provincia o región..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <button className="btn-export" onClick={() => exportarCSV(
              filtrados,
              [
                {key:'id',label:'ID'},{key:'nombre',label:'Nombre'},{key:'edad',label:'Edad'},
                {key:'provincia',label:'Provincia'},{key:'region',label:'Región'},
                {key:'whatsapp',label:'WhatsApp (privado)'},{key:'estado',label:'Estado'},{key:'tiene_padrino',label:'Tiene padrino'},
                {key:'fecha',label:'Fecha registro'},
              ],
              'ninos_registrados'
            )}>Exportar a Excel</button>
          </div>
          <div style={{overflowX:'auto'}}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Edad</th>
                  <th>Provincia</th>
                  <th>Región</th>
                  <th>WhatsApp (privado)</th>
                  <th>Estado</th>
                  <th>Padrino</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(n => (
                  <tr key={n.id}>
                    <td>{n.id}</td>
                    <td style={{fontWeight:600}}>{n.nombre}</td>
                    <td>{n.edad}</td>
                    <td>{n.provincia}</td>
                    <td>{n.region}</td>
                    <td>{n.whatsapp || '—'}</td>
                    <td><EstadoBadge estado={n.estado} /></td>
                    <td>
                      <span className={n.tiene_padrino ? 'badge-si' : 'badge-no'}>
                        {n.tiene_padrino ? '✓ Sí' : '✗ No'}
                      </span>
                    </td>
                    <td>{n.fecha}</td>
                    <td>
                      <div style={{display:'flex', gap:'0.6rem', alignItems:'center'}}>
                        <Link to={`/carta/${n.id}`}
                          style={{color:'var(--red)', fontSize:'0.8rem', textDecoration:'none', fontWeight:600}}>
                          👁 Ver
                        </Link>
                        <button onClick={() => eliminarNino(n)}
                          style={{background:'#fef2f2', color:'#b91c1c', border:'1px solid #fecaca', borderRadius:'8px', padding:'0.3rem 0.6rem', fontSize:'0.78rem', fontWeight:600, cursor:'pointer'}}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'padrinos' && (
        <div style={{overflowX:'auto'}}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>País</th>
                <th>Figura</th>
                <th>Niño apadrinado</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {data.padrinos?.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td style={{fontWeight:600}}>{p.nombre}</td>
                  <td>{p.email}</td>
                  <td>{p.pais || '—'}</td>
                  <td>{p.rol === 'madrina' ? 'Madrina' : 'Padrino'}</td>
                  <td>{p.nino_nombre || '—'}</td>
                  <td>{p.fecha}</td>
                  <td>
                    <button onClick={() => eliminarPadrino(p)}
                      style={{background:'#fef2f2', color:'#b91c1c', border:'1px solid #fecaca', borderRadius:'8px', padding:'0.3rem 0.6rem', fontSize:'0.78rem', fontWeight:600, cursor:'pointer'}}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'mensajes' && (
        <>
          <p style={{color:'var(--ink-soft)', fontSize:'0.9rem', marginBottom:'1rem'}}>
            Mensajes privados enviados a las familias (no aparecen en el muro público).
          </p>
          <div style={{overflowX:'auto'}}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th><th>Para (niño)</th><th>De</th><th>Email</th><th>Mensaje</th><th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {mensajes.length === 0 ? (
                  <tr><td colSpan="6" style={{textAlign:'center', color:'var(--ink-faint)', padding:'1.5rem'}}>
                    Aún no hay mensajes privados.
                  </td></tr>
                ) : mensajes.map(m => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td style={{fontWeight:'bold'}}>{m.nino_nombre}</td>
                    <td>{m.autor}</td>
                    <td>{m.email || '—'}</td>
                    <td style={{maxWidth:320}}>{m.texto}</td>
                    <td>{m.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'historial' && (
        <>
          <div style={{display:'flex', gap:'0.6rem', marginBottom:'1rem', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap'}}>
            <p style={{color:'var(--ink-soft)', fontSize:'0.9rem', margin:0}}>
              Trazabilidad: registro permanente de los niños eliminados (regalo entregado u otro motivo).
            </p>
            <button className="btn-export" onClick={() => exportarCSV(
              historial,
              [
                {key:'nombre',label:'Nombre'},{key:'edad',label:'Edad'},
                {key:'provincia',label:'Provincia'},{key:'region',label:'Región'},
                {key:'tuvo_padrino',label:'Tuvo padrino'},{key:'nombre_padrino',label:'Padrino'},
                {key:'motivo',label:'Motivo'},{key:'fecha_registro',label:'Registrado'},
                {key:'fecha_eliminacion',label:'Eliminado'},
              ],
              'historial_ninos_ayudados'
            )}>Exportar a Excel</button>
          </div>
          <div style={{overflowX:'auto'}}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Edad</th>
                  <th>Provincia</th>
                  <th>Región</th>
                  <th>Tuvo padrino</th>
                  <th>Padrino</th>
                  <th>Motivo</th>
                  <th>Registrado</th>
                  <th>Eliminado</th>
                </tr>
              </thead>
              <tbody>
                {historial.length === 0 ? (
                  <tr><td colSpan="10" style={{textAlign:'center', color:'var(--ink-faint)', padding:'1.5rem'}}>
                    Aún no hay eliminaciones registradas.
                  </td></tr>
                ) : historial.map(h => (
                  <tr key={h.id}>
                    <td>{h.id}</td>
                    <td style={{fontWeight:'bold'}}>{h.nombre}</td>
                    <td>{h.edad}</td>
                    <td>{h.provincia}</td>
                    <td>{h.region}</td>
                    <td>
                      <span className={h.tuvo_padrino ? 'badge-si' : 'badge-no'}>
                        {h.tuvo_padrino ? '✓ Sí' : '✗ No'}
                      </span>
                    </td>
                    <td>{h.nombre_padrino || '—'}</td>
                    <td>{h.motivo}</td>
                    <td>{h.fecha_registro}</td>
                    <td>{h.fecha_eliminacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'admins' && (
        <>
          <p style={{color:'var(--ink-soft)', fontSize:'0.9rem', marginBottom:'1.2rem'}}>
            🔑 Personas con acceso al Panel Admin. Agrega el correo de quien quieras que también administre la página.
          </p>
          <form onSubmit={agregarAdmin} style={{display:'flex', gap:'0.6rem', marginBottom:'1.5rem', flexWrap:'wrap'}}>
            <input className="filtro-buscar" style={{flex:1, minWidth:220}} type="email"
              placeholder="correo@ejemplo.com" value={nuevoAdmin}
              onChange={e=>setNuevoAdmin(e.target.value)} required />
            <button className="btn-export" style={{background:'var(--red)'}} type="submit">＋ Agregar administrador</button>
          </form>
          <div style={{overflowX:'auto'}}>
            <table className="admin-table">
              <thead>
                <tr><th>Correo</th><th>Rol</th><th>Acción</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{fontWeight:'bold'}}>{admins.super_admin}</td>
                  <td><span className="badge-si">👑 Dueño</span></td>
                  <td style={{color:'var(--ink-faint)', fontSize:'0.8rem'}}>No se puede quitar</td>
                </tr>
                {admins.admins?.map(a => (
                  <tr key={a.id}>
                    <td>{a.email}</td>
                    <td><span className="badge-si" style={{background:'#eef2ff', color:'#4f46e5'}}>Administrador</span></td>
                    <td>
                      <button onClick={() => quitarAdmin(a)}
                        style={{background:'#fef2f2', color:'#b91c1c', border:'1px solid #fecaca', borderRadius:'8px', padding:'0.3rem 0.6rem', fontSize:'0.78rem', fontWeight:600, cursor:'pointer'}}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
                {(!admins.admins || admins.admins.length === 0) && (
                  <tr><td colSpan="3" style={{textAlign:'center', color:'var(--ink-faint)', padding:'1.2rem'}}>
                    Aún no has agregado otros administradores.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
