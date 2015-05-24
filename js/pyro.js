var hasFlash = ((typeof navigator.plugins != "undefined" && typeof navigator.plugins["Shockwave Flash"] == "object") || (window.ActiveXObject && (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) != false));
var firebase_url = "";
var firebase_langOpt = "";
var userId = Math.floor(Math.random() * 9999999999).toString();
var pythonDefault = "print 'Welcome to PyroPad in Python!'";
var javaDefault = "//Please keep your public class name as 'solution'\npublic class solution {\n  public static void main(String[] args) {\n    System.out.println(\"Welcome to PyroPad in Java!\");\n  }\n}";
var socket = io('https://hidden-inlet-2774.herokuapp.com/');
var codeMirror = CodeMirror(document.getElementById('firepad-container'), {lineNumbers: true, theme: 'monokai', mode: 'python', userId:userId, matchBrackets: true});
var codeMirrorOutput = CodeMirror(document.getElementById('firepad-container-output'), {lineNumbers: true, theme: 'monokai', mode: 'text/plain', readOnly: "nocursor"});
var codeMirrorLangOpt = CodeMirror(document.getElementById('dummyLangOpt'), {});
var firepadRef = getRef();
var firepadLangRef = new Firebase(firebase_langOpt);
var outputRef = new Firebase(firebase_url);
var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror, {defaultText: pythonDefault});
var outputpad = Firepad.fromCodeMirror(outputRef, codeMirrorOutput, {defaultText: "OUTPUT"});
var langOptPad = Firepad.fromCodeMirror(firepadLangRef, codeMirrorLangOpt, {defaultText: "OUTPUT"});
var compiler = 'python';
var filename = 'solution.py';
var setMode = 'python';
var mode = {'c':'clike', 'c++':'clike', 'java':'text/x-java', 'python':'python'};
var compile = {'java': 'javac', 'c++':'gcc', 'c':'gcc', 'python':'python'};
var ext = {'python':'py', 'haskell':'hs', 'java':'java', 'c':'c', 'c++':'cpp'};
var cmt = {'python':'#', 'java':'//'};
var templateCode = {'python':pythonDefault, 'java':javaDefault};

function fire() {
  //firepadLangRef.update({"currLang":"python"});
  /*if(currLang) {
    $("#languageselected").html((currLang.charAt(0).toUpperCase() + currLang.slice(1)) + "<strong class=\"caret\"></strong>");
    codeMirror.setOption("mode", mode[currLang]);
    setMode = mode[currLang];
    compiler = compile[currLang];
    filename = 'solution.' + ext[currLang];
  }*/
  codeMirror.addKeyMap({"Cmd-J": function() {
    $("#runButton").html("<img src=\"img/loading.GIF\" id=\"loadingGIF\" alt=\"\"/>");
    socket.emit('compile', {filename:filename, compiler:compiler, code:encodeURI(firepad.getText())});
  }});
  codeMirror.addKeyMap({"Ctrl-J": function() {
    $("#runButton").html("<img src=\"img/loading.GIF\" id=\"loadingGIF\" alt=\"\"/>");
    socket.emit('compile', {filename:filename, compiler:compiler, code:encodeURI(firepad.getText())});
  }});

  codeMirror.addKeyMap({"Cmd-S": function() {
    var lang = $("#languageselected").text().toLowerCase();
    var content = firepad.getText() + "\n\n" + cmt[lang] + "Output:\n";
    var outputArray = outputpad.getText().split(/\n/);
    for(var i = 0; i < outputArray.length; i++) {
      content += (cmt[lang] + outputArray[i] + "\n");  
    }
    var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
    saveAs(blob, filename);
  }});
  codeMirror.addKeyMap({"Ctrl-S": function() {
    var lang = $("#languageselected").text().toLowerCase();
    var content = firepad.getText() + "\n\n" + cmt[lang] + "Output:\n";
    var outputArray = outputpad.getText().split(/\n/);
    for(var i = 0; i < outputArray.length; i++) {
      content += (cmt[lang] + outputArray[i] + "\n");  
    }
    var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
    saveAs(blob, filename);
  }});

  console.log(FirepadUserList.fromDiv(firepadRef.child('users'), document.getElementById('userPanel'), userId).userList_);
  console.log($(".col-md-1").css("width"));
}
/*
$("#runButton").hover(function() {
  $(this).html("Cmd+J");
  }, function() {
  $(this).html("Run &#9658;");
});

$("#savePad").hover(function() {
  $(this).html("Cmd+S");
  }, function() {
  $(this).html("Save");
});
*/
$("#languageoption li a").click(function(){
  $("#languageselected").html($(this).text() + "<strong class=\"caret\"></strong>");
  var lang = $(this).text().toLowerCase();
  //localStorage.setItem("currLang", lang);
  if(lang == "python") 
    firepadLangRef.update({"currLang":"python"});
  else if(lang == "java")
    firepadLangRef.update({"currLang":"java"});
  setMode = mode[lang];
  compiler = compile[lang];
  filename = 'solution.' + ext[lang];

  codeMirror.setOption("mode", setMode);
  firepad.setText(templateCode[lang]);
});

firepadLangRef.child("currLang").on("value", function(snapshot) {
  var lang = snapshot.val();
  if(lang) {
    $("#languageselected").html((lang.charAt(0).toUpperCase() + lang.slice(1)) + "<strong class=\"caret\"></strong>");
    setMode = mode[lang];
    compiler = compile[lang];
    filename = 'solution.' + ext[lang];

    codeMirror.setOption("mode", setMode);
  }
});

socket.on('output', function(output) {
  $("#runButton").html("Run &#9658;");
  outputpad.setText("");
  var content = output.stderr + output.stdout;
  outputpad.setText(content);
});

if(hasFlash) {
  ZeroClipboard.config({swfPath:"//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.2.0/ZeroClipboard.swf"});
  var client = new ZeroClipboard($("#shareLink"));
  client.clip(document.getElementById("shareLink"));    
  document.getElementById('global-zeroclipboard-html-bridge').style.position = 'fixed';
  client.on("ready", function(event) {
    client.setText(window.location.href);
  });
}

function getRef() {
  var ref = new Firebase('https://boiling-fire-6186.firebaseio.com/');
  var hash = window.location.hash.replace(/#/g, ''); 
  if (hash) {
    ref = ref.child(hash);
  } 
  else {
    ref = ref.push();
    window.location = window.location + '#' + ref.key();
  }
  if(typeof console !== 'undefined') {
    firebase_url = ref.toString() + "--output";
    firebase_langOpt = ref.toString() + "--langOpt";
  }
  return ref;
}

function savePad() {
  var lang = $("#languageselected").text().toLowerCase();
  if(lang == "language ") {lang = "python"};
  var content = firepad.getText() + "\n\n" + cmt[lang] + "Output:\n";
  var outputArray = outputpad.getText().split(/\n/);
  for(var i = 0; i < outputArray.length; i++) {
    content += (cmt[lang] + outputArray[i] + "\n");  
  }
  var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
  saveAs(blob, filename);
}

function sendCode() {
  $("#runButton").html("<img src=\"img/loading.GIF\" id=\"loadingGIF\" alt=\"\"/>");
  socket.emit('compile', {filename:filename, compiler:compiler, code:encodeURI(firepad.getText())});
}

function shareLink() {
  $("#shareLink").html("&#x2713;");
  window.setTimeout(function() {
    $("#shareLink").text("Link").css("color", "white");
  }, 800);
  if(!hasFlash) {
    window.prompt("Copy Link", window.location.href);
  }
}    
