function curLang(){return localStorage.getItem("35-iris-lang")||"en";}
var I18N={
en:{
no:"no",yes:"yes",idk:"not sure",reset:"Reset answers",
devices_q:"Apple ID -> Devices: a phone, iPad, or Mac you do not own?",devices_p:"Settings -> [your name] -> Devices",
mdm_q:"A configuration profile or MDM you did not install?",mdm_p:"Settings -> General -> VPN & Device Management",
ext_q:"A Safari extension you do not remember installing?",ext_p:"Settings -> Apps -> Safari -> Extensions",
chat_q:"A second phone or browser linked to WhatsApp / iMessage / Telegram?",chat_p:"WhatsApp -> Settings -> Linked devices",
mail_q:"Mail forwarding or a filter you did not set?",mail_p:"Gmail / iCloud Mail filters. Look only.",
screen_q:"Screen Sharing or a remote-view app you did not turn on?",screen_p:"Settings -> Screen Time -> unknown apps",
shareplay_q:"Did anyone ask you to share the screen to fix the wallet?",shareplay_p:"Control Center -> Screen Mirroring. Decline helpers.",
profile_q:"Did anyone send a settings profile file (.mobileconfig)?",profile_p:"Mail / Files / Safari downloads. Do not install.",
gdev_q:"Google account -> Devices: a phone or browser you do not own?",gdev_p:"Settings -> Google -> Manage account -> Security -> Your devices",
admin_q:"A device-admin app you did not grant?",admin_p:"Settings -> Security -> Device admin apps",
acc_q:"An Accessibility service you did not install?",acc_p:"Settings -> Accessibility",
special_q:"Display-over-apps or install-unknown-apps you did not allow?",special_p:"Settings -> Apps -> Special app access",
apk_q:"Did someone send an APK or a cleaner to check the phone?",apk_p:"Do not install. That is the intermediary.",
notif_q:"Notification access for an app you do not know?",notif_p:"Settings -> Apps -> Special app access -> Notification access",
fwd_q:"Gmail forwarding or a filter you did not set?",fwd_p:"Gmail -> Settings -> Forwarding and filters"
},
ar:{
no:"لا",yes:"نعم",idk:"غير متأكد",reset:"إعادة الإجابات",
devices_q:"Apple ID → الأجهزة: هاتف أو آيباد أو ماك ليس لك؟",devices_p:"الإعدادات → [اسمك] → الأجهزة",
mdm_q:"ملف إعداد أو MDM لم تثبّته؟",mdm_p:"الإعدادات → عام → VPN وإدارة الجهاز",
ext_q:"إضافة سفاري لا تذكر تثبيتها؟",ext_p:"الإعدادات → التطبيقات → Safari → الإضافات",
chat_q:"هاتف أو متصفح ثانٍ مربوط بواتساب / آيمسج / تيليجرام؟",chat_p:"واتساب → الإعدادات → الأجهزة المربوطة",
mail_q:"تحويل بريد أو فلتر لم تضعه؟",mail_p:"فلاتر Gmail / iCloud. انظر فقط.",
screen_q:"مشاركة شاشة أو تطبيق رؤية عن بعد لم تشغّله؟",screen_p:"الإعدادات → وقت الشاشة → تطبيقات مجهولة",
shareplay_q:"هل طلب أحد مشاركة الشاشة لإصلاح المحفظة؟",shareplay_p:"مركز التحكم → عكس الشاشة. ارفض المساعد.",
profile_q:"هل أرسل أحد ملف إعدادات (.mobileconfig)؟",profile_p:"البريد / الملفات / تحميلات سفاري. لا تثبّت.",
gdev_q:"حساب Google → الأجهزة: هاتف أو متصفح ليس لك؟",gdev_p:"الإعدادات → Google → إدارة الحساب → الأمان → أجهزتك",
admin_q:"تطبيق مشرف جهاز لم تمنحه؟",admin_p:"الإعدادات → الأمان → تطبيقات مشرف الجهاز",
acc_q:"خدمة إمكانية لم تثبّتها؟",acc_p:"الإعدادات → الإمكانية",
special_q:"الظهور فوق التطبيقات أو تثبيت مجهول لم تسمح به؟",special_p:"الإعدادات → التطبيقات → وصول خاص",
apk_q:"هل أرسل أحد ملف APK أو برنامج تنظيف؟",apk_p:"لا تثبّت. هذا هو الوسيط.",
notif_q:"وصول للإشعارات لتطبيق لا تعرفه؟",notif_p:"الإعدادات → التطبيقات → وصول خاص → الإشعارات",
fwd_q:"تحويل Gmail أو فلتر لم تضعه؟",fwd_p:"Gmail → الإعدادات → التحويل والفلاتر"
}
};
I18N.ru=I18N.en;I18N.zh=I18N.en;I18N.de=I18N.en;I18N.es=I18N.en;
I18N.ru.no="нет";I18N.ru.yes="да";I18N.ru.idk="не уверен";
I18N.de.no="nein";I18N.de.yes="ja";I18N.de.idk="unsicher";
I18N.es.no="no";I18N.es.yes="sí";I18N.es.idk="no sé";
I18N.zh.no="否";I18N.zh.yes="是";I18N.zh.idk="不确定";
function t(id){var L=curLang();return (I18N[L]&&I18N[L][id])||I18N.en[id]||id;}
