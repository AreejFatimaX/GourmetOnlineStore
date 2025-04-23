const jwt = require("jsonwebtoken");

// Middleware to authenticate access tokens
exports.authenticateAccessToken = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      
        req.flash('error Please login first');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        req.flash('invalid token');
      }

      req.user = decoded; // Attach user data to request
      console.log('Decoded user:', req.user);
      next();
    });
  } catch (error) {
    console.error(error);
    req.flash("server error");
  }
};

exports.isAuthenticated = (req, res, next) => {
  // Check if user exists in session
  if (req.session && req.session.user) {
    return next();
  }
  
  // If no user in session, redirect to login
  res.redirect('/login');
};


// Middleware to verify refresh tokens
exports.verifyRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(403).json({ message: "Refresh token required" });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired refresh token" });

    req.user = user; // Attach user data to request
    next();
  });
};

// Function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // 15 minutes
  );

  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET, // Use the correct secret for refresh tokens
    { expiresIn: '30m' } // 7 days
  );

  return { accessToken, refreshToken };
};

// Export the generateTokens function
exports.generateTokens = generateTokens;

exports.checkAdminAccess = (req, res, next) => {
    try {
      // Ensure the user is authenticated by checking for the access token
      const token = req.cookies.accessToken;
  
      if (!token) {
        req.flash('error', 'Please login first');
        return res.redirect('/loginNow'); // Redirect to login if token is missing
      }
  
      // Verify the token
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          req.flash('error', 'Invalid token, please login again');
          return res.redirect('/loginNow'); // Redirect to login page if token is invalid
        }
  
        req.user = decoded; // Attach user information to request
  
        // Check if the user has admin role
        if (req.user.role !== 'admin') {
          req.flash('error', 'Forbidden - You do not have permission to access this resource');
          return res.redirect('/'); // Redirect to home page or any other page on forbidden access
        }
  
        // Proceed if the user is an admin
        next();
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Server error, please try again later');
      return res.redirect('/loginNow'); // Redirect to login page on server error
    }
  };