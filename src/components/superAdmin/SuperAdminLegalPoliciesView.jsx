import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  ShieldCheck,
  Smartphone,
  Briefcase,
  Save,
  Eye,
  Edit3,
  Code,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Sparkles,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { toast } from '../../utils/toast.js';

const SuperAdminLegalPoliciesView = () => {
  const [targetApp, setTargetApp] = useState('customer'); // 'customer' | 'partner'
  const [type, setType] = useState('privacy_policy'); // 'privacy_policy' | 'terms_and_conditions'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [lastUpdatedInfo, setLastUpdatedInfo] = useState(null);

  const [editorMode, setEditorMode] = useState('visual'); // 'visual' | 'code' | 'preview'
  const visualEditorRef = useRef(null);

  // Fetch Policy Data on tab or type change
  const fetchPolicyData = async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getPolicy(targetApp, type);
      const data = res.data?.data || res.data;
      if (data) {
        setTitle(data.title || '');
        setVersion(data.version || 'v1.0');
        setContent(data.content || '');
        setIsPublished(data.isPublished !== undefined ? data.isPublished : true);
        setLastUpdatedInfo({
          updatedAt: data.updatedAt,
          updatedBy: data.lastUpdatedBy || 'Super Admin HQ'
        });
      }
    } catch (err) {
      console.error('Error fetching policy:', err);
      toast.error('Failed to load legal policy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicyData();
  }, [targetApp, type]);

  // Sync content with visual editor ref when loading or switching mode
  useEffect(() => {
    if (visualEditorRef.current && editorMode === 'visual') {
      if (visualEditorRef.current.innerHTML !== content) {
        visualEditorRef.current.innerHTML = content;
      }
    }
  }, [content, editorMode, loading]);

  // Rich Text Editor Commands via execCommand or manual DOM insertion
  const execCmd = (command, value = null) => {
    if (editorMode !== 'visual') return;
    document.execCommand(command, false, value);
    if (visualEditorRef.current) {
      setContent(visualEditorRef.current.innerHTML);
    }
  };

  const insertHtml = (html) => {
    if (editorMode === 'visual' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand('insertHTML', false, html);
      setContent(visualEditorRef.current.innerHTML);
    } else {
      setContent((prev) => prev + '\n' + html);
    }
  };

  const handleVisualInput = () => {
    if (visualEditorRef.current) {
      setContent(visualEditorRef.current.innerHTML);
    }
  };

  // Save Policy to Backend
  const handleSave = async (e) => {
    e?.preventDefault();
    if (!content.trim()) {
      toast.error('Policy content cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const res = await superAdminService.savePolicy(targetApp, type, {
        title,
        content,
        version,
        isPublished
      });
      const data = res.data?.data || res.data;
      toast.success(`🎉 ${targetApp.toUpperCase()} ${type === 'privacy_policy' ? 'Privacy Policy' : 'Terms & Conditions'} saved successfully!`);
      if (data) {
        setLastUpdatedInfo({
          updatedAt: data.updatedAt,
          updatedBy: data.lastUpdatedBy || 'Super Admin HQ'
        });
      }
    } catch (err) {
      console.error('Error saving policy:', err);
      toast.error(err.response?.data?.message || 'Failed to save legal policy');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>
      
      {/* 1. Header & Title Banner */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '26px 30px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                Legal & Policy Rich Text Manager
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Configure live Privacy Policy & Terms & Conditions for Customer App and Partner App.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastUpdatedInfo && (
            <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'right' }}>
              <div style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <Clock size={13} color="#10b981" /> Last Updated: {new Date(lastUpdatedInfo.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div style={{ fontSize: '0.72rem' }}>By {lastUpdatedInfo.updatedBy}</div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            style={{
              padding: '11px 24px',
              borderRadius: '14px',
              fontWeight: '800',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
            <span>Save & Publish</span>
          </button>
        </div>
      </div>

      {/* 2. Target App Switcher Tabs & Policy Type Switcher */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        
        {/* App Switcher: Customer vs Partner */}
        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setTargetApp('customer')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: targetApp === 'customer' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
              color: targetApp === 'customer' ? '#ffffff' : '#64748b',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: targetApp === 'customer' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
            }}
          >
            <Smartphone size={18} /> Customer App Policy
          </button>

          <button
            type="button"
            onClick={() => setTargetApp('partner')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: targetApp === 'partner' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
              color: targetApp === 'partner' ? '#ffffff' : '#64748b',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: targetApp === 'partner' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
            }}
          >
            <Briefcase size={18} /> Partner App Policy
          </button>
        </div>

        {/* Policy Type Switcher: Privacy Policy vs Terms */}
        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setType('privacy_policy')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: type === 'privacy_policy' ? '#7c3aed' : 'transparent',
              color: type === 'privacy_policy' ? '#ffffff' : '#64748b',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldCheck size={18} /> Privacy Policy
          </button>

          <button
            type="button"
            onClick={() => setType('terms_and_conditions')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: type === 'terms_and_conditions' ? '#0f172a' : 'transparent',
              color: type === 'terms_and_conditions' ? '#ffffff' : '#64748b',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <FileText size={18} /> Terms & Conditions
          </button>
        </div>

      </div>

      {/* 3. Document Details & Editor Container */}
      <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)' }}>
        
        {/* Document Title & Metadata Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NOROZZ Customer Privacy Policy"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                fontWeight: '700',
                outline: 'none',
                color: '#0f172a',
                background: '#f8fafc',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Document Version
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. v1.0"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                fontWeight: '700',
                outline: 'none',
                color: '#0f172a',
                background: '#f8fafc',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Publish Status
            </label>
            <div
              onClick={() => setIsPublished(!isPublished)}
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: isPublished ? '#ecfdf5' : '#fef2f2',
                color: isPublished ? '#047857' : '#dc2626',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} /> {isPublished ? 'LIVE & PUBLISHED' : 'DRAFT'}
            </div>
          </div>
        </div>

        {/* Rich Text Action Toolbar */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {/* Left formatting tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            
            {/* Headings */}
            <button
              type="button"
              onClick={() => insertHtml('<h2>Section Heading</h2>')}
              title="Add Heading 2"
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: '800', fontSize: '0.78rem' }}
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertHtml('<h3>Sub Heading</h3>')}
              title="Add Heading 3"
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: '800', fontSize: '0.78rem' }}
            >
              H3
            </button>

            <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 4px' }} />

            {/* Styling */}
            <button
              type="button"
              onClick={() => execCmd('bold')}
              title="Bold"
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => execCmd('italic')}
              title="Italic"
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onClick={() => execCmd('underline')}
              title="Underline"
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
            >
              <Underline size={15} />
            </button>

            <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 4px' }} />

            {/* Lists */}
            <button
              type="button"
              onClick={() => execCmd('insertUnorderedList')}
              title="Bullet List"
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => execCmd('insertOrderedList')}
              title="Numbered List"
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
            >
              <ListOrdered size={15} />
            </button>

            <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 4px' }} />

            {/* Quote Box & Divider */}
            <button
              type="button"
              onClick={() => insertHtml('<hr>')}
              title="Insert Horizontal Divider"
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '700' }}
            >
              <Minus size={15} /> Line
            </button>
            <button
              type="button"
              onClick={() => insertHtml('<div style="background:#f1f5f9; padding:14px; borderRadius:12px; borderLeft:4px solid #10b981; margin:12px 0;"><strong>Note:</strong> Enter important policy highlight here.</div>')}
              title="Insert Callout Box"
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '700' }}
            >
              <Sparkles size={14} color="#10b981" /> Callout Box
            </button>
          </div>

          {/* Right Mode Switcher: Visual vs Code vs Live Preview */}
          <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '3px', borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => setEditorMode('visual')}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: 'none',
                background: editorMode === 'visual' ? '#ffffff' : 'transparent',
                color: editorMode === 'visual' ? '#0f172a' : '#64748b',
                fontWeight: '800',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Edit3 size={13} /> Visual Editor
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('code')}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: 'none',
                background: editorMode === 'code' ? '#ffffff' : 'transparent',
                color: editorMode === 'code' ? '#0f172a' : '#64748b',
                fontWeight: '800',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Code size={13} /> HTML Code
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('preview')}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: 'none',
                background: editorMode === 'preview' ? '#10b981' : 'transparent',
                color: editorMode === 'preview' ? '#ffffff' : '#64748b',
                fontWeight: '800',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Eye size={13} /> Live Preview
            </button>
          </div>
        </div>

        {/* Editor Main Content Body Area */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', background: '#ffffff', border: '1px solid #cbd5e1', borderTop: 'none', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 10px auto', display: 'block', color: '#10b981' }} />
            <div>Loading legal document content...</div>
          </div>
        ) : editorMode === 'visual' ? (
          <div
            ref={visualEditorRef}
            contentEditable
            onInput={handleVisualInput}
            style={{
              minHeight: '380px',
              padding: '24px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderTop: 'none',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
              fontSize: '0.94rem',
              lineHeight: '1.7',
              color: '#1e293b',
              outline: 'none',
              overflowY: 'auto'
            }}
          />
        ) : editorMode === 'code' ? (
          <textarea
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: '380px',
              padding: '20px',
              background: '#0f172a',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontSize: '0.88rem',
              lineHeight: '1.6',
              border: '1px solid #cbd5e1',
              borderTop: 'none',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        ) : (
          /* Live Reader Preview Mode */
          <div style={{
            minHeight: '380px',
            padding: '28px',
            background: '#ffffff',
            border: '1px solid #10b981',
            borderTop: 'none',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.08)'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: '#dcfce7',
              color: '#166534',
              fontWeight: '800',
              fontSize: '0.72rem',
              marginBottom: '16px'
            }}>
              <Eye size={13} /> LIVE USER VIEW PREVIEW ({targetApp.toUpperCase()} APP)
            </div>

            <div
              className="legal-policy-preview"
              dangerouslySetInnerHTML={{ __html: content }}
              style={{
                fontSize: '0.95rem',
                lineHeight: '1.8',
                color: '#1e293b'
              }}
            />
          </div>
        )}

      </div>

    </div>
  );
};

export default SuperAdminLegalPoliciesView;
