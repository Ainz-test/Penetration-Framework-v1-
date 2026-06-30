function renderSettings(el){
  var h='<div class="sec-hdr"><div class="sec-title">&#9881; AI + Settings</div></div>';
  h+='<div class="sec-body">';

  // AI Setup
  h+='<div class="card"><div class="card-hdr"><div class="card-title">&#129302; AI Features (Claude API)</div>'
    +'<span id="ai_status" class="api-status">'+( APP.apiKey?'&#10003; Key saved':'No key — features disabled')+'</span>'
    +'</div><div class="card-body">';

  h+='<div class="tipcard" style="margin-bottom:12px"><span class="tipicon">&#129302;</span><div>'
    +'<div class="tiplbl">What AI Unlocks</div>'
    +'<div class="tiptxt">&#10024; Business Impact — Convert technical findings to CEO language<br>'
    +'&#10024; Remediation Quality — Basic fix → elite actionable steps<br>'
    +'&#10024; Kill Chain Narrative — Attack story for executives<br><br>'
    +'Requires an Anthropic API key + a small Vercel proxy function.</div></div></div>';

  h+='<div class="field-lbl">API Endpoint (default: /api/chat — your Vercel function)</div>'
    +'<input class="field-inp" id="set_endpoint" value="'+esc(APP.apiEndpoint||'/api/chat')+'" placeholder="/api/chat" style="margin-bottom:10px;font-family:monospace">'
    +'<div class="field-lbl">Anthropic API Key (stored locally only)</div>'
    +'<div style="display:flex;gap:8px;margin-bottom:12px">'
    +'<input class="field-inp" type="password" id="set_apikey" value="'+esc(APP.apiKey||'')+'" placeholder="sk-ant-..." style="flex:1;font-family:monospace">'
    +'<button class="btn success" onclick="saveApiKey()">Save</button>'
    +'<button class="btn danger sm" onclick="clearApiKey()">Clear</button>'
    +'</div>'
    +'<button class="btn ai" onclick="testAI()" style="width:100%;justify-content:center;margin-bottom:4px">&#129302; Test AI Connection</button>'
    +'<div id="ai_test_result" style="font-size:11px;color:var(--t3);margin-top:6px;line-height:1.5"></div>'
    +'</div></div>';

  // Vercel function code
  h+='<div class="card"><div class="card-hdr">'
    +'<div class="card-title">&#9889; Vercel Proxy Function Setup</div>'
    +'<button class="btn sm" onclick="copyVercelFn()">&#9113; Copy Code</button>'
    +'</div><div class="card-body">'
    +'<div style="font-size:11px;color:var(--t2);line-height:1.7;margin-bottom:10px">'
    +'Step 1: Create <code style="color:#7dd3fc">api/chat.js</code> in your Vercel project root<br>'
    +'Step 2: Add env var <code style="color:#7dd3fc">ANTHROPIC_API_KEY</code> in Vercel dashboard<br>'
    +'Step 3: Deploy. The AI buttons will now work on your deployed site.'
    +'</div>';

  var fnCode="const Anthropic = require('@anthropic-ai/sdk');\n\nmodule.exports = async (req, res) => {\n  res.setHeader('Access-Control-Allow-Origin', '*');\n  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');\n  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');\n  if (req.method === 'OPTIONS') { res.status(200).end(); return; }\n\n  const { prompt } = req.body;\n  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });\n\n  const message = await client.messages.create({\n    model: 'claude-sonnet-4-6',\n    max_tokens: 1024,\n    messages: [{ role: 'user', content: prompt }]\n  });\n\n  res.json({ text: message.content[0].text });\n};";

  h+='<div class="code-block" id="vercelfn_code">'+esc(fnCode)+'</div></div></div>';

  // Framework settings
  h+='<div class="card"><div class="card-hdr"><div class="card-title">&#128295; Framework Settings</div></div><div class="card-body">'
    +'<div style="display:flex;flex-direction:column;gap:8px">'
    +'<button class="btn danger" onclick="doReset()" style="width:100%;justify-content:center">&#8635; Reset All Framework Progress (current profile)</button>'
    +'<button class="btn" onclick="exportAllData()" style="width:100%;justify-content:center">&#128229; Export All Data (JSON backup)</button>'
    +'</div></div></div>';

  h+='</div>';
  el.innerHTML=h;
}

function saveApiKey(){
  var key=document.getElementById('set_apikey').value.trim();
  var endpoint=document.getElementById('set_endpoint').value.trim()||'/api/chat';
  APP.apiKey=key;
  APP.apiEndpoint=endpoint;
  localStorage.setItem('api_key',key);
  localStorage.setItem('api_endpoint',endpoint);
  var st=document.getElementById('ai_status');
  if(st)st.textContent=key?'✓ Key saved':'No key';
  if(st)st.className='api-status '+(key?'ok':'');
}

function clearApiKey(){
  APP.apiKey='';
  localStorage.removeItem('api_key');
  document.getElementById('set_apikey').value='';
  var st=document.getElementById('ai_status');
  if(st){st.textContent='No key — features disabled';st.className='api-status';}
}

function testAI(){
  var result=document.getElementById('ai_test_result');
  if(result)result.textContent='Testing...';
  aiCall('Say only: "PenTest Pro AI connection successful!"',
    function(text){if(result)result.textContent='✓ '+text;},
    function(err){if(result)result.textContent='✗ Error: '+err;});
}

function copyVercelFn(){
  var el=document.getElementById('vercelfn_code');
  if(el)copy(el.innerText,document.querySelector('.card-hdr .btn'));
}

function exportAllData(){
  var data={profiles:APP.profiles,current:APP.profile,data:{}};
  APP.profiles.forEach(function(p){
    var keys=['ck','notes','eng','phase','step','findings','scope','timer_sessions','kc','kc_narr'];
    data.data[p.id]={};
    keys.forEach(function(k){
      var v=localStorage.getItem('apt_'+p.id+'_'+k);
      if(v)try{data.data[p.id][k]=JSON.parse(v);}catch(e){}
    });
  });
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download='pentest-pro-backup-'+(new Date().toISOString().split('T')[0])+'.json';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
