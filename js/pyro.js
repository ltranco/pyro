//Check flash availability
var flash = ((typeof navigator.plugins != "undefined" && typeof navigator.plugins["Shockwave Flash"] == "object") || (window.ActiveXObject && (new ActiveXObject("ShockwaveFlash.ShockwaveFlash")) != false));

//Firebase instances for output pad and current language choice
var firebaseOutput = "";
var firebaseLangOpt = "";

//Current user id
var userId = Math.floor(Math.random() * 9999999999).toString();

//Default code
var pythonDefault = "print 'Welcome to PyroPad in Python!'";
var javaDefault = "//Please keep your public class name as 'solution'\npublic class solution {\n  public static void main(String[] args) {\n    System.out.println(\"Welcome to PyroPad in Java!\");\n  }\n}";

//Socket io instantiation
var socket = io('https://hidden-inlet-2774.herokuapp.com/');

//CodeMirror references for code editor, output pad, and language option
var codeMirror = CodeMirror(document.getElementById('firepad-container'), {lineNumbers: true, theme: 'monokai', mode: 'python', userId:userId, matchBrackets: true});
var codeMirrorOutput = CodeMirror(document.getElementById('firepad-container-output'), {lineNumbers: true, theme: 'monokai', mode: 'text/plain', readOnly: "nocursor"});
var codeMirrorLangOpt = CodeMirror(document.getElementById('dummyLangOpt'), {});

//Firepad references for code editor, output pad, and language option
var firepadRef = getRef();
var firepadOutputRef = new Firebase(firebaseOutput);
var firepadLangRef = new Firebase(firebaseLangOpt);

//Firepad objects for code editor, output pad, and language option
var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror, {defaultText: pythonDefault});
var outputPad = Firepad.fromCodeMirror(firepadOutputRef, codeMirrorOutput, {defaultText: "OUTPUT"});
var langOptPad = Firepad.fromCodeMirror(firepadLangRef, codeMirrorLangOpt, {defaultText: "OUTPUT"});

//Default compiler, filename, and mode
var compiler = 'python';
var filename = 'solution.py';
var setMode = 'python';

//Available languages and corresponding attributes
var mode = {'c':'clike', 'c++':'clike', 'java':'text/x-java', 'python':'python'};
var compile = {'java': 'javac', 'c++':'gcc', 'c':'gcc', 'python':'python'};
var ext = {'python':'py', 'haskell':'hs', 'java':'java', 'c':'c', 'c++':'cpp'};
var cmt = {'python':'#', 'java':'//'};
var templateCode = {'python':pythonDefault, 'java':javaDefault};

//Called upon body loads
function fire() {
  //Run button keyboard shortcut for Apple and other keyboards handler
  codeMirror.addKeyMap({"Cmd-J": function() {
    $("#runButton").html("<img src=\"img/loading.GIF\" id=\"loadingGIF\" alt=\"\"/>");
    socket.emit('compile', {filename:filename, compiler:compiler, code:encodeURI(firepad.getText())});
  }});
  codeMirror.addKeyMap({"Ctrl-J": function() {
    $("#runButton").html("<img src=\"img/loading.GIF\" id=\"loadingGIF\" alt=\"\"/>");
    socket.emit('compile', {filename:filename, compiler:compiler, code:encodeURI(firepad.getText())});
  }});

  //Save button keyboard shortcut for Apple and other keyboards handler
  codeMirror.addKeyMap({"Cmd-S": function() {
    var lang = $("#languageselected").text().toLowerCase();
    var content = firepad.getText() + "\n\n" + cmt[lang] + "Output:\n";
    var outputArray = outputPad.getText().split(/\n/);
    for(var i = 0; i < outputArray.length; i++) {
      content += (cmt[lang] + outputArray[i] + "\n");  
    }
    var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
    saveAs(blob, filename);
  }});
  codeMirror.addKeyMap({"Ctrl-S": function() {
    var lang = $("#languageselected").text().toLowerCase();
    var content = firepad.getText() + "\n\n" + cmt[lang] + "Output:\n";
    var outputArray = outputPad.getText().split(/\n/);
    for(var i = 0; i < outputArray.length; i++) {
      content += (cmt[lang] + outputArray[i] + "\n");  
    }
    var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
    saveAs(blob, filename);
  }});

  //Add the user list
  console.log(FirepadUserList.fromDiv(firepadRef.child('users'), document.getElementById('userPanel'), userId).userList_);
}

