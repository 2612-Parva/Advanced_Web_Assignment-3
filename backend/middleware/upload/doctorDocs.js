// middleware/upload/doctorDocs.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads/doctor-credentials');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const credentialDir = path.join(__dirname, '../../uploads/doctor-credentials');
if (!fs.existsSync(credentialDir)) {
  fs.mkdirSync(credentialDir, { recursive: true });
}

const profileDir = path.join(__dirname, '../../uploads/doctor-profiles');
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

const allowedTypes = {
  credential: ['.pdf'],
  profile: ['.jpg', '.jpeg', '.png']
};

const createStorage = (docType) => multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, docType === 'profile' ? profileDir : credentialDir);
    },
    filename: (req, file, cb) => {
      const doctorId = req.user?.userId || 'unknown';
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${doctorId}_${docType}${ext}`;
      cb(null, filename);
    }
  }),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const validTypes = allowedTypes[docType === 'profile' ? 'profile' : 'credential'];
    if (!validTypes.includes(ext)) {
      const error = new Error(`Invalid file type for ${docType}. Only ${validTypes.join(', ')} allowed`);
      error.code = 'INVALID_FILE_TYPE';
      return cb(error);
    }
    cb(null, true);
  },
  limits: {
    files: 1
  }
});

module.exports = {
  uploadCredential: createStorage('credential'),
  uploadProfilePicture: createStorage('profile')
};