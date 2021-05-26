const Absensi = require('../models/Absensi');
const handleValidationError = require('../config/handleValidationError');
const responseWrapper = require('../config/responseWrapper');

const fs = require('fs-extra');
const path = require('path');

module.exports = {
  absenIn: async (req, res, next) => {
    const param = JSON.parse(req.body.data);
    const absent = new Absensi({
      userId: param.userId,
      userName: param.userName,
      desc: param.desc,
      dateWork: param.dateWork,
      imageIn: `images/${req.file.filename}`
    });
    if (!req.file) return res.status(400).send(responseWrapper(null, 'Image In is required', 400));
    let error = absent.validateSync();
    if (error) {
      if (req.file.filename) await fs.unlink(path.join(`public/images/${req.file.filename}`));
      handleValidationError(error, res);
    }
    else
      absent.save(async (err, absensi) => {
        if (err) {
          if (req.file.filename) await fs.unlink(path.join(`public/images/${req.file.filename}`));
          return res.status(500).send(responseWrapper(null, err, 500));
        }
        res.status(200).send(responseWrapper(
          { Message: 'Successfully absent in!' },
          'Successfully absent in!',
          200
        ));
      });
  },

  absentOut: async (req, res, next) => {
    try {
      const param = JSON.parse(req.body.data);
      let dataAbsent;
      await Absensi.findOne(param, (err, absentData) => {
        if (err) return res.status(400).send(responseWrapper(null, 'Cannot absent out', 400));
        if (absentData) dataAbsent = absentData;
      });
      const absent = new Absensi({
        userId: param.userId,
        userName: param.userName,
        desc: dataAbsent ? dataAbsent.desc : ''
      });

      if (!req.file) return res.status(400).send(responseWrapper(null, 'Image out is required', 400));

      let error = absent.validateSync();
      if (error) {
        if (req.file.filename) await fs.unlink(path.join(`public/images/${req.file.filename}`));
        handleValidationError(error, res);
      } else {
        param['imageOut'] = `images/${req.file.filename}`;
        await Absensi.updateOne({ userId: param.userId }, param);
        res.status(200).send(responseWrapper(
          { Message: 'Successfully absent out!' },
          'Successfully absent out!',
          200
        ));
      }
    } catch (err) {
      await fs.unlink(path.join(`public/images/${req.file.filename}`));
      return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
    }
  },

  getDataAbsents: async (req, res, next) => {
    try {
      if (!req.body.startDate) return res.status(400).send(responseWrapper(null, 'Start Date is required', 400));
      if (!req.body.endDate) return res.status(400).send(responseWrapper(null, 'End Date is required', 400));
      if (!req.body.userId) return res.status(400).send(responseWrapper(null, 'UserId is required', 400));
      let dataAbsents = await Absensi.find({
        userId: req.body.userId,
        dateWork: {
          $gte: new Date(req.body.startDate),
          $lte: new Date(req.body.endDate)
        }
      });
      if (dataAbsents.length <= 0) return res.status(404).send(responseWrapper(null, 'Data absents is not found', 404));
      res.status(200).send(responseWrapper(dataAbsents, 'Successfully get data absents', 200));
    } catch (err) {
      return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
    }
  }
}
