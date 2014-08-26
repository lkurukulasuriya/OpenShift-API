var express = require('express')
  , mongoskin = require('mongoskin')
  , bodyParser = require('body-parser')

var app = express()
app.use(bodyParser())

var params=""

var db = mongoskin.db('mongodb://@localhost:27017/test', {safe:true})

app.param('collectionName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName)
  return next()
})

app.param('paramList', function(req, res, next, paramList){
  params = paramList
  return next()
})

app.param('collectionNameForSearch', function(req, res, next, paramList){
  collectionNameForSearch = paramList
  return next()
})

app.get('/', function(req, res, next) {
  res.send('please select a collection, e.g., /collections/messages')
})

app.get('/collections/:collectionName/find/:paramList', function(req, res, next) {
  req.setMaxListeners(0);
  req.collection.find({} ,{sort: [['_id',1]]}).toArray(function(e, results){
    if (e) return next(e)
console.log(results);
    var paras = params.split("&")
    var arr=[];
    var result = {};
    for(var item in results){
	var obj={};
	var val = results[item]
	for(var para in paras){
    	    obj["c"+para] = val[paras[para]];
        }
        arr.push(obj);
    }
    result['rows'] = arr;
    res.send(result)
  })
})

app.get('/collections/search/:collectionNameForSearch', function(req, res, next) {
  console.log(collectionNameForSearch);
  req.collection = db.collection(collectionNameForSearch)
  var url = require('url');
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  console.log(query);
  req.collection.find(query,{sort: [['_id',1]]}).toArray(function(e, results){
    if (e) return next(e)
    var arr=[];
    var result = {};
    for(var item in results){
	var obj={};
	var val = results[item]
	for(var para in val){
    	    obj[para] = val[para];
        }
        arr.push(obj);
    }
    result['rows'] = arr;
    res.send(result)
  })
})

app.post('/collections/:collectionName', function(req, res, next) {
  req.collection.insert(req.body, {}, function(e, results){
    if (e) return next(e)
    res.send(results)
  })
})

app.get('/collections/:collectionName/:id', function(req, res, next) {
  req.collection.findById(req.params.id, function(e, result){
    if (e) return next(e)
    res.send(result)
  })
})


app.put('/collections/:collectionName/:id', function(req, res, next) {
  req.collection.updateById(req.params.id, {$set:req.body}, {safe:true, multi:false}, function(e, result){
    if (e) return next(e)
    res.send((result===1)?{msg:'success'}:{msg:'error'})
  })
})

app.del('/collections/:collectionName/:id', function(req, res, next) {
  req.collection.removeById(req.params.id, function(e, result){
    if (e) return next(e)
    res.send((result===1)?{msg:'success'}:{msg:'error'})
  })
})

app.listen(3000)
