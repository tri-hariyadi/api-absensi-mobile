const config = require("../config/config").get(process.env.NODE_ENV);
const Users = require("../models/Users");
const Tokens = require("../models/Tokens");
const responseWrapper = require('../config/responseWrapper');
const handleValidationError = require('../config/handleValidationError');

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  registerUser: async (req, res, next) => {
    const user = new Users({
      username: req.body.username,
      email: req.body.email,
      phonenumber: req.body.phonenumber,
      password: req.body.password,
      organisation: req.body.organisation,
      divisi: req.body.divisi,
      class: req.body.class,
      nim: req.body.nim,
      birthDate: req.body.birthDate,
      birthPlace: req.body.birthPlace,
      gender: req.body.gender,
      role: req.body.role
    });

    let error = user.validateSync();
    if (error) {
      handleValidationError(error, res);
    } else {
      user['password'] = bcrypt.hashSync(req.body.password, 8);
      user.save((err, user) => {
        if (err) return res.status(500).send(responseWrapper(null, err, 500));
        res.status(200).send(responseWrapper(
          { Message: 'User was registered successfully!' },
          'User was registered successfully!',
          200
        ));
      });
    }
  },

  loginUser: async (req, res, next) => {
    Users.findOne({
      email: req.body.email
    }).exec(async (err, user) => {
      if (err) return res.status(500).send(responseWrapper(null, err, 500));
      if (!user) return res.status(404).send(responseWrapper(null, 'Email is not found'));
      if (user) {
        const doc = await Tokens.findOne({ userId: user._id });
        if (!doc) {
          let passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
          );
          if (!passwordIsValid) return res.status(401).send(responseWrapper(null, 'Invalid password', 401));
          let accessToken = jwt.sign({
            idUser: user.id,
            username: user.username,
            organisation: user.organisation,
            division: user.divisi,
            avatar: user.image
          }, config.SECRET, {
            expiresIn: 300 // 24 hours
          });

          let tokens = new Tokens({
            token: accessToken,
            userId: user._id
          });
          tokens.save((err, result) => {
            if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
            res.status(200).send(
              responseWrapper({ accessToken }, 'Success Login', 200)
            );
          });
        } else res.status(400).send(responseWrapper(null, 'Can not login', 400));
      }
    });
  },

  updateUser: async (req, res, next) => {
    const param = JSON.parse(req.body.data);
    param['image'] = `${config.API_BASE_URl}images/${req.file.filename}`;
    const newUser = new Users({
      username: param.username,
      email: param.email,
      phonenumber: param.phonenumber,
      password: param.password,
      organisation: param.organisation,
      divisi: param.divisi,
      class: param.class,
      nim: param.nim,
      birthDate: param.birthDate,
      birthPlace: param.birthPlace,
      gender: param.gender,
      role: param.role,
      image: `${config.API_BASE_URl}images/${req.file.filename}`
    });

    Users.findOne({ _id: param.id }, async (err, user) => {
      if ((!user || err) && req.file.filename) await fs.unlink(path.join(`public/images/${req.file.filename}`));
      if (!user) return res.status(404).send(responseWrapper(null, 'No data user find to update', 404));
      if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
      if (user) {
        let error = param.option === 'IS_UPDATE_IMAGE' ? null : newUser.validateSync();
        if (error) {
          if (req.file.filename) await fs.unlink(path.join(`public/images/${req.file.filename}`));
          handleValidationError(error, res);
        } else {
          if (param.password) param['password'] = bcrypt.hashSync(param.password, 8);
          Users.updateOne({ _id: param.id }, param, async (err, result) => {
            if (err) return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
            if (user.image) {
              try {
                const imageUri = user.image;
                await fs.unlink(path.join(`public/${imageUri.split('/')[3]}/${imageUri.split('/')[4]}`));
              } catch (err) {
                console.log(err);
              }
            }
            res.status(200).send(responseWrapper(
              { Message: 'Update data User is successfully!' },
              'Update data User is successfully!',
              200
            ));
          });
        }
      }
    });
  },

  getAllUsers: async (req, res, next) => {
    if (req.body.role === '1') {
      try {
        const allUsers = await Users.find();
        return res.status(200).send(responseWrapper(allUsers, 'Success get all users', 200));
      } catch (err) {
        return res.status(500).send(responseWrapper(null, 'Internal Server Error', 500));
      }
    } else {
      return res.status(403).send(responseWrapper(null, 'Can not get all users', 403));
    }
  }
}
