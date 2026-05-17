import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, default: 'var(--primary)' }, // İleride renkli etiketler için
  order: { type: Number, default: 0 },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null },
  level: { type: Number, default: 4 } // 1: Danışman Öğretmen, 2: Genel Koordinatör, 3: Komite, 4: Ekip (defaults to 4/Ekip)
}, { timestamps: true });

if (mongoose.models.Role) {
  delete mongoose.models.Role;
}

export default mongoose.model('Role', RoleSchema);
