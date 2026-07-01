/* ── Finding Templates ────────────────────────────────────────────────────
   Pre-populated common pentest findings. A tester chooses a template,
   the finding panel pre-fills with standard description, CVSS, business
   impact skeleton, and remediation — they only add the specific details. */

var FINDING_TEMPLATES = [
  {
    id:'tpl_sqli',icon:'💉',
    title:{en:'SQL Injection',ar:'حقن SQL'},
    severity:'Critical',cvss:{AV:'N',AC:'L',PR:'N',UI:'N',S:'U',C:'H',I:'H',A:'H'},
    mitre:'T1190',mitre_name:'Exploit Public-Facing Application',
    description:{
      en:'A SQL injection vulnerability was identified in the {PARAMETER} parameter of {ENDPOINT}. User-supplied input is incorporated into SQL queries without proper sanitisation or parameterisation, allowing an attacker to manipulate the query structure.',
      ar:'تم تحديد ثغرة حقن SQL في معامل {PARAMETER} في {ENDPOINT}. يتم دمج المدخلات المُقدَّمة من المستخدم في استعلامات SQL دون تعقيم أو تحديد معاملات مناسب، مما يسمح للمهاجم بالتلاعب في بنية الاستعلام.'
    },
    business_impact:{
      en:'An attacker who exploits this vulnerability can extract the entire database contents — including user credentials, personal data, and business records. Depending on database permissions, they may also modify or delete data, or execute operating system commands. This exposes the organisation to data breach notification obligations, regulatory fines, and significant reputational damage.',
      ar:'يمكن للمهاجم الذي يستغل هذه الثغرة استخراج محتويات قاعدة البيانات بالكامل — بما في ذلك بيانات اعتماد المستخدمين والبيانات الشخصية والسجلات التجارية. اعتماداً على أذونات قاعدة البيانات، قد يقوم أيضاً بتعديل البيانات أو حذفها، أو تنفيذ أوامر نظام التشغيل. يُعرِّض هذا المنظمة لالتزامات إخطار خرق البيانات والغرامات التنظيمية والأضرار الجسيمة للسمعة.'
    },
    remediation:{
      en:'1. Use parameterised queries / prepared statements for ALL database interactions — never concatenate user input into SQL strings.\n2. Implement input validation: whitelist expected formats, reject unexpected characters.\n3. Apply least-privilege principles to database accounts — the application account should not have DROP/ALTER permissions.\n4. Deploy a Web Application Firewall (WAF) as a defence-in-depth measure.\n5. Conduct a full codebase review to identify all other SQL concatenation points.\n\nVerification: Re-test with sqlmap after remediation and confirm payloads return generic error pages, not database errors.',
      ar:'1. استخدام Parameterised Queries / Prepared Statements لجميع تفاعلات قاعدة البيانات — لا تدمج أبداً مدخلات المستخدم في سلاسل SQL.\n2. تطبيق التحقق من المدخلات: قائمة بيضاء للتنسيقات المتوقعة، رفض الأحرف غير المتوقعة.\n3. تطبيق مبدأ الحد الأدنى من الأذونات لحسابات قاعدة البيانات — لا ينبغي أن يمتلك حساب التطبيق أذونات DROP/ALTER.\n4. نشر جدار حماية تطبيقات الويب (WAF) كإجراء دفاعي متعمق.\n5. إجراء مراجعة كاملة لقاعدة الكود لتحديد جميع نقاط دمج SQL الأخرى.\n\nالتحقق: إعادة الاختبار بـsqlmap بعد الإصلاح والتأكد من إرجاع الحمولات لصفحات خطأ عامة، وليس أخطاء قاعدة بيانات.'
    }
  },
  {
    id:'tpl_xss',icon:'🔧',
    title:{en:'Cross-Site Scripting (XSS)',ar:'البرمجة عبر المواقع (XSS)'},
    severity:'High',cvss:{AV:'N',AC:'L',PR:'N',UI:'R',S:'C',C:'L',I:'L',A:'N'},
    mitre:'T1059',mitre_name:'Command and Scripting Interpreter',
    description:{
      en:'A {TYPE: Reflected/Stored/DOM-based} Cross-Site Scripting vulnerability was identified in the {PARAMETER} parameter of {ENDPOINT}. User-supplied input is returned in the HTTP response without adequate encoding, allowing injection of arbitrary JavaScript into the page rendered in victims\' browsers.',
      ar:'تم تحديد ثغرة {النوع: منعكسة/مخزّنة/قائمة على DOM} للبرمجة عبر المواقع في معامل {PARAMETER} في {ENDPOINT}. يتم إرجاع المدخلات المُقدَّمة من المستخدم في استجابة HTTP دون ترميز كافٍ، مما يسمح بحقن JavaScript عشوائي في الصفحة المُعرَضة في متصفحات الضحايا.'
    },
    business_impact:{
      en:'An attacker can execute malicious scripts in the context of the victim\'s browser session, enabling session hijacking (stealing authentication cookies), credential theft via fake login forms, redirection to phishing sites, and keylogging. Stored XSS affects every user who views the infected page, potentially compromising all application users simultaneously.',
      ar:'يمكن للمهاجم تنفيذ سكربتات خبيثة في سياق جلسة المتصفح للضحية، مما يتيح اختطاف الجلسة (سرقة كوكيز المصادقة)، وسرقة بيانات الاعتماد عبر نماذج تسجيل دخول مزيفة، وإعادة التوجيه لمواقع التصيد الاحتيالي، وتسجيل لوحة المفاتيح. XSS المخزّن يؤثر على كل مستخدم يشاهد الصفحة المصابة، مما قد يخترق جميع مستخدمي التطبيق في وقت واحد.'
    },
    remediation:{
      en:'1. Encode ALL user-supplied data before inserting into HTML context: use HTML entity encoding (e.g., OWASP Java Encoder, .NET AntiXSS).\n2. Implement Content Security Policy (CSP) header: Content-Security-Policy: default-src \'self\'; script-src \'self\'\n3. Set cookie flags: HttpOnly (prevents JS access to cookies), Secure, SameSite=Strict.\n4. Validate input server-side: reject or sanitise unexpected characters.\n5. For DOM-based XSS: avoid dangerous sinks (innerHTML, document.write) — use textContent instead.',
      ar:'1. ترميز جميع البيانات المُقدَّمة من المستخدم قبل إدراجها في سياق HTML: استخدام ترميز HTML entities.\n2. تطبيق رأس Content Security Policy (CSP): Content-Security-Policy: default-src \'self\'; script-src \'self\'\n3. تعيين علامات الكوكيز: HttpOnly (يمنع وصول JS للكوكيز)، Secure، SameSite=Strict.\n4. التحقق من المدخلات جانب الخادم: رفض أو تعقيم الأحرف غير المتوقعة.\n5. لـXSS القائم على DOM: تجنب المُرِيبات الخطرة (innerHTML، document.write) — استخدم textContent بدلاً منها.'
    }
  },
  {
    id:'tpl_idor',icon:'🔍',
    title:{en:'Insecure Direct Object Reference (IDOR)',ar:'مرجع كائن مباشر غير آمن (IDOR)'},
    severity:'High',cvss:{AV:'N',AC:'L',PR:'L',UI:'N',S:'U',C:'H',I:'L',A:'N'},
    mitre:'T1078',mitre_name:'Valid Accounts',
    description:{
      en:'An Insecure Direct Object Reference vulnerability was identified at {ENDPOINT}. The application uses a predictable, user-controlled identifier ({PARAMETER}) to access objects without verifying that the requesting user is authorised to access that specific object.',
      ar:'تم تحديد ثغرة IDOR في {ENDPOINT}. يستخدم التطبيق معرّفاً قابلاً للتنبؤ يتحكم فيه المستخدم ({PARAMETER}) للوصول إلى الكائنات دون التحقق من أن المستخدم الطالب مصرّح له بالوصول إلى ذلك الكائن المحدد.'
    },
    business_impact:{
      en:'Any authenticated user can access the data of any other user by modifying a single parameter. This allows mass extraction of user accounts, personal information, financial records, or confidential documents belonging to other customers. Depending on data types involved, this may constitute a personal data breach with GDPR or sector-specific regulatory notification obligations.',
      ar:'يمكن لأي مستخدم مصادَق عليه الوصول إلى بيانات أي مستخدم آخر بتعديل معامل واحد. يتيح هذا الاستخراج الجماعي لحسابات المستخدمين والمعلومات الشخصية والسجلات المالية أو الوثائق السرية للعملاء الآخرين. اعتماداً على أنواع البيانات المعنية، قد يُشكّل هذا خرقاً للبيانات الشخصية مع التزامات إخطار تنظيمية وفق GDPR أو تنظيمات القطاع.'
    },
    remediation:{
      en:'1. Implement server-side authorisation checks: before returning any object, verify that the authenticated user owns or has permission to access it.\n2. Replace sequential numeric IDs with non-guessable identifiers (UUIDs) — this alone is NOT sufficient but reduces discoverability.\n3. Implement audit logging for all sensitive object access.\n4. Conduct a full endpoint review: test all API endpoints that accept object identifiers.\n5. Consider indirect reference maps: map user-specific tokens to real object IDs server-side.',
      ar:'1. تطبيق فحوصات التفويض جانب الخادم: قبل إرجاع أي كائن، تحقق من أن المستخدم المصادَق عليه يملكه أو مصرّح له بالوصول إليه.\n2. استبدال المعرّفات الرقمية المتسلسلة بمعرّفات غير قابلة للتخمين (UUIDs) — هذا وحده لا يكفي لكنه يقلل من قابلية الاكتشاف.\n3. تطبيق تسجيل التدقيق لجميع عمليات الوصول للكائنات الحساسة.\n4. إجراء مراجعة كاملة لنقاط النهاية: اختبار جميع نقاط نهاية API التي تقبل معرّفات الكائنات.\n5. النظر في استخدام خرائط المراجع غير المباشرة: تعيين رموز خاصة بالمستخدم لمعرّفات الكائنات الحقيقية جانب الخادم.'
    }
  },
  {
    id:'tpl_ssrf',icon:'🌐',
    title:{en:'Server-Side Request Forgery (SSRF)',ar:'تزوير الطلب من جانب الخادم (SSRF)'},
    severity:'Critical',cvss:{AV:'N',AC:'L',PR:'N',UI:'N',S:'C',C:'H',I:'L',A:'N'},
    mitre:'T1190',mitre_name:'Exploit Public-Facing Application',
    description:{
      en:'A Server-Side Request Forgery vulnerability was identified in the {PARAMETER} parameter of {ENDPOINT}. The application fetches remote resources based on user-supplied URLs without adequate validation, allowing an attacker to coerce the server into making requests to arbitrary internal or external destinations.',
      ar:'تم تحديد ثغرة SSRF في معامل {PARAMETER} في {ENDPOINT}. يجلب التطبيق موارد بعيدة بناءً على عناوين URL المُقدَّمة من المستخدم دون التحقق الكافي، مما يسمح للمهاجم بإجبار الخادم على تقديم طلبات لوجهات داخلية أو خارجية عشوائية.'
    },
    business_impact:{
      en:'SSRF can be used to enumerate and access internal services that are not exposed to the internet (admin panels, monitoring tools, databases), read cloud metadata endpoints to obtain instance credentials (AWS IAM keys, Azure MSI tokens), bypass network-level security controls, and potentially achieve Remote Code Execution. In cloud environments, successful exploitation of SSRF against the metadata endpoint can lead to complete cloud account compromise.',
      ar:'يمكن استخدام SSRF لحصر والوصول إلى الخدمات الداخلية غير المعرّضة للإنترنت (لوحات الإدارة، أدوات المراقبة، قواعد البيانات)، وقراءة نقاط نهاية بيانات التعريف السحابية للحصول على بيانات اعتماد المثيل (مفاتيح AWS IAM، رموز Azure MSI)، وتجاوز ضوابط الأمان على مستوى الشبكة، وتحقيق تنفيذ الأوامر عن بُعد (RCE). في البيئات السحابية، قد يؤدي الاستغلال الناجح لـSSRF ضد نقطة نهاية بيانات التعريف إلى اختراق كامل للحساب السحابي.'
    },
    remediation:{
      en:'1. Validate and whitelist allowed URL schemes (https:// only, no file://, dict://, gopher://).\n2. Validate and whitelist allowed destinations — do not allow requests to private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16).\n3. Use a DNS allowlist to restrict which hostnames the application can reach.\n4. Disable unused URL schemes at the HTTP client library level.\n5. In cloud environments: restrict access to the metadata endpoint via host-based firewall rules (iptables/nftables) independently of application-level controls.',
      ar:'1. التحقق من وضع قائمة بيضاء لمخططات URL المسموح بها (https:// فقط، دون file:// أو dict:// أو gopher://).\n2. التحقق من وضع قائمة بيضاء للوجهات المسموح بها — عدم السماح بالطلبات لنطاقات IP الخاصة.\n3. استخدام قائمة DNS المسموح بها لتقييد أسماء المضيفين التي يمكن للتطبيق الوصول إليها.\n4. تعطيل مخططات URL غير المستخدمة على مستوى مكتبة HTTP client.\n5. في البيئات السحابية: تقييد الوصول لنقطة نهاية بيانات التعريف عبر قواعد جدار الحماية على مستوى المضيف بشكل مستقل عن ضوابط مستوى التطبيق.'
    }
  },
  {
    id:'tpl_missing_headers',icon:'🛡',
    title:{en:'Missing Security Headers',ar:'رؤوس أمان مفقودة'},
    severity:'Medium',cvss:{AV:'N',AC:'L',PR:'N',UI:'R',S:'C',C:'L',I:'L',A:'N'},
    mitre:'T1190',mitre_name:'Exploit Public-Facing Application',
    description:{
      en:'The application responses at {ENDPOINT} are missing multiple recommended security headers. The following headers were absent or misconfigured: {HEADERS}.',
      ar:'استجابات التطبيق في {ENDPOINT} تفتقر لعدة رؤوس أمان موصى بها. الرؤوس التالية غائبة أو مُهيَّأة بشكل خاطئ: {HEADERS}.'
    },
    business_impact:{
      en:'Missing security headers increase the attack surface for client-side attacks including clickjacking, MIME-type sniffing exploits, and cross-site scripting. While not directly exploitable in isolation, their absence removes layers of defence-in-depth that modern browsers provide, making other vulnerabilities easier to exploit and harder to defend.',
      ar:'رؤوس الأمان المفقودة تزيد من سطح الهجوم لهجمات جانب العميل بما في ذلك Clickjacking وثغرات MIME-type sniffing والبرمجة عبر المواقع. على الرغم من أنها لا يمكن استغلالها مباشرة بشكل منفرد، فإن غيابها يزيل طبقات الدفاع المتعمق التي توفرها المتصفحات الحديثة، مما يجعل الثغرات الأخرى أسهل للاستغلال وأصعب للدفاع.'
    },
    remediation:{
      en:'Add the following headers to all responses (can be configured at web server/load balancer level):\n- Content-Security-Policy: default-src \'self\'\n- X-Frame-Options: DENY\n- X-Content-Type-Options: nosniff\n- Referrer-Policy: strict-origin-when-cross-origin\n- Permissions-Policy: geolocation=(), microphone=(), camera=()\n- Strict-Transport-Security: max-age=31536000; includeSubDomains\n\nTest with securityheaders.com after implementation.',
      ar:'أضف الرؤوس التالية لجميع الاستجابات (يمكن تهيئتها على مستوى خادم الويب/موزّع الحمل):\n- Content-Security-Policy: default-src \'self\'\n- X-Frame-Options: DENY\n- X-Content-Type-Options: nosniff\n- Referrer-Policy: strict-origin-when-cross-origin\n- Permissions-Policy: geolocation=(), microphone=(), camera=()\n- Strict-Transport-Security: max-age=31536000; includeSubDomains\n\nاختبر على securityheaders.com بعد التطبيق.'
    }
  },
  {
    id:'tpl_default_creds',icon:'🔑',
    title:{en:'Default Credentials',ar:'بيانات اعتماد افتراضية'},
    severity:'Critical',cvss:{AV:'N',AC:'L',PR:'N',UI:'N',S:'U',C:'H',I:'H',A:'H'},
    mitre:'T1078',mitre_name:'Valid Accounts',
    description:{
      en:'The {SYSTEM/APPLICATION} was found to be accessible using default vendor credentials ({USERNAME}/{PASSWORD}). Default credentials were not changed during deployment.',
      ar:'تبيّن أن {النظام/التطبيق} يمكن الوصول إليه باستخدام بيانات اعتماد البائع الافتراضية ({USERNAME}/{PASSWORD}). لم يتم تغيير بيانات الاعتماد الافتراضية أثناء النشر.'
    },
    business_impact:{
      en:'Any attacker with knowledge of the system vendor and access to the internet can authenticate to this system with administrative privileges. Default credential lists are publicly available and routinely used by automated scanning tools. This provides immediate, unrestricted administrative access without any exploitation skills required.',
      ar:'يمكن لأي مهاجم يعرف بائع النظام ولديه وصول للإنترنت المصادقة على هذا النظام بامتيازات إدارية. قوائم بيانات الاعتماد الافتراضية متاحة للعموم وتُستخدم بشكل روتيني من أدوات المسح الآلي. يوفر هذا وصولاً إدارياً فورياً غير مقيّد دون الحاجة لأي مهارات استغلال.'
    },
    remediation:{
      en:'1. Change all default credentials immediately — apply to ALL instances of this system in the environment, not just the one tested.\n2. Implement a credential change policy for all newly deployed systems before they reach production.\n3. Conduct an inventory scan of all similar systems across the network using tools like Shodan (external) and Nessus (internal) to identify other instances with default credentials.\n4. Implement network segmentation: management interfaces should not be directly accessible from general user networks.\n5. Enable authentication logging and alert on administrative logins.',
      ar:'1. قم بتغيير جميع بيانات الاعتماد الافتراضية فوراً — طبّق على جميع نسخ هذا النظام في البيئة، وليس فقط النسخة المختبرة.\n2. تطبيق سياسة تغيير بيانات الاعتماد لجميع الأنظمة المُنشأة حديثاً قبل وصولها للإنتاج.\n3. إجراء مسح جرد لجميع الأنظمة المماثلة عبر الشبكة.\n4. تطبيق تجزئة الشبكة: لا ينبغي أن تكون واجهات الإدارة متاحة مباشرة من شبكات المستخدمين العامة.\n5. تفعيل تسجيل المصادقة والتنبيه على عمليات تسجيل الدخول الإدارية.'
    }
  }
];

