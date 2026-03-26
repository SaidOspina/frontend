import { useState, useEffect } from "react";
import * as Icons from "./Icons";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
export const ACTIVITY_TYPES = ["Académica", "Autoevaluación", "Investigación", "Extensión", "Capacitación"];
export const SEMESTERS = ["2024-1", "2024-2", "2025-1", "2025-2", "2026-1", "2026-2"];
export const MOBILITY_TYPES = ["Nacional", "Internacional", "Virtual", "N/A"];
export const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
export const DAYS_NAMES = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

// ─── HELPERS ────────────────────────────────────────────────────────────────
export const typeBadge = (t) => ({"Académica":"badge-blue","Autoevaluación":"badge-yellow","Investigación":"badge-purple","Extensión":"badge-teal","Capacitación":"badge-green"}[t]||"badge-blue");
export const typeColor = (t) => ({"Académica":"var(--accent)","Autoevaluación":"var(--warning)","Investigación":"var(--purple)","Extensión":"var(--teal)","Capacitación":"var(--success)"}[t]||"var(--accent)");
export const typeColorBg = (t) => ({"Académica":"var(--accent-soft)","Autoevaluación":"var(--warning-soft)","Investigación":"var(--purple-soft)","Extensión":"var(--teal-soft)","Capacitación":"var(--success-soft)"}[t]||"var(--accent-soft)");
export const formatDate = (d) => { if(!d) return "—"; return new Date(d).toLocaleDateString("es-CO",{day:"2-digit",month:"short",year:"numeric"}); };
export const toInputDate = (d) => { if(!d) return ""; return new Date(d).toISOString().split("T")[0]; };

// ─── TOAST SYSTEM ───────────────────────────────────────────────────────────
let toastListeners = [];
export const addToast = (msg, type="success") => { toastListeners.forEach(fn => fn({id:Math.random().toString(36).slice(2,8),msg,type})); };

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const fn = (t) => { setToasts(p=>[...p,t]); setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==t.id)),3000); };
    toastListeners.push(fn);
    return () => { toastListeners = toastListeners.filter(x=>x!==fn); };
  }, []);
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === "success" ? <Icons.Check size={16}/> : <Icons.X size={16}/>}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── LOADING ────────────────────────────────────────────────────────────────
export function Loading({ text = "Cargando..." }) {
  return <div className="loading-center"><Icons.Loader size={28}/><span style={{fontSize:13}}>{text}</span></div>;
}

// ─── MODAL ──────────────────────────────────────────────────────────────────
export function Modal({ show, onClose, title, children, footer }) {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><Icons.X size={18}/></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
