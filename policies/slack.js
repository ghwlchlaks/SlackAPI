
const Request = require('request');
const async = require('async')
const {WebClient} = require('@slack/client')

const token = 'xoxp-401187969874-400943764356-420021840003-d5c684a0a98a6f414e8ed830f8d856bb'
const web = new WebClient(token)
function sendToSlack(message, channelId, callback) {
    web.chat.postMessage({channel:channelId, text: message})
    .then((res) => {
        callback(res.ts)
    }).catch(console.error)
}
module.exports = {
    sendToSlack(req, res) {
        const userId = req.body.userId
        async.parallel([
            function (callback) {
                Request({
                    method:'get',
                    url: `https://slack.com/api/users.list?token=${token}&pretty=1`,
                    headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
                }, function(err, response, body){
                    try{
                        if(!err && response.statusCode == 200) {
                            const info = JSON.parse(body).members
                            callback(null, info)
                        } else {
                            callback(true, err)
                        }
                    }catch(e){
                        console.log(e)
                        callback(true, e)
                    }
                })
            },
            function (callback) {
                Request({
                    method:'get',
                    url: `https://slack.com/api/im.list?token=${token}&pretty=1`,
                    headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
                }, function(err, response, body){
                    try{
                        if(!err && response.statusCode == 200) {
                            const info = JSON.parse(body).ims
                            callback(null, info)
                        } else { 
                            callback(true, err)
                        }
                    }catch(e){
                        callback(true, e)
                    }
                })
            }
        ], function(err, results){
            var id =null
            if(err) {
                res.send({status: false, result:  err})
            } else {
                var check = false
                for (var data of results[0]){
                    if(data.name == userId) {
                        check= true
                        id = data.id
                        break
                    }
                }
                if (check == false) {
                    res.send({status: false, result : "noMembers"})
                } else {
                    check = false
                    for (var data of results[1]) {
                        //console.log(data.id)
                        if (data.user ==id) {
                            check = true
                            //res.send({status: true, result: data.id})
                            sendToSlack("result : test", data.id, function(response){
                                console.log(response)
                                res.send({status:true, result: response})
                            })
                        }
                    }
                    if (check == false) {
                        res.send({status: false, result : "noMatch"})
                    }
                }
            }
        })
    },
    sendToSlack1(req, res, next) {
        const userId = req.body.userId
        Request({
            method:'get',
            url: `https://slack.com/api/users.list?token=${token}&pretty=1`,
            headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
        }, function(err, response, body){
            try{
                if(!err && response.statusCode == 200) {
                    const info = JSON.parse(body)
                    var check = false
                    for (var data of info.members){
                        if (data.name === userId){
                            check = true
                            req.body.id = data.id
                            //console.log(data.id)
                            next()
                        }
                    }
                    if (check == false){
                        res.send({status: false,result : "noMembers"})
                    }
                } else {
                    res.send({status: false, result : err})
                }
            }catch(e){
                res.send({status: false, result: e})
            }
        })
    }
}
function getUserList(){
    
}
