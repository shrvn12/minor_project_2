const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const { ProductValidator } = require('../middlewares/Validator');

const ProductController = {};

ProductController.create = async (req, res) => {
  // data from forms in view page
  const { name, code, rate } = req.body;
  // get validation over data from forms
  const validator = ProductValidator({ name, code, rate });
  
  // if there is a error over validation
  if (validator.error) {
    req.flash('error', validator.error);
    // come back to products view again
    return res.redirect('/products');
  }
  // get a const over data in database
  const existProduct = await Product.findOne({ code: validator.value.code });
  // if existProduct is true or findOne could find a Data in Database
  if (existProduct) {
    // show a message product exist
    req.flash(
      'error',
      `A product with "${existProduct.code}" has already existed!`
    );
    // return control to products view
    return res.redirect('/products');
  }
 // if existProduct is false or findOne could not find a Data in Database
  try {
    // forms value is equal than validator result value
    const { name, code, rate } = validator.value;
    // get a const from adding a new Product to database and save it
    const savedProduct = await new Product({ name, code, rate }).save();

    // add Product to inventory and save it
    await new Inventory({product: savedProduct._id,}).save();
    // show message Product has been added in view through req.flash
    req.flash(
      'success',
      `Product (${savedProduct.name}) has been successfully added!`
    );
    return res.redirect('/products');

  } catch (e) { // catch error when saving Data to database
    // show a error message
    req.flash('error', `Error While Saving Data - ${e}`);
    
    return res.redirect('/products');
  }
};

ProductController.read = async (req, res) => {
  const perPage = 30;

  // The req.params property is an object containing properties mapped to the named route //
  // “parameters”. For example, if you have the route /student/:id, then the “id” property is 
  // available as req.params.id. This object defaults to {}. 


  const page = req.params.page || 1;

  let products = Product.find({});

  // Mongoose | countDocuments() Function The countDocuments() function is used to 
  // count the number of documents that match the filter in a database collection.
  
  let count = await Product.countDocuments();

  let queryString = {}, countDocs;
    // $regex mongodb function Provides regular expression capabilities for pattern matching 
    // strings in queries
    // $options i Case insensitivity to match upper and lower cases. For an example, 
    // see Perform Case-Insensitive Regular Expression Match.
    // The req.query property is an object containing the property for each query string parameter 
    // in the route. 
    //  searchQuery comes from search.ejs view in form , for seek data in  database

  let matchObj = {code: { $regex: req.query.searchQuery, $options: 'i' },};

  if (req.query.searchQuery) {

   // The Aggregate API.prototype.match() function of the Mongoose API is used to find the existing documents in the database that matches the conditions mentioned in the arguments of the API.

    products = Product.aggregate().match(matchObj);
    countDocs = Product.aggregate().match(matchObj);
    queryString.query = req.query.searchQuery; // queryString line 72 object
  }
  // if there is documents that mach the matchObj, count tne number of them
  if (countDocs) {
    countDocs = await countDocs.exec();
    count = countDocs.length;
  }

  
  // to order data found it 
  // .skip - jump on 
  //.limit perPage - how many data to show per page
  // .sort - to order them from newest to oldest
  // .exec - mongoose function The Query.prototype.exec() function is used to execute the query
  products = await products
    .skip(perPage * page - perPage)
    .limit(perPage)
    .sort({ createdAt: -1 })
    .exec();



  res.render('products/index', {
    currentUser,
    products,
    queryString,
    current: page,
    pages: Math.ceil(count / perPage),
  });
};

ProductController.update = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );
  req.flash(
    'success',
    `Product (${product.name}) has been updated successfully!`
  );
  res.redirect('/products');
};

ProductController.delete = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  await Inventory.findOneAndDelete({ product: req.params.id });
  req.flash(
    'success',
    `Product (${product.name}) has been deleted successfully!`
  );
  res.redirect('/products');
};

// API
ProductController.getProducts = async (req, res) => {
  const products = await Product.find({});
  res.send(products);
};

ProductController.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) return res.send(product);
    return res.send("User Doesn't Exist");
  } catch (e) {
    return '';
  }
};

module.exports = ProductController;
