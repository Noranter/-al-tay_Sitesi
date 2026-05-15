import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, default: 'var(--primary)' }, // İleride renkli etiketler için
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Role || mongoose.model('Role', RoleSchema);
