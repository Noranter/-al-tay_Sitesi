'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check, Users, Image as ImageIcon, FileText, Send, ShieldCheck, Download } from 'lucide-react';

export default function AdminCommittees() {
  const [committees, setCommittees] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', 
    description: '', 
    vision: '', 
    mission: '', 
    workingPaperUrl: '', 
    bannerUrl: '',
    applicationMessage: '',
    applicationEmail: '',
    applicationUrl: '',
    divanMembers: [],
    adminMember: null,
    secretaryMember: null,
    pressMember: null,
    members: []
  });

  useEffect(() => {
    fetchCommittees();
    fetchBoardMembers();
  }, []);

  const fetchCommittees = () => {
    setLoading(true);
    fetch('/api/committees')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCommittees(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchBoardMembers = () => {
    fetch('/api/board').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setBoardMembers(data);
    });
  };

  const handleSave = async () => {
    const isNew = !editingId || editingId === 'new';
    const url = isNew ? '/api/committees' : `/api/committees/${editingId}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setEditingId(null);
        fetchCommittees();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e, type = 'workingPaper') => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const data = await res.json();
      if (data.url) {
        setFormData({ ...formData, [type === 'banner' ? 'bannerUrl' : 'workingPaperUrl']: data.url });
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu komiteyi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/committees/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCommittees();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDivanMember = (memberId) => {
    const current = formData.divanMembers || [];
    if (current.includes(memberId)) {
      setFormData({ ...formData, divanMembers: current.filter(id => id !== memberId) });
    } else if (current.length < 2) {
      setFormData({ ...formData, divanMembers: [...current, memberId] });
    }
  };

  const startEdit = (committee) => {
    setEditingId(committee._id);
    setFormData({
      ...committee,
      divanMembers: committee.divanMembers?.map(m => typeof m === 'object' ? m._id : m) || [],
      adminMember: typeof committee.adminMember === 'object' ? committee.adminMember?._id : committee.adminMember,
      secretaryMember: typeof committee.secretaryMember === 'object' ? committee.secretaryMember?._id : committee.secretaryMember,
      pressMember: typeof committee.pressMember === 'object' ? committee.pressMember?._id : committee.pressMember,
      bannerUrl: committee.bannerUrl || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && committees.length === 0) return <div style={{ textAlign: 'center', padding: '5rem' }}>Yükleniyor...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Komiteler</h1>
          <p style={{ opacity: 0.6 }}>Akademik komiteleri ve ekiplerini buradan yönetin.</p>
        </div>
        {!editingId && (
          <button className="btn btn-primary" style={{ padding: '1rem 2rem' }} onClick={() => { 
            setEditingId('new'); 
            setFormData({ name: '', description: '', vision: '', mission: '', workingPaperUrl: '', bannerUrl: '', applicationMessage: '', applicationEmail: '', applicationUrl: '', divanMembers: [], adminMember: null, secretaryMember: null, pressMember: null, members: [] }); 
          }}>
            <Plus size={20} /> Yeni Komite Ekle
          </button>
        )}
      </header>

      {editingId ? (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div className="glass card" style={{ padding: '3rem', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {editingId === 'new' ? <Plus color="var(--primary)" /> : <Edit2 color="var(--primary)" />}
                {editingId === 'new' ? 'Yeni Komite Oluştur' : 'Komiteyi Düzenle'}
              </h2>
              <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', opacity: 0.5 }}>
                <X size={28} />
              </button>
            </div>

            {/* SECTION 1: TEMEL BİLGİLER */}
            <section style={{ marginBottom: '4rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--primary)' }}>
                <FileText size={20} /> 1. Temel Bilgiler
              </h3>
              <div className="form-group">
                <label>Komite Adı</label>
                <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Örn: Ekonomi ve Finans Komitesi" />
              </div>
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Komite Açıklaması</label>
                <textarea className="form-input" rows="5" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Komitenin genel amacını ve konusunu buraya yazın..." />
              </div>
            </section>

            {/* SECTION 2: GÖRSEL VE BANNER */}
            <section style={{ marginBottom: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--primary)' }}>
                <ImageIcon size={20} /> 2. Görsel Yönetimi
              </h3>
              <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '300px', height: '100px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                  {formData.bannerUrl ? (
                    <>
                      <img src={formData.bannerUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => setFormData({ ...formData, bannerUrl: '' })} style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', opacity: 0.4 }}>
                      <ImageIcon size={32} style={{ marginBottom: '0.5rem' }} />
                      <p style={{ fontSize: '0.8rem' }}>Banner Yüklenmedi</p>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>Banner Yükle (3:1 Oran)</label>
                  <input type="file" className="form-input" onChange={e => handleFileUpload(e, 'banner')} accept="image/*" />
                  <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.75rem' }}>En iyi görünüm için 1200x400px boyutunda görsel kullanın.</p>
                </div>
              </div>
            </section>

            {/* SECTION 3: BAŞVURU AYARLARI */}
            <section style={{ marginBottom: '4rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--primary)' }}>
                <Send size={20} /> 3. Başvuru ve İletişim
              </h3>
              <div className="form-group">
                <label>Başvuru Mesajı (Pop-up içinde görünecek)</label>
                <textarea className="form-input" rows="2" value={formData.applicationMessage} onChange={e => setFormData({...formData, applicationMessage: e.target.value})} placeholder="Başvuru yapacak adaylara kısa bir mesaj..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div className="form-group">
                  <label>Komite Özel Mail Adresi</label>
                  <input className="form-input" value={formData.applicationEmail} onChange={e => setFormData({...formData, applicationEmail: e.target.value})} placeholder="Örn: ekonomi@galcal.com" />
                </div>
                <div className="form-group">
                  <label>Özel Başvuru Formu Linki</label>
                  <input className="form-input" value={formData.applicationUrl} onChange={e => setFormData({...formData, applicationUrl: e.target.value})} placeholder="Boş bırakılırsa genel form kullanılır." />
                </div>
              </div>
            </section>

            {/* SECTION 4: VİZYON VE MİSYON */}
            <section style={{ marginBottom: '4rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--primary)' }}>
                <Check size={20} /> 4. Vizyon & Misyon
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="form-group">
                  <label>Komite Vizyonu</label>
                  <textarea className="form-input" rows="4" value={formData.vision} onChange={e => setFormData({...formData, vision: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Komite Misyonu</label>
                  <textarea className="form-input" rows="4" value={formData.mission} onChange={e => setFormData({...formData, mission: e.target.value})} />
                </div>
              </div>
            </section>

            {/* SECTION 5: EKİP YÖNETİMİ */}
            <section style={{ marginBottom: '4rem', padding: '2.5rem', background: 'rgba(197, 160, 89, 0.03)', borderRadius: '16px', border: '1px solid rgba(197, 160, 89, 0.1)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--primary)' }}>
                <Users size={20} /> 5. Komite Ekibi (Yönetim Kurulu)
              </h3>
              
              <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                <label style={{ marginBottom: '1rem', display: 'block' }}>Divan Üyeleri (En Fazla 2 Kişi Seçin)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                  {boardMembers.map(bm => (
                    <div key={bm._id} onClick={() => toggleDivanMember(bm._id)} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s', background: formData.divanMembers?.includes(bm._id) ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: formData.divanMembers?.includes(bm._id) ? 'black' : 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '600' }}>
                      {bm.name}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                <div className="form-group">
                  <label><ShieldCheck size={14} /> Admin</label>
                  <select className="form-input" value={formData.adminMember || ''} onChange={e => setFormData({...formData, adminMember: e.target.value || null})}>
                    <option value="">Seçiniz...</option>
                    {boardMembers.map(bm => <option key={bm._id} value={bm._id}>{bm.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label><FileText size={14} /> Sekreter</label>
                  <select className="form-input" value={formData.secretaryMember || ''} onChange={e => setFormData({...formData, secretaryMember: e.target.value || null})}>
                    <option value="">Seçiniz...</option>
                    {boardMembers.map(bm => <option key={bm._id} value={bm._id}>{bm.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label><ImageIcon size={14} /> Basın</label>
                  <select className="form-input" value={formData.pressMember || ''} onChange={e => setFormData({...formData, pressMember: e.target.value || null})}>
                    <option value="">Seçiniz...</option>
                    {boardMembers.map(bm => <option key={bm._id} value={bm._id}>{bm.name}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* SECTION 6: DOSYALAR */}
            <section style={{ marginBottom: '4rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--primary)' }}>
                <Download size={20} /> 6. Belgeler ve Dosyalar
              </h3>
              <div className="form-group">
                <label>Çalışma Kağıdı (PDF veya Görsel)</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input type="file" className="form-input" style={{ flex: 1 }} onChange={handleFileUpload} />
                  {formData.workingPaperUrl && (
                    <button onClick={() => setFormData({ ...formData, workingPaperUrl: '' })} style={{ padding: '0 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', cursor: 'pointer' }}>
                      Dosyayı Kaldır
                    </button>
                  )}
                </div>
                {formData.workingPaperUrl && <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.75rem' }}>Mevcut: {formData.workingPaperUrl}</p>}
              </div>
            </section>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '3rem' }}>
              <button className="btn btn-primary" style={{ padding: '1.2rem 4rem', fontSize: '1rem' }} onClick={handleSave}><Check size={20} /> Değişiklikleri Kaydet</button>
              <button className="btn" style={{ padding: '1.2rem 3rem', fontSize: '1rem', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setEditingId(null)}>İptal</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', animation: 'fadeIn 0.5s ease' }}>
          {committees.map(c => (
            <div key={c._id} className="glass card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {c.bannerUrl ? <img src={c.bannerUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users color="black" />}
                   </div>
                   <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{c.name}</h3>
                    <p style={{ fontSize: '0.85rem', opacity: 0.5 }}>Akademik Komite</p>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => startEdit(c)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(197, 160, 89, 0.1)', color: 'var(--primary)', border: 'none', cursor: 'pointer' }}><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(c._id)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </div>
              </div>
              <p style={{ fontSize: '0.95rem', opacity: 0.7, lineHeight: '1.6', marginBottom: '2rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {c.description}
              </p>
              <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}><Users size={14} /> {c.divanMembers?.length || 0} Divan</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}><Send size={14} /> {c.applicationUrl ? 'Özel Form' : 'Genel Form'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.8rem;
          font-weight: 700;
          font-size: 0.95rem;
          opacity: 0.9;
        }
        .form-input {
          width: 100%;
          background: rgba(0,0,0,0.25);
          border: 1px solid var(--glass-border);
          padding: 1.1rem;
          color: white;
          border-radius: 12px;
          transition: all 0.3s;
          font-size: 0.95rem;
        }
        .form-input:focus {
          border-color: var(--primary);
          background: rgba(0,0,0,0.35);
          outline: none;
          box-shadow: 0 0 0 4px rgba(197, 160, 89, 0.1);
        }
      `}</style>
    </div>
  );
}
