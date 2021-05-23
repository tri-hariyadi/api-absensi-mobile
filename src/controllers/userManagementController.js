const config = require("../config/config").get(process.env.NODE_ENV);
const Users = require("../models/Users");
const responseWrapper = require('../config/responseWrapper');

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
      password: bcrypt.hashSync(req.body.password, 8),
      organisation: req.body.organisation,
      divisi: req.body.divisi,
      class: req.body.class,
      nim: req.body.nim,
      birthDate: req.body.birthDate,
      birthPlace: req.body.birthPlace,
      gender: req.body.gender
    });

    if (!parseInt(user.phonenumber, 10)) return res.status(400).send(responseWrapper(
      null,
      'Invalid phone number!',
      400
    ));

    user.save((err, user) => {
      if (err) return res.status(500).send(responseWrapper(null, err, 500));
      res.status(200).send(responseWrapper(
        { Message: 'User was registered successfully!' },
        'User was registered successfully!',
        200
      ));
    });
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
      Users.findOne({ _id: param.id }, async (err, user) => {
        if (user) await fs.unlink(path.join(`public/${user.image}`));
      });
      await Users.updateOne({ _id: param.id }, {
        username: param.username,
        email: param.email,
        phonenumber: param.phonenumber,
        password: bcrypt.hashSync(param.password, 8),
        organisation: param.organisation,
        divisi: param.divisi,
        class: param.class,
        nim: param.nim,
        birthDate: param.birthDate,
        birthPlace: param.birthPlace,
        gender: param.gender,
        image: `images/${req.file.filename}`
      });
      res.status(200).send(responseWrapper(
        { Message: 'Update data User is successfully!' },
        'Update data User is successfully!',
        200
      ));
    } catch (err) {
      await fs.unlink(path.join(`public/images/${req.file.filename}`));
      return res.status(500).send(responseWrapper(null, err ? err : 'Internal Server Error', 500));
    }
  }
}
