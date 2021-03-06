// import required packages
const express = require('express')
const cors = require('cors')
const cron = require('node-cron')
const mongoose = require('mongoose')
const parser = require('rss-parser')
const request = require('request')
const cheerio = require('cheerio')
const bodyParser = require("body-parser")


// define corsOptions (i.e. whitelisted url)
const corsOptions = {
    origin: 'http://smarticle.duckdns.org',
    optionsSuccessStatus: 200
}

// initialize express router and express server and pass corsOptions to server, define PORT variable (i.e. what PORT will we run our server on)
const backend = express()
backend.use(cors(corsOptions))
const router = express.Router()
const PORT = 3000
backend.use(bodyParser.urlencoded({ extended: false }));
backend.use(bodyParser.json());

// routes
router.get('/api/sources', function(req, res) {
    var sources = new Array()
    for (var i = 1; i < FEED.length; i+=3)
        sources.push(FEED[i])
    res.send(sources)
})

router.get('/api/articles-by-source/:source-:pg-:pgl', function(req, res) {
    article.find({source: req.params.source}, ['source','description','pubDate','pubDateMS','link','title'], {skip: (parseInt(req.params.pg) - 1) * parseInt(req.params.pgl), limit: parseInt(req.params.pgl), sort:{'pubDateMS': -1}}, function(err, data) {
        if (err) console.log(err)
        /api
        for (var i = 0; i < data.length; i++) {
            let timeInDays = Math.floor((new Date - data[i].pubDateMS) / 86400000)
            if (timeInDays < 0)
                data[i].pubDate = "AN ERROR HAS OCCURED"
            else
                switch (timeInDays) {
                    case 0: let timeInHrs = Math.floor((new Date - data[i].pubDateMS) / 3600000)
                            switch (timeInHrs) {
                                case 0: let timeInMins = Math.floor(((new Date - data[i].pubDateMS) / 86400000) * 1440)
                                        switch (timeInMins) {
                                            case 0: data[i].pubDate = "WITHIN THE LAST MINUTE"
                                                    break
                                            case 1: data[i].pubDate = "1 MINUTE AGO"
                                                    break
                                            default: data[i].pubDate = timeInMins + " MINUTES AGO"
                                        }
                                        break
                                case 1: data[i].pubDate = "1 HOUR AGO"
                                        break
                                default: data[i].pubDate = timeInHrs + " HOURS AGO"
                            }
                            break
                    case 1: data[i].pubDate = "1 DAY AGO"
                            break
                    default: data[i].pubDate = timeInDays + " DAYS AGO"
                }
        }
        
        res.send(data)
    })
})

router.get('/api/articles-length/:source', function(req, res) {
    article.find({source: req.params.source}).countDocuments(function(err, data) {
        if (err) console.log(err)
        res.send(data.toString())
    })
})

router.get('/api/is-user/:email', function(req, res) {
    user.find({email: req.params.email}).countDocuments(function(err, data) {
        if (err) console.log(err)
        if (data != 0)
            res.send(true)
        else
            res.send(false)
    })
})

router.post('/api/set-user', function(req, res) {
    new user({email: req.body.email, tags: []}).save(err => { if (err) console.log(err) })
})

router.post('/api/add-tags', function(req, res) {
    user.find({email: req.body.email, tags: req.body.tag}).countDocuments(function(err, data) {
        if (err) console.log(err)
        if (data == 0) {
            user.updateOne({email: req.body.email}, {$push:{tags: req.body.tag}}, {upsert: true}, function(err, data) { if (err) console.log(err) })
            res.send(true)
        } else
            res.send(false)
    })
})

router.post('/api/delete-tags', function(req, res) {
    user.updateOne({email: req.body.email}, {$pull:{tags: req.body.tag}}, {upsert: true}, function(err, data) { if (err) console.log(err) })
})


router.get('/api/get-tags/:email', function(req, res) {
    user.find({email: req.params.email}, function(err, data) {
        if (err) console.log(err)
        else res.send(data[0].tags)
    })
})

backend.use(router)

// connect to mongo database and start express server on specified PORT
<<<<<<< HEAD
const uri = "mongodb+srv://MatthewHobbs:<password-here>@biadet-news-cluster-hdjcp.mongodb.net/biadet-news-database?retryWrites=true";
=======
const uri = "mongodb+srv://Matthew:<password>@smarticlecluster-odduz.mongodb.net/test?retryWrites=true";
>>>>>>> b29891a852ee102c681337b8fb6190bb9a431cdd
mongoose.connect(uri, { useNewUrlParser: true }, function(err, client) {
    if (err) console.log(err)

    // define article schema for passing information to database
    userSchema = new mongoose.Schema({ email: 'string', tags: [{type: String}] })
    user = mongoose.model('user', userSchema)
    articleSchema = new mongoose.Schema({ source: 'string', title: 'string', link: 'string', pubDate: 'string', pubDateMS: 'string', description: 'string', content: 'string' })
    article = mongoose.model('article', articleSchema)

    backend.listen(PORT, function() {
        console.log('server started on port ' + PORT)
        // schedule to call parseArticle function on a regular basis
        cron.schedule('*/5 * * * *', () => { parseArticles() })
    })
})

