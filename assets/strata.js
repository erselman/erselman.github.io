/* Animated geological strata / contour lines for the CV hero */
(function(){
var cv=document.getElementById('strata'); if(!cv) return;
var cx=cv.getContext('2d'),W,H,dpr;
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function size(){dpr=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);}
size();addEventListener('resize',size);
var mx=0.7,my=0.4;
addEventListener('pointermove',function(e){mx=e.clientX/W;my=e.clientY/H;},{passive:true});
var grains=[];for(var i=0;i<60;i++)grains.push({x:Math.random(),y:Math.random(),r:Math.random()*1.6+.4,s:Math.random()*.00004+.00001});
function frame(t){
  t=t||0;cx.clearRect(0,0,W,H);
  var n=26;
  for(var i=0;i<n;i++){
    var base=H*(0.18+i*0.034);
    var amp=10+i*1.1;
    var hue=i/n;
    cx.beginPath();
    for(var x=-20;x<=W+20;x+=10){
      var fold=Math.exp(-Math.pow((x/W-mx)*3.2,2))*40*(0.5+my);  // anticline follows the pointer
      var y=base-fold+Math.sin(x*0.004+i*0.35+t*0.00018)*amp+Math.sin(x*0.011-i*0.2-t*0.00011)*amp*0.35;
      if(x===-20)cx.moveTo(x,y);else cx.lineTo(x,y);
    }
    var a=0.06+0.10*Math.sin(Math.PI*hue);
    cx.strokeStyle= i%5===0 ? 'rgba(215,166,95,'+(a+0.08)+')' : 'rgba(127,216,227,'+a+')';
    cx.lineWidth= i%5===0 ? 1.6 : 1;
    cx.stroke();
  }
  grains.forEach(function(g){g.y-=g.s*16;if(g.y<0){g.y=1;g.x=Math.random();}
    cx.fillStyle='rgba(243,217,174,.35)';cx.beginPath();cx.arc(g.x*W,g.y*H,g.r,0,7);cx.fill();});
  if(!reduce)requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
