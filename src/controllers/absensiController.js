const Absensi = require('../models/Absensi');
const Users = require('../models/Users');
const handleValidationError = require('../config/handleValidationError');
const responseWrapper = require('../config/responseWrapper');
const config = require('../config/config').get(process.env.NODE_ENV);

const fs = require('fs-extra');
const path = require('path');
const formidable = require('formidable');

module.exports = {
  absenIn: (req, res, next) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      let oldPath = files.file.path;
      let newPath = files.file.name ? `public/images/${Date.now() + path.extname(files.file.name)}` : null
      let rawData = fs.readFileSync(oldPath);

      fs.writeFile(newPath, rawData, async (err) => {
        if (err) return res.status(400).send(responseWrapper(null, 'Something went wrong', 400));

        const param = JSON.parse(fields.data);
        const absent = new Absensi({
          userId: param.userId,
          userName: param.userName,
          location: param.location,
          desc: param.desc,
          dateWork: `${new Date().getFullYear()}-${String((new Date().getMonth() + 1)).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
          imageIn: `${config.API_BASE_URl}images/${newPath.replace('public/images/', '')}`
        });

        if (!files.file) return res.status(400).send(responseWrapper(null, 'Image In is required', 400));
        let error = absent.validateSync();
        if (error) {
          if (newPath) await fs.unlink(path.join(newPath));
          handleValidationError(error, res);
        }
        else absent.save(async (err, absensi) => {
          if (err) {
            if (newPath) await fs.unlink(path.join(newPath));
            return res.status(500).send(responseWrapper(null, err, 500));
          }
          res.status(200).send(responseWrapper(
            { Message: 'Successfully absent in!' },
            'Successfully absent in!',
            200
          ));
        });
      });
    });
  },

  absentOut: async (req, res, next) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return res.status(400).send(null, 'Something went wrong', 400);
      let oldPath = files.file.path;
      let newPath = files.file.name ? `public/images/${Date.now() + path.extname(files.file.name)}` : null;
      let rawData = fs.readFileSync(oldPath);

      fs.writeFile(newPath, rawData, async (err) => {
        if (err) return res.status(400).send(responseWrapper(null, 'Something went wrong', 400));

        const param = JSON.parse(fields.data);
        let dataAbsent;
        await Absensi.findOne({ _id: param.id }, (err, absentData) => {
          if (err) return res.status(500).send(responseWrapper(null, 'Internal server error', 500));
          if (!absentData) return res.status(400).send(responseWrapper(null, 'Cannot absent out', 400));
          if (absentData) dataAbsent = absentData;
        });
        const absent = new Absensi({
          userId: dataAbsent.userId,
          userName: dataAbsent.userName,
          location: param.location,
          desc: dataAbsent.desc,
          dateWork: `${new Date().getFullYear()}-${String((new Date().getMonth() + 1)).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
        });

        if (!files.file) return res.status(400).send(responseWrapper(null, 'Image out is required', 400));
        let error = absent.validateSync();
        if (error) {
          if (newPath) await fs.unlink(path.join(newPath));
          handleValidationError(error, res);
        } else {
          param['imageOut'] = `${config.API_BASE_URl}images/${newPath.replace('public/images/', '')}`;
          param['status'] = '2';
          Absensi.updateOne({ _id: param.id }, param, async (err, result) => {
            if (err) {
              await fs.unlink(path.join(newPath));
              return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
            }
            res.status(200).send(responseWrapper(
              { Message: 'Successfully absent out!' },
              'Successfully absent out!',
              200
            ));
          });
        }
      });
    });
  },

  getDataAbsents: async (req, res, next) => {
    try {
      if (!req.body.startDate) return res.status(400).send(responseWrapper(null, 'Start Date is required', 400));
      if (!req.body.endDate) return res.status(400).send(responseWrapper(null, 'End Date is required', 400));
      let query = {
        dateWork: {
          $gte: new Date(req.body.startDate),
          $lte: new Date(req.body.endDate)
        }
      }
      if (req.body.userId) query.userId = req.body.userId;
      let dataAbsents = await Absensi.find(query).populate('userId', 'nim divisi username');
      if (dataAbsents.length <= 0) return res.status(404).send(responseWrapper(null, 'Data absents is not found', 404));
      res.status(200).send(responseWrapper(dataAbsents, 'Successfully get data absents', 200));
    } catch (err) {
      return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
    }
  },

  getDataAbsentById: (req, res, next) => {
    Absensi.findOne({ _id: req.body.id }).exec((err, result) => {
      if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
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
      if (dataAbsents) dataAbsents[Object.keys(dataAbsents)[0]].sort((a, b) => new Date(b.dateWork) - new Date(a.dateWork));
      res.status(200).send(responseWrapper(dataAbsents, 'Success get data absents', 200));
    });
  },

  absencePermission: (req, res, next) => {
    const absent = new Absensi({
      userId: req.body.userId,
      userName: req.body.userName,
      location: 'none',
      desc: req.body.desc,
      status: req.body.status
    });
    let error = absent.validateSync();
    if (error) handleValidationError(error, res);
    else absent.save(async (err, absensi) => {
      if (err)
        return res.status(500).send(responseWrapper(null, err, 500));
      res.status(200).send(responseWrapper(
        { Message: 'Successfully add absence permission!' },
        'Successfully add absence permission!',
        200
      ));
    });
  },

  getDataAbsentUsers: async (req, res, next) => {
    const monts = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const getDate = (date) => date < 10 ? `0${date}` : date;
    const DATE_WORK = `${new Date().getFullYear()}-${String((new Date().getMonth() + 1)).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    const day3 = new Date(new Date(DATE_WORK).setDate(new Date(DATE_WORK).getDate() - 1));
    const day2 = new Date(new Date(DATE_WORK).setDate(new Date(DATE_WORK).getDate() - 2));
    const day1 = new Date(new Date(DATE_WORK).setDate(new Date(DATE_WORK).getDate() - 3));

    const month3 = new Date(new Date(DATE_WORK).setMonth(new Date(DATE_WORK).getMonth() - 1));
    const month2 = new Date(new Date(DATE_WORK).setMonth(new Date(DATE_WORK).getMonth() - 2));
    const month1 = new Date(new Date(DATE_WORK).setMonth(new Date(DATE_WORK).getMonth() - 3));

    let countUserNotActive = 0;
    let countUserNotActive3 = 0;
    let countUserNotActive2 = 0;
    let countUserNotActive1 = 0;
    let countUser1 = 0;
    let countUser2 = 0;
    let countUser3 = 0;
    let countUser4 = 0;
    const RegisteredUser = await Users.countDocuments();
    const allUsers = await Users.find({}, '_id createdAt');
    const allAbsents = await Absensi.find({ dateWork: new Date(DATE_WORK) }, 'userId -_id');
    const allAbsents3 = await Absensi.find({ dateWork: day3 }, 'userId -_id');
    const allAbsents2 = await Absensi.find({ dateWork: day2 }, 'userId -_id');
    const allAbsents1 = await Absensi.find({ dateWork: day1 }, 'userId -_id');
    allUsers.forEach(item => {
      if (!allAbsents.some(item2 => item2.userId.toString() === item._id.toString())) countUserNotActive++;
      if (!allAbsents3.some(item3 => item3.userId.toString() === item._id.toString())) countUserNotActive3++;
      if (!allAbsents2.some(item4 => item4.userId.toString() === item._id.toString())) countUserNotActive2++;
      if (!allAbsents1.some(item5 => item5.userId.toString() === item._id.toString())) countUserNotActive1++;

      if (item.createdAt && new Date(item.createdAt).toJSON().slice(5, 7) === DATE_WORK.slice(5, 7)) countUser1++;
      if (item.createdAt && new Date(item.createdAt).toJSON().slice(5, 7) === month3.toJSON().slice(5, 7)) countUser2++;
      if (item.createdAt && new Date(item.createdAt).toJSON().slice(5, 7) === month2.toJSON().slice(5, 7)) countUser3++;
      if (item.createdAt && new Date(item.createdAt).toJSON().slice(5, 7) === month1.toJSON().slice(5, 7)) countUser4++;
    });

    const registeredUser = {
      // [`${monts[new Date().getMonth()]} ${new Date().getFullYear()}`]: await Users.countDocuments({ createdAt: new Date(DATE_WORK) }),
      [`${monts[new Date().getMonth()]} ${new Date().getFullYear()}`]: countUser1,
      [`${monts[new Date().getMonth() - 1]} ${new Date().getFullYear()}`]: countUser2,
      [`${monts[new Date().getMonth() - 2]} ${new Date().getFullYear()}`]: countUser3,
      [`${monts[new Date().getMonth() - 3]} ${new Date().getFullYear()}`]: countUser4,
    }

    const userOnWork = {
      [`${getDate(new Date().getDate())} ${monts[new Date().getMonth()]} ${new Date().getFullYear()}`]: await Absensi.countDocuments({ dateWork: new Date(DATE_WORK), status: '1' }),
      [`${getDate(new Date().getDate() - 1)} ${monts[new Date().getMonth()]} ${new Date().getFullYear()}`]: await Absensi.countDocuments({ dateWork: day3, status: '1' }),
      [`${getDate(new Date().getDate() - 2)} ${monts[new Date().getMonth()]} ${new Date().getFullYear()}`]: await Absensi.countDocuments({ dateWork: day2, status: '1' }),
      [`${getDate(new Date().getDate() - 3)} ${monts[new Date().getMonth()]} ${new Date().getFullYear()}`]: await Absensi.countDocuments({ dateWork: day1, status: '1' })
    }

    const userIzin = {
      [`${getDate(new Date().getDate())} ${monts[new Date().getMonth()]} ${new Date().getFullYear()}`]: await Absensi.countDocuments({ dateWork: new Date(DATE_WORK), status: '3' }),
      [`${getDate(new Date().getDate() - 1)} ${monts[new Date().getMonth()]} ${new Date().getFullYear()}`]: await Absensi.countDocuments({ dateWork: day3, status: '3' }),
      [`${getDate(new Date().getDate() - 2)} ${monts[new Date().getMonth()]} ${new Date().getFullYear()}`]: await Absensi.countDocuments({ dateWork: day2, status: '3' }),
      [`${getDate(new Date().getDate() - 3)} ${monts[new Date().getMonth()]} ${new Date().getFullYear()}`]: await Absensi.countDocuments({ dateWork: day1, status: '3' })
    }

    const userNotActive = {
      [`${getDate(new Date().getDate())} ${monts[new Date().getMonth()]} ${new Date().getFullYear()}`]: countUserNotActive,
      [`${getDate(new Date().getDate() - 1)} ${monts[new Date().getMonth()]} ${new Date().getFullYear()}`]: countUserNotActive3,
      [`${getDate(new Date().getDate() - 2)} ${monts[new Date().getMonth()]} ${new Date().getFullYear()}`]: countUserNotActive2,
      [`${getDate(new Date().getDate() - 3)} ${monts[new Date().getMonth()]} ${new Date().getFullYear()}`]: countUserNotActive1,
    }

    res.status(200).send(responseWrapper({
      userregistered: registeredUser,
      useronwork: userOnWork,
      userizin: userIzin,
      usernotactive: userNotActive,
      alluserregistered: RegisteredUser
    }, 'Success retrieve data absent users', 200));
  }
}


