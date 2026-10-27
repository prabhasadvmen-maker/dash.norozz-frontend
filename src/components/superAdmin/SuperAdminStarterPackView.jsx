import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, Save, Loader2, Clock, Calendar, Eye, RotateCcw, Wand2, Ticket, Timer, Users, Power } from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { catalogService } from '../../services/catalog.service.js';
import { toast } from '../../utils/toast.js';

const DEFAULTS = {
  badge: 'STARTER PACK',
  subBadge: '✦ ONE TIME OFFER ✦',
  originalPrice: '398',
  offerPrice: '139',
  ticketOriginalPrice: '199',
  ticketOfferPrice: '70',
  perVisitPriceText: 'Only ₹70 per visit',
  visitCount: '2',
  visitDurationMinutes: '60',
  validityDays: '15',
  bannerColor: '#ec4899',
  isActive: true,
  targetAudience: 'NEW_USERS_ONLY',
  applicableCategory: '',
  applicableService: '',
};

const NUMERIC = ['originalPrice', 'offerPrice', 'ticketOriginalPrice', 'ticketOfferPrice', 'visitCount', 'visitDurationMinutes', 'validityDays'];

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' };
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', background: '#ffffff', outline: 'none', boxSizing: 'border-box' };

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const idOf = (v) => (v && typeof v === 'object' ? v._id : v) || '';

// Server document -> editable form (numbers are kept as text so the inputs can be cleared while typing)
const toForm = (d = {}) => {
  const out = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS)) {
    if (d[key] === undefined || d[key] === null) continue;
    out[key] = NUMERIC.includes(key) ? String(d[key]) : d[key];
  }
  out.applicableCategory = idOf(d.applicableCategory);
  out.applicableService = idOf(d.applicableService);
  return out;
};

