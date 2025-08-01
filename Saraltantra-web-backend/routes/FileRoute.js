import express from ("express");
const router = express.Router()

import multer from ("multer");

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage })

router.post("/", upload.single('file')), async function (req, res, next) {
    const file = new FileSystem({ file: req.file.originalname })
    await files.save()
    return json(req.file)
}


export default router;