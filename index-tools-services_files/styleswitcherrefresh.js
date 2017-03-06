/*
=============================================================
File: Style Switcher                                                   
Created by: sitecore\DOng1                                     
Created: 30/10/2015 09:00:00 a.m.                                               
Description: Allows users to toggle between the old styles and
the refreshed styles.
==============================================================
*/
function switchtoold() {
  active = getActiveStyleSheet();
  switch (active) {
    case 'stylerefresh' : 
      setActiveStyleSheet('styleold');
      break;
    case 'styleold' :
      break;
    default :
      setActiveStyleSheet('styleold');
      break;
  }
}

function switchtorefresh() {
  active = getActiveStyleSheet();
  switch (active) {
    case 'styleold' : 
      setActiveStyleSheet('stylerefresh');
      break;
    case 'stylerefresh' : 
       break;
    default :
      setActiveStyleSheet('stylerefresh');
      break;
  }
}

function setActiveStyleSheet(title) {
  var i, a, main;
  for (i = 0; (a = document.getElementsByTagName("link")[i]); i++) {
    if(a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")) {
        a.disabled = true;
      if(a.getAttribute("title") == title) a.disabled = false;
    }
  }
}

function getActiveStyleSheet() {
  var i, a;
  for (i = 0; (a = document.getElementsByTagName("link")[i]); i++) {
    if(a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title") && !a.disabled) return a.getAttribute("title");
  }
  return null;
}

function getPreferredStyleSheet() {
  return ('stylerefresh');
}

function createCookie(name,value,days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
  }
  else expires = "";
  document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

window.onload = function (e) {
    var cookie = readCookie("style");
    var title = cookie ? cookie : getPreferredStyleSheet();
    if (title == 'null') {
        title = getPreferredStyleSheet();
    }
    setActiveStyleSheet(title);
}

window.onunload = function (e) {
    var title = getActiveStyleSheet();
    if (title == 'null') {
        title = getPreferredStyleSheet();
    }
    createCookie("style", title, 365);
}

var cookie = readCookie("style");
var title = cookie ? cookie : getPreferredStyleSheet();
if (title == 'null') {
  title = getPreferredStyleSheet();
}

setActiveStyleSheet(title);
