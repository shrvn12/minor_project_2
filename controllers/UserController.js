const bcrypt = require('bcryptjs');
const User = require('../models/user');
const {
  RegisterValidator,
  LoginValidator,
} = require('../middlewares/Validator');

const UserController = {};

UserController.create = async (req, res) => {
  const { name, email, password, role, address } = req.body;
  const validator = RegisterValidator({
    name,
    email,
    password,
    role,
    address
  });
  if (validator.error) {
    req.flash('error', validator.error);
    return res.redirect('/users');
  }
  const userExists = await User.findOne({ email: validator.value.email });
  if (userExists) {
    req.flash('error', 'User already exist with this email account.');
    return res.redirect('/users');
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({
    name: validator.value.name,
    email: validator.value.email,
    password: hashedPassword,
    role,
    address
  });
  try {
    const savedUser = await newUser.save();
    req.flash(
      'success',
      `New user (${savedUser.email}) has been created successfully!`
    );
    return res.redirect('/users');
  } catch (error) {
    req.flash('error', 'User already exist with this email account.');
    return res.redirect('/users');
  }
};

UserController.read = async (req, res) => {
  const perPage = 30;
  const page = req.params.page || 1;
  const users = await User.find({})
    .skip(perPage * page - perPage)
    .limit(perPage);
  const count = await User.countDocuments();
  res.render('users/index', {
    currentUser,
    users,
    current: page,
    pages: Math.ceil(count / perPage),
  });
};
// edit action

UserController.edit = async (req, res) => {

  
 
  console.log ('Estoy en UserController.edit');
  console.log ('user.id:' + user.id);
 

  let userId = req.params.id;
  // Use findById to locate a user in the database by their ID.  
    User.findById(userId)
      .then(user => {
  // Render the user edit page for a specific user in the database.
        
      
      console.log('Estoy en edit UserController - line 72, user: '+ user)
      if (!user.address){
        user.address = '';
      }
       res.render("users/_collect-Edit", {
          currentUser,
          user: user
        });
      })
      .catch(error => {
        console.log(`Error fetching user by ID: ${error.message}`);
       return;
      })



}





UserController.update = async (req, res) => {
  const { name, password, role, address } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.findByIdAndUpdate(req.params.id, {
    $set: {
      name,
      password: hashedPassword,
      role,
      address
    },
  });
  req.flash('success', `User (${user.email}) has been updated successfully!`);
  res.redirect('/users');
};

UserController.delete = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  req.flash('success', `User (${user.email}) has been deleted successfully!`);
  res.redirect('/users');
};

// API
UserController.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      return res.send({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
    return res.send("User Doesn't Exist");
  } catch (e) {
    return '';
  }
};

module.exports = UserController;
