import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '../config';
import { Link } from 'react-router-dom';
import { LangContext } from '../App';

export default function Admin() {
  const { t } = useContext(LangContext);
  const [data, setData] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [tab, setTab] = useState('ninos');

  const cargar = () => {
    axios.get(API+'/api/admin').then(r => setData(r.data));
    axios.get(API+'/api/historial').then(r => setHistorial(r.data)).catch(()=>{});
    axios.get(API+'/api/mensajes-privados').then(r => setMensajes(r.data)).catch(()=>{});
  };
  useEffect(() => { cargar(); }, []);

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
    await axios.delete(`${API}/api/padrinos/${p.id}`);
    cargar();
  };

  const eliminarNino = async (n) => {
    const motivo = window.prompt(
      `Eliminar a "${n.nombre}" de ${n.provincia}.\n\nEsto borra su carta, fotos y comentarios, pero quedará registrado en el Historial.\n\nMotivo (ej: Regalo entregado):`,
      'Regalo entregado'
    );
    if (motivo === null) return; // canceló
    await axios.delete(`${API}/api/ninos/${n.id}`, { data: { motivo } });
    cargar();
  };

  if (!data) return <p className="loading">🎄 Cargando panel...</p>;

  const filtrados = data.ninos.filter(n =>
    n.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.provincia?.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.region?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="admin-page">
      <h1>{t.admin_title}</h1>

      <div className="stats">
        <div className="stat-card"><h3>{data.total_ninos}</h3><p>🎄 {t.admin_total}</p></div>
        <div className="stat-card"><h3>{data.total_padrinos}</h3><p>❤️ {t.admin_padrinos}</p></div>
        <div className="stat-card"><h3 style={{color:'#e74c3c'}}>{data.sin_padrino}</h3><p>⏳ {t.admin_sin_padrino}</p></div>
        <div className="stat-card">
          <h3 style={{color:'#2ecc71'}}>{data.total_ninos > 0 ? Math.round((data.total_padrinos / data.total_ninos) * 100) : 0}%</h3>
          <p>📊 Cobertura</p>
        </div>
      </div>

      {/* TABS */}
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'ninos' ? 'active' : ''}`} onClick={() => setTab('ninos')}>
          🎄 Niños ({data.total_ninos})
        </button>
        <button className={`admin-tab ${tab === 'padrinos' ? 'active' : ''}`} onClick={() => setTab('padrinos')}>
          ❤️ Padrinos ({data.total_padrinos})
        </button>
        <button className={`admin-tab ${tab === 'mensajes' ? 'active' : ''}`} onClick={() => setTab('mensajes')}>
          💌 Mensajes ({mensajes.length})
        </button>
        <button className={`admin-tab ${tab === 'historial' ? 'active' : ''}`} onClick={() => setTab('historial')}>
          📋 Historial ({historial.length})
        </button>
      </div>

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
                {key:'whatsapp',label:'WhatsApp'},{key:'tiene_padrino',label:'Tiene padrino'},
                {key:'fecha',label:'Fecha registro'},
              ],
              'ninos_registrados'
            )}>📊 Exportar a Excel</button>
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
                  <th>WhatsApp</th>
                  <th>Padrino</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(n => (
                  <tr key={n.id}>
                    <td>{n.id}</td>
                    <td style={{color:'#FFD700', fontWeight:'bold'}}>{n.nombre}</td>
                    <td>{n.edad}</td>
                    <td>{n.provincia}</td>
                    <td>{n.region}</td>
                    <td>
                      {n.whatsapp ? (
                        <a href={`https://wa.me/51${n.whatsapp}`} target="_blank" rel="noreferrer"
                          style={{color:'#25d366', textDecoration:'none'}}>
                          💬 {n.whatsapp}
                        </a>
                      ) : '—'}
                    </td>
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
                          🗑 Eliminar
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
                <th>Niño apadrinado</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {data.padrinos?.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td style={{color:'#FFD700', fontWeight:'bold'}}>{p.nombre}</td>
                  <td>{p.email}</td>
                  <td>{p.pais || '—'}</td>
                  <td>{p.nino_nombre || '—'}</td>
                  <td>{p.fecha}</td>
                  <td>
                    <button onClick={() => eliminarPadrino(p)}
                      style={{background:'#fef2f2', color:'#b91c1c', border:'1px solid #fecaca', borderRadius:'8px', padding:'0.3rem 0.6rem', fontSize:'0.78rem', fontWeight:600, cursor:'pointer'}}>
                      🗑 Eliminar
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
            💌 Mensajes privados enviados a las familias (no aparecen en el muro público).
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
              📋 Trazabilidad: registro permanente de los niños eliminados (regalo entregado u otro motivo).
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
            )}>📊 Exportar a Excel</button>
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
    </div>
  );
}
