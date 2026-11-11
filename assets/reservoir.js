/* Animated reservoir drawdown scene — Selman Er. Requires <canvas id="scene"> and gauge elements #gVal #gBar #gState */
(function(){
var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var lang='en';
function curLang(){lang=document.body.getAttribute('data-lang')||'en';}
/* ---------- reservoir scene ---------- */
var cv=document.getElementById('scene'),cx=cv.getContext('2d'),W,H,dpr;
function size(){dpr=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);}
size();addEventListener('resize',size);
var mobile=function(){return W<900;};
function vx(){return mobile()?0.5:0.73;}           // valley centre (fraction of width)
function vw(f){return mobile()?0.62:(f<0?0.30:0.24);}           // half-width
function rimY(){return H*0.50;}
function bedY(){return H*0.94;}
function ground(x){var u=x/W-vx();var d=1-Math.pow(u/vw(u),2);if(d<0)d=0;return rimY()+(bedY()-rimY())*Math.pow(d,0.75)+Math.sin(x*0.03)*2;}
var TOP=function(){return H*0.57;}, LOW=function(){return H*0.86;};
var SITES=[
  {f:-0.62,kind:'church',en:'Drowned church',tr:'Batık kilise'},
  {f:0.62,kind:'columns',en:'Roman columns',tr:'Roma sütunları'},
  {f:0.81,kind:'mound',en:'Mound (tell)',tr:'Höyük'},
  {f:0.87,kind:'minaret',en:'Village minaret',tr:'Köy minaresi'}
];
var ruinsSeen={};
function drawMountains(t){
  var layers=[{y:.30,a:60,c:'#0d3340',s:.0018,o:0},{y:.38,a:45,c:'#0f3f4d',s:.0026,o:2},{y:.45,a:30,c:'#124a58',s:.004,o:4}];
  layers.forEach(function(L){cx.fillStyle=L.c;cx.beginPath();cx.moveTo(0,H);
    for(var x=0;x<=W;x+=8){var y=H*L.y-L.a*(Math.sin(x*L.s+L.o)+.5*Math.sin(x*L.s*2.3+L.o*1.7))-0.6*Math.sin(t*.00005+x*.001)*6;cx.lineTo(x,y);}
    cx.lineTo(W,H);cx.closePath();cx.fill();});
}
function groundPath(){cx.beginPath();cx.moveTo(0,H);for(var x=0;x<=W;x+=4)cx.lineTo(x,ground(x));cx.lineTo(W,H);cx.closePath();}
function drawSite(s,x,y,alpha){
  cx.save();cx.globalAlpha=alpha;cx.fillStyle='#c9a46a';cx.strokeStyle='#8a6a3a';cx.lineWidth=1.2;
  if(s.kind==='mound'){cx.beginPath();cx.ellipse(x,y+2,30,16,0,Math.PI,0);cx.fill();cx.fillStyle='#a8834e';for(var i=-1;i<=1;i++){cx.fillRect(x+i*12-4,y-12+Math.abs(i)*4,8,10-Math.abs(i)*3);}}
  else if(s.kind==='church'){cx.fillRect(x-22,y-26,44,26);cx.beginPath();cx.moveTo(x-25,y-26);cx.lineTo(x,y-42);cx.lineTo(x+25,y-26);cx.fill();cx.fillRect(x+12,y-56,10,30);cx.fillStyle='#5b4526';cx.beginPath();cx.arc(x,y-8,6,Math.PI,0);cx.rect(x-6,y-8,12,8);cx.fill();}
  else if(s.kind==='columns'){for(var j=0;j<4;j++){var h=[34,26,38,18][j];cx.fillRect(x-24+j*15,y-h,7,h);cx.fillRect(x-26+j*15,y-h-3,11,3);}cx.fillRect(x-28,y-2,60,3);}
  else if(s.kind==='minaret'){cx.fillRect(x-5,y-66,10,66);cx.fillRect(x-8,y-48,16,4);cx.beginPath();cx.moveTo(x-6,y-66);cx.lineTo(x,y-84);cx.lineTo(x+6,y-66);cx.fill();cx.fillRect(x-30,y-16,22,16);}
  cx.restore();
}
function frame(now){
  curLang();var t=now||0;
  // water level: slow drawdown & refill cycle (~16 s), with a little seasonal ripple
  var ph=(Math.sin(t*0.00039 - Math.PI/2)+1)/2;            // 0 = full, 1 = lowest
  ph=Math.min(1,Math.max(0,ph+0.05*Math.sin(t*0.0013)));
  var wl=TOP()+(LOW()-TOP())*ph;
  var falling=Math.cos(t*0.00039 - Math.PI/2)>0;
  // sky
  var g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#06202a');g.addColorStop(.55,'#0d3a47');g.addColorStop(1,'#123f4a');
  cx.fillStyle=g;cx.fillRect(0,0,W,H);
  // sun glow
  var sx=W*(mobile()?.8:.84),sy=H*.2;var rg=cx.createRadialGradient(sx,sy,0,sx,sy,H*.35);rg.addColorStop(0,'rgba(240,200,130,.35)');rg.addColorStop(1,'rgba(240,200,130,0)');cx.fillStyle=rg;cx.fillRect(0,0,W,H);
  cx.fillStyle='rgba(250,220,160,.85)';cx.beginPath();cx.arc(sx,sy,18,0,7);cx.fill();
  drawMountains(t);
  // ground with strata
  groundPath();var gg=cx.createLinearGradient(0,rimY(),0,H);gg.addColorStop(0,'#6b5435');gg.addColorStop(.5,'#4f3c25');gg.addColorStop(1,'#33271a');cx.fillStyle=gg;cx.fill();
  cx.save();groundPath();cx.clip();
  // bathtub rings (former shorelines) between top and lowest level
  for(var k=0;k<9;k++){var yy=TOP()+k*(LOW()-TOP())/8;cx.fillStyle='rgba(230,215,185,'+(0.10+0.05*(k%2))+')';cx.fillRect(0,yy,W,3);}
  // wet band just above the water line
  var wb=cx.createLinearGradient(0,wl-30,0,wl);wb.addColorStop(0,'rgba(20,40,40,0)');wb.addColorStop(1,'rgba(20,40,40,.45)');cx.fillStyle=wb;cx.fillRect(0,wl-30,W,30);
  cx.restore();
  // heritage sites on the valley floor/slopes
  var labels=[],nExp=0;
  SITES.forEach(function(s,i){
    var x=W*vx()+s.f*W*vw(s.f);var y=ground(x);
    var exposed=Math.max(0,Math.min(1,(wl-y)/18));          // 0 under water, 1 base dry
    drawSite(s,x,y,1);
    if(exposed>0.6)nExp++;
    if(exposed>0.6&&!mobile()){var hh={mound:22,church:56,columns:40,minaret:84}[s.kind];labels.push({x:x,y:y-hh-26,a:(exposed-0.6)/0.4,s:s});}
  });
  // water body: fill below the wavy surface, clipped to the space above the ground surface
  cx.save();
  cx.beginPath();cx.moveTo(0,-10);for(var x2=0;x2<=W;x2+=4)cx.lineTo(x2,ground(x2));cx.lineTo(W,-10);cx.closePath();cx.clip();
  cx.beginPath();cx.moveTo(0,H);
  for(var x=0;x<=W;x+=6){var wy=wl+Math.sin(x*.025+t*.002)*2.2+Math.sin(x*.06-t*.003)*1.2;cx.lineTo(x,wy);}
  cx.lineTo(W,H);cx.closePath();
  var wg=cx.createLinearGradient(0,wl,0,H);wg.addColorStop(0,'rgba(63,182,198,.80)');wg.addColorStop(.35,'rgba(20,110,128,.86)');wg.addColorStop(1,'rgba(8,52,64,.93)');
  cx.fillStyle=wg;cx.fill();
  cx.restore();
  // shimmer on the surface
  cx.strokeStyle='rgba(255,255,255,.35)';cx.lineWidth=1;
  for(var i=0;i<14;i++){var px=((i*137+t*.03)%W);var lx=W*vx()-W*vw(-1)*0.9,rx=W*vx()+W*vw(1)*0.9;if(px<lx||px>rx)continue;var py=wl+6+(i%5)*9;if(ground(px)<py)continue;cx.beginPath();cx.moveTo(px,py);cx.lineTo(px+18+(i%3)*8,py);cx.stroke();}
  // labels
  labels.forEach(function(L){var txt=lang==='tr'?L.s.tr:L.s.en;cx.save();cx.globalAlpha=L.a;cx.font='600 12px "Source Sans 3",system-ui,sans-serif';var w=cx.measureText(txt).width+18;
    cx.fillStyle='rgba(215,166,95,.95)';cx.beginPath();if(cx.roundRect)cx.roundRect(L.x-w/2,L.y-12,w,22,11);else cx.rect(L.x-w/2,L.y-12,w,22);cx.fill();
    cx.fillStyle='#1d1407';cx.textAlign='center';cx.fillText(txt,L.x,L.y+3);cx.strokeStyle='rgba(215,166,95,.8)';cx.beginPath();cx.moveTo(L.x,L.y+10);cx.lineTo(L.x,L.y+22);cx.stroke();cx.restore();});
  // gauge
  var pct=Math.round(100-ph*85);
  document.getElementById('gVal').textContent=pct+'%';
  document.getElementById('gBar').style.width=pct+'%';
  var st=document.getElementById('gState');
  if(nExp){st.textContent=lang==='tr'?('Açığa çıkan miras: '+nExp):('Heritage exposed: '+nExp);st.className='state warn';}
  else{st.textContent=falling?(lang==='tr'?'Su çekiliyor…':'Drawdown in progress…'):(lang==='tr'?'Baraj doluyor…':'Refilling…');st.className='state';}
  if(!reduce)requestAnimationFrame(frame);
}


if(reduce){frame(4000);}else{requestAnimationFrame(frame);}
})();
