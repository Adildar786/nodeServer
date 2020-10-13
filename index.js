const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');
const express = require('express');
const app = express()
const http = require('http')
const PORT = process.env.port || 3000
const chime = new AWS.Chime({ region: 'us-east-1' });
var welcomeNotes = require("./welcomeNote.json")
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console')
const server = http.createServer(app)
server.listen(PORT,()=>{
    console.log("server started in port ",PORT)
})
app.get('/welcomeNote',(req,res,next) =>{ 
  const radNumber = (Math.floor(Math.random() * Math.floor(45))).toString();
  console.log(welcomeNotes[radNumber]);
  const data = welcomeNotes[radNumber]
  res.status(200).json(data);
})
app.use('/', async (req,res,next) =>{
    const meetingResponse = await chime.createMeeting({
        ClientRequestToken: uuid(),
        MediaRegion: 'us-west-2' // Specify the region in which to create the meeting.
      }).promise();
       
      const attendeeResponse = await chime.createAttendee({
        MeetingId: meetingResponse.Meeting.MeetingId,
        ExternalUserId: uuid() // Link the attendee to an identity managed by your application.
      }).promise();
      console.log(attendeeResponse,meetingResponse)
      const response = {
        attendeeResponse:attendeeResponse,
        meetingResponse:meetingResponse
      }
      res.status(200).json(response);
})



