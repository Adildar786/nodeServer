const express = require('express');
const app = express()
const http = require('http')
const PORT = process.env.port || 3000
var morgan = require('morgan')
var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'})
var docClient = new AWS.DynamoDB.DocumentClient();
var welcomeNotes = require("./welcomeNote.json")
const server = http.createServer(app)
server.listen(PORT, () => {
  console.log("server started in port ", PORT)
})
app.use(morgan('tiny'))
app.get('/welcomeNote', (req, res, next) => {
  const radNumber = (Math.floor(Math.random() * Math.floor(45))).toString();
  console.log(welcomeNotes[radNumber]);
  const data = welcomeNotes[radNumber]
  res.status(200).json(data);
})
app.get('/getUserInfo', async (req, res, next) => {
  const response = {
    succee: false,
    error: false,
    data: null,
    message: null
  }
  console.log()
  if (req.query.userId) {
    await getUserByUserId(req.query.userId).then(user => {
      console.log(user, "res")
      if (user) {
        // response.body.userId = res._id;
        response.succee = true;
        response.error = false;
        response.data = user;
        response.message = "User Profile Found"
        res.status(200).json(response);
      } else {
        response.succee = false
        response.error = true;
        response.data = null;
        response.message = "User not found"
        res.status(404).json(response);
      }
    }).catch(err => {
      console.log(err);
      res.status(500).json(err);
    })
  } else {
    response.succee = false
    response.error = true;
    response.data = null;
    res.status(400).json(err);
  }
})
app.use('/', async (req, res, next) => {
  const meetingResponse = await chime.createMeeting({
    ClientRequestToken: uuid(),
    MediaRegion: 'us-west-2' // Specify the region in which to create the meeting.
  }).promise();

  const attendeeResponse = await chime.createAttendee({
    MeetingId: meetingResponse.Meeting.MeetingId,
    ExternalUserId: uuid() // Link the attendee to an identity managed by your application.
  }).promise();
  console.log(attendeeResponse, meetingResponse)
  const response = {
    attendeeResponse: attendeeResponse,
    meetingResponse: meetingResponse
  }
  res.status(200).json(response);
})



async function getUserByUserId(userId) {
  return await new Promise(async (resolve, reject) => {
    var params = {
      TableName: "dev-users",
    // FilterExpression: "#UserName = :username",
    // ExpressionAttributeNames:{
    //     "#UserName": "UserName"
    // },
    // ExpressionAttributeValues: {
    //     ":username": username
    // }
      KeyConditionExpression: "#id = :userID",
       ExpressionAttributeNames:{
          "#id": "_id"
      },
      ExpressionAttributeValues: {
        ":userID": userId
      }
    };

    docClient.query(params, function (err, data) {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        reject(err)
      } else {
        console.log("Query succeeded.", data);
        resolve(data.Items[0])
      }
    });
  //   MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
  //     if (err) {
  //       console.log(err, "error")
  //       reject(err)
  //     } else {
  //       const dbo = db.db(dataBaseName)
  //       dbo.collection("users").find({ _id: ObjectId(userId) }).toArray(function (err, result) {
  //         if (err) {
  //           reject(err)
  //         };
  //         console.log(result);
  //         resolve(result[0])
  //         db.close();
  //       });
  //     }
  //   });
  })
}