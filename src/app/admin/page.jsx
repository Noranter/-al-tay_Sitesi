'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Users, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ committees: 0, board: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/committees').then(res => res.json()),
      fetch('/api/board').then(res => res.json())
    ]).then(([committees, board]) => {
      setStats({
        committees: Array.isArray(committees) ? committees.length : 0,
        board: Array.isArray(board) ? board.length : 0
      });
    });
  }, []);

  return (
    <div>
      <h1 className="section-title">Hoş Geldiniz, Admin</h1>
      <p style={{ marginBottom: '2rem', opacity: 0.8 }}>Sitenizin içeriğini buradan yönetebilirsiniz.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="glass card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Toplam Komite</p>
              <h2 style={{ fontSize: '2.5rem' }}>{stats.committees}</h2>
            </div>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '12px' }}>
              <ClipboardList size={32} color="var(--primary)" />
            </div>
          </div>
          <Link href="/admin/committees" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}>
            Yönet <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="glass card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Yönetim Kurulu</p>
              <h2 style={{ fontSize: '2.5rem' }}>{stats.board}</h2>
            </div>
            <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '1rem', borderRadius: '12px' }}>
              <Users size={32} color="#ec4899" />
            </div>
          </div>
          <Link href="/admin/board" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}>
            Yönet <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
