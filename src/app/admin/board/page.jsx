'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check, User, Upload, Image as ImageIcon, Loader2, Edit2, Settings2, Tag, Users } from 'lucide-react';

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
  const [roleFormData, setRoleFormData] = useState({ name: '', order: 0 });
  
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
        body: JSON.stringify(roleFormData),
      });
      if (res.ok) {
        setRoleFormData({ name: '', order: 0 });
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
    setRoleFormData({ name: role.name, order: role.order || 0 });
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
      const data = await res.json();
      if (data.url) setMemberFormData({ ...memberFormData, photoUrl: data.url });
    } catch (err) { setStatus({ type: 'error', message: 'Hata.' }); }
    finally { setIsUploading(false); }
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
                    <label>Görevler / Roller (Birden Fazla Seçebilirsiniz)</label>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '0.5rem', 
                      background: 'rgba(0,0,0,0.2)', 
                      padding: '1rem', 
                      borderRadius: '12px',
                      border: '1px solid var(--glass-border)',
                      maxHeight: '150px',
                      overflowY: 'auto'
                    }}>
                      {roles.map(r => (
                        <div 
                          key={r._id} 
                          onClick={() => toggleRole(r._id)}
                          style={{ 
                            padding: '0.4rem 0.8rem', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: memberFormData.roles.includes(r._id) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            color: memberFormData.roles.includes(r._id) ? 'black' : 'var(--text)',
                            border: '1px solid',
                            borderColor: memberFormData.roles.includes(r._id) ? 'var(--primary)' : 'var(--glass-border)'
                          }}
                        >
                          {memberFormData.roles.includes(r._id) ? <Check size={14} /> : <Plus size={14} />}
                          {r.name}
                        </div>
                      ))}
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
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input className="form-input" style={{ flex: 2 }} placeholder="Rol Adı" value={roleFormData.name} onChange={e => setRoleFormData({...roleFormData, name: e.target.value})} />
              <input type="number" className="form-input" style={{ flex: 1 }} placeholder="Sıra" value={roleFormData.order} onChange={e => setRoleFormData({...roleFormData, order: parseInt(e.target.value) || 0})} />
              <button className="btn btn-primary" onClick={handleRoleSave}>{editingRoleId ? 'Güncelle' : 'Ekle'}</button>
              {editingRoleId && <button className="btn" onClick={() => { setEditingRoleId(null); setRoleFormData({name: '', order: 0}); }}>İptal</button>}
            </div>
          </div>

          <div className="glass card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', opacity: 0.7 }}>Tanımlı Roller</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {roles.map(r => (
                  <div key={r._id} style={{ 
                    background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{r.name}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Sıra: {r.order}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => startEditRole(r)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                      <button onClick={() => handleRoleDelete(r._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
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
      `}</style>
    </div>
  );
}