const Section = ({ icon: Icon, title, hint, children }) => (
  <section style={{ ...card, padding: '20px 22px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} color="#db2777" />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
        {hint && <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>{hint}</p>}
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>{children}</div>
  </section>
);

const Field = ({ label, hint, error, wide, children }) => (
  <label style={{ display: 'block', gridColumn: wide ? '1 / -1' : undefined, minWidth: 0 }}>
    <span style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>{label}</span>
    {children}
    {(error || hint) && <span style={{ display: 'block', marginTop: '5px', fontSize: '0.74rem', color: error ? '#b91c1c' : '#94a3b8', fontWeight: error ? 700 : 500 }}>{error || hint}</span>}
  </label>
);

const Preview = ({ f }) => {
  const visits = Number(f.visitCount) || 0;
  return (
    <div style={{ background: '#090d16', borderRadius: '22px', padding: '18px', color: '#ffffff', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(135deg, #111827 0%, #1f293d 100%)', borderRadius: '18px', padding: '22px 18px', position: 'relative', marginBottom: '14px', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#000000', fontSize: '0.68rem', fontWeight: 900, letterSpacing: '1px', padding: '4px 11px', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>{f.badge || '—'}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px', position: 'relative', height: '76px' }}>
          <div style={{ position: 'absolute', width: '88px', height: '48px', background: '#be185d', borderRadius: '8px', transform: 'rotate(-15deg)', opacity: 0.8 }} />
          <div style={{ position: 'absolute', width: '88px', height: '48px', background: '#9d174d', borderRadius: '8px', transform: 'rotate(15deg)', opacity: 0.8 }} />
          <div style={{ position: 'relative', zIndex: 2, background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', borderRadius: '12px', padding: '8px 16px', boxShadow: '0 8px 24px rgba(236, 72, 153, 0.4)', display: 'flex', alignItems: 'center', gap: '8px', border: '1.5px dashed rgba(255, 255, 255, 0.4)' }}>
            <span style={{ fontSize: '1rem', textDecoration: 'line-through', opacity: 0.75, fontWeight: 700 }}>{money(f.ticketOriginalPrice)}</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>{money(f.ticketOfferPrice)}</span>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 900, letterSpacing: '1px', color: '#ec4899', marginBottom: '8px' }}>{f.subBadge}</div>
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 900, marginRight: '8px' }}>{visits} VISITS FOR</span>
        <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', opacity: 0.5, fontWeight: 800, marginRight: '6px' }}>{money(f.originalPrice)}</span>
        <span style={{ fontSize: '1.35rem', fontWeight: 900 }}>{money(f.offerPrice)}</span>
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, marginBottom: '14px' }}>{f.perVisitPriceText}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {[[Clock, `${visits} × ${f.visitDurationMinutes || 0} min visits`], [Calendar, `Valid for ${f.validityDays || 0} days`]].map(([Icon, text]) => (
          <div key={text} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: 700 }}>
            <Icon size={14} color="#ec4899" /> <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SuperAdminStarterPackView = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState(DEFAULTS);
  const [saved, setSaved] = useState(DEFAULTS);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [pack, cats, srvs] = await Promise.all([
        superAdminService.getStarterPack(),
        catalogService.getCategories().catch(() => ({ data: [] })),
        catalogService.getServices().catch(() => ({ data: [] })),
      ]);
      const list = (r) => { const d = r?.data?.data || r?.data || []; return Array.isArray(d) ? d : []; };
      setCategories(list(cats));
      setServices(list(srvs));
      const data = pack?.data?.data || pack?.data;
      const next = toForm(data || {});
      setForm(next);
      setSaved(next);
    } catch {
      setLoadError(true);
      toast.error('Failed to load Starter Pack configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);

  const n = (k) => Number(form[k]);
  const errors = useMemo(() => {
    const e = {};
    for (const k of ['originalPrice', 'offerPrice', 'ticketOriginalPrice', 'ticketOfferPrice']) {
      if (form[k] === '' || !(Number(form[k]) >= 0)) e[k] = 'Enter a price of 0 or more';
    }
    if (!e.offerPrice && !e.originalPrice && n('offerPrice') > n('originalPrice')) e.offerPrice = 'Offer price cannot be higher than the original price';
    if (!e.ticketOfferPrice && !e.ticketOriginalPrice && n('ticketOfferPrice') > n('ticketOriginalPrice')) e.ticketOfferPrice = 'Offer price cannot be higher than the original price';
    if (!(Number(form.visitCount) >= 1) || !Number.isInteger(Number(form.visitCount))) e.visitCount = 'At least 1 whole visit';
    if (!(Number(form.visitDurationMinutes) >= 15)) e.visitDurationMinutes = 'At least 15 minutes';
    if (!(Number(form.validityDays) >= 1)) e.validityDays = 'At least 1 day';
    if (!form.badge.trim()) e.badge = 'Badge text is required';
    return e;
  }, [form]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasErrors = Object.keys(errors).length > 0;
  const visits = Math.max(1, Number(form.visitCount) || 1);
  const perVisit = Math.round((n('offerPrice') || 0) / visits);
  const saving$ = n('originalPrice') - n('offerPrice');
  const savePct = n('originalPrice') > 0 ? Math.round((saving$ / n('originalPrice')) * 100) : 0;
  const serviceOptions = services.filter((s) => !form.applicableCategory || idOf(s.category) === form.applicableCategory);

  const changeCategory = (e) => setForm((f) => ({ ...f, applicableCategory: e.target.value, applicableService: '' }));

  const handleSave = async (e) => {
    e?.preventDefault();
    if (hasErrors) {
      toast.error('Please fix the highlighted fields first');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      for (const k of NUMERIC) payload[k] = Number(form[k]);
      payload.badge = form.badge.trim();
      payload.subBadge = form.subBadge.trim();
      payload.perVisitPriceText = form.perVisitPriceText.trim();
      payload.title = `${payload.visitCount} VISITS FOR ₹${payload.originalPrice} ₹${payload.offerPrice}`;
      await superAdminService.updateStarterPack(payload);
      setSaved(form);
      toast.success('Starter Pack offer saved and published');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save Starter Pack configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ ...card, padding: '48px', textAlign: 'center', color: '#64748b' }}><Loader2 size={28} className="spin" style={{ margin: '0 auto 10px' }} /><div>Loading Starter Pack…</div></div>;
  }
  if (loadError) {
    return (
      <div role="alert" style={{ ...card, padding: '32px', textAlign: 'center', color: '#b91c1c' }}>
        <div style={{ fontWeight: 700, marginBottom: '12px' }}>Could not load the Starter Pack configuration.</div>
        <button type="button" className="btn btn-secondary" onClick={load}>Try again</button>
      </div>
    );
  }

  const inp = (key, extra = {}) => ({ ...inputStyle, ...(errors[key] ? { borderColor: '#f87171', background: '#fef2f2' } : {}), ...extra });

  return (
    <form onSubmit={handleSave} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 0 }}>
      {/* Status & save bar */}
      <div style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', position: 'sticky', top: '8px', zIndex: 5 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <span style={{ position: 'relative', width: '44px', height: '24px', borderRadius: '9999px', background: form.isActive ? '#10b981' : '#cbd5e1', transition: 'background .15s', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: '3px', left: form.isActive ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
          </span>
          <input type="checkbox" checked={form.isActive} onChange={set('isActive')} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} aria-label="Show the Starter Pack offer in the customer app" />
          <span>
            <span style={{ display: 'block', fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>{form.isActive ? 'Offer is live' : 'Offer is switched off'}</span>
            <span style={{ display: 'block', fontSize: '0.76rem', color: '#64748b' }}>{form.isActive ? 'Eligible customers see it in the app' : 'Hidden from every customer'}</span>
          </span>
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {dirty && <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '9999px' }}>Unsaved changes</span>}
          <button type="button" className="btn btn-secondary" disabled={!dirty || saving} onClick={() => setForm(saved)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><RotateCcw size={14} /> Discard</button>
          <button type="submit" disabled={!dirty || saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '0.88rem', color: '#fff', cursor: !dirty || saving ? 'not-allowed' : 'pointer', opacity: !dirty ? 0.55 : 1, background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', boxShadow: dirty ? '0 4px 14px rgba(236, 72, 153, 0.35)' : 'none' }}>
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} {saving ? 'Publishing…' : 'Save & Publish'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Form */}
        <div style={{ flex: '1 1 480px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Section icon={Sparkles} title="Offer text" hint="The labels customers read on the offer card.">
            <Field label="Badge" error={errors.badge}><input type="text" value={form.badge} onChange={set('badge')} placeholder="STARTER PACK" style={inp('badge')} /></Field>
            <Field label="Sub-header tag"><input type="text" value={form.subBadge} onChange={set('subBadge')} placeholder="✦ ONE TIME OFFER ✦" style={inp('subBadge')} /></Field>
            <Field wide label="Per-visit line" hint={<>Shown under the price. <button type="button" onClick={() => setForm((f) => ({ ...f, perVisitPriceText: `Only ${money(perVisit)} per visit` }))} style={{ border: 'none', background: 'none', padding: 0, color: '#db2777', fontWeight: 800, cursor: 'pointer', fontSize: 'inherit' }}><Wand2 size={11} style={{ verticalAlign: '-1px' }} /> Fill from price ({`Only ${money(perVisit)} per visit`})</button></>}>
              <input type="text" value={form.perVisitPriceText} onChange={set('perVisitPriceText')} placeholder="Only ₹70 per visit" style={inp('perVisitPriceText')} />
            </Field>
          </Section>

          <Section icon={Ticket} title="Pricing" hint="Ticket price is the figure on the pink ticket graphic; total price is what the customer pays for the whole pack.">
            <Field label="Ticket: original (₹)" error={errors.ticketOriginalPrice}><input type="number" min="0" value={form.ticketOriginalPrice} onChange={set('ticketOriginalPrice')} style={inp('ticketOriginalPrice')} /></Field>
            <Field label="Ticket: offer (₹)" error={errors.ticketOfferPrice}><input type="number" min="0" value={form.ticketOfferPrice} onChange={set('ticketOfferPrice')} style={inp('ticketOfferPrice')} /></Field>
            <Field label="Total: original (₹)" error={errors.originalPrice}><input type="number" min="0" value={form.originalPrice} onChange={set('originalPrice')} style={inp('originalPrice')} /></Field>
            <Field label="Total: offer (₹)" error={errors.offerPrice}><input type="number" min="0" value={form.offerPrice} onChange={set('offerPrice')} style={inp('offerPrice')} /></Field>
            {!errors.offerPrice && !errors.originalPrice && (
              <div style={{ gridColumn: '1 / -1', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                Customer pays <strong>{money(form.offerPrice)}</strong> for {visits} visit{visits > 1 ? 's' : ''} — about <strong>{money(perVisit)}</strong> per visit, saving <strong>{money(saving$)}</strong> ({savePct}% off).
              </div>
            )}
          </Section>

          <Section icon={Timer} title="Visit rules" hint="What the customer gets with the pack.">
            <Field label="Number of visits" error={errors.visitCount}><input type="number" min="1" step="1" value={form.visitCount} onChange={set('visitCount')} style={inp('visitCount')} /></Field>
            <Field label="Each visit (minutes)" error={errors.visitDurationMinutes}><input type="number" min="15" value={form.visitDurationMinutes} onChange={set('visitDurationMinutes')} style={inp('visitDurationMinutes')} /></Field>
            <Field label="Valid for (days)" error={errors.validityDays}><input type="number" min="1" value={form.validityDays} onChange={set('validityDays')} style={inp('validityDays')} /></Field>
          </Section>

          <Section icon={Users} title="Who can use it" hint="Limit the offer to an audience, a category or one service.">
            <Field wide label="Audience">
              <select value={form.targetAudience} onChange={set('targetAudience')} style={inp('targetAudience')}>
                <option value="NEW_USERS_ONLY">New customers only (first booking)</option>
                <option value="ALL_USERS">All customers</option>
              </select>
            </Field>
            <Field label="Category">
              <select value={form.applicableCategory} onChange={changeCategory} style={inp('applicableCategory')}>
                <option value="">All categories</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Service (optional)">
              <select value={form.applicableService} onChange={set('applicableService')} style={inp('applicableService')}>
                <option value="">All services{form.applicableCategory ? ' in this category' : ''}</option>
                {serviceOptions.map((s) => <option key={s._id} value={s._id}>{s.name || s.title}</option>)}
              </select>
            </Field>
          </Section>
        </div>

        {/* Live preview */}
        <aside style={{ flex: '0 1 360px', minWidth: '280px', position: 'sticky', top: '88px' }}>
          <div style={{ ...card, padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
              <Eye size={16} color="#db2777" /> Live customer app preview
              {!form.isActive && <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#64748b' }}><Power size={12} /> hidden</span>}
            </div>
            <div style={{ opacity: form.isActive ? 1 : 0.45, transition: 'opacity .15s' }}><Preview f={form} /></div>
          </div>
        </aside>
      </div>
    </form>
  );
};

export default SuperAdminStarterPackView;
