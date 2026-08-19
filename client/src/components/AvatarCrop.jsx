import { useEffect, useId, useRef, useState } from "react";
import { squareImageToAvatarDataUrl } from "../helpers";

const VIEW = 280;
const CIRCLE = 232;
const RADIUS = CIRCLE / 2;

export default function AvatarCrop({ src, t, onCancel, onApply }) {
  const maskId = useId().replace(/:/g, "");
  const imgRef = useRef(null);
  const drag = useRef(null);
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setReady(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [src]);

  function metrics() {
    const img = imgRef.current;
    if (!img?.naturalWidth) return null;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const base = CIRCLE / Math.min(nw, nh);
    const scale = base * zoom;
    const maxX = Math.max(0, (nw * scale) / 2 - RADIUS);
    const maxY = Math.max(0, (nh * scale) / 2 - RADIUS);
    return { nw, nh, scale, maxX, maxY };
  }

  function clampPan(next, m) {
    const box = m || metrics();
    if (!box) return next;
    return {
      x: Math.max(-box.maxX, Math.min(box.maxX, next.x)),
      y: Math.max(-box.maxY, Math.min(box.maxY, next.y)),
    };
  }

  function onImgLoad() {
    setReady(true);
    setPan({ x: 0, y: 0 });
  }

  function onPointerDown(e) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, pan };
  }

  function onPointerMove(e) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    setPan(clampPan({ x: drag.current.pan.x + dx, y: drag.current.pan.y + dy }));
  }

  function onPointerUp(e) {
    drag.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onZoom(value) {
    const nextZoom = Number(value);
    setZoom(nextZoom);
    const img = imgRef.current;
    if (!img?.naturalWidth) return;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const base = CIRCLE / Math.min(nw, nh);
    const scale = base * nextZoom;
    const maxX = Math.max(0, (nw * scale) / 2 - RADIUS);
    const maxY = Math.max(0, (nh * scale) / 2 - RADIUS);
    setPan((p) => ({
      x: Math.max(-maxX, Math.min(maxX, p.x)),
      y: Math.max(-maxY, Math.min(maxY, p.y)),
    }));
  }

  async function apply() {
    const img = imgRef.current;
    const m = metrics();
    if (!img || !m) return;
    setBusy(true);
    try {
      const side = CIRCLE / m.scale;
      const sx = m.nw / 2 - pan.x / m.scale - side / 2;
      const sy = m.nh / 2 - pan.y / m.scale - side / 2;
      const dataUrl = await squareImageToAvatarDataUrl(img, sx, sy, side);
      onApply(dataUrl);
    } catch {
      onApply("");
    } finally {
      setBusy(false);
    }
  }

  const m = ready ? metrics() : null;
  const imgStyle = m
    ? {
        width: m.nw * m.scale,
        height: m.nh * m.scale,
        left: VIEW / 2 - (m.nw * m.scale) / 2 + pan.x,
        top: VIEW / 2 - (m.nh * m.scale) / 2 + pan.y,
      }
    : { opacity: 0 };

  return (
    <div className="avatar-crop">
      <p className="crop-hint">{t.cropHint}</p>
      <div
        className="crop-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img ref={imgRef} src={src} alt="" draggable={false} onLoad={onImgLoad} style={imgStyle} />
        <svg className="crop-mask" viewBox={`0 0 ${VIEW} ${VIEW}`} aria-hidden="true">
          <defs>
            <mask id={maskId}>
              <rect width={VIEW} height={VIEW} fill="#fff" />
              <circle cx={VIEW / 2} cy={VIEW / 2} r={RADIUS} fill="#000" />
            </mask>
          </defs>
          <rect width={VIEW} height={VIEW} fill="rgba(43,36,24,0.58)" mask={`url(#${maskId})`} />
          <circle cx={VIEW / 2} cy={VIEW / 2} r={RADIUS} fill="none" stroke="#C9A227" strokeWidth="2.5" />
        </svg>
      </div>
      <label className="crop-zoom">
        <span>{t.cropZoom}</span>
        <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => onZoom(e.target.value)} />
      </label>
      <div className="btn-row crop-actions">
        <button className="btn btn-ghost" type="button" onClick={onCancel}>{t.cropCancel}</button>
        <button className="btn btn-gold" type="button" disabled={!ready || busy} onClick={apply}>
          {busy ? "..." : t.cropApply}
        </button>
      </div>
    </div>
  );
}
