const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
    "username":"Sample name",
    "password":"14896"
}];

const isValid = (username)=>{ 
const user=users.filter((u)=>u.username===username);
if(user.length>0){
    return true;
}
else return false;
}

const authenticatedUser = (username,password)=>{
    const user=users.filter((u)=>u.username===username);

    if(username===user[0].username && password===user[0].password){
        return true;
    }
    else return false;
}

 
//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const {username,password}=req.body;

  if(isValid(username) && authenticatedUser(username,password)){
    let accessToken=jwt.sign({
        data:username
    },'access')
    req.session.authorization={accessToken}
    req.session.user=username
    
    return res.status(200).json({message:"User logged in successfully."})

  }
  return res.status(401).json({message: "Access denied something went wrong."});
});



// regd_users.put("/auth/review/:isbn", (req, res) => {
//     const isbn = req.params.isbn;
//     const userReview = req.query.review;
//     const user = req.session.user
  
//     const bookToBeReviewed = Object.values(books).filter(book => book.isbn === isbn);
//     const reviews = bookToBeReviewed[0].reviews;
//     reviews.review = userReview;
//     reviews.username = user;
//     //Add review to session
//     req.session.book = bookToBeReviewed;
    
//     return res.status(200).json({message: `Review: '${userReview}' was added by '${user}'`, book: bookToBeReviewed});
//   });
  


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const userReview = req.body.review;
    const username = req.session.user;

    const bookForReview = books[isbn];
    if (!bookForReview) {
        return res.status(404).json({ message: `No book available with ISBN ${isbn}.` });
    }

    const reviews = bookForReview.reviews;
    reviews.review = userReview;
    reviews.username = username;

    req.session.book = bookForReview;
    return res.status(200).json({ message: `Review: '${userReview}' was added by '${username}'`, book: bookForReview });
});



//Delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const bookForDeleteReview = books[isbn];
  
    if (bookForDeleteReview) {
        const userReview = bookForDeleteReview.reviews;
        if (userReview && req.session.user === userReview.username) {
            delete userReview.review;
            delete userReview.username;
            return res.status(200).json({ message: "Review deleted successfully", book: bookForDeleteReview });
        } else {
            return res.status(403).json({ message: "Access Denied to delete review", book: bookForDeleteReview });
        }
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
