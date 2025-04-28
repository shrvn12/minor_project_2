const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Entry = require('../models/Entry');

const productListController = {};

productListController.read = async (req, res) => {
  const getProducts = await Product.find({});
  let getData = getProducts.map(async (product) => {
    const productId = product.id;
    const inventoryProduct = await Entry.find({
      product: productId,
      type: 'inventory',
    });
    const inventoryQuantity = inventoryProduct.reduce(
      (acc, curr) => acc + curr.quantity,
      0
    );
    const salesProduct = await Entry.find({ product: productId, type: 'sale' });
    const salesQuantity = salesProduct.reduce(
      (acc, curr) => acc + curr.quantity,
      0
    );
    const returnProduct = await Entry.find({
      product: productId,
      type: 'return',
    });
    const returnQuantity = returnProduct.reduce(
      (acc, curr) => acc + curr.quantity,
      0
    );
    let totalQuantity = {};
    totalQuantity[productId] = {
      inventoryQuantity,
      salesQuantity,
      returnQuantity,
    };
    return totalQuantity;
  });
  const records = await Promise.all(getData);
  records.forEach(async (data) => {
    for (const id in data) {
      let leftOver =
        data[id].inventoryQuantity +
        data[id].returnQuantity -
        data[id].salesQuantity;
      const n = await Inventory.findOneAndUpdate(
        { product: id },
        {
          $set: {
            quantity: data[id].inventoryQuantity,
            leftOver: leftOver,
            returns: data[id].returnQuantity,
            sales: data[id].salesQuantity,
          },
        }
      );
    }
  });
  const perPage = 30;
  const page = req.params.page || 1;
  let queryString = {};
  let count = await Inventory.countDocuments(); // default count
  
  let lookUpProduct = {
    from: 'products',
    localField: 'product',
    foreignField: '_id',
    as: 'product',
  };
  
  let matchObj = {
    $or: [
        { 'product.name': { $regex: req.query.searchQuery, $options: 'i' } },
        { 'product.code': { $regex: req.query.searchQuery, $options: 'i' } },
    ],
  };
  
  let inventories;
  
  if (req.query.searchQuery) {
    queryString.query = req.query.searchQuery;
  
    const aggregationPipeline = [
        { $lookup: lookUpProduct },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        // Flatten the product fields into inventory
        { 
          $set: {
            merged: {
              $mergeObjects: ['$product', '$$ROOT']
            }
          }
        },
        { $replaceRoot: { newRoot: "$merged" } },
        // Convert document to array of key-value pairs
        { $addFields: { kvArray: { $objectToArray: "$$ROOT" } } },
        // Now match: check if any value matches the searchQuery
        {
          $match: {
            "kvArray.v": { $regex: req.query.searchQuery, $options: "i" }
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: perPage * (page - 1) },
        { $limit: perPage }
      ];
      
  
    inventories = await Inventory.aggregate(aggregationPipeline);
  
    // Count separately without skip/limit
    const countDocs = await Inventory.aggregate([
      { $lookup: lookUpProduct },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    ]);
    count = countDocs.length;
  
  } else {
    // If no search, use normal find with populate
    inventories = await Inventory.find({})
      .populate('product')
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ createdAt: -1 })
      .exec();
    console.log(inventories);
  };
  
  res.render('productList/index', {
    inventories,
    queryString,
    pages: Math.ceil(count / perPage),
  });
};

module.exports = productListController;
