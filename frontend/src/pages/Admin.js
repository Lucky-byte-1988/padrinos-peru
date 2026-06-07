import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { LangContext } from '../App';

export default function Admin() {
  const { t } = useContext(LangContext);
  const [data, setData] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [tab, setTab] = useState('ninos');

  useEffect(() => {
    axios.get('http://localhost:5003/api/admin').then(r => setData(r.data));
  }, []);

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
      </div>

      {tab === 'ninos' && (
        <>
          <input
            className="filtro-buscar"
            style={{marginBottom:'1rem', width:'100%'}}
            placeholder="🔍 Buscar niño, provincia o región..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
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
                      <Link to={`/carta/${n.id}`}
                        style={{color:'#FFD700', fontSize:'0.8rem', textDecoration:'none'}}>
                        👁 Ver
                      </Link>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
