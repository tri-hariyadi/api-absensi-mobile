const Kas = require('../models/Kas');
const KasTrans = require('../models/KasTransaction');
const Users = require('../models/Users');
const handleValidationError = require('../config/handleValidationError');
const responseWrapper = require('../config/responseWrapper');
const config = require('../config/config').get(process.env.NODE_ENV);;

const fs = require('fs-extra');
const path = require('path');
const formidable = require('formidable');

module.exports = {
  insertKas: (req, res, next) => {
    if (req.body.role === '1') {
      Kas.find({}, (err, dataKas) => {
        if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
        if (dataKas && dataKas.length > 0) return res.status(400).send(responseWrapper(null, 'Can not input data, Data kas is already exist', 400))
      });

      const kas = new Kas({
        saldo: req.body.saldo,
        date: req.body.date
      });

      let error = kas.validateSync();
      if (error) handleValidationError(error, res)
      else kas.save((err, dataKas) => {
        if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
        res.status(200).send(responseWrapper({ Message: 'Successfully safe kas' }, 'Successfully safe kas', 200));
      });
    } else res.status(403).send(responseWrapper({ Message: 'Can not insert data kas' }, 'Can not insert data kas', 403));
  },

  getKas: (req, res, next) => {
    Kas.find({}, (err, dataKas) => {
      if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
      if (dataKas.length <= 0) return res.status(404).send(responseWrapper(null, 'Data kas is not found', 404));
      res.status(200).send(responseWrapper(dataKas, 'Successfully get data kas', 200));
    });
  },

  kasTransaction: async (req, res, next) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return res.status(400).send(null, 'Something went wrong', 400);
      if (Object.keys(files).length < 1) return res.status(400).send(responseWrapper(null, 'Proof Payment is required', 400));
      let oldPath = files.file.path;
      let newPath = files.file.name ? `public/images/${Date.now() + path.extname(files.file.name)}` : null
      let rawData = fs.readFileSync(oldPath);

      fs.writeFile(newPath, rawData, async (err) => {
        if (err) return res.status(400).send(responseWrapper(null, 'Something went wrong', 400));
        console.log(oldPath);

        const param = JSON.parse(fields.data);
        const kasTrans = new KasTrans({
          userId: param.userId,
          userName: param.userName,
          totalPay: param.totalPay,
          dateTransaction: param.dateTransaction,
          desc: param.desc,
          status: param.status,
          proofPayment: `${config.API_BASE_URl}images/${newPath.replace('public/images/', '')}`,
          typeTransaction: param.typeTransaction
        });

        let error = kasTrans.validateSync();
        if (error) {
          if (newPath) await fs.unlink(path.join(newPath));
          handleValidationError(error, res);
        } else {
          if (param.typeTransaction === 'spend') {
            let dataKas = await Kas.find({});
            if (dataKas) {
              kasTrans.save(async (err, dataTransaction) => {
                if (err) {
                  if (newPath) await fs.unlink(path.join(newPath));
                  return res.status(500).send(responseWrapper(null, 'Error Internal System', 500));
                }
                if (dataTransaction) {
                  Kas.updateMany({}, {
                    date: new Date(),
                    $set: { saldo: dataKas[0].saldo - dataTransaction.totalPay }
                  }, (err, result) => {
                    if (err) return res.status(500).send(responseWrapper(null, 'Update data transaction is failed', 500));
                    return res.status(200).send(responseWrapper({ Message: 'Successfully Update data transaction' }, 'Successfully Update data transaction', 200));
                  });
                }
              });
            }
          }
          else kasTrans.save(async (err, dataKas) => {
            if (err) {
              if (newPath) await fs.unlink(path.join(newPath));
              return res.status(500).send(responseWrapper(null, 'Error Internal System', 500));
            }
            res.status(200).send(responseWrapper({ Message: 'Successfully pay kas' }, 'Successfully pay kas', 200));
          });
        }
      });
    });
  },

  updateKasTransaction: async (req, res, next) => {
    if (req.body.role === '1') {
      let dataKasTransaction;
      let prevStatus;
      await KasTrans.findOne({
        userId: req.body.userId,
        userName: req.body.userName
      }, (err, result) => {
        if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
        if (!result) return res.status(404).send(responseWrapper(null, 'Can not find data transaction', 404));
        if (result) {
          dataKasTransaction = result;
          prevStatus = result.status;
          dataKasTransaction['status'] = req.body.status;
        }
      });

      const kasTrans = new KasTrans(dataKasTransaction);
      let error = kasTrans.validateSync();
      if (error) handleValidationError(error, res);
      else if (prevStatus !== 'accept')
        KasTrans.updateOne({ _id: dataKasTransaction.id }, { status: req.body.status }, async (err, dataUpdateKas) => {
          if (err) return res.status(500).send(responseWrapper(null, 'Update data transaction is failed', 500));
          if (dataUpdateKas.status === 'accept') {
            let dataKas = await Kas.find({});
            if (dataKas && dataKas.length > 0) {
              Kas.updateMany({}, {
                date: new Date(),
                $inc: { saldo: dataUpdateKas.totalPay }
              }, (err, result) => {
                if (err) return res.status(500).send(responseWrapper(null, 'Update data transaction is failed', 500));
                res.status(200).send(responseWrapper({ Message: 'Successfully Update data transaction' }, 'Successfully Update data transaction', 200));
              });
            }
          }
          else res.status(200).send(responseWrapper({ Message: 'Successfully Update data transaction' }, 'Successfully Update data transaction', 200));
        });
      else res.status(200).send(responseWrapper({ Message: 'Can not update data with status accept' }, 'Can not update data with status accept', 200));
    } else res.status(403).send(responseWrapper({ Message: 'Can not update data' }, 'Can not update data', 403));
  },

  getKasTransaction: (req, res, next) => {
    if (!req.body.startDate) return res.status(400).send(responseWrapper(null, 'Start Date is required', 400));
    if (!req.body.endDate) return res.status(400).send(responseWrapper(null, 'End Date is required', 400));
    const param = {
      userId: req.body.userId,
      dateTransaction: {
        $gte: new Date(req.body.startDate),
        $lte: new Date(req.body.endDate)
      }
    }
    if (!req.body.userId) delete param['userId'];
    KasTrans.find(param, (err, dataKasTransaction) => {
      if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
      if (dataKasTransaction.length <= 0) return res.status(404).send(responseWrapper(null, 'Data transactions is not found', 404));
      res.status(200).send(responseWrapper(dataKasTransaction, 'Successfully get data kas transactions', 200));
    });
  },

  deleteKasTransaction: async (req, res, next) => {
    if (!req.body.startDate) return res.status(400).send(responseWrapper(null, 'Start Date is required', 400));
    if (!req.body.endDate) return res.status(400).send(responseWrapper(null, 'End Date is required', 400));
    if (!req.body.userId) return res.status(400).send(responseWrapper(null, 'User is required', 400));
    Users.findOne({ _id: req.body.userId }, (err, user) => {
      if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
      if (!user) return res.status(404).send(responseWrapper(null, 'User is not found', 404));
      if (user) {
        if (user.role === '1') {
          const param = {
            dateTransaction: {
              $gte: new Date(req.body.startDate),
              $lte: new Date(req.body.endDate)
            }
          }

          await KasTrans.find(param, async (err, result) => {
            if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
            if (!result) return res.status(404).send(responseWrapper(null, 'Data kas transaction not found', 404));
            if (result) {
              result.forEach(item => {
                let splitUrl = item.proofPayment.split('/');
                let pathImg = `public/${splitUrl[3]}/${splitUrl[4]}`;
                await fs.unlink(path.join(pathImg));
              })
            }
          });

          KasTrans.deleteMany(param, async (err, result) => {
            if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
            res.status(200).send(responseWrapper({ Message: 'Successfully delete kas transactions' }, 'Successfully delete kas transactions', 200));
          });
        } else {
          res.status(200).send(responseWrapper(
            { Message: 'User is not have permission to delete kas transaction' },
            'User is not have permission to delete kas transaction',
            200
          ));
        }
      }
    });
  }
}
