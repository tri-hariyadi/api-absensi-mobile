const config = require("../config/config").get(process.env.NODE_ENV);
const Users = require("../models/Users");
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
    }).exec((err, user) => {
      if (err) return res.status(500).send(responseWrapper(null, err, 500));
      if (!user) return res.status(404).send(responseWrapper(null, 'Email is not found'));
      if (user) {
        let passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );
        if (!passwordIsValid)
          return res.status(401).send(responseWrapper(null, 'Invalid password', 401));

        let token = jwt.sign({
          idUser: user.id,
          username: user.username
        }, config.SECRET, {
          expiresIn: 86400 // 24 hours
        });

        res.status(200).send(
          responseWrapper({ accessToken: token }, 'Success Login', 200)
        );
      }
    })
  },

  updateUser: async (req, res, next) => {
    try {
      const param = JSON.parse(req.body.data);
      param['image'] = `images/${req.file.filename}`;
      const user = new Users({
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
        image: `images/${req.file.filename}`
      });
      let uriImage;
      await Users.findOne({ _id: param.id }, async (err, user) => {
        if (user) uriImage = user.image;
        if (err) return res.status(400).send(responseWrapper(null, 'Failed to update user data', 400));
      });

      let error = user.validateSync();
      if (error) {
        if (req.file.filename) await fs.unlink(path.join(`public/images/${req.file.filename}`));
        handleValidationError(error, res);
      } else {
        param['password'] = bcrypt.hashSync(param.password, 8);
        await Users.updateOne({ _id: param.id }, param);
        if (uriImage) await fs.unlink(path.join(`public/${uriImage}`));
        res.status(200).send(responseWrapper(
          { Message: 'Update data User is successfully!' },
          'Update data User is successfully!',
          200
        ));
      }
    } catch (err) {
      console.log(err);
      if (req.file.filename) await fs.unlink(path.join(`public/images/${req.file.filename}`));
      return res.status(500).send(responseWrapper(null, err, 500));
    }
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
