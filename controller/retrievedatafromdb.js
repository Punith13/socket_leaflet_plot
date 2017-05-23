       
 module.exports = function(request , socket , receiver , emitter ,noofobj )
 {    
     console.log(receiver);
     console.log(noofobj);
     console.log(emitter);
     // Custom event emitter 
     const EventEmitter = require('events');
     const util = require('util');

     function MyEmitter() {
         EventEmitter.call(this);
     }
     util.inherits(MyEmitter, EventEmitter);

     const myEmitter = new MyEmitter();

     var jsonoutput = [];
     var jsonBufferArray = [];
     var firstrowcounter = 0;
     var Plottingflag = 0;
     var counter = 0;
     
     request.on('row', function(row) {

         jsonoutput.push(row);
         
         if(Plottingflag == 0)
         {
         firstrowcounter++; 
         }

         if(firstrowcounter == noofobj)
         {
          myEmitter.emit('Firstflush');
          firstrowcounter = 0;
         }
     });

     myEmitter.on('Firstflush', () => {
        
        
         Plottingflag = 1;
         
         jsonBufferArray = [];
         jsonBufferArray.push(jsonoutput.shift());
         socket.emit(receiver, jsonBufferArray);
         
         socket.on(emitter, function() {

             jsonBufferArray = [];
           
             for (var i = 0; i <= noofobj; i++) 
             {    
                 var a = jsonoutput.shift();
                 if(a !== undefined)
                 {
                 jsonBufferArray.push(a);
                 }
                 counter++; 
             }
                 
             if(counter < 100000 ) 
             {
                 if(jsonBufferArray.length > 0)
                 {
              socket.emit(receiver, jsonBufferArray);
                 }
                 else
                 {
              socket.emit('donesending' , 'Completed work');     
                 }
             }
         });
     });
     
       request.on('done', function(affected) {
      
         if(Plottingflag == 0)
         { 
         jsonBufferArray = [];
         jsonBufferArray.push(jsonoutput.shift());
         socket.emit(receiver, jsonBufferArray);
         
         socket.on(emitter, function() {
            
             jsonBufferArray = [];
           
             for (var i = 0; i <= noofobj; i++) 
             {    
                 var a = jsonoutput.shift();
                 if(a !== undefined)
                 {
                 jsonBufferArray.push(a);
                 counter++; 
                 }
                 
             }
                 
             if(counter < 100000 ) 
             { 
                 if(jsonBufferArray.length > 0)
                 {         
              socket.emit(receiver, jsonBufferArray);
                 }
                 else
                 {
              socket.emit('donesending' , 'Completed work');     
                 }
             }
         });
         }
     }); 
        
 }