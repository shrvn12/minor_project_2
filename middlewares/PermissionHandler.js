module.exports = (role) => {
  return (req, res, next) => {

    console.log("currentUser: "+ res.locals.currentUser)
    console.log("req.session.user "+ req.session.user)

  //if (req.session.user ) {
    if (req.session.user ) {
      const currentUserRole = req.session.user.role;
      if (role.includes(currentUserRole)) {
        return next();
      }
    }

    console.log("Estoy en Permission Handler ,voy hacia permission, -line 10")
    res.render('permission');
  };
};


