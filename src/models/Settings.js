import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  workshopName: { type: String, default: 'Lise Çalıştayı' },
  siteName: { type: String, default: 'GalÇal 26' },
  shortDescription: { type: String, default: 'Geleceğin Liderlerini Yetiştiriyoruz' },
  instagramUrl: { type: String, default: 'https://instagram.com' },
  dateAndLocation: { type: String, default: 'Bahar Dönemi | İstanbul' },
  vision: { type: String, default: 'Vizyon metnimiz buraya gelecek.' },
  mission: { type: String, default: 'Misyon metnimiz buraya gelecek.' },
  globalApplicationMessage: { type: String, default: 'Çalıştayımıza delege veya gözlemci olarak başvurmak için bize mail atabilirsiniz.' },
  globalApplicationEmail: { type: String, default: 'iletisim@galcal.com' },
  globalApplicationUrl: { type: String, default: '' },
  
  // Committees Page
  committeesPageTitle: { type: String, default: 'Akademik Komiteler' },
  committeesPageSubtitle: { type: String, default: 'Çalıştayımız bünyesinde yer alan akademik komiteler ve detayları.' },
  
  // Why Join / Highlights Section
  highlights: [{
    title: String,
    value: String, // Can be "4", "100+", or empty for text-only
    isNumeric: { type: Boolean, default: true }
  }]
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
