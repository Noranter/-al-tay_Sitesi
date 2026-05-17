'use client';

import { useState, useEffect } from 'react';
import { User, Loader2 } from 'lucide-react';

export default function Board() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCardKey, setActiveCardKey] = useState(null); // Tracks unique expanded card key e.g. memberId_lvl_levelNum

  useEffect(() => {
    Promise.all([
      fetch('/api/board').then(res => {
        if (!res.ok) throw new Error('Yönetim kurulu üyeleri alınamadı');
        return res.json();
      }),
      fetch('/api/roles').then(res => {
        if (!res.ok) throw new Error('Rol tanımları alınamadı');
        return res.json();
      })
    ])
      .then(([membersData, rolesData]) => {
        if (Array.isArray(membersData) && Array.isArray(rolesData)) {
          setMembers(membersData);
          setRoles(rolesData);
        } else {
          throw new Error('API geçersiz veri döndürdü');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Yükleme hatası:', err);
        setError(err.message || 'Veriler yüklenirken hata oluştu.');
        setLoading(false);
      });
  }, []);

  // Helper to determine the level of a role with fallback
  const getRoleLevel = (role, allRoles) => {
    if (role.level !== undefined && role.level !== null) return role.level;
    
    // Heuristic Name Fallback for existing database roles
    const nameLower = role.name?.toLowerCase() || '';
    if (nameLower.includes('danışman') || nameLower.includes('öğretmen')) return 1;
    if (nameLower.includes('koordinatör') || nameLower.includes('kordinatör')) return 2;
    if (nameLower.includes('komite') || nameLower.includes('sekreter') || nameLower.includes('admin') || nameLower.includes('divan')) return 3;
    
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

  // Helper to check if a member has a role belonging to a specific level (supports multi-level presence)
  const hasRoleAtLevel = (member, levelNum) => {
    if (!member.roles || member.roles.length === 0) {
      return levelNum === 4;
    }
    return member.roles.some(r => {
      const roleId = r._id || r;
      const roleObj = roles.find(role => role._id === roleId);
      if (roleObj) {
        const roleLvl = getRoleLevel(roleObj, roles);
        if (levelNum === 4) {
          return roleLvl >= 4;
        }
        return roleLvl === levelNum;
      }
      return false;
    });
  };

  // 500-IQ Composite Sorting Key Generator: Groups members strictly by their role, then sorts by individual member order
  const getMemberSortKey = (member, levelNum) => {
    const levelRoles = roles.filter(r => getRoleLevel(r, roles) === levelNum);
    const memberRoleIds = member.roles?.map(mr => mr._id || mr) || [];
    
    const matchingRole = levelRoles.find(r => memberRoleIds.includes(r._id));
    if (matchingRole) {
      const roleOrder = matchingRole.order !== undefined ? String(matchingRole.order).padStart(5, '0') : '99999';
      const memberOrder = member.order !== undefined ? String(member.order).padStart(5, '0') : '99999';
      return `${roleOrder}_${matchingRole.name}_${memberOrder}`;
    }
    
    const memberOrder = member.order !== undefined ? String(member.order).padStart(5, '0') : '99999';
    return `99999_zzzz_${memberOrder}`;
  };

  // Group members into their respective rows based on active role associations (a member can appear in multiple rows!)
  const row0Members = members
    .filter(m => hasRoleAtLevel(m, 1))
    .sort((a, b) => getMemberSortKey(a, 1).localeCompare(getMemberSortKey(b, 1)));

  const row1Members = members
    .filter(m => hasRoleAtLevel(m, 2))
    .sort((a, b) => getMemberSortKey(a, 2).localeCompare(getMemberSortKey(b, 2)));

  const row2Members = members
    .filter(m => hasRoleAtLevel(m, 3))
    .sort((a, b) => getMemberSortKey(a, 3).localeCompare(getMemberSortKey(b, 3)));

  const row3Members = members
    .filter(m => hasRoleAtLevel(m, 4))
    .sort((a, b) => getMemberSortKey(a, 4).localeCompare(getMemberSortKey(b, 4)));

  const renderMemberCard = (member, levelNum) => {
    const cardKey = `${member._id}_lvl_${levelNum}`;
    const isExpanded = activeCardKey === cardKey;
    const isAnyCardActive = activeCardKey !== null;
    const isInactive = isAnyCardActive && !isExpanded;

    // Fetch all roles of the member, and sort so the primary matching role is always first in the DOM list
    const memberRoles = roles
      .filter(r => member.roles?.some(mr => (mr._id || mr) === r._id))
      .sort((a, b) => {
        const aMatch = getRoleLevel(a, roles) === levelNum ? 0 : 1;
        const bMatch = getRoleLevel(b, roles) === levelNum ? 0 : 1;
        return aMatch - bMatch;
      });

    return (
      <div 
        key={cardKey} 
        className={`member-card-wrapper ${isExpanded ? 'active-expanded' : ''} ${isInactive ? 'inactive-shrunk' : ''}`}
        onClick={(e) => {
          e.stopPropagation(); // Stop click from bubbling to document/overlay
          setActiveCardKey(isExpanded ? null : cardKey);
        }}
      >
        <div className="member-showcase-card glass">
          <div className="avatar-container">
            {member.photoUrl ? (
              <img src={member.photoUrl} alt={member.name} className="member-photo" />
            ) : (
              <div className="avatar-placeholder">
                <User size={32} style={{ width: '40%', height: '40%', color: 'var(--primary)' }} />
              </div>
            )}
          </div>
          <div className="member-info">
            <h3 className="member-name">{member.name}</h3>
            <div className="role-badges-container">
              {memberRoles.map((r, index) => (
                <span key={r._id} className={`role-pill-badge badge-idx-${index}`}>
                  {r.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '2px' }}>PİRAMİT ŞEMA OLUŞTURULUYOR...</h2>
      </div>
    </div>
  );

  if (error) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="glass card" style={{ textAlign: 'center', borderColor: '#ff4d4d', maxWidth: '500px' }}>
        <h2 style={{ color: '#ff4d4d', marginBottom: '1rem', fontWeight: '800' }}>Bağlantı Hatası</h2>
        <p style={{ opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Yeniden Dene</button>
      </div>
    </div>
  );

  const hasAnyMembers = row0Members.length > 0 || row1Members.length > 0 || row2Members.length > 0 || row3Members.length > 0;

  const rawCss = `
    /* Expand global container to allow cards to breathe side-by-side with maximum lateral room */
    .container {
      max-width: 96% !important;
      padding-left: 1.2rem !important;
      padding-right: 1.2rem !important;
    }

    .pyramid-container {
      display: flex;
      flex-direction: column;
      gap: 3.2rem; /* Tightened from 5.5rem to make rows stand closer and unified */
      width: 100%;
      align-items: center;
      margin-top: 2rem;
    }
    
    .pyramid-level {
      display: flex;
      flex-direction: column;
      gap: 2.2rem; /* Tightened level title gap */
      width: 100%;
      align-items: center;
    }
    
    .level-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: white;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 1rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      width: 100%;
      justify-content: center;
    }
    .level-title::before,
    .level-title::after {
      content: '';
      flex: 1;
      height: 1px;
      max-width: 350px;
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
    }
    .level-title::before {
      background: linear-gradient(to left, rgba(255,255,255,0.1), transparent);
    }
    .level-title span {
      color: black;
      background: var(--primary);
      padding: 0.35rem 1rem;
      border-radius: 8px;
      font-size: 0.8rem;
      letter-spacing: 1px;
      font-weight: 900;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }
    
    /* Dynamic Fluid Flex Row: Always forces cards side-by-side, no scrollbar, scales down card sizes dynamically */
    .members-flex-row {
      display: flex !important;
      flex-direction: row !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 2vw !important; /* Fluid gap that shrinks with screen size */
      flex-wrap: nowrap !important; /* STRICTLY prevent wrapping */
      width: 100% !important;
      overflow: hidden !important; /* No scrolling, pure dynamic visual scaling */
      padding: 2rem 0.5rem !important; /* Increased top padding slightly to protect larger scales */
    }
    
    /* STATIC WRAPPER: Premium physics-based elastic spring transition.
       This completely stops the browser from recalculating layout on hover, eliminating all jitter/shaking! */
    .member-card-wrapper {
      position: relative !important;
      width: 100% !important;
      max-width: 250px !important;
      min-width: 100px !important; /* Allows high-density squeeze on mobile without collapsing */
      aspect-ratio: 250 / 330 !important; /* Keeps the card proportions absolutely identical while scaling */
      flex-shrink: 1 !important; /* Forces the browser to scale cards down rather than overflowing */
      transition: all 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) !important; /* Springy elastic curve */
      z-index: 1;
      will-change: transform, opacity, filter;
    }
    .member-card-wrapper:hover {
      z-index: 10 !important; /* Lifts the hovered item cleanly above others without shifting boundaries */
    }
    
    /* ABSOLUTE GLASS CARD: Smoothly scales independently inside the static boundary wrapper */
    .member-showcase-card {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important; /* 100% height of parent in normal state */
      padding: 2.2rem 1.2rem !important;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255, 255, 255, 0.02) !important;
      backdrop-filter: blur(10px);
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      text-align: center !important;
      gap: 1.2rem !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      transition: all 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) !important; /* Match bouncy transition */
      cursor: pointer;
      overflow: hidden;
      will-change: transform, height, border-color, background, box-shadow;
    }
    
    /* Golden swept light sweep */
    .member-showcase-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0) 0%,
        rgba(212, 175, 55, 0.15) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      transform: skewX(-25deg);
      transition: 0.75s;
    }
    .member-card-wrapper:hover .member-showcase-card::before {
      left: 150%;
    }
    
    /* Hover triggers translation and scale ONLY on the absolute child.
       Bouncy elastic scale to 1.16 and translateY to -15px for a stunning 3D hover projection! */
    .member-card-wrapper:hover .member-showcase-card {
      transform: scale(1.16) translateY(-15px) !important;
      border-color: var(--primary) !important;
      background: rgba(212, 175, 55, 0.08) !important;
      box-shadow: 0 30px 60px rgba(212, 175, 55, 0.35) !important;
    }
    
    /* Percentage-based fluid circular avatar container */
    .avatar-container {
      width: 46% !important; /* Dynamically scales circle width relative to card width */
      max-width: 120px !important;
      min-width: 45px !important;
      aspect-ratio: 1 / 1 !important; /* Ensures the circle is always mathematically perfect */
      border-radius: 50% !important;
      overflow: hidden !important;
      background: rgba(0,0,0,0.4) !important;
      border: 2px solid rgba(212, 175, 55, 0.35) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important; /* Bouncy avatar transition */
      box-shadow: 0 8px 24px rgba(0,0,0,0.35) !important;
      flex-shrink: 0 !important;
    }
    .member-card-wrapper:hover .avatar-container {
      border-color: var(--primary) !important;
      transform: scale(1.10) !important; /* Slightly boosted avatar zoom */
      box-shadow: 0 8px 32px rgba(212, 175, 55, 0.45) !important;
    }
    
    .member-photo {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      display: block !important;
    }
    .avatar-placeholder {
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: rgba(212, 175, 55, 0.05) !important;
      opacity: 0.75;
    }
    
    .member-info {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 0.4rem !important;
      width: 100% !important;
    }
    
    /* Clamp fluid typography shrinks text gracefully as card scales down */
    .member-name {
      font-weight: 800 !important;
      font-size: clamp(0.75rem, 1.1vw, 1.25rem) !important;
      color: white !important;
      margin: 0 !important;
      letter-spacing: 0.5px !important;
      transition: color 0.3s !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      width: 100% !important;
    }
    .member-card-wrapper:hover .member-name {
      color: var(--primary) !important;
    }
    
    .role-badges-container {
      display: flex !important;
      flex-direction: column !important;
      gap: 0.3rem !important;
      align-items: center !important;
      width: 100% !important;
      height: auto !important;
      max-height: 28px !important; /* Lock height to exactly show 1 primary badge in collapsed state */
      overflow: hidden !important;
      transition: max-height 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) !important; /* Pure transitionable max-height */
    }
    
    /* In normal collapsed state, hide extra badges via pure CSS to avoid any DOM recreate flickering */
    .role-pill-badge {
      font-size: clamp(0.55rem, 0.7vw, 0.72rem) !important;
      font-weight: 800 !important;
      color: var(--primary) !important;
      background: rgba(212, 175, 55, 0.06) !important;
      padding: 0.2rem 0.6rem !important;
      border-radius: 100px !important;
      border: 1px solid rgba(212, 175, 55, 0.25) !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      transition: all 0.3s !important;
      display: none !important; /* Hide extra badges by default */
      max-width: 100% !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }
    /* Only show the first (primary matching) badge in collapsed state */
    .role-pill-badge:first-child {
      display: inline-block !important;
    }

    .member-card-wrapper:hover .role-pill-badge:first-child {
      background: var(--primary) !important;
      color: black !important;
      border-color: var(--primary) !important;
      box-shadow: 0 4px 10px rgba(212, 175, 55, 0.25) !important;
    }

    /* Subtle glaze full-screen overlay (doesn't force cards to disappear) */
    .focus-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(8, 10, 15, 0.32) !important; /* Very subtle glazed dark overlay */
      z-index: 40 !important; /* Just below active card but above everything else */
      animation: overlayFadeIn 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards !important;
      cursor: pointer;
      will-change: opacity, backdrop-filter;
    }

    @keyframes overlayFadeIn {
      from {
        opacity: 0;
        backdrop-filter: blur(0px);
        -webkit-backdrop-filter: blur(0px);
      }
      to {
        opacity: 1;
        backdrop-filter: blur(3px); /* Subtle glaze blur */
        -webkit-backdrop-filter: blur(3px);
      }
    }

    /* INACTIVE SHRUNK STATE: Cards stay perfectly sharp, readable, and visible - just scale down and squeeze in */
    .member-card-wrapper.inactive-shrunk {
      transform: scale(0.88) !important; /* Gentle 3D step-back scale */
      opacity: 0.70 !important; /* Beautifully visible and clear, just slightly dimmed */
      filter: none !important; /* No blur! Keep them sharp and readable */
      pointer-events: none !important; /* Disable interaction with background cards */
    }

    /* ACTIVE EXPANDED STATE: The clicked card zooms into center focus with bouncy physics */
    .member-card-wrapper.active-expanded {
      z-index: 50 !important; /* Ensure it is on top of focus overlay */
    }

    /* Transitionable height scales seamlessly from 100% to 122% of static wrapper to guarantee ZERO snapping/flickering! */
    .member-card-wrapper.active-expanded .member-showcase-card {
      transform: scale(1.24) translateY(-20px) !important; /* Giant cinematic zoom projection with bounce */
      height: 122% !important; /* Smoothly transitions height, absolutely NO snapping! */
      min-height: 400px !important;
      border-color: var(--primary) !important;
      background: rgba(212, 175, 55, 0.14) !important; /* Deep warm golden tint */
      box-shadow: 0 35px 90px rgba(212, 175, 55, 0.45) !important; /* Majestic glowing aura */
      z-index: 50 !important;
      overflow: visible !important; /* Allow badges to render with no cropping */
    }

    .member-card-wrapper.active-expanded .avatar-container {
      border-color: var(--primary) !important;
      transform: scale(1.10) !important;
      box-shadow: 0 8px 32px rgba(212, 175, 55, 0.45) !important;
    }

    .member-card-wrapper.active-expanded .member-name {
      color: var(--primary) !important;
      font-size: 1.35rem !important; /* Larger readable title */
    }

    .member-card-wrapper.active-expanded .role-badges-container {
      max-height: 180px !important; /* Butter-smooth transitionable height expansion */
      overflow-y: visible !important;
      padding-bottom: 0.5rem !important;
      gap: 0.5rem !important;
    }

    /* Show all badges in expanded state with staggered popping keyframes */
    .member-card-wrapper.active-expanded .role-pill-badge {
      display: inline-block !important; /* Fully show all badges */
      background: var(--primary) !important;
      color: black !important;
      border-color: var(--primary) !important;
      font-size: 0.78rem !important; /* Highly readable role size */
      padding: 0.35rem 0.9rem !important;
      white-space: normal !important; /* Wrap long role names to be fully read! */
      text-overflow: clip !important;
      box-shadow: 0 4px 10px rgba(212, 175, 55, 0.3) !important;
      animation: badgePopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    @keyframes badgePopIn {
      from {
        opacity: 0;
        transform: scale(0.6) translateY(15px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    /* Stagger delays for elastic cascade pop */
    .member-card-wrapper.active-expanded .role-pill-badge:nth-child(1) { animation-delay: 0.08s; }
    .member-card-wrapper.active-expanded .role-pill-badge:nth-child(2) { animation-delay: 0.16s; }
    .member-card-wrapper.active-expanded .role-pill-badge:nth-child(3) { animation-delay: 0.24s; }
    .member-card-wrapper.active-expanded .role-pill-badge:nth-child(4) { animation-delay: 0.32s; }
    .member-card-wrapper.active-expanded .role-pill-badge:nth-child(5) { animation-delay: 0.40s; }
  `;

  return (
    <div className="container" style={{ maxWidth: '96%', paddingLeft: '1.2rem', paddingRight: '1.2rem', paddingBottom: '10rem', overflowX: 'hidden' }}>
      {/* Native Raw CSS injection bypasses styled-jsx compiler restrictions */}
      <style dangerouslySetInnerHTML={{ __html: rawCss }} />

      {/* Cinematic Full-screen Blur Backdrop Overlay when a card is active */}
      {activeCardKey && (
        <div className="focus-overlay" onClick={() => setActiveCardKey(null)} />
      )}

      <header style={{ marginBottom: '6rem', textAlign: 'center' }}>
        <h1 className="section-title" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Yönetim Kurulu</h1>
        <div style={{ width: '80px', height: '3px', background: 'var(--primary)', margin: '0 auto 2rem' }} />
        <p style={{ opacity: 0.6, fontSize: '1.15rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
          Akademik ve operasyonel hiyerarşiyi temsil eden piramit şemamız.
        </p>
      </header>

      {hasAnyMembers ? (
        <div className="pyramid-container">
          {/* Row 0: Danışman Öğretmen */}
          {row0Members.length > 0 && (
            <section className="pyramid-level">
              <h2 className="level-title"><span>1. Sıra</span> Danışman Öğretmen</h2>
              <div className="members-flex-row">
                {row0Members.map(m => renderMemberCard(m, 1))}
              </div>
            </section>
          )}

          {/* Row 1: Genel Koordinatörler */}
          {row1Members.length > 0 && (
            <section className="pyramid-level">
              <h2 className="level-title"><span>2. Sıra</span> Genel Koordinatörler</h2>
              <div className="members-flex-row">
                {row1Members.map(m => renderMemberCard(m, 2))}
              </div>
            </section>
          )}

          {/* Row 2: Committees, Secretaries, Admins */}
          {row2Members.length > 0 && (
            <section className="pyramid-level">
              <h2 className="level-title"><span>3. Sıra</span> Komiteler, Sekreterler ve Adminler</h2>
              <div className="members-flex-row">
                {row2Members.map(m => renderMemberCard(m, 3))}
              </div>
            </section>
          )}

          {/* Row 3: Teams */}
          {row3Members.length > 0 && (
            <section className="pyramid-level">
              <h2 className="level-title"><span>4. Sıra</span> Ekipler</h2>
              <div className="members-flex-row">
                {row3Members.map(m => renderMemberCard(m, 4))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="glass card" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: '800' }}>HENÜZ ÜYE ATANMADI</h3>
          <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Yönetim kurulu hiyerarşisinde henüz aktif üye bulunmamaktadır. Lütfen yönetim panelinden üyeleri rolleriyle ilişkilendirin.</p>
        </div>
      )}
    </div>
  );
}
