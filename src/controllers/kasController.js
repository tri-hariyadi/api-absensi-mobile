const Kas = require('../models/Kas');
const KasTrans = require('../models/KasTransaction');
const handleValidationError = require('../config/handleValidationError');
const responseWrapper = require('../config/responseWrapper');
const config = require('../config/config');

const fs = require('fs-extra');
const path = require('path');

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
    const param = JSON.parse(req.body.data);
    const kasTrans = new KasTrans({
      userId: param.userId,
      userName: param.userName,
      totalPay: param.totalPay,
      dateTransaction: param.dateTransaction,
      desc: param.desc,
      status: param.status,
      proofPayment: req.file.filename ? `${config.API_BASE_URl}images/${req.file.filename}` : ''
    });

    let error = kasTrans.validateSync();
    if (error) {
      if (req.file.filename) await fs.unlink(path.join(`public/images/${req.file.filename}`));
      handleValidationError(error, res);
    } else {
      kasTrans.save(async (err, dataKas) => {
        if (err) {
          if (req.file.filename) await fs.unlink(path.join(`public/images/${req.file.filename}`));
          return res.status(500).send(responseWrapper(null, 'Error Internal System', 500));
        }
        res.status(200).send(responseWrapper({ Message: 'Successfully pay kas' }, 'Successfully pay kas', 200));
      });
    }
  },

  updateKasTransaction: async (req, res, next) => {
    if (req.body.role === '1') {
      let dataKasTransaction;
      let prevStatus;
      await KasTrans.findOne({
        userId: req.body.userId,
        userName: req.body.userName
      }, (err, dataKas) => {
        if (err) return res.status(500).send(responseWrapper(null, 'Can not update data transaction', 500));
        if (!dataKas) return res.status(404).send(responseWrapper(null, 'Can not find data transaction', 404));
        if (dataKas) {
          dataKasTransaction = dataKas;
          prevStatus = dataKas.status;
          dataKasTransaction['status'] = req.body.status;
        }
      });

      const kasTrans = new KasTrans(dataKasTransaction);
      let error = kasTrans.validateSync();
      if (error) handleValidationError(error, res);
      else if (prevStatus !== 'accept')
        KasTrans.updateOne({ _id: dataKasTransaction.id }, { status: req.body.status }, (err, dataUpdateKas) => {
          if (err) return res.status(500).send(responseWrapper(null, 'Update data transaction is failed', 500));
          if (kasTrans.status === 'accept') Kas.updateMany({}, {
            date: new Date(),
            $inc: { saldo: dataKasTransaction.totalPay }
          }, (err, result) => {
            if (err) return res.status(500).send(responseWrapper(null, 'Update data transaction is failed', 500));
            res.status(200).send(responseWrapper({ Message: 'Successfully Update data transaction' }, 'Successfully Update data transaction', 200));
          });
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
      else if (dataKasTransaction.length <= 0) return res.status(404).send(responseWrapper(null, 'Data transactions is not found', 404));
      else return res.status(200).send(responseWrapper(dataKasTransaction, 'Successfully get data kas transactions', 200));
    });
  }
}
