const https = require("https");
function postData(url, data, then) {
  data = JSON.stringify(data);
  console.log(url.split("/"));
  let options = {
    hostname: "testing-sendmail-it-works.glitch.me",
    port: 443,
    path: "/email",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length
    }
  };

  let req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on("data", d => {
      console.log(d);
      then(d);
    });
  });

  req.on("error", error => {
    console.error(error);
    then(error);
  });

  req.write(data);
  req.end();
  /*return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
      return resolve(xhr.responseText);
    };
    xhr.onerror = function () {
      return reject(xhr.statusText);
    };
    xhr.send(data);
  }).then(function (successMessage) {
    then(successMessage);
  }).catch(function (error) {
    console.log("no internet doing default", error, JSON.stringify(data));
    //location.reload();
  });*/
}
exports.timeSince = function(date) {
  if (typeof date !== "object") {
    date = new Date(date);
  }
  var seconds = Math.floor((new Date() - date) / 1000);
  var intervalType;
  var interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    intervalType = "year";
  } else {
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      intervalType = "month";
    } else {
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) {
        intervalType = "day";
      } else {
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
          intervalType = "hour";
        } else {
          interval = Math.floor(seconds / 60);
          if (interval >= 1) {
            intervalType = "minute";
          } else {
            interval = seconds;
            intervalType = "second";
          }
        }
      }
    }
  }
  if (interval > 1 || interval === 0) {
    intervalType += "s";
  }
  return interval + " " + intervalType + " ago";
};
exports.totime = function(time) {
  return Math.floor(time / 60) + ":" + (time % 60).toFixed().pad(2, "0");
};
exports.asort = (a, t, s) => {
  //console.log(a)
  let ha = [];
  let ha2 = {};
  for (var i = 0; i < a.length; i++) {
    if (ha.indexOf(a[i].ch) === -1) {
      ha.push(a[i].ch);
      ha2[a[i].ch] = a[i];
      //console.log(a[i].ch);
    } else if (t === "hl" && a[i].score > ha2[a[i].ch].score) {
      ha2[a[i].ch] = a[i];
      //console.log("new best for "+a[i].ch+" score: "+a[i].score+ " type: "+a[i].type)
    } else if (t === "lh" && a[i].score < ha2[a[i].ch].score) {
      ha2[a[i].ch] = a[i];
      //console.log("new best for "+a[i].ch+" score: "+a[i].score+ " type: "+a[i].type)
    }
  }
  //console.log(ha2)
  return ha2;
};
exports.pad = function(l, s) {
  return (l -= this.length) > 0
    ? (s = new Array(Math.ceil(l / s.length) + 1).join(s)).substr(0, s.length) +
        this +
        s.substr(0, l - s.length)
    : this;
};
exports.push = (opt, to, ref, webPush) => {
  if (to === "") {
    let query = ref.get().then(subs => {
      subs.forEach(sub => {
        //console.log(sub.data().sub);
        return webPush.sendNotification(sub.data().sub, opt).catch(err => {
          if (err.statusCode === 410) {
            console.log("Subscription is no longer valid: ", err);
            ref.doc(sub.id).delete();
          } else {
            console.log(err);
          }
        });
      });
    });
  } else {
    let query = ref
      .where("userName", "==", to)
      .get()
      .then(subs => {
        if (subs.empty) {
          console.log("No matching documents.");
          return;
        }
        subs.forEach(sub => {
          //console.log(sub.data().sub);
          return webPush.sendNotification(sub.data().sub, opt).catch(err => {
            if (err.statusCode === 410) {
              console.log("Subscription is no longer valid: ", err);
              ref.doc(sub.id).delete();
            } else {
              console.log(err);
            }
          });
        });
      });
  }
};
exports.sendmail = function(to) {
  postData(
    "https://testing-sendmail-it-works.glitch.me/email",
    { to: to },
    function(s) {
      console.log(s);
    }
  );
};