// array containing the rss-feeds and tags required to parse the article information
const FEED = [
    'https://abcnews.go.com/abcnews/topstories','ABC News', 'p',
    'https://www.aljazeera.com/xml/rss/all.xml', 'Al Jazeera', 'p',
    'http://feeds.bbci.co.uk/news/rss.xml','BBC News', 'p',
    'https://www.cbsnews.com/latest/rss/main','CBS News', 'p',
    'https://www.cnbc.com/id/100727362/device/rss/rss.html', 'CNBC', 'p',
    'http://rss.cnn.com/rss/cnn_world.rss','CNN', '.zn-body__paragraph',
    'https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009','CTV News', 'p',
    'http://feeds.foxnews.com/foxnews/world','Fox News', 'p',
    'https://globalnews.ca/feed/','Global News', 'p',
    'http://feeds.reuters.com/reuters/topNews','Reuters', 'p',
    'http://feeds.skynews.com/feeds/rss/home.xml','Sky News', 'p',
    'https://www.huffingtonpost.com/section/front-page/feed','The Huffington Post', 'p',
    'http://www.latimes.com/rss2.0.xml','The Los Angeles Times', 'p',
    'http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml','The New York Times', 'p',
    'http://www.thestar.com/content/thestar/feed.RSSManagerServlet.topstories.rss','Toronto Star', 'p',
]

// function to pull all article information from the specified sources and save it to the mongo database
function parseArticles() {
    console.log('started updating mongo database @ ' + Date())
    let promise = new Promise(async function(resolve, reject) {
        // loop through each url that is provided in the FEED array
        for (var i = 0; i < FEED.length; i+=3) {
            try {
                // initialize new parser and parse rss information from url (FEED[i])
                let Parser = new parser()
                let feed = await Parser.parseURL(FEED[i])
                // loop through each article in the specific url's feed
                feed.items.forEach(item => {
                    // continue the process if the article includes a description (item.content), a publish date (item.pubDate), and it is less than 14 days old (1209600000 milliseconds = 14 days)
                    if (item.contentSnippet.length > 10 && item.pubDate && new Date().getTime() - Date.parse(item.pubDate) < 1209600000) {  
                        new Promise((resolve, reject) => { 
                            // push the following information to the next step of the promise
                            let tag = FEED[i+2], source = FEED[i+1];
                            article.find({ 'title': item.title }, function(err, data) {
                                if (err) console.log(err)

                                if (data.length == 0) resolve([tag, source, item.title, item.link, item.pubDate, Date.parse(new Date(item.pubDate)), item.contentSnippet])
                                else resolve(null)
                            })
                        }).then(result => {
                            if (result != null) {
                                // gather html code from the article's url with request
                                request(result[3], function(error, response, html) {
                                    var iContent = ""
                                    if (!error) {
                                        // parse article text from html code using cheerio and html tag provided in FEED
                                        var $ = cheerio.load(html);
                                        $(result[0]).filter(function() {
                                            iContent += $(this).text() + " "
                                        })      
                                    }
                                    // continue the process if the article is longer that 25 characters (unable to generate accurate synopsis if article is too short)
                                    if (iContent.length > 25) {
                                        // push article information to mongo database
                                        new article({ source: result[1], title: result[2], link: result[3], pubDate: result[4], pubDateMS: result[5], description: result[6], content: iContent }).save(err => { 
                                            if (err) console.log(err)
                                        })
                                        console.log('[ADDED] [' + result[1] + '] ' + result[2])
                                    }
                                }) 
                            }       
                        })
                    }
                })
            } catch (err) { console.log(FEED[i+1] + ' [AN ERROR HAS OCCURED]') }
        }
        // resolve promise after a 5 seconds timeout, ensures function is finished parsing all articles before promise is resolved
        setTimeout(resolve, 5000)
    })

    promise.then(function() {
        console.log('delete old articles')
        article.find({pubDateMS: {$lt: (Date.parse(new Date()) - 1209600000)}},(err, data) => {
            if (err) console.log(err)
            data.forEach(article => {
                console.log('[REMOVED] [' + article.source + '] ' + article.title)
                article.collection.deleteOne({ _id: article._id })
            })
            console.log('finished updating mongo database @ ' + Date())
        });
    })
}