import mongoose from 'mongoose';
import './BoardMember';

const CommitteeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  vision: { type: String, required: true },
  mission: { type: String, required: true },
  workingPaperUrl: { type: String, default: '' },
  bannerUrl: { type: String, default: '' },
  applicationMessage: { type: String, default: 'Bu komiteye başvurmak için aşağıdaki mail adresi üzerinden bizimle iletişime geçebilirsiniz.' },
  applicationEmail: { type: String, default: '' },
  applicationUrl: { type: String, default: '' },
  
  // Specific Team Roles
  divanMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BoardMember' }],
  adminMember: { type: mongoose.Schema.Types.ObjectId, ref: 'BoardMember' },
  secretaryMember: { type: mongoose.Schema.Types.ObjectId, ref: 'BoardMember' },
  pressMember: { type: mongoose.Schema.Types.ObjectId, ref: 'BoardMember' },

  members: [{
    name: String,
    role: String,
    photoUrl: String
  }]
}, { timestamps: true });

export default mongoose.models.Committee || mongoose.model('Committee', CommitteeSchema);
