const express = require('express');
const app = express();

const sessions = {

    "session1":{
        "sessionID": "1456ABCDEF",
        "username": "Waltraud"
    },

    "session2": {
        "sessionID": "abcdefg",
        "username": "Atomfried"
    },
        
    "session3": {
        "sessionID": "blablabla",
        "username": "Solarfried"
    }
}


app.get('/sessions', (req,res) => {
  res.send(sessions)
});

app.listen(3030, () => console.log('Server Started'));

