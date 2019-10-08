var log = function log(t, deco, type) {
  if (type === "normal" || type === undefined) {
    if (deco === "") {
      console.log(t);
    } else {
      console.log("%c" + t, deco);
    }
  } else if (type === "clear") {
    console.clear();
    if (deco === "") {
      console.log("log cleared");
    } else {
      console.log("%c log cleared", deco);
    }
  } else if (type === "groupbegin") {
    if (deco === "") {
      console.group(t);
    } else {
      console.group("%c" + t, deco);
    }
  } else if (type === "groupend") {
    if (deco === "") {
      console.log(t);
      console.groupEnd();
    } else {
      console.log("%c" + t, deco);
      console.groupEnd();
    }
  } else if (type === "warn") {
    if (deco === "") {
      console.warn(t);
    } else {
      console.warn("%c" + t, deco);
    }
  } else if (type === "error") {
    if (deco === "") {
      console.error(t);
    } else {
      console.error("%c" + t, deco);
    }
  }
};
export default log;
