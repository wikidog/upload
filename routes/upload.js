const path = require('path');
const fs = require('fs-extra');

// const debug = require('debug')('upload:upload');
const logger = require('../services/logger');

// * middleware for handling multipart/form-data
// * Multer won't process any request body which is not multipart/form-data
const multer = require('multer');

const combineChunks = require('../services/upload_combine_chunks');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// ==================================================================
// multer disStorage configuration
//
const destination = async (req, file, next) => {
  const partIndex = req.body.qqpartindex;
  // console.log('####### in destination ########');
  // console.log(req.body);
  // console.log(file);
  if (partIndex == null) {
    // console.log('----- no chunking -----');
    next(null, UPLOAD_DIR);
  } else {
    // console.log('******* chunking ******');
    const destDir = `${UPLOAD_DIR}/${req.body.qquuid}`;
    await fs.ensureDir(destDir);
    next(null, destDir);
  }
};

const filename = (req, file, next) => {
  const partIndex = req.body.qqpartindex;
  // console.log('====== in filename =======');
  // console.log(req.body);
  // console.log(file);
  if (partIndex == null) {
    // console.log('----- no chunking -----');
    next(null, `upload_${Date.now()}-${file.originalname}`);
  } else {
    // console.log('******* chunking ******');
    const totalParts = req.body.qqtotalparts;
    // 0 left padding
    // padding length depends on the length of total parts
    next(null, partIndex.padStart(totalParts.length, '0'));
  }
};

const storage = multer.diskStorage({
  destination,
  filename,
});

// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage });

// ====================================================================
const combineChunksCallback = (req, res, next, toFile) => {
  // at this point, combining chunks is successful
  res.send({ success: true, filename: path.basename(toFile) });
  // TODO: save file information
};

// ====================================================================
module.exports = app => {
  app.get('/upload', (req, res) => {
    res.send({ message: 'message 123456' });
    return;

    // req.setTimeout(10000);

    // setTimeout(() => {
    //   res.send({ message: 'secret code 123456' });
    // }, 180000);
  });

  app.post('/formsubmit', (req, res, next) => {
    // console.log(req.body);
    logger.info('request body:', req.body);
    res.send({ success: true });
    // res.status(422).send({ error: 'Wrong password' });
  });

  // for this request, we need
  //    app.use(bodyParser.urlencoded({ extended: true }));
  app.post('/chunksdone', (req, res, next) => {
    logger.info('======== chunksdone ==========');
    logger.info('>>>>>>>> request body:\n%o', req.body);
    logger.info('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');

    // res.send({ success: true });
    // // res.status(422).send({ error: 'Wrong password' });
    // return;

    const uuid = req.body.qquuid;
    const filename = req.body.qqfilename;
    // const totalSize = req.body.qqtotalfilesizes;
    const totalParts = req.body.qqtotalparts;
    const totalPartsInt = parseInt(totalParts);
    //
    const fromDir = `${UPLOAD_DIR}/${uuid}`;
    // const fromDir = uuid;
    // const files = await fs.readdir(destDir);
    const toFile = `${UPLOAD_DIR}/upload_${Date.now()}-${filename}`;
    // const toFile = `${UPLOAD_DIR}/${toFilename}`;

    //  fromDir: dirname with full path
    //  toFile:  filename with full path
    //! Node has default 2 minute timeout for the request
    //! if the uploaded file is very big, merging could take long time
    //! we must extend the timeout value for this request
    combineChunks(
      totalPartsInt,
      fromDir,
      toFile,
      combineChunksCallback,
      req,
      res,
      next
    );
  });

  app.post('/uploads', upload.single('qqfile'), (req, res, next) => {
    // res.status(420).send({ success: false });
    logger.info('========= one upload done ==========');
    logger.info('>>>>>>>> request body:\n%o', req.body);
    logger.info('>>>>>>>> file:\n%o', req.file);
    logger.info('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    let rtnData = { success: true };
    const partIndex = req.body.qqpartindex;
    if (partIndex == null) {
      // no chunking
      rtnData.filename = req.file.filename;
      // TODO: save file information
    }
    // res.send({ success: true });
    res.send(rtnData);
  });
};
