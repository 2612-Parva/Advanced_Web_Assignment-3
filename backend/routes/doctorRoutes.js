const { Router } = require('express');
const multer = require('multer');
const { verifyToken } = require('../middleware/authmiddleware/Jwt');
const { authorizeRoles } = require('../middleware/rolemiddleware/role');
const {
  getDoctorProfile,
  updateBasicDoctorProfile,
  updateAvailability,
  updateDoctorAddress,
  getAvailability,
  uploadProfilePicture,
  getPublicDoctorProfile,
  listDoctors
} = require('../controllers/doctorController');

const upload = multer();
const router = Router();


router.use(verifyToken);

router.get('/profile', authorizeRoles('doctor'), getDoctorProfile);

router.put('/profile/basic', authorizeRoles('doctor'), updateBasicDoctorProfile);
router.put('/profile/availability', authorizeRoles('doctor'), updateAvailability);
router.put('/profile/address', authorizeRoles('doctor'), updateDoctorAddress);

router.post('/profile-picture', authorizeRoles('doctor'), upload.single('image'), uploadProfilePicture);
router.get('/availability', authorizeRoles('doctor'), getAvailability);

router.get('/public/:doctorId', getPublicDoctorProfile);
router.get('/list/all', listDoctors);

module.exports = router;
