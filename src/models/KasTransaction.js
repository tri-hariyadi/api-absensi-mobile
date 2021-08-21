const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const kasTransactionScheme = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: 'User'
  },
  userName: {
    type: String,
    required: [true, 'Username is required']
  },
  totalPay: {
    type: Number,
    required: [true, 'Total payment is required']
  },
  dateTransaction: {
    type: Date,
    required: [true, 'Date transaction is required'],
    default: new Date()
  },
  desc: {
    type: String,
    required: [true, 'Description is required'],
    default: 'Paying kas',
    minlength: [10, 'Description minimum 10 characters']
  },
  proofPayment: {
    type: String,
    required: [true, 'Must include proof of payment']
  },
  status: {
    type: String,
    enum: {
      values: ['accept', 'reject', 'processing'],
      message: 'Only accept, reject, and processing is supported for status field'
    },
    required: [true, 'Status payment is required'],
    default: 'processing'
  },
  typeTransaction: {
    type: String,
    enum: {
      values: ['spend', 'income'],
      message: 'Only spend and income is supported for status field'
    },
    required: [true, 'Type Transaction is required']
  }
});

module.exports = mongoose.model('KasTransaction', kasTransactionScheme);
