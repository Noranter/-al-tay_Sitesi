import mongoose from 'mongoose';

const BoardMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  photoUrl: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.BoardMember || mongoose.model('BoardMember', BoardMemberSchema);
