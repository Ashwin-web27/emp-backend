const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EmployeeSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  referralCode: {
    type: String,
    trim: true,
    index: true
  },
  referredBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive'],
    default: 'pending'
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for referred employees
EmployeeSchema.virtual('referredEmployees', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'referredBy',
  justOne: false
});

// Encrypt password using bcrypt
EmployeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update timestamp before saving
EmployeeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Match user entered password to hashed password in database
EmployeeSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate referral code
EmployeeSchema.methods.generateReferralCode = function() {
  const randomString = Math.random().toString(36).substring(2, 8);
  this.referralCode = `${this.fullName.substring(0, 3)}${randomString}`.toUpperCase();
};

// Static method to check if email is taken
EmployeeSchema.statics.isEmailTaken = async function(email, excludeEmployeeId) {
  const employee = await this.findOne({ 
    email, 
    _id: { $ne: excludeEmployeeId } 
  });
  return !!employee;
};

module.exports = mongoose.model('Employee', EmployeeSchema);