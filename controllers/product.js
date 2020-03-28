const formidable = require('formidable');
const _ = require('lodash');
const Product = require('../models/product');
const fs = require('fs');
const { errorHandler } = require('../helpers/dbErrorHandler'); 

// Product By ID
exports.productById = (req, res, next, id) => {
  Product.findById(id).exec((err, product) => {
    if(err || !product) {
      res.status(400).json({
        error: "Product not found"
      })
    } 
    req.product = product
    next();
  })
};

// READ Method
exports.read = (req, res) => {
  req.product.photo = undefined
  return res.json(req.product)
}

// CREATE METHOD      
exports.create = (req, res) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if(err) {
      return res.status(400).json({
        error: "Image could not be uploaded"
      })
    }

    // check for all fields
    const {name, description, price, category, quantity, shipping} = fields
    if(!name || !description || !price || !category || !quantity || !shipping) {
      return res.status(400).json({
        error: "All fields are required"
      })
    }

    let product = new Product(fields)

    if(files.photo) {
      //console.log('FILES PHOTO:', files.photo)
      if(files.photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image size should be less than 1mb'
        })
      }
      product.photo.data = fs.readFileSync(files.photo.path)
      product.photo.contentType = files.photo.type
    }

    product.save((err, result) => {
      if(err) {
        return res.status(400).json({
          error: errorHandler(err)
        })
      }
      res.json(result)
    })
  })
}

// REMOVE METHOD
exports.remove = (req, res) => {
  let product = req.product
  product.remove((err, deletedProduct) => {
    if(err) {
      return res.status(400).json({
        error: errorHandler(err)
      })
    }
    res.json({
      "message": "Product deleted successfully"
    })
  })
}

// UPDATE METHOD
exports.update = (req, res) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if(err) {
      return res.status(400).json({
        error: "Image could not be uploaded"
      })
    }

    // check for all fields
    const {name, description, price, category, quantity, shipping} = fields
    if(!name || !description || !price || !category || !quantity || !shipping) {
      return res.status(400).json({
        error: "All fields are required"
      })
    }

    let product = req.product
    product = _.extend(product, fields)

    if(files.photo) {
      //console.log('FILES PHOTO:', files.photo)
      if(files.photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image size should be less than 1mb'
        })
      }
      product.photo.data = fs.readFileSync(files.photo.path)
      product.photo.contentType = files.photo.type
    }

    product.save((err, result) => {
      if(err) {
        return res.status(400).json({
          error: errorHandler(err)
        })
      }
      res.json(result)
    })
  })
}