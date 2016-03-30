var socket = io.connect('http://localhost:3000');


socket.appConfig = {

    sendActiveDrawEvents: true //points which are being draw

}

//$('form').submit(function(){
$(document).ready(function(){

$('#sent_chat').on('click', function(){  
  console.log("got msg");
  socket.emit('chat message', $('#m').val());
  $('#messages').append($('<li>').text($('#m').val()));
  $('#m').val('');

  return false;
});


socket.on('chat message', function(msg){
  console.log("got msg");
  $('#messages').append($('<li>').text(msg));
});


});



socket.webSocketId = Math.ceil(Math.random()*10000);

//io.on('connection', function(socket){
//  socket.broadcast.emit('hi');
//});



// socket.on('news', function (data) {
// console.log(data);
// socket.emit('my other event', { my: 'data' });
// });


//socket.emit('chat message', "hi");


socket.on('connect', function(){
  socket.on('users_count', function(data){
    $('#client_count').text("Total connected users: "+ data);

    if(data==1){
      $("#presenter").prop( "checked", true );
    }

   // alert(data);
    console.log("Connection");
    console.log()
  });


socket.on('emulateButton',function(evt){

    console.log("emulating to press button");
    console.log("************************");
    console.log(evt.buttonNumber);
    console.log("************************");

    if(socket.webSocketId!=evt.webSocketId){
	    g_buttons[evt.buttonNumber].click();
    	console.log("different client... can emulate ")

    } else {
    	console.log("same client... no need to emulate ")
    }


});


socket.on('emulateMouseEvent',function(evt){

    console.log("emulating to mouse event");
    console.log("************************");
    console.log(evt.buttonNumber);
    console.log("************************");

    if(socket.webSocketId!=evt.webSocketId){

      // do something here 

      console.log("different client... can emulate ")

    } else {
      console.log("same client... no need to emulate ")
    }


});




var actionOnCanvas = function(evt) {

    console.log("emulating to canvas event: " + evt.eventType);
    console.log("************************");
    console.log(evt);
    console.log("************************");

    if(socket.webSocketId!=evt.webSocketId){

        var color = cornerstoneTools.toolColors.getActiveColor();
        var font = cornerstoneTools.textStyle.getFont();
        var fontHeight = cornerstoneTools.textStyle.getFontSize();

        // because I'm unable to handle clearing canvas, I'm printing on when white / ToolColor is detected

        var context = document.getElementById("mainCanvas").getContext('2d');;

        g_context = context;

        if(1 || !evt.color || evt.color==cornerstoneTools.toolColors.getToolColor()){



      console.log(evt.eventType + "before switch") ;

      switch(evt.eventType) {
          case 'wwwc':
            cornerstoneTools.wwwc.activate(g_context.canvas.parentElement, 1);
            cornerstoneTools.wwwcTouchDrag.activate(g_context.canvas.parentElement);
            var viewport = cornerstone.getViewport(g_context.canvas.parentElement);
            viewport.voi= evt.voi;
            cornerstone.setViewport(g_context.canvas.parentElement, viewport);
            break;
          case 'zoom':
            var viewport = cornerstone.getViewport(g_context.canvas.parentElement);
//            viewport.scale= evt.viewport;
            viewport.scale= evt.viewport.scale;
            cornerstone.setViewport(g_context.canvas.parentElement, viewport);
            break;
          case 'drawTextBox':

   //       cornerstoneTools.drawTextBox(g_context, evt.text , evt.x, evt.y , "white")
//           var enabledElement = cornerstone.getEnabledElement(g_context.canvas.parentElement);
//           var t = cornerstone.internal.getTransform(enabledElement)
//           var transformedPoints =  t.transformPointInverse(evt.x,evt.y)
//           console.log(transformedPoints);
//           cornerstoneTools.drawTextBox(g_context, evt.text , transformedPoints.x, transformedPoints.y , "yellow")

        var padding = 5,
            font = cornerstoneTools.textStyle.getFont(),
            fontSize = cornerstoneTools.textStyle.getFontSize(),
            backgroundColor = cornerstoneTools.textStyle.getBackgroundColor();


// TODO: Put this change in cornerstoneTools.js
/////// Experimenting with scale
             var viewport = cornerstone.getViewport(g_context.canvas.parentElement);
         fontSize = cornerstoneTools.textStyle.getFontSize()/viewport.scale;
         font = fontSize+ "px" + cornerstoneTools.textStyle.getFont().split("px")[1]

/////// Experimenting with scale --- ends here....

        context.save();

        // Get the text width in the current font
        context.font = font;
        var width = context.measureText(evt.text).width / viewport.scale;

        // Draw the background box with padding
        context.textBaseline = 'top';
        context.fillStyle = backgroundColor;

        context.fillRect(evt.x, evt.y - fontSize, width + (padding * 2), fontSize + (padding * 2));
        // Draw the text
        context.fillStyle = evt.color;
        context.fillText(evt.text, evt.x + padding, evt.y - fontSize + padding);

              break;
          case 'drawArrow':
//                context.save();
                cornerstoneTools.drawArrow(g_context, evt.start, evt.end, evt.color, evt.lineWidth)
              break;
          case 'drawHandles':
                context.save();
                context.strokeStyle = evt.color;
                var viewport = cornerstone.getViewport(g_context.canvas.parentElement);
                var handleRadius = 6/viewport.scale;

                Object.keys(evt.handles).forEach(function(name) {
                    var handle = evt.handles[name];
                    context.beginPath();

                    if (handle.active) {
                        context.lineWidth = cornerstoneTools.toolStyle.getActiveWidth();
                    } else {
                        context.lineWidth = cornerstoneTools.toolStyle.getToolWidth();
                    }
  
                    context.lineWidth  = context.lineWidth/viewport.scale;
                    context.arc(handle.x, handle.y, handleRadius, 0, 2 * Math.PI);

                    if (evt.fill) {
                        context.fillStyle = evt.fill;
                        context.fill();
                    }

                    context.stroke();
                });
              break;

         case 'drawRect': 
            context.save();
            var viewport = cornerstone.getViewport(g_context.canvas.parentElement);
            var handleRadius = 6;

            var widthCanvas = Math.abs(evt.data.handles.start.x - evt.data.handles.end.x);
            var heightCanvas = Math.abs(evt.data.handles.start.y - evt.data.handles.end.y);
            var leftCanvas = Math.min(evt.data.handles.start.x, evt.data.handles.end.x);
            var topCanvas = Math.min(evt.data.handles.start.y, evt.data.handles.end.y);
            var centerX = (evt.data.handles.start.x + evt.data.handles.end.x) / 2;
            var centerY = (evt.data.handles.start.y + evt.data.handles.end) / 2;

            context.beginPath();
            context.strokeStyle = evt.color;
            context.lineWidth = evt.lineWidth/viewport.scale;
            context.rect(leftCanvas, topCanvas, widthCanvas, heightCanvas);
            context.stroke();
         break;
         case 'drawLine': 

            context.save();
            var viewport = cornerstone.getViewport(g_context.canvas.parentElement);

            // configurable shadow
            if (evt.config && evt.config.shadow) {
                context.shadowColor = '#000000';
                context.shadowOffsetX = +1;
                context.shadowOffsetY = +1;
            }
              
            if (evt.data.active) {
               var color = cornerstoneTools.toolColors.getActiveColor();
            } else {
               var color = cornerstoneTools.toolColors.getToolColor();
            }

            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = evt.lineWidth / viewport.scale;
            context.moveTo(evt.data.handles.start.x, evt.data.handles.start.y);
            context.lineTo(evt.data.handles.end.x, evt.data.handles.end.y);
            if(evt.data.handles.start2 && evt.data.handles.end2){
              context.moveTo(evt.data.handles.start2.x, evt.data.handles.start2.y);
              context.lineTo(evt.data.handles.end2.x, evt.data.handles.end2.y);
            }
            context.stroke();
            break;


          case 'drawEllipse':
        //          cornerstoneTools.drawEllipse(g_context, evt.x, evt.y, evt.w, evt.h);
         var viewport = cornerstone.getViewport(g_context.canvas.parentElement);
          evt.w = evt.w /viewport.scale;
          evt.h = evt.h /viewport.scale;

              var lineWidth = cornerstoneTools.toolStyle.getToolWidth() /viewport.scale;
              var  color = cornerstoneTools.toolColors.getToolColor();


                  context.beginPath();
                  context.strokeStyle = color;
                  context.lineWidth = lineWidth;
                  cornerstoneTools.drawEllipse(context, evt.x, evt.y, evt.w, evt.h);
                  context.closePath();
          //        context.save();

              var kappa = 0.5522848,
                  ox = (evt.w / 2) * kappa, // control point offset horizontal
                  oy = (evt.h / 2) * kappa, // control point offset vertical
                  xe = evt.x + evt.w, // x-end
                  ye = evt.y + evt.h, // y-end
                  xm = evt.x + evt.w / 2, // x-middle
                  ym = evt.y + evt.h / 2; // y-middle

              context.beginPath();
              context.moveTo(evt.x, ym);
              context.bezierCurveTo(evt.x, ym - oy, xm - ox, evt.y, xm, evt.y);
              context.bezierCurveTo(xm + ox, evt.y, xe, ym - oy, xe, ym);
              context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
              context.bezierCurveTo(xm - ox, ye, evt.x, ym + oy, evt.x, ym);
              context.closePath();
              context.stroke();
              break;
          default:
              console.log("default in eventType");
      }
}

        // color shows if data.active or not...
        if(evt.color==cornerstoneTools.toolColors.getActiveColor()){
          // save these elements to be cleared later
          // i have to save state for each one of them
       //   cornerstoneTools.toolColors.getActiveColor();
       // g_context.restore();
        }
        // as soon as nonActive color is spotted... clear ActiveColor stuff
        console.log( evt.color);
        if(evt.color==cornerstoneTools.toolColors.getToolColor()){
          // pick all canvas elements with getActiveColor() and hide or delete them
          cornerstoneTools.toolColors.getActiveColor();
        //  g_context.save();
        }

      console.log("different client... can emulate ")

    } else {
      console.log("same client... no need to emulate ")
    }


}



// couldn't find multiple events captured using one socket.on 
socket.on('drawTextBox',function(evt){
  actionOnCanvas(evt);
});

socket.on('drawArrow',function(evt){
  actionOnCanvas(evt);
});

socket.on('drawHandles',function(evt){
  actionOnCanvas(evt);
});


socket.on('drawEllipse',function(evt){
  actionOnCanvas(evt);
});

socket.on('drawLine',function(evt){
  actionOnCanvas(evt);
});

socket.on('drawRect',function(evt){
  actionOnCanvas(evt);
});

socket.on('wwwc',function(evt){
  actionOnCanvas(evt);
});

socket.on('zoom',function(evt){
  actionOnCanvas(evt);
});





socket.on('loadStudy',function(evt){

    console.log("loading Study");
    console.log("************************");
    console.log(evt);
    console.log("************************");

	g_evt_from_socket = evt;

    if(socket.webSocketId!=evt.webSocketId){

		$('#studyListData tr td').each(function()
		{if($(this).html()==evt.patientId){
		  console.log($(this).html());		
          $(this).click();	
		}
		});


     // loadStudy(evt.studyViewerCopy, evt.viewportTemplate, evt.study);

      // evt.studyRowElement.click();




    	console.log("different client... should load ")
    } else {
    	console.log("same client... no need to emulate ")
    }


});




});