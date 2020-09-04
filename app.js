const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const ejs = require("ejs");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

// Store any static files (images/css files) in public folder.
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

// Create a MongoDB schema.
const articleSchema = {
    title: String,
    content: String
}

// Create a MongoDB model.
const Article = mongoose.model("Article", articleSchema);

// Create GET/POST/DELETE requests for all articles
app.route("/articles" )
    .get(function(req, res){
        // Find all articles from Article model.
        Article.find(function(err, foundArticles) {
            if(!err) {
                // Send foundArticles to the client.
                res.send(foundArticles);
            } else {
                res.send(err);
            }
        });
    })
    .post(function(req, res){
        const title = req.body.title;
        const content = req.body.content;

        const newArticle = new Article({
            title: title,
            content: content
        })

        newArticle.save(function(err){
            if (!err) {
                res.send("A new article was successfully added!");
            } else {
                res.send(err);
            }
        });
    })
    .delete(function(req, res){
        Article.deleteMany(function(err) {
            if (!err) {
                res.send("Successfully deleted all the articles!");
            } else {
                res.send(err);
            }
        });
    });

// Create GET, PUT, DELETE requests for a specific article
app.route("/articles/:articleTitle")
    .get(function(req, res) {
        Article.findOne({title: req.params.articleTitle}, function(err, foundArticle){
            if (foundArticle) {
                res.send(foundArticle);
            } else {
                res.send("No matching title was found.");
            }
        })
    }) 
    // Replace the old article with a new article completely
    .put(function(req, res) {
        Article.update(
            {title: req.params.articleTitle},
            {title: req.body.title, content: req.body.content},
            {overwrite: true},
            function(err) {
                if (!err) {
                    res.send("Successfully updated!");
                } else {
                    res.send(err);
                }
            }
        );
    })
    // Only replace a specified part of the article
    .patch(function(req, res) {
        Article.update(
            {title: req.params.articleTitle},
            {$set: req.body},
            function(err) {
                if (!err) {
                    res.send("Successfully updated article!");
                } else {
                    res.send(err);
                }
            }
        )
    })

    // Delete a specific article
    .delete(function(req, res) {
        Article.deleteOne(
            {title: req.params.articleTitle},
            function(err) {
                if (!err) {
                    res.send("Successfully deleted the article!");
                } else {
                    res.send(err);
                }
            }
        )
    })

app.listen(3000, function(){
    console.log("Server strated on port 3000.")
})