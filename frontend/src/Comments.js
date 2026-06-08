import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API } from './config';
import { HeartIcon } from './Icons';

const AVATAR_COLORS = ['#1877f2','#e0245e','#15803d','#7c3aed','#d97706','#0891b2','#db2777'];
const colorFor = (name) => AVATAR_COLORS[(name || '?').charCodeAt(0) % AVATAR_COLORS.length];

function Avatar({ name, size = 40 }) {
  return (
    <div className="igc-avatar" style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.4 }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

function CommentNode({ c, replies, allReplies, onReply, depth = 0 }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(c.likes || 0);
  const [showReply, setShowReply] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    const r = await axios.post(`${API}/api/comentarios/${c.id}/like`);
    setLikes(r.data.likes); setLiked(true);
  };

  return (
    <div className={`igc ${depth > 0 ? 'igc-reply' : ''}`}>
      <Avatar name={c.autor} size={depth > 0 ? 32 : 40} />
      <div className="igc-main">
        <div className="igc-text">
          <span className="igc-user">{c.autor}</span>
          <span className="igc-time">{c.fecha}</span>
          <br />
          {c.texto}
        </div>
        <div className="igc-meta">
          {likes > 0 && <span>{likes} me gusta</span>}
          <button onClick={() => setShowReply(s => !s)}>Responder</button>
        </div>
        {showReply && (
          <ReplyComposer compact onSend={async (texto, autor) => { await onReply(texto, autor, c.id); setShowReply(false); }}
            placeholder={`Responder a ${c.autor}…`} />
        )}
        {replies.map(r => (
          <CommentNode key={r.id} c={r} replies={allReplies.filter(x => x.parent_id === r.id)}
            allReplies={allReplies} onReply={onReply} depth={depth + 1} />
        ))}
      </div>
      <button className={`igc-like ${liked ? 'on' : ''}`} onClick={handleLike} aria-label="Me gusta">
        <HeartIcon filled={liked} size={18} />
      </button>
    </div>
  );
}

function ReplyComposer({ onSend, placeholder, compact }) {
  const saved = localStorage.getItem('visitorName') || '';
  const [autor, setAutor] = useState(saved);
  const [texto, setTexto] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!texto.trim() || !autor.trim()) return;
    setSending(true);
    localStorage.setItem('visitorName', autor.trim());
    await onSend(texto.trim(), autor.trim());
    setTexto(''); setSending(false);
  };

  return (
    <form className={`igc-composer ${compact ? 'compact' : ''}`} onSubmit={submit}>
      {!saved && (
        <input className="igc-name" placeholder="Tu nombre" value={autor}
          onChange={e => setAutor(e.target.value)} required />
      )}
      <div className="igc-input-row">
        <input className="igc-input" placeholder={placeholder || 'Añade un comentario…'}
          value={texto} onChange={e => setTexto(e.target.value)} required />
        <button className="igc-send" disabled={sending || !texto.trim()}>
          {sending ? '···' : 'Publicar'}
        </button>
      </div>
    </form>
  );
}

export default function Comments({ ninoId }) {
  const [comments, setComments] = useState([]);
  const load = useCallback(() => {
    axios.get(`${API}/api/ninos/${ninoId}/comentarios`).then(r => setComments(r.data));
  }, [ninoId]);
  useEffect(() => { load(); }, [load]);

  const addComment = async (texto, autor, parentId = null) => {
    await axios.post(`${API}/api/ninos/${ninoId}/comentarios`, { autor, texto, pais: '', parent_id: parentId });
    load();
  };

  const topLevel = comments.filter(c => !c.parent_id);

  return (
    <div className="igc-wrap">
      <div className="igc-list">
        {topLevel.length === 0 && (
          <p className="igc-empty">Aún no hay mensajes.<br/>Sé el primero en dejar uno 💛</p>
        )}
        {topLevel.map(c => (
          <CommentNode key={c.id} c={c} replies={comments.filter(x => x.parent_id === c.id)}
            allReplies={comments} onReply={addComment} />
        ))}
      </div>
      <ReplyComposer onSend={(texto, autor) => addComment(texto, autor, null)} />
    </div>
  );
}
