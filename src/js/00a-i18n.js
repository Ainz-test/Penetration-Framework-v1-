/* ── i18n: translation dictionary + helpers ──────────────────────────────
   t(key)      -> UI chrome string in current language
   tx(field)   -> bilingual DATA field {en,ar} -> current language (falls back
                  to plain string for any field not yet converted, or to .en)
   setLang(l)  -> switch language, persist, flip RTL, re-render current view
   Executable syntax (commands, flags, payload strings, install commands,
   tool names) is intentionally NEVER translated — see README. */

var I18N = {
  // topbar / nav
  app_title:{en:'PenTest Pro',ar:'بن تست برو'},
  search_ph:{en:'Search commands...',ar:'ابحث في الأوامر...'},
  nav_framework:{en:'Framework',ar:'الإطار'},
  nav_findings:{en:'Findings',ar:'النتائج'},
  nav_scope:{en:'Scope',ar:'النطاق'},
  nav_tools:{en:'Tools',ar:'الأدوات'},
  nav_payloads:{en:'Payloads',ar:'الحمولات'},
  nav_report:{en:'Report',ar:'التقرير'},
  nav_killchain:{en:'Kill Chain',ar:'سلسلة الهجوم'},
  nav_timer:{en:'Timer',ar:'المؤقت'},
  nav_profiles:{en:'Profiles',ar:'الملفات'},
  nav_settings:{en:'AI + Settings',ar:'الذكاء الاصطناعي والإعدادات'},
  loading:{en:'Loading...',ar:'جارٍ التحميل...'},

  // framework: tabs / step nav / commands
  tab_commands:{en:'Commands',ar:'الأوامر'},
  tab_checklist:{en:'Checklist',ar:'قائمة المهام'},
  tab_info:{en:'Info',ar:'معلومات'},
  tab_notes:{en:'Notes',ar:'الملاحظات'},
  tab_search_results:{en:'Search Results',ar:'نتائج البحث'},
  no_commands_step:{en:'No commands for this step',ar:'لا توجد أوامر لهذه الخطوة'},
  example_lbl:{en:'EXAMPLE',ar:'مثال'},
  flags_details:{en:'FLAGS & DETAILS',ar:'الخيارات والتفاصيل'},
  tip_lbl:{en:'TIP',ar:'ملاحظة'},
  out_lbl:{en:'OUT',ar:'الناتج'},
  complete_lbl:{en:'COMPLETE',ar:'مكتمل'},
  check_all:{en:'Check All',ar:'تحديد الكل'},
  uncheck_all:{en:'Uncheck All',ar:'إلغاء تحديد الكل'},
  elite_tip:{en:'ELITE TIP',ar:'نصيحة احترافية'},
  deliverable_lbl:{en:'DELIVERABLE',ar:'المُخرجات'},
  tools_used:{en:'TOOLS USED',ar:'الأدوات المستخدمة'},
  no_info_step:{en:'No additional info for this step',ar:'لا توجد معلومات إضافية لهذه الخطوة'},
  engagement_notes:{en:'ENGAGEMENT NOTES',ar:'ملاحظات المهمة'},
  notes_placeholder:{en:'Record your findings, observations, and evidence for this step...\n\nUse this for custom commands, discovered credentials, scope-specific notes...',ar:'سجّل ملاحظاتك ونتائجك وأدلتك لهذه الخطوة...\n\nاستخدم هذا الحقل للأوامر المخصصة، بيانات الاعتماد المكتشفة، وملاحظات خاصة بالنطاق...'},
  notes_autosave:{en:'Notes auto-save per step. Export in Report section.',ar:'يتم حفظ الملاحظات تلقائياً لكل خطوة. صدّرها من قسم التقرير.'},
  results_for:{en:'results for',ar:'نتيجة لـ'},
  no_search_match:{en:'No commands match your search',ar:'لا توجد أوامر مطابقة لبحثك'},
  prev_btn:{en:'Prev',ar:'السابق'},
  next_btn:{en:'Next',ar:'التالي'},
  engagement_name_prompt:{en:'Engagement name:',ar:'اسم المهمة:'},
  reset_confirm:{en:'Reset ALL progress for this profile? This cannot be undone.',ar:'إعادة تعيين كل التقدم لهذا الملف؟ لا يمكن التراجع عن هذا الإجراء.'},
  copy_btn:{en:'Copy',ar:'نسخ'},
  copied_btn:{en:'Copied!',ar:'تم النسخ!'},

  // findings
  findings_title:{en:'Findings Tracker',ar:'متتبع الثغرات'},
  add_finding:{en:'+ Add Finding',ar:'+ إضافة ثغرة'},
  findings_count:{en:'findings',ar:'ثغرة'},
  no_findings_yet:{en:'No findings yet.',ar:'لا توجد ثغرات بعد.'},
  click_add_finding:{en:'Click "Add Finding" to log your first vulnerability.',ar:'اضغط "إضافة ثغرة" لتسجيل أول ثغرة.'},
  summary_lbl:{en:'Summary',ar:'الملخص'},
  open_lbl:{en:'Open',ar:'مفتوحة'},
  fixed_lbl:{en:'Fixed',ar:'تم الإصلاح'},
  risk_accepted_lbl:{en:'Risk Accepted',ar:'المخاطرة مقبولة'},
  all_lbl:{en:'All',ar:'الكل'},
  edit_finding:{en:'Edit Finding',ar:'تعديل الثغرة'},
  new_finding:{en:'New Finding',ar:'ثغرة جديدة'},
  delete_btn:{en:'Delete',ar:'حذف'},
  save_btn:{en:'Save',ar:'حفظ'},
  finding_title_lbl:{en:'Finding Title',ar:'عنوان الثغرة'},
  finding_title_ph:{en:'e.g. SQL Injection on Login Endpoint',ar:'مثال: حقن SQL في صفحة تسجيل الدخول'},
  status_lbl:{en:'Status',ar:'الحالة'},
  affected_lbl:{en:'Affected System / URL',ar:'النظام / الرابط المتأثر'},
  cvss_calc_title:{en:'CVSS 3.1 Calculator',ar:'حاسبة CVSS 3.1'},
  attack_vector:{en:'Attack Vector',ar:'متجه الهجوم'},
  attack_complexity:{en:'Attack Complexity',ar:'تعقيد الهجوم'},
  privileges_required:{en:'Privileges Required',ar:'الصلاحيات المطلوبة'},
  user_interaction:{en:'User Interaction',ar:'تفاعل المستخدم'},
  scope_metric:{en:'Scope',ar:'النطاق (Scope)'},
  confidentiality:{en:'Confidentiality',ar:'السرية'},
  integrity:{en:'Integrity',ar:'السلامة'},
  availability:{en:'Availability',ar:'التوافر'},
  cvss_network:{en:'Network',ar:'شبكة'},
  cvss_adjacent:{en:'Adjacent',ar:'مجاورة'},
  cvss_local:{en:'Local',ar:'محلي'},
  cvss_physical:{en:'Physical',ar:'فعلي'},
  cvss_low:{en:'Low',ar:'منخفض'},
  cvss_high:{en:'High',ar:'مرتفع'},
  cvss_none:{en:'None',ar:'لا شيء'},
  cvss_required:{en:'Required',ar:'مطلوب'},
  cvss_unchanged:{en:'Unchanged',ar:'بدون تغيير'},
  cvss_changed:{en:'Changed',ar:'متغيّر'},
  mitre_technique:{en:'MITRE ATT&CK Technique',ar:'أسلوب MITRE ATT&CK'},
  clear_btn:{en:'Clear',ar:'مسح'},
  search_techniques_ph:{en:'Search techniques...',ar:'ابحث في الأساليب...'},
  technical_desc:{en:'Technical Description',ar:'الوصف التقني'},
  technical_desc_ph:{en:'Describe the vulnerability, how it was found, and the technical details...',ar:'صف الثغرة، كيف تم اكتشافها، والتفاصيل التقنية...'},
  business_impact_lbl:{en:'Business Impact',ar:'الأثر على الأعمال'},
  ai_generate:{en:'AI Generate',ar:'توليد بالذكاء الاصطناعي'},
  business_impact_ph:{en:'Translate this finding into CEO language. What is the financial, reputational, and compliance risk?\n\nClick AI Generate to auto-create from the description above...',ar:'حوّل هذه الثغرة إلى لغة يفهمها المدير التنفيذي. ما هو الخطر المالي والسمعي والامتثالي؟\n\nاضغط "توليد بالذكاء الاصطناعي" لإنشائه تلقائياً من الوصف أعلاه...'},
  generating_impact:{en:'Generating business impact...',ar:'جارٍ توليد الأثر على الأعمال...'},
  evidence_lbl:{en:'Evidence / Proof of Concept',ar:'الدليل / إثبات المفهوم'},
  evidence_ph:{en:'Request/response, screenshots description, payload used, tool output...',ar:'الطلب/الاستجابة، وصف لقطات الشاشة، الحمولة المستخدمة، ناتج الأداة...'},
  remediation_lbl:{en:'Remediation',ar:'الإصلاح'},
  ai_enhance:{en:'AI Enhance',ar:'تحسين بالذكاء الاصطناعي'},
  remediation_ph:{en:'Specific remediation steps — patches, config changes, code fixes, timeline, responsible team...\n\nClick AI Enhance to improve this to elite quality...',ar:'خطوات إصلاح محددة — تحديثات، تغييرات إعدادات، إصلاحات كود، الجدول الزمني، الفريق المسؤول...\n\nاضغط "تحسين بالذكاء الاصطناعي" للوصول لجودة احترافية...'},
  enhancing_remediation:{en:'Enhancing remediation...',ar:'جارٍ تحسين الإصلاح...'},
  untitled_finding:{en:'Untitled Finding',ar:'ثغرة بدون عنوان'},
  delete_finding_confirm:{en:'Delete this finding?',ar:'حذف هذه الثغرة؟'},

  // severity / status display labels (internal keys stay English)
  sev_critical:{en:'Critical',ar:'حرجة'},
  sev_high:{en:'High',ar:'عالية'},
  sev_medium:{en:'Medium',ar:'متوسطة'},
  sev_low:{en:'Low',ar:'منخفضة'},
  sev_info:{en:'Info',ar:'معلوماتية'},
  pri_critical:{en:'critical',ar:'حرجة'},
  pri_high:{en:'high',ar:'عالية'},
  pri_medium:{en:'medium',ar:'متوسطة'},
  pri_low:{en:'low',ar:'منخفضة'},

  // scope
  scope_title:{en:'Scope Manager',ar:'مدير النطاق'},
  scope_subtitle:{en:'Engagement scope, targets, contacts. Reference this during the test.',ar:'نطاق المهمة، الأهداف، جهات الاتصال. ارجع لهذا أثناء الاختبار.'},
  save_btn2:{en:'Save',ar:'حفظ'},
  saved_flash:{en:'Saved!',ar:'تم الحفظ!'},
  engagement_info:{en:'Engagement Info',ar:'معلومات المهمة'},
  client_name:{en:'Client Name',ar:'اسم العميل'},
  client_name_ph:{en:'Acme Corporation',ar:'اسم الشركة'},
  test_type:{en:'Test Type',ar:'نوع الاختبار'},
  start_date:{en:'Start Date',ar:'تاريخ البدء'},
  end_date:{en:'End Date',ar:'تاريخ الانتهاء'},
  in_scope:{en:'In-Scope',ar:'ضمن النطاق'},
  out_of_scope:{en:'Out of Scope',ar:'خارج النطاق'},
  in_scope_ph:{en:'IP, CIDR, or domain...',ar:'عنوان IP أو نطاق CIDR أو دومين...'},
  oos_ph:{en:'Excluded IP, domain, system...',ar:'عنوان IP أو دومين أو نظام مستثنى...'},
  testing_windows:{en:'Testing Windows',ar:'نوافذ الاختبار'},
  testing_window_ph:{en:'e.g. Mon-Fri 18:00-06:00 UTC',ar:'مثال: الإثنين-الجمعة 18:00-06:00 UTC'},
  emergency_contacts:{en:'Emergency Contacts',ar:'جهات اتصال الطوارئ'},
  name_ph:{en:'Name',ar:'الاسم'},
  role_ph:{en:'Role (CISO)',ar:'المنصب (مدير أمن المعلومات)'},
  quick_reference:{en:'Quick Reference',ar:'مرجع سريع'},
  scope_qr_inscope:{en:'IN-SCOPE',ar:'ضمن النطاق'},
  scope_qr_oos:{en:'OOS',ar:'خارج النطاق'},
  scope_qr_window:{en:'WINDOW',ar:'النافذة'},
  scope_qr_emergency:{en:'EMERGENCY',ar:'الطوارئ'},
  test_type_blackbox:{en:'Black Box',ar:'الصندوق الأسود'},
  test_type_greybox:{en:'Grey Box',ar:'الصندوق الرمادي'},
  test_type_whitebox:{en:'White Box',ar:'الصندوق الأبيض'},
  test_type_redteam:{en:'Red Team',ar:'الفريق الأحمر'},
  test_type_physical:{en:'Physical',ar:'اختبار فعلي'},
  test_type_socialeng:{en:'Social Engineering',ar:'الهندسة الاجتماعية'},

  // tools
  tools_title:{en:'Tools Guide',ar:'دليل الأدوات'},
  tools_subtitle:{en:'Installation, verification & config for every tool. One-tap copy.',ar:'التثبيت والتحقق والإعداد لكل أداة. نسخ بضغطة واحدة.'},
  search_tools_ph:{en:'Search tools...',ar:'ابحث في الأدوات...'},
  no_tools_match:{en:'No tools match your search.',ar:'لا توجد أدوات مطابقة لبحثك.'},
  free_lbl:{en:'FREE',ar:'مجاني'},
  paid_lbl:{en:'PAID',ar:'مدفوع'},

  // payloads
  payloads_title:{en:'Payload Quick-Reference',ar:'مرجع الحمولات السريع'},
  categories_lbl:{en:'categories',ar:'فئة'},

  // report
  report_title:{en:'Report Generator',ar:'مولّد التقارير'},
  report_subtitle:{en:'Auto-generated from your findings and scope data',ar:'يُنشأ تلقائياً من بيانات الثغرات والنطاق'},
  download_md:{en:'Download .md',ar:'تنزيل .md'},
  tester_lbl:{en:'Tester:',ar:'الفاحص:'},
  tester_ph:{en:'Your Name',ar:'اسمك'},
  date_lbl:{en:'Date:',ar:'التاريخ:'},
  refresh_btn:{en:'Refresh',ar:'تحديث'},
  report_lang_lbl:{en:'Report language:',ar:'لغة التقرير:'},

  // kill chain
  killchain_title:{en:'Attack Kill Chain',ar:'سلسلة الهجوم'},
  killchain_subtitle:{en:'Map your attack steps across the cyber kill chain — link to findings',ar:'تتبّع خطوات الهجوم عبر سلسلة القتل السيبرانية — اربطها بالثغرات'},
  export_btn:{en:'Export',ar:'تصدير'},
  add_step:{en:'+ Add step',ar:'+ إضافة خطوة'},
  executive_narrative:{en:'Executive Narrative',ar:'السرد التنفيذي'},
  killchain_narr_ph:{en:'Describe the full attack chain in executive language...\n\nClick \'AI Generate\' to auto-create from your kill chain stages above.',ar:'صف سلسلة الهجوم الكاملة بلغة تنفيذية...\n\nاضغط "توليد بالذكاء الاصطناعي" لإنشائها تلقائياً من مراحل السلسلة أعلاه.'},
  killchain_narr_footer:{en:'This narrative will be included in your generated report.',ar:'سيتم تضمين هذا السرد في تقريرك المُنشأ.'},
  add_step_prompt:{en:'Add step to',ar:'إضافة خطوة إلى'},
  kc_copied_alert:{en:'Kill chain copied to clipboard!',ar:'تم نسخ سلسلة الهجوم إلى الحافظة!'},
  kc_stage_recon:{en:'Reconnaissance',ar:'الاستطلاع'},
  kc_stage_weapon:{en:'Weaponization',ar:'التسليح'},
  kc_stage_delivery:{en:'Delivery',ar:'التوصيل'},
  kc_stage_exploit:{en:'Exploitation',ar:'الاستغلال'},
  kc_stage_install:{en:'Installation',ar:'التثبيت'},
  kc_stage_c2:{en:'Command & Control',ar:'القيادة والتحكم'},
  kc_stage_actions:{en:'Actions on Objectives',ar:'تنفيذ الأهداف'},

  // timer
  timer_title:{en:'Time Tracker',ar:'متتبع الوقت'},
  clear_log:{en:'Clear Log',ar:'مسح السجل'},
  no_timer_running:{en:'No timer running',ar:'لا يوجد مؤقت قيد التشغيل'},
  stop_btn:{en:'Stop',ar:'إيقاف'},
  start_timer_btn:{en:'Start Timer',ar:'بدء المؤقت'},
  no_sessions_yet:{en:'No sessions logged yet. Start a timer above.',ar:'لا توجد جلسات مسجلة بعد. ابدأ مؤقتاً أعلاه.'},
  total_engagement_time:{en:'Total Engagement Time',ar:'إجمالي وقت المهمة'},
  clear_timer_confirm:{en:'Clear all timer sessions?',ar:'مسح كل جلسات المؤقت؟'},

  // profiles
  profiles_title:{en:'Engagement Profiles',ar:'ملفات المهام'},
  profiles_subtitle:{en:'Switch between clients. Each profile has independent findings, scope, notes, and progress.',ar:'بدّل بين العملاء. كل ملف له ثغراته ونطاقه وملاحظاته وتقدمه الخاص.'},
  new_profile:{en:'+ New Profile',ar:'+ ملف جديد'},
  active_lbl:{en:'Active',ar:'نشط'},
  findings_count2:{en:'findings',ar:'ثغرة'},
  created_lbl:{en:'Created',ar:'أُنشئ في'},
  switch_btn:{en:'Switch',ar:'تبديل'},
  how_profiles_work:{en:'How profiles work:',ar:'كيف تعمل الملفات:'},
  profiles_desc1:{en:'Each profile stores its own findings, scope, notes, timer sessions, and framework progress completely independently.',ar:'يحتفظ كل ملف بثغراته ونطاقه وملاحظاته وجلسات مؤقته وتقدمه في الإطار بشكل مستقل تماماً.'},
  profiles_desc2:{en:'Use one profile per client engagement. Switch instantly without losing any data.',ar:'استخدم ملفاً واحداً لكل مهمة عميل. بدّل فوراً دون فقدان أي بيانات.'},
  engagement_name_prompt2:{en:'Engagement name:',ar:'اسم المهمة:'},
  delete_profile_confirm:{en:'Delete this profile and ALL its data?',ar:'حذف هذا الملف وكل بياناته؟'},

  // settings
  settings_title:{en:'AI + Settings',ar:'الذكاء الاصطناعي والإعدادات'},
  ai_features_title:{en:'AI Features (Claude API)',ar:'ميزات الذكاء الاصطناعي (Claude API)'},
  key_saved:{en:'Key saved',ar:'تم حفظ المفتاح'},
  no_key_disabled:{en:'No key — features disabled',ar:'لا يوجد مفتاح — الميزات معطلة'},
  ai_unlocks_title:{en:'What AI Unlocks',ar:'ما الذي يفتحه الذكاء الاصطناعي'},
  ai_unlocks_body:{en:'Business Impact — Convert technical findings to CEO language<br>Remediation Quality — Basic fix → elite actionable steps<br>Kill Chain Narrative — Attack story for executives<br><br>Requires an Anthropic API key + a small Vercel proxy function.',ar:'الأثر على الأعمال — تحويل الثغرات التقنية إلى لغة يفهمها المدير التنفيذي<br>جودة الإصلاح — من إصلاح بسيط إلى خطوات احترافية قابلة للتنفيذ<br>سرد سلسلة الهجوم — قصة الهجوم لصناع القرار<br><br>يتطلب مفتاح Anthropic API ودالة وكيل صغيرة على Vercel.'},
  api_endpoint_lbl:{en:'API Endpoint (default: /api/chat — your Vercel function)',ar:'نقطة نهاية API (الافتراضي: /api/chat — دالة Vercel الخاصة بك)'},
  api_key_lbl:{en:'Anthropic API Key (stored locally only)',ar:'مفتاح Anthropic API (يُحفظ محلياً فقط)'},
  test_ai_connection:{en:'Test AI Connection',ar:'اختبار اتصال الذكاء الاصطناعي'},
  vercel_setup_title:{en:'Vercel Proxy Function Setup',ar:'إعداد دالة الوكيل على Vercel'},
  copy_code:{en:'Copy Code',ar:'نسخ الكود'},
  vercel_step1:{en:'Step 1: Create',ar:'الخطوة 1: أنشئ'},
  vercel_step1b:{en:'in your Vercel project root',ar:'في جذر مشروع Vercel'},
  vercel_step2:{en:'Step 2: Add env var',ar:'الخطوة 2: أضف متغير البيئة'},
  vercel_step2b:{en:'in Vercel dashboard',ar:'في لوحة تحكم Vercel'},
  vercel_step3:{en:'Step 3: Deploy. The AI buttons will now work on your deployed site.',ar:'الخطوة 3: انشر المشروع. ستعمل أزرار الذكاء الاصطناعي الآن على موقعك المنشور.'},
  framework_settings:{en:'Framework Settings',ar:'إعدادات الإطار'},
  reset_progress_btn:{en:'Reset All Framework Progress (current profile)',ar:'إعادة تعيين كل تقدم الإطار (الملف الحالي)'},
  export_backup_btn:{en:'Export All Data (JSON backup)',ar:'تصدير كل البيانات (نسخة احتياطية JSON)'},
  testing_status:{en:'Testing...',ar:'جارٍ الاختبار...'},
  language_lbl:{en:'Language',ar:'اللغة'},

  // AI errors / misc alerts
  ai_no_key_error:{en:'No API key. Add your Anthropic API key in AI + Settings.',ar:'لا يوجد مفتاح API. أضف مفتاح Anthropic API في قسم الذكاء الاصطناعي والإعدادات.'},
  ai_error_prefix:{en:'AI Error:',ar:'خطأ في الذكاء الاصطناعي:'},
  add_title_desc_first:{en:'Add a title and description first.',ar:'أضف عنواناً ووصفاً أولاً.'},
  add_title_first:{en:'Add a finding title first.',ar:'أضف عنوان الثغرة أولاً.'},
  add_kc_stages_first:{en:'Add some kill chain stages first.',ar:'أضف بعض مراحل سلسلة الهجوم أولاً.'}
};

function t(key){
  var entry=I18N[key];
  if(!entry)return key;
  return entry[APP.lang]||entry.en||key;
}

function tx(field){
  if(field==null)return '';
  if(typeof field==='string')return field;
  if(typeof field==='object')return field[APP.lang]||field.en||'';
  return String(field);
}

function applyStaticTranslations(){
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    el.textContent=t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
    el.setAttribute('placeholder',t(el.getAttribute('data-i18n-ph')));
  });
}

function setLang(lang){
  APP.lang=lang;
  localStorage.setItem('apt_lang',lang);
  document.documentElement.setAttribute('lang',lang);
  document.documentElement.setAttribute('dir',lang==='ar'?'rtl':'ltr');
  document.body.classList.toggle('rtl',lang==='ar');
  applyStaticTranslations();
  var langBtn=document.getElementById('langbtn');
  if(langBtn)langBtn.textContent=lang==='ar'?'EN':'AR';
  if(typeof setSection==='function')setSection(APP.section);
}
