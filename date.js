module.exports.getGreeting = function(){
  let greetingMsg = "";
  let today = new Date();
  let currentDay = today.getDay();
  if (currentDay === 0 || currentDay === 6) {
    greetingMsg = "Yay! It's the Weekend!";
  } else {
    greetingMsg = "It's Weekday!";
  }
  return greetingMsg;
}

module.exports.getDate = function(){
  let today = new Date();
  let options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  let day = today.toLocaleDateString("en-US", options);
  return day;
}
