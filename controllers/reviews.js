const Movie = require('../models/movie');

module.exports = {
  create,
  // Add this export
  delete: deleteReview,
  edit,
  update,
};

async function deleteReview(req, res) {
  // Note the cool "dot" syntax to query on the property of a subdoc
  const movie = await Movie.findOne({ 'reviews._id': req.params.id, 'reviews.user': req.user._id });
  // Rogue user!
  if (!movie) return res.redirect('/movies');
  // Remove the review using the remove method available on Mongoose arrays
  movie.reviews.remove(req.params.id);
  // Save the updated movie doc
  await movie.save();
  // Redirect back to the movie's show view
  res.redirect(`/movies/${movie._id}`);
}

async function create(req, res) {
  const movie = await Movie.findById(req.params.id);

  // Add the user-centric info to req.body (the new review)
  req.body.user = req.user._id;
  req.body.userName = req.user.name;
  req.body.userAvatar = req.user.avatar;

  // We can push (or unshift) subdocs into Mongoose arrays
  movie.reviews.push(req.body);
  try {
    // Save any changes made to the movie doc
    await movie.save();
  } catch (err) {
    console.log(err);
  }
  res.redirect(`/movies/${movie._id}`);
}

async function edit(req, res){
  const movie = await Movie.findOne({ 'reviews._id': req.params.id, 'reviews.user': req.user._id });
  // Rogue user!
  if (!movie) return res.redirect('/movies');

  const review = movie.reviews.find(function (item){
    return item._id.toString() === req.params.id;

  });
  console.log(review)

  // Save the updated movie doc
  await movie.save();
  // Redirect back to the movie's show view
  res.render('reviews/edit', {title: 'Edit Review', review});
}


async function update(req, res) {
 
  try{
    const movie = await Movie.findOne({ 'reviews._id': req.params.id, 'reviews.user': req.user._id });
    const reviewIndex = movie.reviews.findIndex(review => review._id.equals(req.params.id));
    if (reviewIndex === -1) return res.redirect('/movies')
    movie.reviews[reviewIndex].content = req.body.content;
    movie.reviews[reviewIndex].rating = req.body.rating;  
    await movie.save()
    console.log(movie)
    res.redirect(`/movies/${movie._id}`)
}catch (err) {
  console.log(err);
}
}