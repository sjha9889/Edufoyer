import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  mobileNumber: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 15
  },
  strongSubject: {
    type: String,
    required: true,
    enum: [
      'Operating Systems',
      'Artificial Intelligence', 
      'Database Management Systems',
      'Data Structures and Algorithms',
      'Java',
      'MERN'
    ]
  },
  universityName: {
    type: String,
    required: true,
    default: 'Kalinga Institute of Industrial Technology'
  },
  course: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Profile = mongoose.model('Profile', ProfileSchema);

export default Profile;