function openFindingFromTemplate(tplId){
  var tpl=FINDING_TEMPLATES.find(function(t){return t.id===tplId;});
  if(!tpl)return;
  var f={
    id:genId(),
    title:tx(tpl.title),
    severity:tpl.severity,
    status:'Open',
    affected:'',
    description:tx(tpl.description),
    business_impact:tx(tpl.business_impact),
    evidence:'',
    remediation:tx(tpl.remediation),
    mitre:tpl.mitre||'',
    mitre_name:tpl.mitre_name||'',
    cvss_score:'',cvss_vector:'',
    created:Date.now(),
    cvss:tpl.cvss||{AV:'N',AC:'L',PR:'N',UI:'N',S:'U',C:'H',I:'H',A:'H'}
  };
  f.cvss_score=calcCVSS(f.cvss);
  APP.editFinding=f;
  CURR_CVSS=Object.assign({},f.cvss);
  MITRE_SEARCH='';
  renderFindingPanel();
  // close template picker
  document.getElementById('tpl_picker')&&document.getElementById('tpl_picker').remove();
}

function showTemplatePicker(){
  var existing=document.getElementById('tpl_picker');
  if(existing){existing.remove();return;}
  var el=document.createElement('div');
  el.id='tpl_picker';
  el.style.cssText='position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.65);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);padding:20px';
  var h='<div style="background:var(--s1);border:1px solid var(--bdr);border-radius:12px;width:100%;max-width:440px;max-height:80vh;overflow-y:auto;padding:20px">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
    +'<div style="font-size:15px;font-weight:700;color:var(--t1)">'+t('templates_title')+'</div>'
    +'<button class="btn sm" onclick="document.getElementById(\'tpl_picker\').remove()">&#10005;</button>'
    +'</div>';
  FINDING_TEMPLATES.forEach(function(tpl){
    var cvss=calcCVSS(tpl.cvss||{AV:'N',AC:'L',PR:'N',UI:'N',S:'U',C:'H',I:'H',A:'H'});
    var sev=cvssToSev(cvss);
    var col=SEV_COLORS[sev]||'#475569';
    h+='<div onclick="openFindingFromTemplate(\''+tpl.id+'\')" style="background:var(--s2);border:1px solid var(--bdr);border-left:3px solid '+col+';border-radius:8px;padding:11px 14px;margin-bottom:7px;cursor:pointer;display:flex;align-items:center;gap:12px;transition:border-color .15s" onmouseover="this.style.borderColor=\''+col+'\'" onmouseout="this.style.borderColor=\'var(--bdr)\'">'
      +'<span style="font-size:20px">'+tpl.icon+'</span>'
      +'<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;color:var(--t1)">'+esc(tx(tpl.title))+'</div>'
      +'<div style="font-size:10px;color:var(--t3);margin-top:2px">CVSS '+cvss+' &nbsp;·&nbsp; <span style="color:'+col+'">'+sev+'</span></div>'
      +'</div><span style="font-size:16px;color:var(--t3)">&#8250;</span>'
      +'</div>';
  });
  h+='<div style="font-size:10px;color:var(--t3);text-align:center;margin-top:8px">'+t('templates_note')+'</div>';
  h+='</div>';
  el.innerHTML=h;
  el.addEventListener('click',function(e){if(e.target===el)el.remove();});
  document.body.appendChild(el);
}
