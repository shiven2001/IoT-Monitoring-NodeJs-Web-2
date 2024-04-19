const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;


//routes for main index page (login)
router.get('', async (req, res) => {
  try {
    const locals = {
      title: "Login",
      description: "NB-IoT Data Portal"
    }
    res.render('index', { locals });
  } catch (error) {
    console.log(error);
  }
});   

router.post('', async (req, res) => {
  try {
    const { username, password } = req.body;
    if(req.body.username === 'admin' && req.body.password === 'password') {
      res.redirect('dashboard');
    } else {
      res.send('Wrong username or password');
    }
  } catch (error) {
    console.log(error); 
  }
});

/*check login and if correct, redirect to admin page
router.post('', async (req, res) => {
  try {
    const {username} = req.body.username;
    const {password} = req.body.password;
    const user = await User.findOne( { username } );
    if(!user) {
      return res.status(401).json( { message: 'Invalid username' } );
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid) {
      return res.status(401).json( { message: 'Invalid password' } );
    }
    const token = jwt.sign({ userId: user._id}, jwtSecret );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('dashboard');

  } catch (error) {
    console.log(error); 
  }
});
*/


module.exports = router;