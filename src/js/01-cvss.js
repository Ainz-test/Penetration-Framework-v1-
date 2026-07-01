var CVSS_AV={N:0.85,A:0.62,L:0.55,P:0.2};
var CVSS_AC={L:0.77,H:0.44};
var CVSS_PR={N:{U:0.85,C:0.85},L:{U:0.62,C:0.50},H:{U:0.27,C:0.50}};
var CVSS_UI={N:0.85,R:0.62};
var CVSS_CIA={N:0,L:0.22,H:0.56};

function calcCVSS(m){
  var av=CVSS_AV[m.AV]||0.85,ac=CVSS_AC[m.AC]||0.77;
  var pr=((CVSS_PR[m.PR]||{})[m.S])||0.85;
  var ui=CVSS_UI[m.UI]||0.85;
  var C=CVSS_CIA[m.C]||0,I=CVSS_CIA[m.I]||0,A=CVSS_CIA[m.A]||0;
  var ISC=1-(1-C)*(1-I)*(1-A);
  var Imp=m.S==='U'?6.42*ISC:7.52*(ISC-0.029)-3.25*Math.pow(ISC-0.02,15);
  var Exp=8.22*av*ac*pr*ui;
  if(Imp<=0)return '0.0';
  var raw=m.S==='U'?Math.min(Imp+Exp,10):Math.min(1.08*(Imp+Exp),10);
  return (Math.ceil(raw*10)/10).toFixed(1);
}

function cvssToSev(s){var n=parseFloat(s);if(n===0)return 'Info';if(n<=3.9)return 'Low';if(n<=6.9)return 'Medium';if(n<=8.9)return 'High';return 'Critical';}

/* Severity colors — new design system palette */
var SEV_COLORS={Critical:'#F04438',High:'#FB7C3C',Medium:'#EAB308',Low:'#22C65A',Info:'#6B9EFF'};
var SEV_BG={Critical:'#2A0A08',High:'#2A1008',Medium:'#201600',Low:'#052210',Info:'#0A1628'};

function ringHTML(pct,col,sz,lbl){
  var r=sz/2-3.5,c=sz/2,circ=2*Math.PI*r,dash=pct/100*circ;
  return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 '+sz+' '+sz+'">'
    +'<circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3"/>'
    +'<circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="3"'
    +' stroke-dasharray="'+dash.toFixed(1)+' '+circ.toFixed(1)+'" stroke-linecap="round"'
    +' transform="rotate(-90 '+c+' '+c+')" opacity=".9"/>'
    +'<text x="'+c+'" y="'+(c+4)+'" text-anchor="middle" fill="rgba(237,236,248,0.8)" font-size="8" font-weight="700" font-family="system-ui">'+lbl+'</text>'
    +'</svg>';
}
