'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check, User, Upload, Image as ImageIcon, Loader2, Edit2, Settings2, Tag, Users, Search } from 'lucide-react';


export default function AdminBoard() {
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [memberFormData, setMemberFormData] = useState({ name: '', roles: [], photoUrl: '', order: 0 });
  
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleFormData, setRoleFormData] = useState({ name: '', order: 0, parent: '', level: 4 });
  
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [definedRoleSearchQuery, setDefinedRoleSearchQuery] = useState('');
  const [definedRoleSearchQueryHierarchy, setDefinedRoleSearchQueryHierarchy] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, rolesRes] = await Promise.all([
        fetch('/api/board'),
        fetch('/api/roles')
      ]);
      const membersData = await membersRes.json();
      const rolesData = await rolesRes.json();
      
      if (Array.isArray(membersData)) setMembers(membersData);
      if (Array.isArray(rolesData)) setRoles(rolesData);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- ROLE FUNCTIONS ---
  const handleRoleSave = async () => {
    if (!roleFormData.name) return;
    try {
      const url = editingRoleId ? `/api/roles/${editingRoleId}` : '/api/roles';
      const method = editingRoleId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roleFormData.name,
          order: roleFormData.order,
          parent: roleFormData.parent || null,
          level: parseInt(roleFormData.level) || 4
        }),
      });
      if (res.ok) {
        setRoleFormData({ name: '', order: 0, parent: '', level: 4 });
        setEditingRoleId(null);
        fetchData();
        setStatus({ type: 'success', message: 'Rol kaydedildi.' });
        setTimeout(() => setStatus({ type: '', message: '' }), 2000);
      }
    } catch (err) { console.error(err); }
  };

  const handleRoleDelete = async (id) => {
    if (!confirm('Bu rolü silmek istiyor musunuz?')) return;
    try {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const startEditRole = (role) => {
    setEditingRoleId(role._id);
    setRoleFormData({ name: role.name, order: role.order || 0, parent: role.parent || '', level: role.level || 4 });
  };

  // --- MEMBER FUNCTIONS ---
  const toggleRole = (roleId) => {
    const currentRoles = [...memberFormData.roles];
    const index = currentRoles.indexOf(roleId);
    if (index > -1) {
      currentRoles.splice(index, 1);
    } else {
      currentRoles.push(roleId);
    }
    setMemberFormData({ ...memberFormData, roles: currentRoles });
  };

  const handleMemberEdit = (member) => {
    setEditingMemberId(member._id);
    setMemberFormData({
      name: member.name,
      roles: member.roles?.map(r => r._id || r) || [],
      photoUrl: member.photoUrl,
      order: member.order || 0
    });
    setShowMemberForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMemberSave = async () => {
    if (!memberFormData.name || memberFormData.roles.length === 0) {
      setStatus({ type: 'error', message: 'Lütfen isim ve en az bir rol seçin.' });
      return;
    }

    try {
      const url = editingMemberId ? `/api/board/${editingMemberId}` : '/api/board';
      const method = editingMemberId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberFormData),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Üye kaydedildi!' });
        setTimeout(() => {
          setShowMemberForm(false);
          setEditingMemberId(null);
          setMemberFormData({ name: '', roles: [], photoUrl: '', order: 0 });
          setStatus({ type: '', message: '' });
          fetchData();
        }, 1000);
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Hata oluştu.' });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
      
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text.substring(0, 100) || 'Bilinmeyen sunucu hatası');
      }

      if (res.ok && data.url) {
        setMemberFormData({ ...memberFormData, photoUrl: data.url });
        setStatus({ type: 'success', message: 'Fotoğraf başarıyla yüklendi!' });
        setTimeout(() => setStatus({ type: '', message: '' }), 2000);
      } else {
        setStatus({ type: 'error', message: data.error || 'Dosya yükleme sunucu tarafından reddedildi.' });
      }
    } catch (err) { 
      console.error('Upload client error:', err);
      setStatus({ type: 'error', message: `Fotoğraf yüklenemedi: ${err.message || 'Bağlantı hatası'}` }); 
    } finally { 
      setIsUploading(false); 
    }
  };

  const handleUpdateRoleLevel = async (roleId, level) => {
    try {
      const url = `/api/roles/${roleId}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: parseInt(level) || 4 }),
      });
      if (res.ok) {
        fetchData();
        setStatus({ type: 'success', message: 'Rol sırası başarıyla güncellendi!' });
        setTimeout(() => setStatus({ type: '', message: '' }), 1500);
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Hata oluştu.' });
    }
  };

  const getRoleLevel = (role, allRoles) => {
    if (role.level !== undefined && role.level !== null) return role.level;
    let depth = 0;
    let current = role;
    const visited = new Set();
    while (current && current.parent && !visited.has(current._id)) {
      visited.add(current._id);
      const parentRole = allRoles.find(r => r._id === current.parent);
      if (parentRole) {
        depth++;
        current = parentRole;
      } else {
        break;
      }
    }
    return depth + 1;
  };

  const renderPreviewLevels = () => {
    const row0 = roles.filter(r => getRoleLevel(r, roles) === 1);
    const row1 = roles.filter(r => getRoleLevel(r, roles) === 2).sort((a, b) => a.order - b.order);
    const row2 = roles.filter(r => getRoleLevel(r, roles) === 3).sort((a, b) => a.order - b.order);
    const row3 = roles.filter(r => getRoleLevel(r, roles) >= 4).sort((a, b) => a.order - b.order);

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>1. Sıra: Danışman Öğretmen</div>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            {row0.map(r => (
              <div key={r._id} className="preview-node glass" style={{ background: 'rgba(197, 160, 89, 0.1)', borderColor: 'var(--primary)' }}>
                <div style={{ fontWeight: '800', fontSize: '0.85rem', color: 'white' }}>{r.name}</div>
              </div>
            ))}
            {row0.length === 0 && <div style={{ fontSize: '0.8rem', opacity: 0.4, fontStyle: 'italic' }}>Üye/Rol Atanmadı</div>}
          </div>
        </div>

        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>2. Sıra: Genel Koordinatörler</div>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            {row1.map(r => (
              <div key={r._id} className="preview-node glass">
                <div style={{ fontWeight: '800', fontSize: '0.85rem', color: 'white' }}>{r.name}</div>
              </div>
            ))}
            {row1.length === 0 && <div style={{ fontSize: '0.8rem', opacity: 0.4, fontStyle: 'italic' }}>Üye/Rol Atanmadı (Butonlardan 2. Sıra seçin)</div>}
          </div>
        </div>

        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>3. Sıra: Komiteler, Sekreterler ve Adminler</div>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            {row2.map(r => (
              <div key={r._id} className="preview-node glass">
                <div style={{ fontWeight: '800', fontSize: '0.85rem', color: 'white' }}>{r.name}</div>
              </div>
            ))}
            {row2.length === 0 && <div style={{ fontSize: '0.8rem', opacity: 0.4, fontStyle: 'italic' }}>Üye/Rol Atanmadı (Butonlardan 3. Sıra seçin)</div>}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>4. Sıra: Ekipler</div>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            {row3.map(r => (
              <div key={r._id} className="preview-node glass">
                <div style={{ fontWeight: '800', fontSize: '0.85rem', color: 'white' }}>{r.name}</div>
              </div>
            ))}
            {row3.length === 0 && <div style={{ fontSize: '0.8rem', opacity: 0.4, fontStyle: 'italic' }}>Üye/Rol Atanmadı (Butonlardan 4. Sıra seçin)</div>}
          </div>
        </div>
      </div>
    );
  };

  const handleMemberDelete = async (id) => {
    if (!confirm('Silmek istiyor musunuz?')) return;
    try {
      const res = await fetch(`/api/board/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  if (loading && members.length === 0) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <Loader2 className="animate-spin" size={40} color="var(--primary)" />
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Yönetim Kurulu</h1>
        <p style={{ opacity: 0.6 }}>Ekip üyeleri ve çoklu rol yönetimi.</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '14px', width: 'fit-content' }}>
        <button 
          className={`btn ${activeTab === 'members' ? 'btn-primary' : ''}`} 
          onClick={() => setActiveTab('members')}
          style={{ background: activeTab === 'members' ? 'var(--primary)' : 'transparent', color: activeTab === 'members' ? 'black' : 'var(--text)', border: 'none' }}
        >
          <Users size={18} /> Üyeler
        </button>
        <button 
          className={`btn ${activeTab === 'roles' ? 'btn-primary' : ''}`} 
          onClick={() => setActiveTab('roles')}
          style={{ background: activeTab === 'roles' ? 'var(--primary)' : 'transparent', color: activeTab === 'roles' ? 'black' : 'var(--text)', border: 'none' }}
        >
          <Tag size={18} /> Roller
        </button>
        <button 
          className={`btn ${activeTab === 'hierarchy' ? 'btn-primary' : ''}`} 
          onClick={() => setActiveTab('hierarchy')}
          style={{ background: activeTab === 'hierarchy' ? 'var(--primary)' : 'transparent', color: activeTab === 'hierarchy' ? 'black' : 'var(--text)', border: 'none' }}
        >
          <Settings2 size={18} /> Şema Yönetimi
        </button>
      </div>

      {status.message && (
        <div style={{ 
          marginBottom: '2rem', padding: '1rem', borderRadius: '10px', 
          background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          color: status.type === 'error' ? '#ef4444' : '#22c55e', textAlign: 'center', border: '1px solid currentColor'
        }}>
          {status.message}
        </div>
      )}

      {/* --- MEMBERS SECTION --- */}
      {activeTab === 'members' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {!showMemberForm ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <button className="btn btn-primary" onClick={() => setShowMemberForm(true)}>
                <Plus size={18} /> Yeni Üye Ekle
              </button>
            </div>
          ) : (
            <div className="glass card" style={{ marginBottom: '3rem', padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {editingMemberId ? <Edit2 color="var(--primary)" /> : <User color="var(--primary)" />}
                  {editingMemberId ? 'Üyeyi Düzenle' : 'Yeni Üye Ekle'}
                </h3>
                <button onClick={() => { setShowMemberForm(false); setEditingMemberId(null); }} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', opacity: 0.5 }}>
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ 
                    width: '180px', height: '180px', borderRadius: '24px', background: 'rgba(0,0,0,0.3)', border: '2px dashed var(--glass-border)',
                    overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                  }}>
                    {isUploading ? <Loader2 className="animate-spin" size={32} color="var(--primary)" /> : 
                     memberFormData.photoUrl ? <img src={memberFormData.photoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                     <ImageIcon size={48} style={{ opacity: 0.2 }} />}
                  </div>
                  <label className="btn" style={{ width: '100%', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
                    <Upload size={18} /> Fotoğraf Seç
                    <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept="image/*" />
                  </label>
                </div>

                <div className="admin-form">
                  <div className="form-group">
                    <label>İsim Soyisim</label>
                    <input className="form-input" value={memberFormData.name} onChange={e => setMemberFormData({...memberFormData, name: e.target.value})} placeholder="Örn: Ahmet Yılmaz" />
                  </div>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                      <label style={{ margin: 0, fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8 }}>
                        Görevler / Roller * <span style={{ textTransform: 'none', fontSize: '0.8rem', opacity: 0.5, fontWeight: 'normal' }}>(Birden fazla seçebilirsiniz)</span>
                      </label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', opacity: 0.4 }} />
                        <input 
                          type="text" 
                          placeholder="Rol Ara..." 
                          value={roleSearchQuery}
                          onChange={(e) => setRoleSearchQuery(e.target.value)}
                          style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '100px',
                            padding: '0.4rem 1rem 0.4rem 2.2rem',
                            fontSize: '0.85rem',
                            color: 'white',
                            outline: 'none',
                            transition: 'all 0.3s',
                            width: '180px'
                          }}
                          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                          onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                        />
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '0.8rem', 
                      background: 'rgba(0,0,0,0.25)', 
                      padding: '1.5rem', 
                      borderRadius: '16px',
                      border: '1px solid var(--glass-border)',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {roles.filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase())).map(r => {
                        const isSelected = memberFormData.roles.includes(r._id);
                        return (
                          <div 
                            key={r._id} 
                            onClick={() => toggleRole(r._id)}
                            className={isSelected ? 'role-badge selected' : 'role-badge'}
                          >
                            {isSelected ? <Check size={16} strokeWidth={3} /> : <Plus size={16} />}
                            {r.name}
                          </div>
                        );
                      })}
                      {roles.filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase())).length === 0 && (
                        <div style={{ padding: '2rem 1rem', opacity: 0.4, fontSize: '0.9rem', width: '100%', textAlign: 'center' }}>
                          Aradığınız kriterde rol bulunamadı.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Sıralama</label>
                    <input type="number" className="form-input" value={memberFormData.order} onChange={e => setMemberFormData({...memberFormData, order: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleMemberSave} disabled={isUploading}>Kaydet</button>
                <button className="btn" style={{ flex: 1 }} onClick={() => { setShowMemberForm(false); setEditingMemberId(null); }}>İptal</button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
            {members.map(m => (
              <div key={m._id} className="glass card member-card" style={{ textAlign: 'center', padding: '2rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                  <button onClick={() => handleMemberEdit(m)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}><Edit2 size={14} /></button>
                  <button onClick={() => handleMemberDelete(m._id)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}><Trash2 size={14} /></button>
                </div>
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--primary)', margin: '0 auto 1rem', overflow: 'hidden', border: '2px solid var(--glass-border)' }}>
                  {m.photoUrl ? <img src={m.photoUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={30} color="white" style={{ marginTop: '30px' }} />}
                </div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>{m.name}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px' }}>
                  {m.roles?.map(r => (
                    <span key={r._id} style={{ fontSize: '0.65rem', background: 'rgba(197, 160, 89, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>{r.name}</span>
                  ))}
                  {(!m.roles || m.roles.length === 0) && <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Rol Yok</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ROLES SECTION --- */}
      {activeTab === 'roles' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div className="glass card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {editingRoleId ? <Edit2 size={20} /> : <Plus size={20} />}
              {editingRoleId ? 'Rolü Düzenle' : 'Yeni Rol Ekle'}
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input className="form-input" style={{ flex: 2, minWidth: '200px' }} placeholder="Rol Adı" value={roleFormData.name} onChange={e => setRoleFormData({...roleFormData, name: e.target.value})} />
              <input type="number" className="form-input" style={{ flex: 1, minWidth: '100px' }} placeholder="Sıra" value={roleFormData.order} onChange={e => setRoleFormData({...roleFormData, order: parseInt(e.target.value) || 0})} />
              <select className="form-input" style={{ flex: 2, minWidth: '200px' }} value={roleFormData.level || 4} onChange={e => setRoleFormData({...roleFormData, level: parseInt(e.target.value) || 4})}>
                <option value={1}>1. Sıra (Danışman Öğretmen)</option>
                <option value={2}>2. Sıra (Genel Koordinatörler)</option>
                <option value={3}>3. Sıra (Komiteler)</option>
                <option value={4}>4. Sıra (Ekipler)</option>
              </select>
              <button className="btn btn-primary" onClick={handleRoleSave}>{editingRoleId ? 'Güncelle' : 'Ekle'}</button>
              {editingRoleId && <button className="btn" onClick={() => { setEditingRoleId(null); setRoleFormData({name: '', order: 0, parent: '', level: 4}); }}>İptal</button>}
            </div>
          </div>

          <div className="glass card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ margin: 0, opacity: 0.8, fontSize: '1.2rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Tanımlı Roller</h3>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', opacity: 0.4 }} />
                <input 
                  type="text" 
                  placeholder="Rollerde Ara..." 
                  value={definedRoleSearchQuery}
                  onChange={(e) => setDefinedRoleSearchQuery(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '100px',
                    padding: '0.5rem 1rem 0.5rem 2.2rem',
                    fontSize: '0.85rem',
                    color: 'white',
                    outline: 'none',
                    transition: 'all 0.3s',
                    width: '200px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                />
              </div>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {roles.filter(r => r.name.toLowerCase().includes(definedRoleSearchQuery.toLowerCase())).map(r => (
                  <div key={r._id} style={{ 
                    background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--glass-border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.2s'
                  }} className="defined-role-card">
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{r.name}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.4, marginTop: '0.2rem' }}>Sıra: {r.order}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => startEditRole(r)} style={{ background: 'rgba(197, 160, 89, 0.1)', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={16} /></button>
                      <button onClick={() => handleRoleDelete(r._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                {roles.filter(r => r.name.toLowerCase().includes(definedRoleSearchQuery.toLowerCase())).length === 0 && (
                  <div style={{ padding: '3rem 1rem', opacity: 0.4, fontSize: '0.9rem', width: '100%', textAlign: 'center', gridColumn: '1 / -1' }}>
                    Aradığınız kriterde tanımlı rol bulunamadı.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- HIERARCHY SECTION --- */}
      {activeTab === 'hierarchy' && (
        <div style={{ animation: 'fadeIn 0.3s ease', display: 'grid', gridTemplateColumns: '1.3fr 1.7fr', gap: '2.5rem' }} className="hierarchy-grid">
          {/* Left Side: Relationship Manager */}
          <div className="glass card" style={{ padding: '2.5rem', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.3rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sıra (Seviye) Yönetimi</h3>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', opacity: 0.4 }} />
                <input 
                  type="text" 
                  placeholder="Rollerde Ara..." 
                  value={definedRoleSearchQueryHierarchy}
                  onChange={(e) => setDefinedRoleSearchQueryHierarchy(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '100px',
                    padding: '0.5rem 1rem 0.5rem 2.2rem',
                    fontSize: '0.85rem',
                    color: 'white',
                    outline: 'none',
                    transition: 'all 0.3s',
                    width: '200px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                />
              </div>
            </div>
            <p style={{ opacity: 0.6, fontSize: '0.9rem', lineHeight: '1.4' }}>
              Rollerin hangi sırada (seviyede) görüneceğini tek tıkla ayarlayın. Sistem bağlantıları otomatik oluşturur!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {roles.filter(r => r.name.toLowerCase().includes(definedRoleSearchQueryHierarchy.toLowerCase())).map(r => (
                <div key={r._id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--primary)' }}>{r.name}</div>
                  
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4].map(l => (
                      <button
                        key={l}
                        onClick={() => handleUpdateRoleLevel(r._id, l)}
                        style={{
                          padding: '0.6rem 0.8rem',
                          borderRadius: '10px',
                          border: '1px solid',
                          borderColor: (r.level || 4) === l ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                          background: (r.level || 4) === l ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                          color: (r.level || 4) === l ? 'black' : 'rgba(255,255,255,0.6)',
                          fontSize: '0.8rem',
                          fontWeight: '900',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          flex: 1,
                          minWidth: '70px',
                          boxShadow: (r.level || 4) === l ? '0 4px 12px rgba(197, 160, 89, 0.25)' : 'none'
                        }}
                      >
                        {l}. Sıra
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {roles.filter(r => r.name.toLowerCase().includes(definedRoleSearchQueryHierarchy.toLowerCase())).length === 0 && (
                <div style={{ padding: '2rem 1rem', opacity: 0.4, fontSize: '0.9rem', textAlign: 'center' }}>
                  Aradığınız kriterde rol bulunamadı.
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Live Visual Tree Preview */}
          <div className="glass card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', overflowX: 'auto' }}>
            <h3 style={{ marginBottom: '2rem', fontWeight: '800', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Seviye Dağılımı Önizleme</h3>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', overflowX: 'auto', padding: '2rem 0' }}>
              {renderPreviewLevels()}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .member-card:hover { transform: translateY(-5px); transition: transform 0.3s ease; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background: var(--primary); borderRadius: 10px; }
        
        .role-badge {
          padding: 0.8rem 1.5rem;
          border-radius: 100px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 700;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .role-badge:hover {
          background: rgba(255,255,255,0.08);
          color: white;
          border-color: rgba(255,255,255,0.25);
          transform: translateY(-2px);
        }
        .role-badge.selected {
          background: var(--primary);
          color: black;
          border-color: var(--primary);
          box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.25);
        }
        .role-badge.selected:hover {
          background: var(--primary);
          color: black;
          border-color: var(--primary);
          opacity: 0.95;
          transform: translateY(-2px) scale(1.02);
        }

        /* Tree Styles for Admin Preview */
        .preview-tree {
          width: 100%;
        }
        .preview-tree ul {
          padding-top: 20px; 
          position: relative;
          transition: all 0.5s;
          display: flex;
          justify-content: center;
        }
        .preview-tree li {
          float: left; 
          text-align: center;
          list-style-type: none;
          position: relative;
          padding: 20px 5px 0 5px;
          transition: all 0.5s;
        }
        .preview-tree li::before, .preview-tree li::after {
          content: '';
          position: absolute; 
          top: 0; 
          right: 50%;
          border-top: 1px solid rgba(197, 160, 89, 0.4);
          width: 50%; 
          height: 20px;
        }
        .preview-tree li::after {
          right: auto; 
          left: 50%;
          border-left: 1px solid rgba(197, 160, 89, 0.4);
        }
        .preview-tree li:only-child::after, .preview-tree li:only-child::before {
          display: none;
        }
        .preview-tree li:only-child { 
          padding-top: 0;
        }
        .preview-tree li:first-child::before, .preview-tree li:last-child::after {
          border: 0 none;
        }
        .preview-tree li:last-child::before {
          border-right: 1px solid rgba(197, 160, 89, 0.4);
          border-radius: 0 5px 0 0;
        }
        .preview-tree li:first-child::after {
          border-radius: 5px 0 0 0;
        }
        .preview-tree ul ul::before {
          content: '';
          position: absolute; 
          top: 0; 
          left: 50%;
          border-left: 1px solid rgba(197, 160, 89, 0.4);
          width: 0; 
          height: 20px;
        }
        .preview-node {
          padding: 0.8rem 1.2rem;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          background: rgba(255,255,255,0.03);
          display: inline-block;
          min-width: 120px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          transition: 0.3s;
        }
        .preview-node:hover {
          border-color: var(--primary);
          background: rgba(var(--primary-rgb), 0.05);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.15);
        }
        @media (max-width: 900px) {
          .hierarchy-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
