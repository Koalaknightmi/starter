var reqs = 0;
const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const app = express();
const server = http.Server(app);
var p2p = require("socket.io-p2p-server").Server;
const io = socketio(server); // Attach socket.io to our server
const email = "";
const hbs = require("hbs");
const webPush = require("web-push");
var bodyParser = require("body-parser");
var serveIndex = require("serve-index");
var serveStatic = require("serve-static");
var fs = require("fs");
const fileUpload = require("express-fileupload");
const f = require("./functions");
var Jimp = require("jimp");
require("./webpackRunner");

app.use(express.json()); // for parsing application/json
app.use(
  express.urlencoded({
    extended: true
  })
); // for parsing application/x-www-form-urlencoded
app.use(fileUpload());
app.use(
  "/files",
  serveIndex("/", {
    icons: true
  })
);
app.use("/files", serveStatic("/"));

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.log(
    "You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY " +
      "environment variables. You can use the following ones:"
  );
  console.log(webPush.generateVAPIDKeys());
  //return;
}
webPush.setVapidDetails(
  "https://serviceworke.rs/",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
const options = {
  TTL: 1 * 60 * 60 * 24
};
const admin = require("firebase-admin");
var serviceAccount = {
  /*type: process.env.SAtype,
  project_id: process.env.SAproject_id,
  private_key_id: process.env.SAprivate_key_id,
  private_key: process.env.SAprivate_key,
  client_email: process.env.SAclient_email,
  client_id: process.env.SAclient_id,
  auth_uri: process.env.SAauth_uri,
  token_uri: process.env.SAtoken_uri,
  auth_provider_x509_cert_url: process.env.SAauth_provider_x509_cert_url,
  client_x509_cert_url: process.env.SAclient_x509_cert_url*/
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bible-quiz-e1ef4.firebaseio.com"
});
//var storageRef = admin.storage().bucket();
var db = admin.firestore();
var usersref = db.collection("users");
var subsref = db.collection("subs");
let FieldValue = admin.firestore.FieldValue;
var usertimouts = {};
var payload = "hi there";
//var Sequelize = require('sequelize');
//const Op = Sequelize.Op;
var ip = "";
var log = console.log;
var emailmsg = `<b>welcome to Nazarene Bible Quizing Online</b> <br>
We hope that you enjoy your experience with our site<br>
if you have ant question or concerns plz email <a href = "mailto:bible-quiz-develepers@googlegroups.com">bible-quiz-develepers@googlegroups.com</a>`;
var sendmail = f.sendmail;
var newD = function(c, n, data) {
  let docRef = db.collection(c).doc(n);
  data.createdAt = new Date().toISOString();
  data.updatedAt = new Date().toISOString();
  docRef.set(data);
};
var newD2 = function(c, data, t) {
  data.createdAt = new Date().toISOString();
  data.updatedAt = new Date().toISOString();
  let addDoc = db
    .collection(c)
    .add(data)
    .then(ref => {
      if (t) {
        t(ref);
      }
    });
};
var updateOne = function(c, n, data) {
  let dRef = db.collection(c).doc(n);
  data.updatedAt = FieldValue.serverTimestamp();
  dRef.update(data);
};
var onlineplayers = {};
var Admins = ["koalastrikermi"];
var go_p2p = function(socket, room) {
  p2pserver(socket, null, room);
};
var push = (push = (opt, to, webPush) => {
  if (to === "") {
    let query = subsref.get().then(subs => {
      subs.forEach(sub => {
        //console.log(sub.data().sub);
        return webPush.sendNotification(sub.data().sub, opt).catch(err => {
          if (err.statusCode === 410) {
            console.log("Subscription is no longer valid: ", err);
            subsref.doc(sub.id).delete();
          } else {
            console.log(err);
          }
        });
      });
    });
  } else {
    let query = subsref
      .where("userName", "==", to)
      .get()
      .then(subs => {
        if (subs.empty) {
          console.log("No matching documents.5");
          return;
        }
        subs.forEach(sub => {
          //console.log(sub.data().sub);
          return webPush.sendNotification(sub.data().sub, opt).catch(err => {
            if (err.statusCode === 410) {
              console.log("Subscription is no longer valid: ", err);
              subsref.doc(sub.id).delete();
            } else {
              console.log(err);
            }
          });
        });
      });
  }
});
var timeSince = f.timeSince;
var totime = f.totime;
var asort = f.asort;
//made by porter on khan academy https://www.Khanacademy.org/profile/battleboy21
String.prototype.pad = f.pad;
hbs.registerPartials(__dirname + "/veiws/partials");
app.set("view engine", "hbs");
app.set("views", __dirname + "/veiws/");
app.use((req, res, next) => {
  reqs++;
  //console.log(reqs)
  next();
});
app.use(express.static("public"));
app.get("/", function(request, response) {
  ip = request.headers["x-forwarded-for"];
  //console.log(request)
  response.sendFile(__dirname + "/public/html/index.html");
});
io.sockets.on("connection", function(socket) {
  /*socket.on('message', function (data) {
    User.findOne({
      where: {
        userName: data.user
      }
    }).then(user => {
      data.col = user.dataValues.nameCOl;
    });
    data.timesince = (new Date().toISOString())
    chat.unshift(data);
    console.log(chat);
    io.emit("message",chat);
  });*/
  socket.on("vapidPublicKey", data => {
    socket.emit("vpk", process.env.VAPID_PUBLIC_KEY);
  }); // listen to the event
  socket.on("register", function(data, sub) {
    console.log(sub);
    let used = false;
    let query = usersref.get().then(users => {
      users.forEach(user => {
        console.log(user);
        if (user.id === data.name) {
          used = true;
        }
      });
      if (!used) {
        if (Admins.indexOf(data.name) > -1) {
          Jimp.read(
            __dirname + "/public/images/avatar generic.png",
            (err, img) => {
              if (err) throw err;

              img.write(
                __dirname + "/public/images/users/" + data.name + ".png"
              ); // save
            }
          );
          newD("users", data.name, {
            id: 1,
            userName: data.name,
            email: data.email,
            password: data.pass,
            lastLogin: new Date().toISOString(),
            isAdmin: true,
            visitNum: 0,
            nameCOl: "blue",/*
            ratings: [
              { openOnline: 1000, rd: 350 },
              { teamsOnline: 1000, rd: 350 }
            ],
            gamesPlayed: 0,*/
            online: true,
            //tournaments: "",
            friends: [],
            //monthScore: 0,
            //allTimeScore: 0,
            profileIMG: data.name,
            //state: data.state,
            ipAD: ip,
            banned: false
          });
          newD2("subs", {
            userName: data.name,
            sub: sub
          });
          //console.log('user ' + data.name + ' registered');
          socket.emit("registered", data.name);
          //var id = socket.id;
          sendmail(data.email);
          /*db.collection("users").get().then(users => {
            io.emit("leaderboard", users);
            //console.log(users);
          })*/
        } else {
          Jimp.read(
            __dirname + "/public/images/avatar generic.png",
            (err, img) => {
              if (err) throw err;

              img.write(
                __dirname + "/public/images/users/" + data.name + ".png"
              ); // save
            }
          );
          newD("users", data.name, {
            id: 1,
            userName: data.name,
            email: data.email,
            password: data.pass,
            lastLogin: new Date().toISOString(),
            isAdmin: false,
            visitNum: 0,
            nameCOl: "blue",/*
            ratings: [
              { openOnline: 1000, rd: 350 },
              { teamsOnline: 1000, rd: 350 }
            ],
            gamesPlayed: 0,*/
            online: true,
            //tournaments: "",
            friends: [],
            //monthScore: 0,
            //allTimeScore: 0,
            profileIMG: data.name,
            //state: data.state,
            ipAD: ip,
            banned: false
          });
          newD2("subs", {
            userName: data.name,
            sub: sub
          });
          //console.log('user ' + data.name + ' registered');
          socket.emit("registered", data.name);
          var id = socket.id;
          sendmail(data.email);
          /*var id = socket.id;
          var newplayer = {
            id: id,
            user: data.user
          };
          onlineplayers[id] = newplayer;
          onlinepls[socket.id] = {
            user: data.user
          };*/
          /*chat.unshift({
            col: "black",
            user: 'bot',
            message: data.user + ' is online now',
            timesince: new Date().toISOString()
          });*/
          //io.emit("message", chat);
          /*db.collection("users").get().then(users => {
            io.emit("leaderboard", users);
            //console.log(users);
          })*/
        }
      } else {
        socket.emit("already used", data.name);
        console.log(data.name + " username already used");
      }
    });
  });
  socket.on("login attempt", function(data) {
    //console.log("login attempt" + JSON.stringify(data));
    let match = false;
    let query = usersref
      .where("userName", "==", data.user)
      .get()
      .then(users => {
        if (users.empty) {
          console.log("No matching documents.");
          socket.emit("login failed");
          return;
        }
        users.forEach(user => {
          //console.log(user.data().userName)
          if (user.data().password === data.pass) {
            match = true;
          }
        });
        if (match) {
          updateOne("users", data.user, {
            visitNum: FieldValue.increment(1),
            lastLogin: new Date().toISOString(),
            online: true
          });
          if (data.sub) {
            newD2("subs", {
              userName: data.user,
              sub: data.sub
            });
          }
          //push(payload, "",webPush)
          socket.emit("logged in", data.user);
        } else {
          socket.emit("login failed");
        }
      });
    /*User.findOne({
      where: {
        userName: data.user
      }
    }).then(users => {
      if (users === null) {
        socket.emit("login failed");
        //console.log("login failed " + data.user + " is not regestered");
      }
      else if (users.dataValues.password === data.pass) {
        //console.log(users);
        //console.log(users.dataValues.password);
        User.update({
          lastLogin: new Date(),
          visitNum: users.visitNum + 1,
          online: true
        }, {
          where: {
            userName: data.user
          }
        });
        subs.create({
          userName: data.name,
          sub: data.sub
        })
        
        //console.log("logged in:"+users.password+" = "+data.pass);
        var id = socket.id;
        var newplayer = {
          id: id,
          user: data.user
        };
        onlineplayers[id] = newplayer;
        console.log("player initalized " + data.user);
        io.emit("in game players", {
          id: id,
          onlineplayers: onlineplayers
        });
        //console.log(onlineplayers);
        /*User.findAll().then(users => {
          for (var i in users) {
            //console.log(users[i].dataValues.id, users[i].dataValues.userName);
          }
          //socket.emit("leaderboard", users);
          socket.emit("logged in", data.user);
          onlinepls[socket.id] = {
            user: data.user
          };
          chat.unshift({
            col: "black",
            user: 'bot',
            message: data.user + ' is online now',
            timesince: new Date().toISOString()
          });
          io.emit("message", chat);
        })
      }
      else {
        socket.emit("login failed");
        //console.log("login failed " + users.password + "!==" + data.pass);
      }
    })
    /*socket.on("player moved", function (data) {
      if(!onlineplayers[data.id]) return;
      onlineplayers[data.id].x = data.x;
      onlineplayers[data.id].z = data.z;
      onlineplayers[data.id].y = data.y;
      //console.log(onlineplayers);
      socket.broadcast.emit("ingame players moved", data);
    });
  });*/
    /*socket.on("quoted", (data) => {
      //console.log(data)
      User.findOne({
        where: {
          userName: data.user
        }
      }).then(user => {
        if (user === null) {
          socket.emit("login failed");
          //console.log("login failed " + data.user + " is not regestered");
        }
        else if (user.dataValues.password === data.pass) {
      if (data.prompt === 0) {
        prompt = false;
      }
      else {
        prompt = true;
      }
      
        typequizzingscores.create({
          ch: data.ch,
          userName: data.user,
          score: data.score,
          type: "quoted-" + prompt,
          profileIMG: user.dataValues.profileIMG,
          nameCOL: user.dataValues.nameCOl
        });
        
        }
        else {
          socket.emit("login failed");
        }  
      })
    })
    socket.on("completed", (data) => {
      User.findOne({
        where: {
          userName: data.user
        }
      }).then(user => {
        if (user === null) {
          socket.emit("login failed");
          //console.log("login failed " + data.user + " is not regestered");
        }
        else if (user.dataValues.password === data.pass) {
      if (data.prompt === 0) {
        prompt = false;
      }
      else {
        prompt = true;
      }
        typequizzingscores.create({
          ch: data.ch,
          userName: data.user,
          score: data.score,
          type: "completed-" + prompt,
          profileIMG: user.dataValues.profileIMG,
          nameCOL: user.dataValues.nameCOl
        });
        }
        else {
          socket.emit("login failed");
        }  
      })*/
  });
  socket.on("idle", user => {
    //console.log(user + " left")
    usertimouts[user] = setTimeout(function() {
      updateOne("users", user, {
        online: false
      });
    }, 2000 * 60 * 4.9);
  });
  socket.on("active", user => {
    //console.log(user + " came back")
    clearTimeout(usertimouts[user]);
  });
  /*socket.on('getleaderboard', function (fn) {
    typequizzingscores.findAll().then(scores => {
      console.log(scores); 
      fn(scores);
    })
  });*/
  socket.on("disconnect", function() {
    /*if (!onlineplayers[socket.id]) return;
    User.update({
      online: false
    }, {
        where: {
          userName: onlineplayers[socket.id].user
        }
      });delete onlineplayers[socket.id];
    // Update clients with the new player killed 
    socket.broadcast.emit('leave', socket.id);
    if (!onlinepls) return;
    if (onlinepls[socket.id] !== undefined) {
      var l = onlinepls[socket.id].user;
      chat.unshift({
        col: "black",
        user: 'bot',
        message: l + ' is offline now',
        timesince: new Date().toISOString()
      });
    }
    delete onlinepls[socket.id];

    io.emit("message", chat);*/
  });
});
setInterval(() => {
  //tp.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
server.listen(3000, () => console.log("server started"));
