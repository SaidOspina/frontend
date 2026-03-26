import { useState, useEffect, useCallback, useMemo } from "react";
import api from "./api";
import * as Icons from "./Icons";
import { ACTIVITY_TYPES, SEMESTERS, MOBILITY_TYPES, MONTHS, DAYS_NAMES, typeBadge, typeColor, typeColorBg, formatDate, toInputDate, addToast, ToastContainer, Loading, Modal } from "./helpers";
import "./index.css";

// ════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ════════════════════════════════════════════════════════════════════════════
function LoginPage({ onLogin, onPublicView }) {
  const [doc, setDoc] = useState("");
  const [code, setCode] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  const handleLogin = async () => {
    setError(""); setLoading(true);
    try {
      const data = await api.login({ documento: doc, codigo: code, password: pass });
      api.setToken(data.token); api.setUser(data.usuario); onLogin(data.usuario);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleForgot = async () => {
    try { const d = await api.forgotPassword({ correo: forgotEmail }); setForgotMsg(d.mensaje); }
    catch (e) { setForgotMsg(e.message); }
  };

  return (
    <div className="login-page"><div className="login-bg" />
      <div className="login-card slide-up">
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div className="brand-icon" style={{ width: 56, height: 56, fontSize: 24, margin: "0 auto 16px", borderRadius: 14 }}>A</div>
        </div>
        <h1>ACTISIS</h1>
        <p className="subtitle">Plataforma de Gestión de Actividades<br />Programa de Ingeniería de Sistemas</p>
        {error && <div className="login-error">{error}</div>}
        {!showForgot ? (<>
          <div className="form-group"><label className="form-label">Número de documento</label><input className="form-input" placeholder="Ingrese su documento" value={doc} onChange={e => setDoc(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Código</label><input className="form-input" placeholder="Ingrese su código" value={code} onChange={e => setCode(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Contraseña</label><input className="form-input" type="password" placeholder="Ingrese su contraseña" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
          <button className="btn btn-primary" style={{ width: "100%", padding: 12, fontSize: 15, marginTop: 8 }} onClick={handleLogin} disabled={loading}>
            {loading ? <Icons.Loader size={16} /> : <Icons.Lock size={16} />} {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => setShowForgot(true)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-body)" }}>¿Olvidó su contraseña?</button>
          </div>
        </>) : (<>
          <div className="form-group"><label className="form-label">Correo institucional</label><input className="form-input" type="email" placeholder="correo@ufps.edu.co" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} /></div>
          {forgotMsg && <div style={{ background: "var(--accent-soft)", color: "var(--accent)", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{forgotMsg}</div>}
          <button className="btn btn-primary" style={{ width: "100%", padding: 12 }} onClick={handleForgot}><Icons.Mail size={16} /> Enviar enlace</button>
          <div style={{ textAlign: "center", marginTop: 12 }}><button onClick={() => { setShowForgot(false); setForgotMsg(""); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)" }}>Volver al login</button></div>
        </>)}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={onPublicView} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-body)" }}><Icons.Globe size={14} /> Ver actividades públicas</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC VIEW
// ════════════════════════════════════════════════════════════════════════════
function PublicView({ onBack }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { (async () => { try { const d = await api.getPublicActivities(); setActivities(d.actividades || []); } catch (e) {} finally { setLoading(false); } })(); }, []);

  const filtered = activities.filter(a => (a.nombre || "").toLowerCase().includes(search.toLowerCase()) || (a.tematica || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} className="fade-in">
      <div style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div className="brand-icon" style={{ width: 36, height: 36, fontSize: 16 }}>A</div><span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>ACTISIS</span></div>
        <button className="btn btn-secondary" onClick={onBack}><Icons.Lock size={14} /> Iniciar Sesión</button>
      </div>
      <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
        <div className="public-hero"><h1>Actividades del Programa</h1><p>Consulta las actividades académicas, seminarios, talleres y eventos del Programa de Ingeniería de Sistemas.</p></div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div className="search-box"><Icons.Search size={16} /><input className="form-input" style={{ paddingLeft: 38, width: 400, maxWidth: "90vw" }} placeholder="Buscar actividades..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        {loading ? <Loading /> : filtered.length === 0 ? <div className="empty-state"><Icons.Calendar size={48} /><p>No se encontraron actividades públicas.</p></div> : (
          <div className="activity-cards">{filtered.map(a => (
            <div key={a._id} className="activity-card slide-up">
              <div style={{ marginBottom: 10 }}><span className={`badge ${typeBadge(a.tipo)}`}>{a.tipo}</span></div>
              <h3>{a.nombre}</h3><p className="ac-desc">{a.descripcion}</p>
              <div className="ac-meta"><span>📅 {formatDate(a.fechaInicio)}</span><span>🕐 {a.horario || "—"}</span><span>📍 {a.lugar || "—"}</span>{a.conferencista?.nombre && <span>🎤 {a.conferencista.nombre}</span>}</div>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
function Dashboard({ user }) {
  const [data, setData] = useState({ activities: [], userCount: 0, agreementCount: 0, speakerCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try {
    const [actRes, ...extras] = await Promise.all([api.getActivities(), ...(user.rol === "admin" ? [api.getUsers(), api.getAgreements(), api.getSpeakers()] : [])]);
    setData({ activities: actRes.actividades || [], userCount: extras[0]?.total || 0, agreementCount: extras[1]?.total || 0, speakerCount: extras[2]?.total || 0 });
  } catch (e) {} finally { setLoading(false); } })(); }, [user]);

  if (loading) return <Loading text="Cargando dashboard..." />;
  const acts = data.activities;
  const typeCount = {}; acts.forEach(a => { typeCount[a.tipo] = (typeCount[a.tipo] || 0) + 1; });
  const upcoming = [...acts].filter(a => new Date(a.fechaInicio) >= new Date()).sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio)).slice(0, 5);

  return (
    <div className="fade-in">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon" style={{ background: "var(--accent-soft)" }}><Icons.Activity size={20} color="var(--accent)" /></div><div className="value">{acts.length}</div><div className="label">Actividades</div></div>
        {user.rol === "admin" && <div className="stat-card"><div className="stat-icon" style={{ background: "var(--purple-soft)" }}><Icons.Users size={20} color="var(--purple)" /></div><div className="value">{data.userCount}</div><div className="label">Docentes</div></div>}
        <div className="stat-card"><div className="stat-icon" style={{ background: "var(--teal-soft)" }}><Icons.Handshake size={20} color="var(--teal)" /></div><div className="value">{data.agreementCount}</div><div className="label">Convenios</div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: "var(--success-soft)" }}><Icons.Mic size={20} color="var(--success)" /></div><div className="value">{data.speakerCount}</div><div className="label">Conferencistas</div></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="chart-container">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Actividades por Tipo</h3>
          <div className="chart-bar-group">{ACTIVITY_TYPES.map(t => { const c = typeCount[t] || 0; const mx = Math.max(...Object.values(typeCount), 1);
            return <div key={t} className="chart-bar-wrapper"><div className="chart-bar-value">{c}</div><div className="chart-bar" style={{ height: `${(c / mx) * 150}px`, background: typeColor(t) }} /><div className="chart-bar-label">{t.slice(0, 4)}</div></div>;
          })}</div>
        </div>
        <div className="table-container" style={{ maxHeight: 320, display: "flex", flexDirection: "column" }}>
          <div className="table-header" style={{ flexShrink: 0 }}><h3>Próximas Actividades</h3></div>
          {upcoming.length === 0 ? <div className="empty-state"><p>No hay actividades próximas</p></div> :
            <div className="table-scroll" style={{ flex: 1, overflow: "auto" }}><table><thead><tr><th>Actividad</th><th>Fecha</th><th>Tipo</th></tr></thead><tbody>
              {upcoming.map(a => <tr key={a._id}><td style={{ fontWeight: 600, fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nombre}</td><td style={{ fontSize: 12 }}>{formatDate(a.fechaInicio)}</td><td><span className={`badge ${typeBadge(a.tipo)}`}>{a.tipo}</span></td></tr>)}
            </tbody></table></div>}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CALENDAR
// ════════════════════════════════════════════════════════════════════════════
function CalendarView() {
  const [activities, setActivities] = useState([]); const [loading, setLoading] = useState(true);
  const [cur, setCur] = useState(new Date());
  const [viewing, setViewing] = useState(null);
  const [speakers, setSpeakers] = useState([]);

  useEffect(() => { (async () => { try {
    const [a, s] = await Promise.all([api.getActivities(), api.getSpeakersList()]);
    setActivities(a.actividades || []); setSpeakers(s.conferencistas || []);
  } catch (e) {} finally { setLoading(false); } })(); }, []);

  const y = cur.getFullYear(), m = cur.getMonth();
  const start = new Date(y, m, 1); start.setDate(start.getDate() - start.getDay());
  const end = new Date(y, m + 1, 0); end.setDate(end.getDate() + (6 - end.getDay()));
  const days = []; const d = new Date(start); while (d <= end) { days.push(new Date(d)); d.setDate(d.getDate() + 1); }
  const todayStr = new Date().toISOString().split("T")[0];
  const evts = (date) => { const ds = date.toISOString().split("T")[0]; return activities.filter(a => { const fi = toInputDate(a.fechaInicio), ff = toInputDate(a.fechaFin || a.fechaInicio); return ds >= fi && ds <= ff; }); };
  const spName = (c) => { if (!c) return "—"; return typeof c === "object" ? c.nombre || "—" : (speakers.find(x => x._id === c)?.nombre || "—"); };

  if (loading) return <Loading text="Cargando calendario..." />;
  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-secondary btn-icon" onClick={() => setCur(new Date(y, m - 1, 1))}><Icons.ChevL size={18} /></button>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, minWidth: 200, textAlign: "center" }}>{MONTHS[m]} {y}</h2>
          <button className="btn btn-secondary btn-icon" onClick={() => setCur(new Date(y, m + 1, 1))}><Icons.ChevR size={18} /></button>
        </div>
        <button className="btn btn-secondary" onClick={() => setCur(new Date())}>Hoy</button>
      </div>
      <div className="calendar-grid">
        {DAYS_NAMES.map(d => <div key={d} className="cal-header-cell">{d}</div>)}
        {days.map((day, i) => { const ds = day.toISOString().split("T")[0]; const ev = evts(day); const ot = day.getMonth() !== m;
          return <div key={i} className={`cal-cell ${ot ? "other-month" : ""} ${ds === todayStr ? "today" : ""}`}>
            <div className="cal-day-num">{day.getDate()}</div>
            <div className="cal-events-container">
              {ev.slice(0, 2).map(e => <div key={e._id} className="cal-event" style={{ background: typeColorBg(e.tipo), color: typeColor(e.tipo) }} onClick={() => setViewing(e)} title={e.nombre}>{e.nombre}</div>)}
              {ev.length > 2 && <div className="cal-event-more" onClick={() => { /* could open a day-detail in the future */ }}>+{ev.length - 2} más</div>}
            </div>
          </div>;
        })}
      </div>

      {/* Activity detail modal */}
      <Modal show={!!viewing} onClose={() => setViewing(null)} title="Detalle de Actividad">{viewing && <div>
        {[["Nombre", viewing.nombre],
          ["Fechas", `${formatDate(viewing.fechaInicio)} – ${formatDate(viewing.fechaFin)}`],
          ["Horario", viewing.horario],
          ["Tipo", <span className={`badge ${typeBadge(viewing.tipo)}`}>{viewing.tipo}</span>],
          ["Estado", <span className={`badge ${({"aprobada":"badge-green","pendiente":"badge-yellow","rechazada":"badge-red"})[viewing.estado] || "badge-blue"}`}>{viewing.estado || "aprobada"}</span>],
          ["Semestre", viewing.semestre],
          ["Temática", viewing.tematica],
          ["Descripción", viewing.descripcion],
          ["Lugar", viewing.lugar],
          ["Conferencista", spName(viewing.conferencista)],
          ["Movilidad", viewing.movilidad],
          ["Docente", `${viewing.docente?.nombre || ""} ${viewing.docente?.apellido || ""}`],
        ].map(([l, v]) =>
          <div key={l} className="detail-row"><div className="detail-label">{l}</div><div className="detail-value">{v || "—"}</div></div>
        )}
      </div>}</Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ACTIVITY FORM MODAL
// ════════════════════════════════════════════════════════════════════════════
function ActivityFormModal({ show, onClose, onSave, activity, speakers, agreements, user, docentes }) {
  const isEdit = !!activity;
  const isAdmin = user?.rol === "admin";
  const empty = { nombre: "", fechaInicio: "", fechaFin: "", horario: "", tipo: "", semestre: "", tematica: "", descripcion: "", lugar: "", conferencista: "", movilidad: "", convenio: "", publica: true, docente: "" };
  const [form, setForm] = useState(empty); const [errors, setErrors] = useState({}); const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (activity) setForm({ ...empty, ...activity, fechaInicio: toInputDate(activity.fechaInicio), fechaFin: toInputDate(activity.fechaFin), conferencista: activity.conferencista?._id || activity.conferencista || "", convenio: activity.convenio?._id || activity.convenio || "", docente: activity.docente?._id || activity.docente || "" });
    else setForm({ ...empty, docente: isAdmin ? "" : user?._id || "" });
  }, [activity, show]);
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };
  const validate = () => { const e = {}; if (!form.nombre.trim()) e.nombre = "Requerido"; if (!form.fechaInicio) e.fechaInicio = "Requerido"; if (!form.tipo) e.tipo = "Requerido"; if (!form.semestre) e.semestre = "Requerido"; if (isAdmin && !form.docente) e.docente = "Seleccione un docente"; setErrors(e); return !Object.keys(e).length; };
  const handleSave = async () => { if (!validate()) return; setSaving(true); try { await onSave({ ...form, fechaFin: form.fechaFin || form.fechaInicio }); onClose(); } catch (e) { addToast(e.message, "error"); } finally { setSaving(false); } };

  return (
    <Modal show={show} onClose={onClose} title={isEdit ? "Editar Actividad" : "Nueva Actividad"} footer={<>
      <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? <Icons.Loader size={14} /> : <Icons.Check size={14} />} {isEdit ? "Guardar" : "Registrar"}</button>
    </>}>
      {!isAdmin && !isEdit && (
        <div style={{ background: "var(--warning-soft)", color: "var(--warning)", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
          Las actividades creadas por docentes quedan en estado <strong>pendiente</strong> hasta ser aprobadas por un administrador.
        </div>
      )}
      <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={form.nombre} onChange={e => set("nombre", e.target.value)} />{errors.nombre && <div className="form-error">{errors.nombre}</div>}</div>
      {isAdmin && (
        <div className="form-group"><label className="form-label">Docente asignado *</label>
          <select className="form-select" value={form.docente} onChange={e => set("docente", e.target.value)}>
            <option value="">Seleccione un docente...</option>
            {docentes.map(d => <option key={d._id} value={d._id}>{d.nombre} {d.apellido} ({d.codigo})</option>)}
          </select>
          {errors.docente && <div className="form-error">{errors.docente}</div>}
        </div>
      )}
      <div className="form-row">
        <div className="form-group"><label className="form-label">Fecha Inicio *</label><input className="form-input" type="date" value={form.fechaInicio} onChange={e => set("fechaInicio", e.target.value)} />{errors.fechaInicio && <div className="form-error">{errors.fechaInicio}</div>}</div>
        <div className="form-group"><label className="form-label">Fecha Fin</label><input className="form-input" type="date" value={form.fechaFin} onChange={e => set("fechaFin", e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Horario</label><input className="form-input" value={form.horario} onChange={e => set("horario", e.target.value)} placeholder="08:00 - 12:00" /></div>
        <div className="form-group"><label className="form-label">Tipo *</label><select className="form-select" value={form.tipo} onChange={e => set("tipo", e.target.value)}><option value="">Seleccione...</option>{ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>{errors.tipo && <div className="form-error">{errors.tipo}</div>}</div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Semestre *</label><select className="form-select" value={form.semestre} onChange={e => set("semestre", e.target.value)}><option value="">Seleccione...</option>{SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}</select>{errors.semestre && <div className="form-error">{errors.semestre}</div>}</div>
        <div className="form-group"><label className="form-label">Movilidad</label><select className="form-select" value={form.movilidad} onChange={e => set("movilidad", e.target.value)}><option value="">Seleccione...</option>{MOBILITY_TYPES.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
      </div>
      <div className="form-group"><label className="form-label">Temática</label><input className="form-input" value={form.tematica} onChange={e => set("tematica", e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-textarea" value={form.descripcion} onChange={e => set("descripcion", e.target.value)} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Lugar</label><input className="form-input" value={form.lugar} onChange={e => set("lugar", e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Conferencista</label><select className="form-select" value={form.conferencista} onChange={e => set("conferencista", e.target.value)}><option value="">Sin conferencista</option>{speakers.map(s => <option key={s._id} value={s._id}>{s.nombre}</option>)}</select></div>
      </div>
      <div className="form-group"><label className="form-label">Convenio</label><select className="form-select" value={form.convenio} onChange={e => set("convenio", e.target.value)}><option value="">Sin convenio</option>{agreements.map(a => <option key={a._id} value={a._id}>{a.numero} – {a.empresa}</option>)}</select></div>
      {isAdmin && (
        <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}><input type="checkbox" checked={form.publica} onChange={e => set("publica", e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--accent)" }} /><label style={{ fontSize: 13, color: "var(--text-secondary)" }}>Visible en la vista pública</label></div>
      )}
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ACTIVITIES MODULE
// ════════════════════════════════════════════════════════════════════════════
const estadoBadge = (e) => ({ "aprobada": "badge-green", "pendiente": "badge-yellow", "rechazada": "badge-red" }[e] || "badge-blue");

function ActivitiesModule({ user }) {
  const [activities, setActivities] = useState([]); const [speakers, setSpeakers] = useState([]); const [agreements, setAgreements] = useState([]); const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true); const [showForm, setShowForm] = useState(false); const [editing, setEditing] = useState(null); const [viewing, setViewing] = useState(null);
  const [search, setSearch] = useState(""); const [filterType, setFilterType] = useState(""); const [filterEstado, setFilterEstado] = useState("");
  const [rejectId, setRejectId] = useState(null); const [rejectMotivo, setRejectMotivo] = useState("");

  const isAdmin = user?.rol === "admin";

  const load = useCallback(async () => { try {
    const qs = new URLSearchParams(); if (search) qs.set("search", search); if (filterType) qs.set("tipo", filterType); if (filterEstado) qs.set("estado", filterEstado);
    const promises = [api.getActivities(qs.toString()), api.getSpeakersList(), api.getAgreementsList()];
    if (isAdmin) promises.push(api.getUsers());
    const [a, s, g, u] = await Promise.all(promises);
    setActivities(a.actividades || []); setSpeakers(s.conferencistas || []); setAgreements(g.convenios || []);
    if (u) setDocentes(u.usuarios || []);
  } catch (e) { addToast(e.message, "error"); } finally { setLoading(false); } }, [search, filterType, filterEstado, isAdmin]);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (form) => { if (editing) { await api.updateActivity(editing._id, form); addToast("Actividad actualizada"); } else { await api.createActivity(form); addToast("Actividad registrada"); } setEditing(null); load(); };
  const handleDelete = async (id) => { if (!confirm("¿Eliminar esta actividad?")) return; try { await api.deleteActivity(id); addToast("Actividad eliminada", "error"); load(); } catch (e) { addToast(e.message, "error"); } };
  const handleApprove = async (id) => { try { await api.approveActivity(id, { publica: true }); addToast("Actividad aprobada"); load(); } catch (e) { addToast(e.message, "error"); } };
  const handleReject = async () => { if (!rejectId) return; try { await api.rejectActivity(rejectId, rejectMotivo); addToast("Actividad rechazada", "error"); setRejectId(null); setRejectMotivo(""); load(); } catch (e) { addToast(e.message, "error"); } };

  const spName = (c) => { if (!c) return "—"; return typeof c === "object" ? c.nombre || "—" : (speakers.find(x => x._id === c)?.nombre || "—"); };
  const agNum = (c) => { if (!c) return "—"; return typeof c === "object" ? c.numero || "—" : (agreements.find(x => x._id === c)?.numero || "—"); };

  const pendingCount = activities.filter(a => a.estado === "pendiente").length;

  if (loading) return <Loading text="Cargando actividades..." />;
  return (
    <div className="fade-in">
      {isAdmin && pendingCount > 0 && (
        <div style={{ background: "var(--warning-soft)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>⏳</span>
          <div><strong style={{ color: "var(--warning)" }}>{pendingCount} actividad{pendingCount > 1 ? "es" : ""} pendiente{pendingCount > 1 ? "s" : ""} de aprobación.</strong>
            <span style={{ color: "var(--text-secondary)", fontSize: 13, marginLeft: 8 }}>Filtre por estado "Pendiente" para revisarlas.</span>
          </div>
        </div>
      )}
      <div className="table-container">
        <div className="table-header">
          <h3>Actividades {isAdmin ? "(Todas)" : "(Mis actividades)"}</h3>
          <div className="table-actions">
            <div className="search-box"><Icons.Search size={14} /><input className="form-input" style={{ paddingLeft: 34, width: 180 }} placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            <select className="form-select" style={{ width: 150 }} value={filterType} onChange={e => setFilterType(e.target.value)}><option value="">Todos los tipos</option>{ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
            <select className="form-select" style={{ width: 140 }} value={filterEstado} onChange={e => setFilterEstado(e.target.value)}><option value="">Todo estado</option><option value="pendiente">Pendiente</option><option value="aprobada">Aprobada</option><option value="rechazada">Rechazada</option></select>
            <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><Icons.Plus size={14} /> Nueva</button>
          </div>
        </div>
        {activities.length === 0 ? <div className="empty-state"><Icons.FileText size={40} /><p>No hay actividades registradas</p></div> :
          <div className="table-scroll"><table><thead><tr><th>Nombre</th><th>Fecha</th><th>Tipo</th><th>Estado</th><th>Semestre</th>{isAdmin && <th>Docente</th>}<th>Acciones</th></tr></thead><tbody>
            {activities.map(a => <tr key={a._id}>
              <td style={{ fontWeight: 600 }}>{a.nombre}</td>
              <td style={{ fontSize: 12 }}>{formatDate(a.fechaInicio)}</td>
              <td><span className={`badge ${typeBadge(a.tipo)}`}>{a.tipo}</span></td>
              <td><span className={`badge ${estadoBadge(a.estado)}`}>{a.estado || "aprobada"}</span></td>
              <td>{a.semestre}</td>
              {isAdmin && <td style={{ fontSize: 12 }}>{a.docente?.nombre} {a.docente?.apellido}</td>}
              <td><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setViewing(a)} title="Ver"><Icons.Eye size={14} /></button>
                <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEditing(a); setShowForm(true); }} title="Editar"><Icons.Edit size={14} /></button>
                {isAdmin && a.estado === "pendiente" && <>
                  <button className="btn btn-success btn-sm" onClick={() => handleApprove(a._id)} title="Aprobar"><Icons.Check size={14} /> Aprobar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => { setRejectId(a._id); setRejectMotivo(""); }} title="Rechazar"><Icons.X size={14} /></button>
                </>}
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(a._id)} title="Eliminar"><Icons.Trash size={14} /></button>
              </div></td>
            </tr>)}
          </tbody></table></div>}
      </div>
      <ActivityFormModal show={showForm} onClose={() => { setShowForm(false); setEditing(null); }} onSave={handleSave} activity={editing} speakers={speakers} agreements={agreements} user={user} docentes={docentes} />
      {/* Detail modal */}
      <Modal show={!!viewing} onClose={() => setViewing(null)} title="Detalle de Actividad">{viewing && <div>
        {[["Nombre", viewing.nombre], ["Fechas", `${formatDate(viewing.fechaInicio)} – ${formatDate(viewing.fechaFin)}`], ["Horario", viewing.horario], ["Tipo", <span className={`badge ${typeBadge(viewing.tipo)}`}>{viewing.tipo}</span>],
          ["Estado", <span className={`badge ${estadoBadge(viewing.estado)}`}>{viewing.estado || "aprobada"}</span>],
          ...(viewing.estado === "rechazada" && viewing.motivoRechazo ? [["Motivo rechazo", <span style={{ color: "var(--danger)" }}>{viewing.motivoRechazo}</span>]] : []),
          ["Semestre", viewing.semestre], ["Temática", viewing.tematica], ["Descripción", viewing.descripcion], ["Lugar", viewing.lugar], ["Conferencista", spName(viewing.conferencista)], ["Movilidad", viewing.movilidad], ["Convenio", agNum(viewing.convenio)], ["Docente", `${viewing.docente?.nombre || ""} ${viewing.docente?.apellido || ""}`], ["Pública", viewing.publica ? "Sí" : "No"]].map(([l, v]) =>
          <div key={l} className="detail-row"><div className="detail-label">{l}</div><div className="detail-value">{v || "—"}</div></div>
        )}
      </div>}</Modal>
      {/* Reject modal */}
      <Modal show={!!rejectId} onClose={() => setRejectId(null)} title="Rechazar Actividad" footer={<>
        <button className="btn btn-secondary" onClick={() => setRejectId(null)}>Cancelar</button>
        <button className="btn btn-danger" onClick={handleReject}><Icons.X size={14} /> Rechazar</button>
      </>}>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>Indique el motivo del rechazo para que el docente pueda corregir la actividad:</p>
        <div className="form-group"><label className="form-label">Motivo del rechazo</label><textarea className="form-textarea" value={rejectMotivo} onChange={e => setRejectMotivo(e.target.value)} placeholder="Describa el motivo..." /></div>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// USERS MODULE (Admin only)
// ════════════════════════════════════════════════════════════════════════════
function UsersModule() {
  const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true); const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false); const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", apellido: "", codigo: "", correo: "", documento: "", tipo: "Planta" }); const [errors, setErrors] = useState({}); const [saving, setSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState(""); const [inviteName, setInviteName] = useState(""); const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => { try { const d = await api.getUsers(`search=${search}`); setUsers(d.usuarios || []); } catch (e) {} finally { setLoading(false); } }, [search]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (editing) setForm({ nombre: editing.nombre, apellido: editing.apellido, codigo: editing.codigo, correo: editing.correo, documento: editing.documento, tipo: editing.tipo }); else setForm({ nombre: "", apellido: "", codigo: "", correo: "", documento: "", tipo: "Planta" }); }, [editing, showForm]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };
  const handleSave = async () => { const e = {}; ["nombre", "apellido", "correo", "documento", "codigo"].forEach(f => { if (!form[f]?.trim()) e[f] = "Requerido"; }); setErrors(e); if (Object.keys(e).length) return; setSaving(true); try { if (editing) { await api.updateUser(editing._id, form); addToast("Docente actualizado"); } setShowForm(false); setEditing(null); load(); } catch (e) { addToast(e.message, "error"); } finally { setSaving(false); } };
  const toggleStatus = async (id) => { try { await api.toggleUserStatus(id); addToast("Estado actualizado"); load(); } catch (e) { addToast(e.message, "error"); } };
  const handleInvite = async () => { if (!inviteEmail.trim()) { addToast("Ingrese un correo", "error"); return; } setInviting(true); try { await api.invite({ correo: inviteEmail, nombre: inviteName }); addToast("Enlace enviado"); setInviteEmail(""); setInviteName(""); } catch (e) { addToast(e.message, "error"); } finally { setInviting(false); } };

  if (loading) return <Loading text="Cargando docentes..." />;
  return (
    <div className="fade-in">
      <div className="invite-bar"><div className="form-group" style={{ marginBottom: 0, flex: 1 }}><label className="form-label">Invitar Nuevo Docente</label><div style={{ display: "flex", gap: 8 }}><input className="form-input" placeholder="Nombre (opcional)" value={inviteName} onChange={e => setInviteName(e.target.value)} style={{ maxWidth: 180 }} /><input className="form-input" placeholder="correo@ufps.edu.co" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} style={{ flex: 1 }} /><button className="btn btn-primary" onClick={handleInvite} disabled={inviting}>{inviting ? <Icons.Loader size={14} /> : <Icons.Send size={14} />} Enviar</button></div></div></div>
      <div className="table-container">
        <div className="table-header"><h3>Gestión de Docentes</h3><div className="search-box"><Icons.Search size={14} /><input className="form-input" style={{ paddingLeft: 34, width: 200 }} placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
        {users.length === 0 ? <div className="empty-state"><Icons.Users size={40} /><p>No hay docentes</p></div> :
          <div className="table-scroll"><table><thead><tr><th>Nombre</th><th>Código</th><th>Correo</th><th>Tipo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
            {users.map(u => <tr key={u._id}><td style={{ fontWeight: 600 }}>{u.nombre} {u.apellido}</td><td>{u.codigo}</td><td style={{ fontSize: 12 }}>{u.correo}</td><td>{u.tipo}</td>
              <td><span className={`badge ${u.estado === "activo" ? "badge-green" : "badge-red"}`}>{u.estado}</span></td>
              <td><div style={{ display: "flex", gap: 4 }}><button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEditing(u); setShowForm(true); }}><Icons.Edit size={14} /></button><button className={`btn btn-sm ${u.estado === "activo" ? "btn-danger" : "btn-success"}`} onClick={() => toggleStatus(u._id)}>{u.estado === "activo" ? "Inactivar" : "Activar"}</button></div></td>
            </tr>)}
          </tbody></table></div>}
      </div>
      <Modal show={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title="Editar Docente" footer={<><button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Cancelar</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}><Icons.Check size={14} /> Guardar</button></>}>
        <div className="form-row"><div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={form.nombre} onChange={e => set("nombre", e.target.value)} />{errors.nombre && <div className="form-error">{errors.nombre}</div>}</div><div className="form-group"><label className="form-label">Apellido *</label><input className="form-input" value={form.apellido} onChange={e => set("apellido", e.target.value)} />{errors.apellido && <div className="form-error">{errors.apellido}</div>}</div></div>
        <div className="form-row"><div className="form-group"><label className="form-label">Correo *</label><input className="form-input" value={form.correo} onChange={e => set("correo", e.target.value)} />{errors.correo && <div className="form-error">{errors.correo}</div>}</div><div className="form-group"><label className="form-label">Tipo</label><select className="form-select" value={form.tipo} onChange={e => set("tipo", e.target.value)}><option value="Planta">Planta</option><option value="Cátedra">Cátedra</option><option value="Ocasional">Ocasional</option></select></div></div>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AGREEMENTS MODULE
// ════════════════════════════════════════════════════════════════════════════
function AgreementsModule() {
  const [agreements, setAgreements] = useState([]); const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ numero: "", fecha: "", descripcion: "", razon: "", empresa: "", evidencia: "" }); const [errors, setErrors] = useState({}); const [saving, setSaving] = useState(false);

  const load = useCallback(async () => { try { const d = await api.getAgreements(); setAgreements(d.convenios || []); } catch (e) {} finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (editing) setForm({ numero: editing.numero, fecha: toInputDate(editing.fecha), descripcion: editing.descripcion || "", razon: editing.razon || "", empresa: editing.empresa, evidencia: editing.evidencia || "" }); else setForm({ numero: "", fecha: "", descripcion: "", razon: "", empresa: "", evidencia: "" }); }, [editing, showForm]);
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  const handleSave = async () => { const e = {}; if (!form.numero.trim()) e.numero = "Requerido"; if (!form.empresa.trim()) e.empresa = "Requerido"; setErrors(e); if (Object.keys(e).length) return; setSaving(true); try { if (editing) { await api.updateAgreement(editing._id, form); addToast("Convenio actualizado"); } else { await api.createAgreement(form); addToast("Convenio registrado"); } setShowForm(false); setEditing(null); load(); } catch (e) { addToast(e.message, "error"); } finally { setSaving(false); } };

  if (loading) return <Loading text="Cargando convenios..." />;
  return (
    <div className="fade-in">
      <div className="table-container">
        <div className="table-header"><h3>Gestión de Convenios</h3><button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><Icons.Plus size={14} /> Nuevo Convenio</button></div>
        {agreements.length === 0 ? <div className="empty-state"><Icons.Handshake size={40} /><p>No hay convenios</p></div> :
          <div className="table-scroll"><table><thead><tr><th>Número</th><th>Empresa</th><th>Fecha</th><th>Descripción</th><th>Acciones</th></tr></thead><tbody>
            {agreements.map(a => <tr key={a._id}><td style={{ fontWeight: 600 }}>{a.numero}</td><td>{a.empresa}</td><td style={{ fontSize: 12 }}>{formatDate(a.fecha)}</td><td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.descripcion}</td><td><button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEditing(a); setShowForm(true); }}><Icons.Edit size={14} /></button></td></tr>)}
          </tbody></table></div>}
      </div>
      <Modal show={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? "Editar Convenio" : "Nuevo Convenio"} footer={<><button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Cancelar</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}><Icons.Check size={14} /> {editing ? "Guardar" : "Registrar"}</button></>}>
        <div className="form-row"><div className="form-group"><label className="form-label">Número *</label><input className="form-input" value={form.numero} onChange={e => set("numero", e.target.value)} />{errors.numero && <div className="form-error">{errors.numero}</div>}</div><div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" value={form.fecha} onChange={e => set("fecha", e.target.value)} /></div></div>
        <div className="form-group"><label className="form-label">Empresa *</label><input className="form-input" value={form.empresa} onChange={e => set("empresa", e.target.value)} />{errors.empresa && <div className="form-error">{errors.empresa}</div>}</div>
        <div className="form-group"><label className="form-label">Razón</label><input className="form-input" value={form.razon} onChange={e => set("razon", e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-textarea" value={form.descripcion} onChange={e => set("descripcion", e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Evidencia</label><input className="form-input" value={form.evidencia} onChange={e => set("evidencia", e.target.value)} /></div>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SPEAKERS MODULE
// ════════════════════════════════════════════════════════════════════════════
function SpeakersModule() {
  const [speakers, setSpeakers] = useState([]); const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", identificacion: "", telefono: "", correo: "", institucion: "", especialidad: "" }); const [errors, setErrors] = useState({}); const [saving, setSaving] = useState(false);

  const load = useCallback(async () => { try { const d = await api.getSpeakers(); setSpeakers(d.conferencistas || []); } catch (e) {} finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (editing) setForm({ nombre: editing.nombre, identificacion: editing.identificacion || "", telefono: editing.telefono || "", correo: editing.correo || "", institucion: editing.institucion || "", especialidad: editing.especialidad || "" }); else setForm({ nombre: "", identificacion: "", telefono: "", correo: "", institucion: "", especialidad: "" }); }, [editing, showForm]);
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  const handleSave = async () => { if (!form.nombre.trim()) { setErrors({ nombre: "Requerido" }); return; } setSaving(true); try { if (editing) { await api.updateSpeaker(editing._id, form); addToast("Conferencista actualizado"); } else { await api.createSpeaker(form); addToast("Conferencista registrado"); } setShowForm(false); setEditing(null); load(); } catch (e) { addToast(e.message, "error"); } finally { setSaving(false); } };

  if (loading) return <Loading text="Cargando conferencistas..." />;
  return (
    <div className="fade-in">
      <div className="table-container">
        <div className="table-header"><h3>Gestión de Conferencistas</h3><button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}><Icons.Plus size={14} /> Nuevo</button></div>
        {speakers.length === 0 ? <div className="empty-state"><Icons.Mic size={40} /><p>No hay conferencistas</p></div> :
          <div className="table-scroll"><table><thead><tr><th>Nombre</th><th>Identificación</th><th>Correo</th><th>Institución</th><th>Especialidad</th><th>Acciones</th></tr></thead><tbody>
            {speakers.map(s => <tr key={s._id}><td style={{ fontWeight: 600 }}>{s.nombre}</td><td style={{ fontSize: 12 }}>{s.identificacion}</td><td style={{ fontSize: 12 }}>{s.correo}</td><td>{s.institucion}</td><td>{s.especialidad}</td><td><button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setEditing(s); setShowForm(true); }}><Icons.Edit size={14} /></button></td></tr>)}
          </tbody></table></div>}
      </div>
      <Modal show={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? "Editar Conferencista" : "Nuevo Conferencista"} footer={<><button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null); }}>Cancelar</button><button className="btn btn-primary" onClick={handleSave} disabled={saving}><Icons.Check size={14} /> {editing ? "Guardar" : "Registrar"}</button></>}>
        <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={form.nombre} onChange={e => set("nombre", e.target.value)} />{errors.nombre && <div className="form-error">{errors.nombre}</div>}</div>
        <div className="form-row"><div className="form-group"><label className="form-label">Identificación</label><input className="form-input" value={form.identificacion} onChange={e => set("identificacion", e.target.value)} /></div><div className="form-group"><label className="form-label">Teléfono</label><input className="form-input" value={form.telefono} onChange={e => set("telefono", e.target.value)} /></div></div>
        <div className="form-row"><div className="form-group"><label className="form-label">Correo</label><input className="form-input" value={form.correo} onChange={e => set("correo", e.target.value)} /></div><div className="form-group"><label className="form-label">Institución</label><input className="form-input" value={form.institucion} onChange={e => set("institucion", e.target.value)} /></div></div>
        <div className="form-group"><label className="form-label">Especialidad</label><input className="form-input" value={form.especialidad} onChange={e => set("especialidad", e.target.value)} /></div>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// REPORTS MODULE
// ════════════════════════════════════════════════════════════════════════════
function ReportsModule() {
  const [activities, setActivities] = useState([]); const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true); const [exporting, setExporting] = useState(false);
  const [dateFrom, setDateFrom] = useState(""); const [dateTo, setDateTo] = useState(""); const [fType, setFType] = useState(""); const [fSem, setFSem] = useState("");

  const load = useCallback(async () => { setLoading(true); try { const qs = new URLSearchParams(); if (dateFrom) qs.set("fechaDesde", dateFrom); if (dateTo) qs.set("fechaHasta", dateTo); if (fType) qs.set("tipo", fType); if (fSem) qs.set("semestre", fSem);
    const [a, s] = await Promise.all([api.getActivities(qs.toString()), api.getActivityStats(qs.toString())]); setActivities(a.actividades || []); setStats(s.estadisticas || null);
  } catch (e) {} finally { setLoading(false); } }, [dateFrom, dateTo, fType, fSem]);
  useEffect(() => { load(); }, [load]);

  const handlePDF = async () => { setExporting(true); try { const qs = new URLSearchParams(); if (dateFrom) qs.set("fechaDesde", dateFrom); if (dateTo) qs.set("fechaHasta", dateTo); if (fType) qs.set("tipo", fType); if (fSem) qs.set("semestre", fSem);
    const blob = await api.exportPDF(qs.toString()); const url = window.URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `ACTISIS_Informe_${new Date().toISOString().split("T")[0]}.pdf`; a.click(); window.URL.revokeObjectURL(url); addToast("PDF descargado");
  } catch (e) { addToast("Error al exportar", "error"); } finally { setExporting(false); } };

  const pt = stats?.porTipo || []; const ps = stats?.porSemestre || []; const pm = stats?.porMovilidad || [];

  return (
    <div className="fade-in">
      <div className="chart-container" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Filtros de Informe</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Desde</label><input className="form-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 160 }} /></div>
          <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Hasta</label><input className="form-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 160 }} /></div>
          <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Tipo</label><select className="form-select" value={fType} onChange={e => setFType(e.target.value)} style={{ width: 160 }}><option value="">Todos</option>{ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Semestre</label><select className="form-select" value={fSem} onChange={e => setFSem(e.target.value)} style={{ width: 140 }}><option value="">Todos</option>{SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <button className="btn btn-secondary" onClick={() => { setDateFrom(""); setDateTo(""); setFType(""); setFSem(""); }}>Limpiar</button>
        </div>
      </div>
      {loading ? <Loading text="Generando informe..." /> : <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          {[["Por Tipo", pt, (x) => typeColor(x._id)], ["Por Semestre", ps, () => "var(--purple)"], ["Por Movilidad", pm, () => "var(--teal)"]].map(([title, data, color]) => (
            <div key={title} className="chart-container"><h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>{title}</h4><div className="chart-bar-group" style={{ height: 160 }}>
              {data.map(x => { const mx = Math.max(...data.map(d => d.count), 1); return <div key={x._id || "n"} className="chart-bar-wrapper"><div className="chart-bar-value">{x.count}</div><div className="chart-bar" style={{ height: `${(x.count / mx) * 120}px`, background: color(x) }} /><div className="chart-bar-label">{(x._id || "N/A").slice(0, 6)}</div></div>; })}
            </div></div>
          ))}
        </div>
        <div className="table-container">
          <div className="table-header"><h3>Resultados ({activities.length})</h3><button className="btn btn-primary" onClick={handlePDF} disabled={exporting}>{exporting ? <Icons.Loader size={14} /> : <Icons.Download size={14} />} Exportar PDF</button></div>
          {activities.length === 0 ? <div className="empty-state"><Icons.BarChart size={40} /><p>No hay resultados</p></div> :
            <div className="table-scroll"><table><thead><tr><th>Nombre</th><th>Fecha</th><th>Tipo</th><th>Semestre</th><th>Movilidad</th><th>Docente</th></tr></thead><tbody>
              {activities.map(a => <tr key={a._id}><td style={{ fontWeight: 600 }}>{a.nombre}</td><td style={{ fontSize: 12 }}>{formatDate(a.fechaInicio)}</td><td><span className={`badge ${typeBadge(a.tipo)}`}>{a.tipo}</span></td><td>{a.semestre}</td><td>{a.movilidad || "—"}</td><td style={{ fontSize: 12 }}>{a.docente?.nombre} {a.docente?.apellido}</td></tr>)}
            </tbody></table></div>}
        </div>
      </>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PROFILE MODULE
// ════════════════════════════════════════════════════════════════════════════
function ProfileModule({ user, onUserUpdate }) {
  const [editing, setEditing] = useState(false); const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: user.nombre, apellido: user.apellido, correo: user.correo, tipo: user.tipo });
  const [showPass, setShowPass] = useState(false); const [passForm, setPassForm] = useState({ passwordActual: "", passwordNueva: "" }); const [savingPass, setSavingPass] = useState(false);

  const handleSave = async () => { setSaving(true); try { const d = await api.updateProfile(form); api.setUser(d.usuario); onUserUpdate(d.usuario); setEditing(false); addToast("Perfil actualizado"); } catch (e) { addToast(e.message, "error"); } finally { setSaving(false); } };
  const handlePass = async () => { if (passForm.passwordNueva.length < 6) { addToast("Mínimo 6 caracteres", "error"); return; } setSavingPass(true); try { await api.changePassword(passForm); setPassForm({ passwordActual: "", passwordNueva: "" }); setShowPass(false); addToast("Contraseña actualizada"); } catch (e) { addToast(e.message, "error"); } finally { setSavingPass(false); } };

  return (
    <div className="fade-in">
      <div className="profile-card" style={{ maxWidth: 600 }}>
        <div className="profile-banner"><div className="profile-avatar-lg">{user.nombre?.[0]}{user.apellido?.[0]}</div></div>
        <div className="profile-content">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{user.nombre} {user.apellido}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>{user.rol === "admin" ? "Administrador" : "Docente"} · {user.codigo}</p>
          {editing ? (<>
            <div className="form-row"><div className="form-group"><label className="form-label">Nombre</label><input className="form-input" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} /></div><div className="form-group"><label className="form-label">Apellido</label><input className="form-input" value={form.apellido} onChange={e => setForm(p => ({ ...p, apellido: e.target.value }))} /></div></div>
            <div className="form-group"><label className="form-label">Correo</label><input className="form-input" value={form.correo} onChange={e => setForm(p => ({ ...p, correo: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Tipo</label><select className="form-select" value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}><option value="Planta">Planta</option><option value="Cátedra">Cátedra</option><option value="Ocasional">Ocasional</option></select></div>
            <div style={{ display: "flex", gap: 8 }}><button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? <Icons.Loader size={14} /> : <Icons.Check size={14} />} Guardar</button><button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancelar</button></div>
          </>) : (<>
            {[["Documento", user.documento], ["Código", user.codigo], ["Correo", user.correo], ["Tipo", user.tipo], ["Estado", <span className={`badge ${user.estado === "activo" ? "badge-green" : "badge-red"}`}>{user.estado}</span>]].map(([l, v]) => <div key={l} className="detail-row"><div className="detail-label">{l}</div><div className="detail-value">{v}</div></div>)}
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}><button className="btn btn-primary" onClick={() => setEditing(true)}><Icons.Edit size={14} /> Editar Perfil</button><button className="btn btn-secondary" onClick={() => setShowPass(true)}><Icons.Lock size={14} /> Cambiar Contraseña</button></div>
          </>)}
        </div>
      </div>
      <Modal show={showPass} onClose={() => setShowPass(false)} title="Cambiar Contraseña" footer={<><button className="btn btn-secondary" onClick={() => setShowPass(false)}>Cancelar</button><button className="btn btn-primary" onClick={handlePass} disabled={savingPass}><Icons.Check size={14} /> Cambiar</button></>}>
        <div className="form-group"><label className="form-label">Contraseña actual</label><input className="form-input" type="password" value={passForm.passwordActual} onChange={e => setPassForm(p => ({ ...p, passwordActual: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Nueva contraseña (mín. 6)</label><input className="form-input" type="password" value={passForm.passwordNueva} onChange={e => setPassForm(p => ({ ...p, passwordNueva: e.target.value }))} /></div>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("loading");
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = api.getToken();
    const saved = api.getUser();
    if (token && saved) {
      // Verificar token sin usar el interceptor de 401 que hace reload
      api.me()
        .then(d => { setCurrentUser(d.usuario); setView("app"); })
        .catch(() => {
          api.clearToken();
          api.clearUser();
          setView("login");
        });
    } else {
      setView("login");
    }
  }, []);

  const handleLogin = (user) => { setCurrentUser(user); setView("app"); setPage("dashboard"); };
  const handleLogout = async () => { try { await api.logout(); } catch (e) {} api.clearToken(); api.clearUser(); setCurrentUser(null); setView("login"); };

  const navItems = useMemo(() => {
    const items = [{ id: "dashboard", label: "Dashboard", icon: Icons.Home, section: "Principal" }, { id: "activities", label: "Actividades", icon: Icons.Activity, section: "Principal" }, { id: "calendar", label: "Calendario", icon: Icons.Calendar, section: "Principal" }];
    if (currentUser?.rol === "admin") items.push({ id: "users", label: "Docentes", icon: Icons.Users, section: "Administración" }, { id: "agreements", label: "Convenios", icon: Icons.Handshake, section: "Administración" }, { id: "speakers", label: "Conferencistas", icon: Icons.Mic, section: "Administración" }, { id: "reports", label: "Reportes", icon: Icons.BarChart, section: "Informes" });
    items.push({ id: "profile", label: "Mi Perfil", icon: Icons.User, section: "Cuenta" });
    return items;
  }, [currentUser]);

  const sections = useMemo(() => { const s = {}; navItems.forEach(i => { if (!s[i.section]) s[i.section] = []; s[i.section].push(i); }); return s; }, [navItems]);
  const pageTitle = navItems.find(i => i.id === page)?.label || "Dashboard";

  if (view === "loading") return <div className="login-page"><div className="login-bg" /><Loading text="Iniciando ACTISIS..." /></div>;
  if (view === "login") return <><LoginPage onLogin={handleLogin} onPublicView={() => setView("public")} /><ToastContainer /></>;
  if (view === "public") return <><PublicView onBack={() => setView("login")} /><ToastContainer /></>;

  return (
    <><ToastContainer />
      <div className="app">
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-brand"><div className="brand-icon">A</div><div className="brand-text"><h2>ACTISIS</h2><span>Ing. Sistemas</span></div></div>
          <nav className="sidebar-nav">{Object.entries(sections).map(([sec, items]) => (
            <div key={sec} className="nav-section"><div className="nav-section-title">{sec}</div>{items.map(it => <button key={it.id} className={`nav-item ${page === it.id ? "active" : ""}`} onClick={() => { setPage(it.id); setSidebarOpen(false); }}><it.icon size={18} />{it.label}</button>)}</div>
          ))}</nav>
          <div className="sidebar-user"><div className="user-avatar">{currentUser?.nombre?.[0]}{currentUser?.apellido?.[0]}</div><div className="user-info"><div className="name">{currentUser?.nombre} {currentUser?.apellido}</div><div className="role">{currentUser?.rol}</div></div><button className="logout-btn" onClick={handleLogout} title="Cerrar Sesión"><Icons.LogOut size={18} /></button></div>
        </aside>
        <main className="main">
          <header className="header"><div style={{ display: "flex", alignItems: "center", gap: 12 }}><button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}><Icons.Menu size={22} /></button><h1 className="header-title">{pageTitle}</h1></div><span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span></header>
          <div className="content">
            {page === "dashboard" && <Dashboard user={currentUser} />}
            {page === "activities" && <ActivitiesModule user={currentUser} />}
            {page === "calendar" && <CalendarView />}
            {page === "users" && currentUser?.rol === "admin" && <UsersModule />}
            {page === "agreements" && currentUser?.rol === "admin" && <AgreementsModule />}
            {page === "speakers" && currentUser?.rol === "admin" && <SpeakersModule />}
            {page === "reports" && currentUser?.rol === "admin" && <ReportsModule />}
            {page === "profile" && <ProfileModule user={currentUser} onUserUpdate={u => { setCurrentUser(u); api.setUser(u); }} />}
          </div>
        </main>
      </div>
      {sidebarOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 99 }} onClick={() => setSidebarOpen(false)} />}
    </>
  );
}
