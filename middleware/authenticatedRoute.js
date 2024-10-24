function authenticatedRoute(req, res, next)
{
  if(req.session.loggedIn!=true)
    return res.redirect('/login')
  next();
}

module.exports = authenticatedRoute;
