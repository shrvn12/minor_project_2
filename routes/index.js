"use strict";

 // require express module
const 
 express = require("express"),
 
 PermissionHandler = require('../middlewares/PermissionHandler'),
  // use the Router module in Express.js
  // This line creates a Router object that offers its own middleware
  // and routing alongside the Express.js app object.
  router = require("express").Router(),





  // use system routes
           
          // subscriberRoutes = require("./subscriberRoutes"),
          // courseRoutes = require("./courseRoutes"),
          // errorRoutes = require("./errorRoutes"),
          // homeRoutes = require("./homeRoutes"),
          
          
          dashboardRouter = require('./dashboard'),
          // from userRoutes
          userRoutes = require("./userRoutes"),
          // from dashboard users /user
          userRouter = require('./user'),
          apiRouter = require('./api/index'),
          productRouter = require('./product'),
          inventoryRouter = require('./inventory'),
          productListRouter = require("./productList"),
          entryRouter = require('./entry'),
     
          servicingRouter = require('./servicing'),
          expenseRouter = require('./expense'),
          customerRouter = require('./customer'),
          saleRouter = require('./sale'),
          returnRouter = require('./return');

  // implement a namespace for API endpoints that return JSON data or perform actions asynchronously
          //apiRoutes = require("./apiRoutes");

  // Adding routes for each page and request type

        
        console.log("Estoy en index router ....");

       // dashboard routes
       router.use('/', dashboardRouter);
      
       router.use('/users', PermissionHandler(['admin']), userRouter);

        // users routes
        router.use("/", userRoutes);
       
        // api routes
        router.use('/api', apiRouter),

        // products routes
        router.use('/products', PermissionHandler(['admin']), productRouter);
        

         // inventories routes
         router.use('/inventories',PermissionHandler(['admin', 'inventory']),inventoryRouter);

         // product list
         router.use('/productList',productListRouter);
    
         // entries routes
         router.use('/entries', PermissionHandler(['admin', 'inventory']), entryRouter);

  // servicing routes       
router.use('/servicing',PermissionHandler(['admin', 'servicing']),servicingRouter);
  // expenses routes
router.use('/expenses', PermissionHandler(['admin', 'expense']), expenseRouter);
  // customers routes
router.use('/customers', PermissionHandler(['admin', 'sales']), customerRouter);
         
// sales routes
router.use('/sales', PermissionHandler(['admin', 'sales']), saleRouter);

// returns routes
router.use('/returns', PermissionHandler(['admin', 'sales']), returnRouter);

module.exports = router;
