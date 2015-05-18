var hasFlash = ((typeof navigator.plugins != "undefined" && typeof navigator.plugins["Shockwave Flash"] == "object") || (window.ActiveXObject && (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) != false));
var firebase_url = "";
var firebase_langOpt = "";
var userId = Math.floor(Math.random() * 9999999999).toString();
var pythonDefault = "print 'Welcome to PyroPad in Python!'";
var javaDefault = "//Please keep your public class name as 'solution'\npublic class solution {\n  public static void main(String[] args) {\n    System.out.println(\"Welcome to PyroPad in Java!\");\n  }\n}";
var socket = io('https://hidden-inlet-2774.herokuapp.com/');
var codeMirror = CodeMirror(document.getElementById('firepad-container'), {lineNumbers: true, theme: 'monokai', mode: 'python', userId:userId});
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
var templateCode = {'python':pythonDefault, 'java':javaDefault};

function fire() {
  firepadLangRef.update({"currLang":"python"});
  /*if(currLang) {
    $("#languageselected").html((currLang.charAt(0).toUpperCase() + currLang.slice(1)) + "<strong class=\"caret\"></strong>");
    codeMirror.setOption("mode", mode[currLang]);
    setMode = mode[currLang];
    compiler = compile[currLang];
    filename = 'solution.' + ext[currLang];
  }*/
  console.log(FirepadUserList.fromDiv(firepadRef.child('users'), document.getElementById('userPanel'), userId).userList_);
}

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
  console.log(lang + " " + compiler + " " + filename);
});

firepadLangRef.child("currLang").on("value", function(snapshot) {
  var lang = snapshot.val();
  $("#languageselected").html((lang.charAt(0).toUpperCase() + lang.slice(1)) + "<strong class=\"caret\"></strong>");
  setMode = mode[lang];
  compiler = compile[lang];
  filename = 'solution.' + ext[lang];

  codeMirror.setOption("mode", setMode);
  console.log(lang + " " + compiler + " " + filename);
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
    console.log("here2");
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
  console.log('Firebase data: ', ref.toString());
  console.log("opt: " + firebase_langOpt);
  return ref;
}

function sendCode() {

  $("#runButton").html("<img src=\"img/loading.GIF\" id=\"loadingGIF\" alt=\"\"/>");
  var code = firepad.getText();
  code = encodeURI(code);
  socket.emit('compile', {filename:filename, compiler:compiler, code:code});
  //$("#runButton").html("&bull;").delay(3000).html("&bull;&bull;"); 
  
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
