import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API } from './config';

const AVATAR_COLORS = ['#1877f2','#e74c3c','#15803d','#7c3aed','#d97706','#0891b2','#db2777'];
const colorFor = (name) => AVATAR_COLORS[(name || '?').charCodeAt(0) % AVATAR_COLORS.length];

function Avatar({ name, size = 36 }) {
  return (
    <div className="fb-avatar" style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.42 }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

function timeAgo(fecha) {
  return fecha; // ya viene formateado dd/mm/yyyy hh:mm
}

function CommentNode({ c, replies, allReplies, onReply, onLike, depth = 0 }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(c.likes || 0);
  const [showReply, setShowReply] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    const r = await axios.post(`${API}/api/comentarios/${c.id}/like`);
    setLikes(r.data.likes); setLiked(true);
  };

  return (
    <div className="fb-comment">
      <Avatar name={c.autor} size={depth > 0 ? 30 : 36} />
      <div className="fb-comment-main">
        <div className="fb-bubble">
          <div className="fb-author">
            {c.autor}
            {c.pais && <span className="fb-pais">· {c.pais}</span>}
          </div>
          <div className="fb-text">{c.texto}</div>
        </div>
        <div className="fb-actions">
          <button className={`fb-action ${liked ? 'active' : ''}`} onClick={handleLike}>Me gusta</button>
          <span className="fb-dot">·</span>
          <button className="fb-action" onClick={() => setShowReply(s => !s)}>Responder</button>
          <span className="fb-dot">·</span>
          <span className="fb-time">{timeAgo(c.fecha)}</span>
          {likes > 0 && <span className="fb-likepill">👍 {likes}</span>}
        </div>

        {showReply && (
          <ReplyComposer
            onSend={async (texto, autor) => {
              await onReply(texto, autor, c.id);
              setShowReply(false);
            }}
            placeholder={`Responder a ${c.autor}…`}
          />
        )}

        {/* Respuestas anidadas */}
        {replies.map(r => (
          <CommentNode
            key={r.id} c={r}
            replies={allReplies.filter(x => x.parent_id === r.id)}
            allReplies={allReplies}
            onReply={onReply} onLike={onLike} depth={depth + 1}
          />
        ))}
      </div>
    </div>
  );
}

function ReplyComposer({ onSend, placeholder }) {
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
    <form className="fb-composer" onSubmit={submit}>
      <Avatar name={autor || '?'} size={32} />
      <div className="fb-composer-fields">
        {!saved && (
          <input className="fb-name-input" placeholder="Tu nombre"
            value={autor} onChange={e => setAutor(e.target.value)} required />
        )}
        <div className="fb-input-wrap">
          <input className="fb-input" placeholder={placeholder}
            value={texto} onChange={e => setTexto(e.target.value)} required />
          <button className="fb-send" disabled={sending} aria-label="Enviar">
            {sending ? '···' : '➤'}
          </button>
        </div>
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
    await axios.post(`${API}/api/ninos/${ninoId}/comentarios`, {
      autor, texto, pais: '', parent_id: parentId,
    });
    load();
  };

  const topLevel = comments.filter(c => !c.parent_id);
  const total = comments.length;

  return (
    <div className="fb-comments">
      <div className="fb-comments-head">
        <h4>Mensajes de apoyo</h4>
        <span className="fb-count">{total} {total === 1 ? 'comentario' : 'comentarios'}</span>
      </div>

      {/* Composer principal */}
      <ReplyComposer
        onSend={(texto, autor) => addComment(texto, autor, null)}
        placeholder="Escribe un mensaje de aliento…"
      />

      {/* Lista */}
      <div className="fb-list">
        {topLevel.length === 0 && (
          <p className="fb-empty">Sé el primero en dejar un mensaje de cariño 💛</p>
        )}
        {topLevel.map(c => (
          <CommentNode
            key={c.id} c={c}
            replies={comments.filter(x => x.parent_id === c.id)}
            allReplies={comments}
            onReply={addComment}
          />
        ))}
      </div>
    </div>
  );
}
