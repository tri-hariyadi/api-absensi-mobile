const Absensi = require('../models/Absensi');
const handleValidationError = require('../config/handleValidationError');
const responseWrapper = require('../config/responseWrapper');
const config = require('../config/config').get(process.env.NODE_ENV);

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
      imageIn: `${config.API_BASE_URl}images/${req.file.filename}`
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
        param['imageOut'] = `${config.API_BASE_URl}images/${req.file.filename}`;
        param['status'] = '2';
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
  },

  getDataAbsentById: (req, res, next) => {
    Absensi.findOne({
      userId: req.body.userId,
      userName: req.body.userName
    }).exec((err, result) => {
      if (err) res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
      if (!result) return res.status(404).send(responseWrapper(null, 'Data user is not found', 404))
      if (result) return res.status(200).send(responseWrapper(result, 'Successfully get data user', 200));
    });
  },

  getLatestDataAbsent: (req, res, next) => {
    let today = new Date();

    let endYYYY = today.getFullYear();
    let endMM = String(today.getMonth() + 1).padStart(2, '0');
    let endDD = String(today.getDate()).padStart(2, '0');

    today.setMonth(today.getMonth() - 3);

    let startYYYY = today.getFullYear();
    let startMM = String((today.getMonth() + 1)).padStart(2, '0');
    let startDD = String(today.getDate()).padStart(2, '0');

    let startDate = `${startYYYY}-${startMM}-${startDD}`;
    let endDate = `${endYYYY}-${endMM}-${endDD}`;

    let monthArray = [];
    let mounts = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    let i = Number(startMM) - 1;
    while (i < 12) {
      monthArray.push({ MM: i, MMMM: mounts[i] });
      if (i === 11 && Number(endMM) - 1 <= 2) i = -1;
      i++
      if (i === Number(endMM)) break;
    }

    Absensi.find({
      userId: req.body.userId,
      dateWork: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }, (err, result) => {
      const dataAbsents = {}
      let temp = [];
      if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
      if (!result || result.length <= 0) return res.status(404).send(responseWrapper(null, 'Data Absents is empty', 404));
      if (result) {
        //descending
        const compare = (a, b) => {
          if (a.dateWork > b.dateWork) {
            return -1;
          }
          if (a.dateWork < b.dateWork) {
            return 1;
          }
          return 0;
        }
        result.sort(compare);
        result.map((item, idx) => {
          if (temp.length > 0 && new Date(temp[temp.length - 1].dateWork).getMonth() !== new Date(item.dateWork).getMonth()) temp = [];
          temp.push(item);
          monthArray.map(month => {
            if (new Date(item.dateWork).getMonth() === month.MM) {
              dataAbsents[month.MMMM] = temp;
            }
          });
        });
      }
      res.status(200).send(responseWrapper(dataAbsents, 'Success get data absents', 200));
    });
  }
}