//Handler for changing the language option
$("#languageoption li a").click(function(){
  //Update dropdown menu UI
  $("#languageselected").html($(this).text() + "<strong class=\"caret\"></strong>");
  var lang = $(this).text().toLowerCase();

  //Update current language option on Firebase
  if(lang == "python") 
    firepadLangRef.update({"currLang":"python"});
  else if(lang == "java")
    firepadLangRef.update({"currLang":"java"});

  //Update current mode, compiler, and filename to match current language option
  setMode = mode[lang];
  compiler = compile[lang];
  filename = 'solution.' + ext[lang];

  //Update syntax highlighting and default code
  codeMirror.setOption("mode", setMode);
  firepad.setText(templateCode[lang]);
});

//Listener from Firebase: when the current language option has changed, update all instances
firepadLangRef.child("currLang").on("value", function(snapshot) {
  var lang = snapshot.val();
  if(lang) {
    //Update dropdown menu UI on all instances of PyroPad
    $("#languageselected").html((lang.charAt(0).toUpperCase() + lang.slice(1)) + "<strong class=\"caret\"></strong>");

    //Update mode, compiler, and filename for all instances of PyroPad
    setMode = mode[lang];
    compiler = compile[lang];
    filename = 'solution.' + ext[lang];

    //Update syntax highlighting for all instances of PyroPad
    codeMirror.setOption("mode", setMode);
  }
});

//Listener from socket.io: when code has been compiled and sent back
socket.on('output', function(output) {
  //Update run button UI
  $("#runButton").html("Run &#9658;");

  //Clear output pad and update with new output
  outputPad.setText("");
  var content = output.stderr + output.stdout;
  outputPad.setText(content);
});

//Copy link with ZeroClipboard configuaration when flash is available
if(flash) {
  //Get the flash object and initialize ZeroClipboard
  ZeroClipboard.config({swfPath:"//cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.2.0/ZeroClipboard.swf"});
  var client = new ZeroClipboard($("#shareLink"));
  client.clip(document.getElementById("shareLink"));

  //Position the flash object right on the button    
  document.getElementById('global-zeroclipboard-html-bridge').style.position = 'fixed';

  //Copy current URL to clipboard
  client.on("ready", function(event) {
    client.setText(window.location.href);
  });
}

//Getting Firebase references to use Firepad
function getRef() {
  //My Firebase unique URL
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
    //Create extra URLs for output pad and language option Firebase instances
    firebaseOutput = ref.toString() + "--output";
    firebaseLangOpt = ref.toString() + "--langOpt";
  }
  return ref;
}

//Handler for save button
function savePad() {
  var lang = $("#languageselected").text().toLowerCase();
  if(lang == "language ") 
    lang = "python";
  var content = firepad.getText() + "\n\n" + cmt[lang] + "Output:\n";
  var outputArray = outputPad.getText().split(/\n/);
  for(var i = 0; i < outputArray.length; i++) {
    content += (cmt[lang] + outputArray[i] + "\n");  
  }
  var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
  saveAs(blob, filename);
}

//Handler for run button: send current text and while output hasn't returned, show loading gif
function sendCode() {
  $("#runButton").html("<img src=\"img/loading.GIF\" id=\"loadingGIF\" alt=\"\"/>");
  socket.emit('compile', {filename:filename, compiler:compiler, code:encodeURI(firepad.getText())});
}

//Handler for sharelink button
function shareLink() {
  //Confirmation animation
  $("#shareLink").html("&#x2713;");
  window.setTimeout(function() {
    $("#shareLink").text("Link").css("color", "white");
  }, 800);

  //If flash isn't available, default to popup
  if(!flash) {
    window.prompt("Copy Link", window.location.href);
  }
}    
