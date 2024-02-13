const multer = require('multer')
const {v4:uuidv4} = require('uuid')
const path= require('path')

const storage = multer.diskStorage({
    destination: function(req, file, cb){

        let destination;
        if(req.path === '/updateavatar'){
            destination = './public/images/userprofilepics/'
        }
        else{
            destination = './public/images/uploads/'
        }

        cb(null, destination)
    },
    filename: function(req, file, cb){
        let uniqueFilename = uuidv4()
        cb(null, uniqueFilename+path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})

module.exports = upload