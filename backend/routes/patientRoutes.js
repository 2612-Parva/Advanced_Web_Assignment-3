const express = require('express');
const { verifyToken, verifyPendingToken } = require('../middleware/authmiddleware/Jwt');
const checkRole = require('../middleware/authmiddleware/role');
const { getPatientProfile,updatePatientProfile } = require('../controllers/patientController');
const upload = require('../middleware/upload/patientDocs');

const {
  uploadHealthCardFrontcontroller,
  uploadHealthCardBackcontroller,
  uploadInsuranceDocument,
  uploadAllergyDocument,
  uploadMedicalHistory
} = require('../controllers/patientDocumentController');

const {
  uploadHealthCardFront,
  uploadHealthCardBack,
  uploadInsurance,
  uploadAllergy,
  uploadMedical
} = require('../middleware/upload/patientDocs');

const router = express.Router();

router.get('/profile', verifyToken, checkRole('patient'), getPatientProfile);
router.put('/profile', verifyToken, checkRole('patient'), updatePatientProfile);


router.post(
  '/upload/healthcard/front',
  verifyToken,
  checkRole('patient'),
  uploadHealthCardFront.single('file'),
  uploadHealthCardFrontcontroller
);

router.post(
  '/upload/healthcard/back',
  verifyToken,
  checkRole('patient'),
  uploadHealthCardBack.single('file'),
  uploadHealthCardBackcontroller
);

router.post(
  '/upload/insurance',
  verifyToken,
  checkRole('patient'),
  uploadInsurance.single('file'),
  uploadInsuranceDocument
);

router.post(
  '/upload/allergy',
  verifyToken,
  checkRole('patient'),
  uploadAllergy.single('file'),
  uploadAllergyDocument
);

router.post(
  '/upload/medical-history',
  verifyToken,
  checkRole('patient'),
  uploadMedical.single('file'),
  uploadMedicalHistory
);

module.exports = router;