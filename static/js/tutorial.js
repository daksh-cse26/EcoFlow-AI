/**
 * EcoFlow AI - Interactive Step-by-Step Tutorial Guide & Feature Video Demonstrations
 * Fully localized across all 19 supported Indian regional and global languages.
 * Automatically updates text, audio captions, and voiceover in real-time when
 * the application language changes.
 * STRICT REQUIREMENT: Only enabled and visible in Household and Field Collector interfaces.
 */

class TutorialController {
  constructor() {
    this.currentContext = null; // 'household' or 'collector'
    this.currentStepIndex = 0;
    this.isPlayingVideo = false;
    this.videoTimer = null;
    this.videoCurrentTime = 0;
    this.videoDuration = 20;
    this.videoSpeed = 1.0;
    this.videoVoiceoverEnabled = true;
    this.activeVideoKey = null;
    this.isSpeakingGuide = false;

    // Household Tutorial Base Steps (IDs and Selectors)
    this.householdBaseSteps = [
      { id: "hh_impact", targetSelector: ".impact-grid", videoKey: "hh_impact", icon: "⚖️" },
      { id: "hh_scanner", targetSelector: "#hh-tab-scan", videoKey: "hh_scanner", icon: "🎯" },
      { id: "hh_pickup", targetSelector: "#hh-tab-pickups", videoKey: "hh_pickup", icon: "📦" },
      { id: "hh_settlement", targetSelector: "#hh-tab-settlement", videoKey: "hh_settlement", icon: "🎉" },
      { id: "hh_rewards", targetSelector: "#hh-tab-rewards", videoKey: "hh_rewards", icon: "🎙️" }
    ];

    // Field Collector Tutorial Base Steps
    this.collectorBaseSteps = [
      { id: "col_modes", targetSelector: ".portal-subnav-bar", videoKey: "col_modes", icon: "🚚" },
      { id: "col_assignment", targetSelector: "#collector-pane-mode1", videoKey: "col_assignment", icon: "🏠" },
      { id: "col_seallot", targetSelector: ".hub-card", videoKey: "col_seallot", icon: "🏷️" },
      { id: "col_transfer", targetSelector: ".hub-card", videoKey: "col_transfer", icon: "🏭" },
      { id: "col_grassroots", targetSelector: "#collector-pane-mode1", videoKey: "col_grassroots", icon: "📴" }
    ];

    this.initMultilingualData();
  }

  initMultilingualData() {
    // -------------------------------------------------------------
    // Multilingual Step Texts for Household (5 Steps)
    // -------------------------------------------------------------
    this.householdStepsI18n = {
      en: [
        { title: "🌱 1. Verified Recycling Impact", desc: "Track verified kilograms of scrap, total pickups, your segregation cleanliness score (up to 100), and weight matches in real-time." },
        { title: "📸 2. Local AI Waste Scanner", desc: "Scan scrap using on-device regional AI neural models (Copper, PCB, Newspaper, PET, Aluminium) for instant segregation advice and price estimation." },
        { title: "📅 3. Schedule Doorstep Pickup", desc: "Book a certified field collector pickup in seconds. Pick your address, select convenient date and time, and receive smart coordinator dispatch." },
        { title: "🧾 4. Transparent Settlement Formula", desc: "Never get cheated on scrap prices! Settlements strictly follow: Verified Hub Weight × Company Buying Rate, with bonus incentives for accuracy." },
        { title: "🎁 5. Eco Rewards & Multilingual Voice", desc: "Earn carbon offset tokens and rewards. Tap the voice assistant anytime to speak in 19 Indian & global languages to dictate notes." }
      ],
      hi: [
        { title: "🌱 1. सत्यापित रीसाइक्लिंग प्रभाव", desc: "वास्तविक समय में अपने रीसाइक्लिंग किलोग्राम, कुल पिकअप, अपशिष्ट पृथक्करण स्कोर (100 में से) और वजन मिलान को ट्रैक करें।" },
        { title: "📸 2. क्षेत्रीय एआई अपशिष्ट स्कैनर", desc: "तांबे के तार, सर्किट बोर्ड, अखबार या प्लास्टिक की त्वरित पहचान और अनुमानित मूल्य प्राप्त करने के लिए ऑन-डिवाइस एआई मॉडल से स्कैन करें।" },
        { title: "📅 3. घर बैठे स्क्रैप पिकअप बुक करें", desc: "सत्यापित फील्ड कलेक्टर से सेकंडों में पिकअप शेड्यूल करें। अपना पता, पसंदीदा तारीख और समय चुनें।" },
        { title: "🧾 4. पारदर्शी डिजिटल निपटान", desc: "कबाड़ के दामों में कोई हेराफेरी नहीं! निपटान का सूत्र: हब द्वारा सत्यापित वजन × कंपनी खरीद दर, और सटीकता पर बोनस!" },
        { title: "🎁 5. इको रिवार्ड्स और बहुभाषी आवाज", desc: "उचित पृथक्करण के लिए कार्बन टोकन अर्जित करें। अपनी मातृभाषा में बोलने के लिए कभी भी माइक बटन दबाएं।" }
      ],
      mr: [
        { title: "🌱 1. सत्यापित पुनर्वापर प्रभाव", desc: "रिअल-टाइममध्ये सत्यापित किलो, एकूण फेऱ्या, कचरा वर्गीकरण स्कोअर (100 पैकी) आणि वजन जुळवणी तपासा." },
        { title: "📸 2. प्रादेशिक एआय वेस्ट स्कॅनर", desc: "तांब्याची तार, ई-कचरा, रद्दी कागद किंवा प्लास्टिकचे वर्गीकरण आणि अंदाजे किंमत मिळवण्यासाठी ऑन-डिव्हाइस एआय स्कॅन करा." },
        { title: "📅 3. घरपोच भंगार पिकअप शेड्युल करा", desc: "प्रमाणित फील्ड कलेक्टर पिकअप काही सेकंदात बुक करा. आपला पत्ता, सोयीची तारीख व वेळ निवडा." },
        { title: "🧾 4. पारदर्शक डिजिटल पावती", desc: "कधीही फसवणूक नाही! सूत्र: हब सत्यापित वजन × कंपनी खरेदी दर, आणि वजन तंतोतंत जुळल्यास विशेष इको बोनस!" },
        { title: "🎁 5. इको रिवॉर्ड्स आणि बहुभाषिक व्हॉइस", desc: "योग्य वर्गीकरणासाठी रिवॉर्ड टोकन मिळवा. आपल्या भाषेत सूचना देण्यासाठी कधीही व्हॉइस बटण दाबा." }
      ],
      gu: [
        { title: "🌱 1. ચકાસાયેલ રિસાયક્લિંગ પ્રભાવ", desc: "વાસ્તવિક સમયમાં વજન, પૂર્ણ થયેલ પિકઅપ, કચરા વર્ગીકરણ સ્કોર (100 માંથી) અને વજન મેળવણી ટ્રેક કરો." },
        { title: "📸 2. સ્થાનિક AI કચરો સ્કેનર", desc: "તાંબાના વાયર, સર્કિટ બોર્ડ, છાપાં કે પ્લાસ્ટિકના સ્કેનિંગ દ્વારા સચોટ માર્ગદર્શન અને અંદાજિત કિંમત મેળવો." },
        { title: "📅 3. ઘરબેઠા પિકઅપ શેડ્યૂલ કરો", desc: "પ્રમાણિત ફીલ્ડ કલેક્ટર માટે સેકન્ડોમાં પિકઅપ બુક કરો. તમારું સરનામું, તારીખ અને સમય સ્લોટ પસંદ કરો." },
        { title: "🧾 4. પારદર્શક ચુકવણી ફોર્મ્યુલા", desc: "ક્યારેય છેતરાશો નહીં! ચુકવણી: હબ ચકાસાયેલ વજન × કંપની ખરીદ દર, અને વજન મેળ પર વિશેષ બોનસ!" },
        { title: "🎁 5. ઇકો રિવોર્ડ્સ અને બહુભાષી અવાજ", desc: "યોગ્ય વર્ગીકરણ માટે ગ્રીન ટોકન્સ જીતો. તમારી માતૃભાષામાં સૂચના આપવા ગમે ત્યારે માઇક દબાવો." }
      ],
      mwr: [
        { title: "🌱 1. जाच्योड़ो रिसाइक्लिंग असर", desc: "असली वजन, पूरी होयोड़ी पिकअप, कचरो छांटण रो स्कोर (100 मांय सूं) और वजन मिलान लाइव देखो सा।" },
        { title: "📸 2. स्थानीय एआई कचरो स्कैनर", desc: "तांबो, सर्किट बोर्ड, अखबार या बोतल स्कैन कर'र तुरंत भाव और छांटण री सलाह लेवो सा।" },
        { title: "📅 3. घर बैठे भंगार पिकअप मंगवावो", desc: "सरकारी कलेक्टर पिकअप सेकंडां में बुक करो सा। आपरो पत्तो, तारीख और टेम चुणो।" },
        { title: "🧾 4. साफ-सुथरो हिसाब-किताब", desc: "कबाड़ में कदेई घाटो कोनी! हिसाब रो सूत्र: हब रो जाच्योड़ो वजन × पक्का भाव, और सही वजन माथे बोनस!" },
        { title: "🎁 5. इको ईनाम और अपनी बोली", desc: "सफाई माथे ईनाम पाओ सा। अपनी मारवाड़ी बोली में बोल'र निर्देश देवण खातर माइक दबावो सा।" }
      ],
      te: [
        { title: "🌱 1. ధృవీకరించబడిన రీసైక్లింగ్ ప్రభావం", desc: "నిజ-సమయంలో ధృవీకరించిన బరువు, పూర్తయిన పికప్‌లు, విభజన స్కోరు (100 కి) మరియు సరిపోలిన బరువును తనిఖీ చేయండి." },
        { title: "📸 2. స్థానిక AI వ్యర్థాల స్కానర్", desc: "రాగి తీగలు, ఎలక్ట్రానిక్స్, కాగితం లేదా ప్లాస్టిక్‌లను స్కాన్ చేసి సరైన విభజన సలహా మరియు ధర అంచనా పొందండి." },
        { title: "📅 3. డోర్‌స్టెప్ పికప్‌ను బుక్ చేయండి", desc: "కొద్ది సెకన్లలో కలెక్టర్ పికప్‌ను షెడ్యూల్ చేయండి. మీ చిరునామా, తేదీ మరియు సమయాన్ని ఎంచుకోండి." },
        { title: "🧾 4. పారదర్శక చెల్లింపు సూత్రం", desc: "ఖచ్చితమైన చెల్లింపు: హబ్ ధృవీకరించిన బరువు × అధికారిక రేటు, మరియు ఖచ్చితత్వానికి గ్రీన్ బోనస్!" },
        { title: "🎁 5. పర్యావరణ రివార్డులు & వాయిస్ గైడ్", desc: "సరైన విభజనకు కార్బన్ టోకెన్లు సంపాదించండి. మీ భాషలో మాట్లాడటానికి ఎప్పుడైనా మైక్ నొక్కండి." }
      ],
      ta: [
        { title: "🌱 1. சரிபார்க்கப்பட்ட மறுசுழற்சி தாக்கம்", desc: "நிகழ்நேரத்தில் சரிபார்க்கப்பட்ட எடை, நிறைவுற்ற பிக்கப்கள், கழிவு பிரிப்பு மதிப்பெண் மற்றும் எடை பொருத்தங்களை கண்காணிக்கவும்." },
        { title: "📸 2. உள்நாட்டு AI கழிவு ஸ்கேனர்", desc: "செப்பு கம்பிகள், மின்னணு பலகைகள், செய்தித்தாள்களை ஸ்கேன் செய்து சரியான வகைப்பாடு மற்றும் மதிப்பிடப்பட்ட விலையை அறியவும்." },
        { title: "📅 3. வீட்டு வாசலில் பிக்கப் பதிவு செய்க", desc: "சான்றளிக்கப்பட்ட சேகரிப்பாளரை நொடிகளில் பதிவு செய்யுங்கள். உங்கள் முகவரி, தேதி மற்றும் நேரத்தைத் தேர்ந்தெடுக்கவும்." },
        { title: "🧾 4. வெளிப்படையான தீர்வு சூத்திரம்", desc: "நேர்மையான விலை! கணக்கீடு: மையத்தில் சரிபார்க்கப்பட்ட எடை × நிறுவனத்தின் கொள்முதல் விலை." },
        { title: "🎁 5. சுற்றுச்சூழல் வெகுமதிகள் & குரல் உதவி", desc: "சரியான கழிவு பிரிப்பிற்கு வெகுமதிகளைப் பெறுங்கள். உங்கள் தாய்மொழியில் பேச குரல் பொத்தானைத் தட்டவும்." }
      ],
      kn: [
        { title: "🌱 1. ದೃಢೀಕರಿಸಿದ ಮರುಬಳಕೆ ಪ್ರಭಾವ", desc: "ನಿಜಾವಧಿಯಲ್ಲಿ ದೃಢೀಕರಿಸಿದ ತೂಕ, ಪೂರ್ಣಗೊಂಡ ಪಿಕಪ್‌ಗಳು, ತ್ಯಾಜ್ಯ ವಿಂಗಡಣಾ ಸ್ಕೋರ್ ಮತ್ತು ತೂಕದ ಹೊಂದಾಣಿಕೆಯನ್ನು ವೀಕ್ಷಿಸಿ." },
        { title: "📸 2. ಸ್ಥಳೀಯ AI ತ್ಯಾಜ್ಯ ಸ್ಕ್ಯಾನರ್", desc: "ತಾಮ್ರದ ತಂತಿ, ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್, ಕಾಗದವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ತಕ್ಷಣದ ವಿಂಗಡಣೆ ಸಲಹೆ ಮತ್ತು ಅಂದಾಜು ಬೆಲೆ ಪಡೆಯಿರಿ." },
        { title: "📅 3. ಮನೆಬಾಗಿಲಿಗೆ ಪಿಕಪ್ ಕಾಯ್ದಿರಿಸಿ", desc: "ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಅಧಿಕೃತ ಕಲೆಕ್ಟರ್ ಪಿಕಪ್ ನಿಗದಿಪಡಿಸಿ. ನಿಮ್ಮ ವಿಳಾಸ, ದಿನಾಂಕ ಮತ್ತು ಸಮಯವನ್ನು ಆರಿಸಿ." },
        { title: "🧾 4. ಪಾರದರ್ಶಕ ಪಾವತಿ ಸೂತ್ರ", desc: "ನ್ಯಾಯಯುತ ಬೆಲೆ: ಹಬ್ ದೃಢೀಕರಿಸಿದ ತೂಕ × ನಿಗದಿತ ದರ, ಜೊತೆಗೆ ನಿಖರ ತೂಕಕ್ಕೆ ವಿಶೇಷ ಬೋನಸ್!" },
        { title: "🎁 5. ಇಕೋ ಬಹುಮಾನಗಳು & ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ", desc: "ಉತ್ತಮ ವಿಂಗಡಣೆಗೆ ಇಕೋ ಟೋಕನ್ ಪಡೆಯಿರಿ. ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಲು ಯಾವಾಗ ಬೇಕಾದರೂ ಮೈಕ್ ಒತ್ತಿರಿ." }
      ],
      ml: [
        { title: "🌱 1. പരിശോധിച്ച പുനരുപയോഗ സ്വാധീനം", desc: "യഥാർത്ഥ ഭാരം, പൂർത്തിയായ പിക്കപ്പുകൾ, വേർതിരിക്കൽ സ്കോർ (100 ൽ), ഭാര പൊരുത്തം എന്നിവ തത്സമയം കാണുക." },
        { title: "📸 2. ലോക്കൽ AI വേസ്റ്റ് സ്കാനർ", desc: "ചെമ്പ് കമ്പികൾ, ഇ-മാലിന്യം, പത്രങ്ങൾ എന്നിവ സ്കാൻ ചെയ്ത് കൃത്യമായ നിർദ്ദേശങ്ങളും വിലയും അറിയുക." },
        { title: "📅 3. വീട്ടുപടിക്കൽ പിക്കപ്പ് ബുക്ക് ചെയ്യുക", desc: "വിശ്വാസയോഗ്യനായ കളക്ടറെ നിമിഷങ്ങൾക്കകം ബുക്ക് ചെയ്യുക. വിലാസവും സൗകര്യപ്രദമായ സമയവും തിരഞ്ഞെടുക്കുക." },
        { title: "🧾 4. സുതാര്യമായ കണക്കുകൂട്ടൽ", desc: "ന്യായമായ വില! സൂത്രവാക്യം: ഹബ് പരിശോധിച്ച ഭാരം × കമ്പനി വാങ്ങൽ നിരക്ക്, ഒപ്പം ബോണസും!" },
        { title: "🎁 5. ഇക്കോ റിവാർഡുകളും വോയ്‌സ് ഗൈഡും", desc: "മാലിന്യം വേർതിരിക്കുന്നതിന് കാർബൺ ടോക്കണുകൾ നേടൂ. നിങ്ങളുടെ ഭാഷയിൽ സംസാരിക്കാൻ മൈക്ക് അമർത്തുക." }
      ],
      pa: [
        { title: "🌱 1. ਪ੍ਰਮਾਣਿਤ ਰੀਸਾਈਕਲਿੰਗ ਪ੍ਰਭਾਵ", desc: "ਅਸਲ ਸਮੇਂ ਵਿੱਚ ਪ੍ਰਮਾਣਿਤ ਭਾਰ, ਮੁਕੰਮਲ ਪਿਕਅੱਪ, ਕੂੜਾ ਛਾਂਟੀ ਸਕੋਰ (100 ਵਿੱਚੋਂ) ਅਤੇ ਭਾਰ ਮੇਲ ਵੇਖੋ।" },
        { title: "📸 2. ਸਥਾਨਕ AI ਸਕ੍ਰੈਪ ਸਕੈਨਰ", desc: "ਤਾਂਬੇ ਦੀਆਂ ਤਾਰਾਂ, ਬੋਰਡ, ਅਖਬਾਰਾਂ ਨੂੰ ਸਕੈਨ ਕਰਕੇ ਤੁਰੰਤ ਸਹੀ ਛਾਂਟੀ ਸਲਾਹ ਅਤੇ ਅੰਦਾਜ਼ਨ ਕੀਮਤ ਪ੍ਰਾਪਤ ਕਰੋ।" },
        { title: "📅 3. ਘਰ ਬੈਠੇ ਪਿਕਅੱਪ ਬੁੱਕ ਕਰੋ", desc: "ਪ੍ਰਮਾਣਿਤ ਕੁਲੈਕਟਰ ਤੋਂ ਕੁਝ ਹੀ ਸਕਿੰਟਾਂ ਵਿੱਚ ਪਿਕਅੱਪ ਬੁੱਕ ਕਰੋ। ਆਪਣਾ ਪਤਾ ਅਤੇ ਸਮਾਂ ਚੁਣੋ।" },
        { title: "🧾 4. ਪਾਰਦਰਸ਼ੀ ਡਿਜੀਟਲ ਹਿਸਾਬ", desc: "ਕੋਈ ਧੋਖਾ ਨਹੀਂ! ਫਾਰਮੂਲਾ: ਹੱਬ ਪ੍ਰਮਾਣਿਤ ਭਾਰ × ਕੰਪਨੀ ਖਰੀਦ ਦਰ, ਅਤੇ ਸ਼ੁੱਧਤਾ 'ਤੇ ਗ੍ਰੀਨ ਬੋਨਸ!" },
        { title: "🎁 5. ਈਕੋ ਇਨਾਮ ਅਤੇ ਬੋਲੀ ਗਾਈਡ", desc: "ਸਹੀ ਛਾਂਟੀ ਲਈ ਗ੍ਰੀਨ ਟੋਕਨ ਪ੍ਰਾਪਤ ਕਰੋ। ਆਪਣੀ ਮਾਂ-ਬੋਲੀ ਵਿੱਚ ਨਿਰਦੇਸ਼ ਦੇਣ ਲਈ ਮਾਈਕ ਦਬਾਓ।" }
      ],
      as: [
        { title: "🌱 1. প্ৰমাণিত পুনৰ্ব্যৱহাৰ প্ৰভাৱ", desc: "প্ৰকৃত ওজন, সম্পূৰ্ণ পিকআপ, আৱৰ্জনা পৃথকীকৰণ স্ক'ৰ (১০০ৰ ভিতৰত) আৰু ওজনৰ মিল নিৰীক্ষণ কৰক।" },
        { title: "📸 2. স্থানীয় AI আৱৰ্জনা স্কেনাৰ", desc: "তামৰ তাৰ, বৰ্ড, বাতৰি কাকত বা প্লাষ্টিক স্কেন কৰি সঠিক মূল্যায়ন আৰু আনুমানিক মূল্য লাভ কৰক।" },
        { title: "📅 3. ঘৰতে পিকআপ অনুৰোধ কৰক", desc: "প্ৰমাণিত সংগ্ৰাহকৰ সৈতে চেকেণ্ডতে পিকআপ অনুসূচীভুক্ত কৰক। আপোনাৰ ঠিকনা আৰু সময় বাছক।" },
        { title: "🧾 4. স্বচ্ছ ডিজিটেল নিষ্পত্তি", desc: "কোনো প্ৰৱঞ্চনা নাই! সূত্ৰ: হাবৰ প্ৰমাণিত ওজন × ক্ৰয় দৰ, আৰু সঠিকতাৰ বাবে বিশেষ বোনাছ!" },
        { title: "🎁 5. ইক' পুৰস্কাৰ আৰু ভইচ সহায়", desc: "সঠিক পৃথকীকৰণৰ বাবে টোকেন লাভ কৰক। মাতৃভাষাত ক'বলৈ যিকোনো সময়তে মাইক টিপক।" }
      ],
      bn: [
        { title: "🌱 1. যাচাইকৃত পুনর্ব্যবহার প্রভাব", desc: "রিয়েল-টাইমে যাচাইকৃত ওজন, সম্পন্ন পিকআপ, বর্জ্য পৃথকীকরণ স্কোর (১০০-তে) এবং ওজন মিল দেখুন।" },
        { title: "📸 2. লোকাল এআই বর্জ্য স্ক্যানার", desc: "তামার তার, সার্কিট বোর্ড বা খবরের কাগজ স্ক্যান করে সঠিক পৃথকীকরণ নির্দেশ ও আনুমানিক মূল্য পান।" },
        { title: "📅 3. ডোরস্টেপ পিকআপ বুক করুন", desc: "কয়েক সেকেন্ডের মধ্যে সার্টিফাইড সংগ্রাহক বুক করুন। আপনার ঠিকানা, তারিখ এবং সময় স্লট বাছুন।" },
        { title: "🧾 4. স্বচ্ছ ডিজিটাল নিষ্পত্তির সূত্র", desc: "ন্যায্য মূল্য নিশ্চিত! সূত্র: হাব যাচাইকৃত ওজন × কোম্পানির ক্রয় মূল্য, এবং বোনাস ইনসেনটিভ!" },
        { title: "🎁 5. ইকো রিওয়ার্ড ও বহুভাষিক ভয়েস", desc: "সঠিক পৃথকীকরণের জন্য কার্বন টোকেন অর্জন করুন। মাতৃভাষায় কথা বলতে মাইক বোতাম টিপুন।" }
      ],
      or: [
        { title: "🌱 1. ପ୍ରମାଣିତ ପୁନଃଚକ୍ରଣ ପ୍ରଭାବ", desc: "ପ୍ରକୃତ ଓଜନ, ସମ୍ପୂର୍ଣ୍ଣ ପିକଅପ୍, ଅଲଗା କରିବା ସ୍କୋର ଏବଂ ଓଜନ ମେଳ ତୁରନ୍ତ ଦେଖନ୍ତୁ।" },
        { title: "📸 2. ସ୍ଥାନୀୟ AI ବର୍ଜ୍ୟ ସ୍କାନର୍", desc: "ତମ୍ବା ତାର, ସର୍କିଟ୍ ବୋର୍ଡ କିମ୍ବା କାଗଜ ସ୍କାନ୍ କରି ସଠିକ୍ ପରାମର୍ଶ ଏବଂ ମୂଲ୍ୟ ପାଆନ୍ତୁ।" },
        { title: "📅 3. ଘରେ ବସି ପିକ୍ଅପ୍ ବୁକ୍ କରନ୍ତୁ", desc: "ପ୍ରମାଣିତ ସଂଗ୍ରାହକ ପିକଅପ୍ କିଛି ସେକେଣ୍ଡରେ ବୁକ୍ କରନ୍ତୁ। ଆପଣଙ୍କ ଠିକଣା ଏବଂ ସମୟ ବାଛନ୍ତୁ।" },
        { title: "🧾 4. ସ୍ୱଚ୍ଛ ପରିଶୋଧ ସୂତ୍ର", desc: "ସଠିକ୍ ମୂଲ୍ୟ: ହବ୍ ପ୍ରମାଣିତ ଓଜନ × କମ୍ପାନୀ କ୍ରୟ ଦର, ଏବଂ ସଠିକତା ପାଇଁ ଗ୍ରୀନ୍ ବୋନସ୍!" },
        { title: "🎁 5. ଇକୋ ପୁରସ୍କାର ଏବଂ ଭଏସ୍ ଗାଇଡ୍", desc: "ସଠିକ୍ ପୃଥକୀକରଣ ପାଇଁ ଟୋକନ୍ ଜିତନ୍ତୁ। ନିଜ ଭାଷାରେ ନିର୍ଦ୍ଦେଶ ଦେବାକୁ ମାଇକ୍ ଦବାନ୍ତୁ।" }
      ],
      ur: [
        { title: "🌱 1. مصدقہ ری سائیکلنگ اثرات", desc: "حقیقی وزن، مکمل شدہ پک اپس، کوڑا الگ کرنے کا اسکور اور وزن کا ملاپ لائیو دیکھیں۔" },
        { title: "📸 2. لوکل اے آئی ویسٹ اسکینر", desc: "تانبے کی تاروں، سرکٹ بورڈز یا کاغذ کو اسکین کر کے بروقت رہنمائی اور تخمینی قیمت حاصل کریں۔" },
        { title: "📅 3. دہلیز پر پک اپ شیڈول کریں", desc: "چند سیکنڈ میں مصدقہ کلیکٹر پک اپ بک کریں۔ اپنا پتہ، تاریخ اور وقت کا انتخاب کریں۔" },
        { title: "🧾 4. شفاف ڈیجیٹل تصفیہ", desc: "کوئی دھوکہ نہیں! فارمولا: تصدیق شدہ وزن × کمپنی کی خریداری کی قیمت مع درستگی بونس!" },
        { title: "🎁 5. ایکو انعامات اور صوتی رہنمائی", desc: "صحیح کچرا الگ کرنے پر انعامات جیتیں۔ مادری زبان میں ہدایات دینے کے لیے مائیک دبائیں۔" }
      ],
      es: [
        { title: "🌱 1. Impacto de reciclaje verificado", desc: "Monitoree peso verificado, recolecciones completadas, puntaje de segregación y coincidencia de peso." },
        { title: "📸 2. Escáner de residuos con IA local", desc: "Escanee cobre, circuitos o botellas para obtener recomendaciones de segregación y cotización estimada." },
        { title: "📅 3. Programar recolección a domicilio", desc: "Reserve un recolector certificado en segundos. Elija dirección, fecha y franja horaria." },
        { title: "🧾 4. Fórmula de liquidación transparente", desc: "¡Cero deducciones ocultas! Fórmula: Peso verificado en centro × Tarifa de compra oficial." },
        { title: "🎁 5. Recompensas ecológicas y voz", desc: "Gane tokens de carbono por separar residuos. Toque el micrófono para dictar en su idioma." }
      ],
      fr: [
        { title: "🌱 1. Impact de recyclage vérifié", desc: "Suivez le poids vérifié, les collectes terminées, le score de tri et la correspondance des poids." },
        { title: "📸 2. Scanner IA local des déchets", desc: "Scannez câbles en cuivre, circuits ou papier pour obtenir des conseils de tri et une estimation immédiate." },
        { title: "📅 3. Planifier une collecte à domicile", desc: "Réservez un collecteur certifié en quelques secondes avec votre adresse et créneau horaire." },
        { title: "🧾 4. Formule de règlement transparente", desc: "Règlement garanti : Poids vérifié au centre × Tarif d'achat officiel de l'entreprise." },
        { title: "🎁 5. Éco-récompenses et guide vocal", desc: "Gagnez des jetons écologiques pour un tri optimal. Parlez dans votre langue maternelle." }
      ],
      de: [
        { title: "🌱 1. Verifizierte Recycling-Wirkung", desc: "Verfolgen Sie verifiziertes Gewicht, abgeschlossene Abholungen und Trennungswerte in Echtzeit." },
        { title: "📸 2. Lokaler KI-Abfallscanner", desc: "Scannen Sie Kupferdrähte, Leiterplatten oder PET für sofortige Trennhinweise und Richtpreise." },
        { title: "📅 3. Abholung vor Ort vereinbaren", desc: "Buchen Sie zertifizierte Sammler in Sekunden mit Wunschtermin und Zeitfenster." },
        { title: "🧾 4. Transparente Abrechnungsformel", desc: "Verifiziertes Gewicht × Offizieller Ankaufspreis ohne versteckte Abzüge." },
        { title: "🎁 5. Öko-Belohnungen & Sprachführer", desc: "Sammeln Sie CO2-Prämien und nutzen Sie die Sprachführung in Ihrer Muttersprache." }
      ],
      ja: [
        { title: "🌱 1. 検証済みリサイクル実績", desc: "実測重量、収集完了回数、分別スコア、重量照合結果をリアルタイムで確認できます。" },
        { title: "📸 2. ローカルAI廃棄物スキャナー", desc: "銅線や電子基板、古紙をスキャンし、即座に分別推奨と参考価格を判定します。" },
        { title: "📅 3. 戸別収集の予約", desc: "認定コレクターの収集を数秒で手配。住所・日時を指定するだけで自動配車されます。" },
        { title: "🧾 4. 透明性の高い決済計算式", desc: "拠点での検証重量 × 公式買取単価により、公平で透明な決済が保証されます。" },
        { title: "🎁 5. エコ報酬＆多言語音声ガイド", desc: "適切な分別でカーボン報酬を獲得。マイクをタップして母国語で操作できます。" }
      ],
      ar: [
        { title: "🌱 1. أثر إعادة التدوير المعتمد", desc: "تتبع الكيلوغرامات المعتمدة، وعمليات الاستلام المكتملة، ودرجة الفرز، وتطابق الأوزان مباشرة." },
        { title: "📸 2. ماسح النفايات بالذكاء الاصطناعي", desc: "امسح الأسلاك النحاسية أو اللوحات الإلكترونية لتصنيفها فورياً وتقدير أسعارها بدقة." },
        { title: "📅 3. جدولة استلام منزلي", desc: "احجز جامع نفايات معتمد خلال ثوانٍ. اختر عنوانك والتاريخ والوقت المناسب." },
        { title: "🧾 4. معادلة محاسبة شفافة", desc: "حساب دقيق وموثوق: الوزن المعتمد في المركز × سعر الشراء الرسمي للشركة." },
        { title: "🎁 5. مكافآت بيئية ودليل صوتي", desc: "اكسب رموز الكربون مقابل الفرز الصحيح. اضغط على الميكروفون للتحدث بلغتك الأم." }
      ]
    };

    // -------------------------------------------------------------
    // Multilingual Step Texts for Field Collector (5 Steps)
    // -------------------------------------------------------------
    this.collectorStepsI18n = {
      en: [
        { title: "📱 1. Three Operating Modes", desc: "Work via Smartphone App with GPS (Mode 1), Two-Way SMS for keypad phones (Mode 2), or Printed Dispatch Sheets (Mode 3)." },
        { title: "📍 2. Active Collection Assignment", desc: "View assigned doorstep pickups with household addresses and scrap categories. Navigate directly to customer premises." },
        { title: "📦 3. Seal & Generate Waste Lot QR", desc: "Weigh scrap on portable scale, pack into sack, and seal lot. Encrypted LOT-2026 QR stamps permanent digital custody." },
        { title: "⚖️ 4. Storage Hub Digital Intake", desc: "Deliver sealed lots to the municipal Hub. Official scale verifies weight, releases settlement, and logs collector performance." },
        { title: "📴 5. Grassroots Registration (COL-NP)", desc: "Register phone-less waste pickers with official COL-NP passes. Complete zero-knowledge privacy wipes data from device." }
      ],
      hi: [
        { title: "📱 1. तीन कार्य प्रणालियां (मोड्स)", desc: "स्मार्टफोन ऐप जीपीएस (मोड 1), बेसिक फोन के लिए 2-वे एसएमएस (मोड 2), या मुद्रित डिस्पैच शीट (मोड 3) से कार्य करें।" },
        { title: "📍 2. सक्रिय संग्रहण कार्य आवंटन", desc: "आवंटित घरों के पते, फोन नंबर और स्क्रैप श्रेणी देखें। सीधे घर पहुंचकर सामग्री की जांच करें।" },
        { title: "📦 3. सील करें और लॉट क्यूआर बनाएं", desc: "कांटे पर वजन तोलें, बोरी बांधें और 'सील लॉट' दबाएं। सुरक्षित डिजिटल क्यूआर कोड जनरेट होगा।" },
        { title: "⚖️ 4. स्टोरेज हब पर डिजिटल सत्यापन", desc: "सील किए लॉट को म्युनिसिपल हब पहुंचाएं। डिजिटल कांटे पर सटीक वजन होते ही तत्काल भुगतान जारी होगा।" },
        { title: "📴 5. फोन-रहित कबाड़ी पंजीकरण (COL-NP)", desc: "बिना फोन वाले साथियों को आधिकारिक COL-NP टोकन जारी करें। निजता सुरक्षा के तहत फोन से डेटा तुरंत मिट जाता है।" }
      ],
      mr: [
        { title: "📱 1. तीन कार्य पद्धती (मोड्स)", desc: "स्मार्टफोन ॲप (मोड 1), साध्या फोनसाठी 2-वे एसएमएस (मोड 2), किंवा प्रिंटेड डिस्पॅच शीट (मोड 3) द्वारे काम करा." },
        { title: "📍 2. सक्रिय संकलन कार्य वाटप", desc: "ग्राहकांचा पत्ता आणि भंगाराचा प्रकार पहा. थेट जागेवर पोहोचून स्क्रॅपची तपासणी करा." },
        { title: "📦 3. लॉट सील करा आणि QR तयार करा", desc: "वजन काट्यावर मोजा, पोते बांधा आणि 'सील लॉट' टॅप करा. सुरक्षित डिजिटल QR तयार होईल." },
        { title: "⚖️ 4. स्टोरेज हबवर वजन पडताळणी", desc: "सील लॉट हबवर जमा करा. डिजिटल काट्यावर वजन होताच त्वरित पेमेंट मंजुरी मिळते." },
        { title: "📴 5. फोन नसलेल्या कामगारांची नोंदणी", desc: "स्मार्टफोन नसलेल्या कचरा वेचकांना COL-NP पास द्या. गोपनीयता नियमानुसार डेटा फोनवरून नष्ट होतो." }
      ],
      gu: [
        { title: "📱 1. ત્રણ કાર્ય પદ્ધતિઓ (મોડ્સ)", desc: "સ્માર્ટફોન એપ (મોડ 1), સાદા ફોન માટે SMS (મોડ 2), અથવા પ્રિન્ટેડ શીટ (મોડ 3) વડે કામ કરો." },
        { title: "📍 2. સક્રિય સંગ્રહ સોંપણી", desc: "સોંપેલ ઘરોના સરનામા અને કચરાની વિગતો જુઓ. સ્થળ પર પહોંચી સામગ્રી ચકાસો." },
        { title: "📦 3. લોટ સીલ કરો અને QR બનાવો", desc: "કાંટા પર વજન કરો, બોરી સીલ કરો અને QR કોડ જનરેટ કરો. ડિજિટલ રેકોર્ડ લૉક થશે." },
        { title: "⚖️ 4. સ્ટોરેજ હબ ડિજિટલ વેરિફિકેશન", desc: "સીલ લોટ મ્યુનિસિપલ હબ પહોંચાડો. વજન થતાં જ તરત જ ચુકવણી ખાતામાં જમા થશે." },
        { title: "📴 5. ફોન વગરના કલેક્ટર રજીસ્ટ્રેશન", desc: "ફોન ન ધરાવતા સાથીઓને COL-NP ટોકન આપો. પ્રાઇવસી સુરક્ષા હેઠળ ફોનમાંથી ડેટા ભૂંસાઈ જશે." }
      ],
      mwr: [
        { title: "📱 1. तीनू काम करण रा तरीका", desc: "स्मार्टफोन ऐप (मोड 1), सादा फोन रो SMS (मोड 2), या कागजी लिस्ट (मोड 3) सूं काम करो सा।" },
        { title: "📍 2. आज रो कबाड़ उठावण रो काम", desc: "घर रो पत्तो और कबाड़ री जानकारी देखो सा। सीधा घरे पहुंच'र माल चेक करो।" },
        { title: "📦 3. सील लगावो और QR कोड बणावो", desc: "कांटे माथे तोलो, बोरी बांधो और QR कोड बणावो सा। पक्का डिजिटल सबूत तैयार होवेला।" },
        { title: "⚖️ 4. हब माथे वजन री जांच", desc: "सील कट्टो सरकारी हब ले जावो। कांटे माथे तोलते ही तुरंत रुपिया जारी होवेला सा।" },
        { title: "📴 5. बिना फोन कबाड़ी पंजीकरण", desc: "बिना मोबाइल आळा भाईयां ने COL-NP पास देवो सा। नियम मुजब फोन मांय सूं डेटा मिट जावेला।" }
      ],
      te: [
        { title: "📱 1. మూడు పని విధానాలు", desc: "స్మార్ట్‌ఫోన్ యాప్ (మోడ్ 1), సాధారణ ఫోన్ SMS (మోడ్ 2), లేదా ప్రింటెడ్ షీట్ (మోడ్ 3) ద్వారా పని చేయండి." },
        { title: "📍 2. యాక్టివ్ సేకరణ కేటాయింపు", desc: "ఇంటి చిరునామా మరియు స్క్రాప్ రకాన్ని చూడండి. కస్టమర్ ఇంటికి చేరుకుని తనిఖీ చేయండి." },
        { title: "📦 3. లాట్ సీల్ & QR కోడ్ జనరేషన్", desc: "త్రాసుపై బరువు తూచి, సంచిని సీల్ చేయండి. డిజిటల్ QR కోడ్ జనరేట్ అవుతుంది." },
        { title: "⚖️ 4. స్టోరేజ్ హబ్ డిజిటల్ తనిఖీ", desc: "సీల్ చేసిన లాట్‌లను హబ్‌కు చేర్చండి. ఖచ్చితమైన బరువు ధృవీకరణతో వెంటనే చెల్లింపు జరుగుతుంది." },
        { title: "📴 5. ఫోన్ లేని కార్మికుల నమోదు", desc: "స్మార్ట్‌ఫోన్ లేని వారికి COL-NP టోకెన్ జారీ చేయండి. గోప్యతా నియమాల ప్రకారం డేటా తొలగించబడుతుంది." }
      ],
      ta: [
        { title: "📱 1. மூன்று செயல்பாட்டு முறைகள்", desc: "ஸ்மார்ட்போன் செயலி (முறை 1), விசைப்பலகை தொலைபேசி SMS (முறை 2), அச்சிடப்பட்ட பட்டியல் (முறை 3)." },
        { title: "📍 2. செயலில் உள்ள சேகரிப்பு பணி", desc: "வீட்டு முகவரிகள் மற்றும் கழிவு வகைகளைக் காண்க. நேரில் சென்று ஆய்வு செய்யுங்கள்." },
        { title: "📦 3. முத்திரையிட்டு QR உருவாக்குதல்", desc: "எடையை அளந்து, பையை முத்திரையிட்டு QR குறியீட்டை உருவாக்குங்கள்." },
        { title: "⚖️ 4. கிடங்கு மையத்தில் டிஜிட்டல் சோதனை", desc: "முத்திரையிடப்பட்ட கழிவை மையத்திற்கு கொண்டு செல்லுங்கள். எடை சரிபார்க்கப்பட்டதும் உடனடி தீர்வு." },
        { title: "📴 5. தொலைபேசி இல்லாதோர் பதிவு", desc: "தொலைபேசி இல்லாதவர்களுக்கு COL-NP டோக்கன் வழங்குங்கள். தரவு உங்கள் சாதனத்திலிருந்து அழிக்கப்படும்." }
      ],
      kn: [
        { title: "📱 1. ಮೂರು ಕಾರ್ಯ ವಿಧಾನಗಳು", desc: "ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಆಪ್ (ಮೋಡ್ 1), ಕೀಪ್ಯಾಡ್ SMS (ಮೋಡ್ 2), ಅಥವಾ ಮುದ್ರಿತ ಡಿಸ್ಪ್ಯಾಚ್ ಶೀಟ್ (ಮೋಡ್ 3)." },
        { title: "📍 2. ಸಕ್ರಿಯ ಸಂಗ್ರಹಣೆ ನಿಯೋಜನೆ", desc: "ಗ್ರಾಹಕರ ವಿಳಾಸ ಮತ್ತು ತ್ಯಾಜ್ಯ ವರ್ಗವನ್ನು ವೀಕ್ಷಿಸಿ. ನೇರವಾಗಿ ಮನೆಗೆ ಭೇಟಿ ನೀಡಿ ಪರಿಶೀಲಿಸಿ." },
        { title: "📦 3. ಸೀಲ್ ಮತ್ತು QR ಕೋಡ್ ರಚನೆ", desc: "ತೂಕವನ್ನು ಅಳೆದು ಚೀಲವನ್ನು ಸೀಲ್ ಮಾಡಿ. ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಿದ QR ಕೋಡ್ ರಚನೆಯಾಗುತ್ತದೆ." },
        { title: "⚖️ 4. ಸ್ಟೋರೇಜ್ ಹಬ್ ತೂಕ ಪರಿಶೀಲನೆ", desc: "ಸೀಲ್ ಮಾಡಿದ ಲಾಟನ್ನು ಹಬ್‌ಗೆ ತಲುಪಿಸಿ. ಡಿಜಿಟಲ್ ತೂಕ ಮುಗಿದ ತಕ್ಷಣ ಪಾವತಿ ಬಿಡುಗಡೆಯಾಗುತ್ತದೆ." },
        { title: "📴 5. ಫೋನ್ ಇಲ್ಲದವರ ನೋಂದಣಿ", desc: "ಫೋನ್ ಇಲ್ಲದ ಕಾರ್ಮಿಕರಿಗೆ COL-NP ಪಾಸ್ ನೀಡಿ. ಗೌಪ್ಯತೆ ಕಾಯ್ದುಕೊಂಡು ಫೋನ್‌ನಿಂದ ವಿವರ ಅಳಿಸಲಾಗುತ್ತದೆ." }
      ],
      ml: [
        { title: "📱 1. മൂന്ന് പ്രവർത്തന രീതികൾ", desc: "സ്മാർട്ട്ഫോൺ ആപ്പ് (മോഡ് 1), ബട്ടൺ ഫോൺ SMS (മോഡ് 2), അല്ലെങ്കിൽ പ്രിന്റ് ചെയ്ത ഷീറ്റ് (മോഡ് 3)." },
        { title: "📍 2. ശേഖരണ ചുമതലകൾ", desc: "വീട്ടു വിലാസങ്ങളും മാലിന്യ ഇനങ്ങളും പരിശോധിക്കുക. സ്ഥലത്തെത്തി പരിശോധിച്ച് ശേഖരിക്കുക." },
        { title: "📦 3. സീൽ ചെയ്ത് QR കോഡ് ഉണ്ടാക്കുക", desc: "ഭാരം തൂക്കി ചാക്ക് സീൽ ചെയ്യുക. ഡിജിറ്റൽ QR കോഡ് തൽക്ഷണം ലഭ്യമാകും." },
        { title: "⚖️ 4. സ്റ്റോറേജ് ഹബ് പരിശോധന", desc: "സീൽ ചെയ്തവ ഹബ്ബിൽ എത്തിക്കുക. ഡിജിറ്റൽ ത്രാസിൽ പരിശോധിച്ച ഉടൻ പണം ലഭ്യമാകും." },
        { title: "📴 5. ഫോൺ ഇല്ലാത്തവരുടെ രജിസ്ട്രേഷൻ", desc: "സ്മാർട്ട്ഫോൺ ഇല്ലാത്തവർക്ക് COL-NP ടോക്കൺ നൽകുക. സുരക്ഷയ്ക്കായി വിവരങ്ങൾ ഫോണിൽ നിന്ന് നീക്കും." }
      ],
      pa: [
        { title: "📱 1. ਤਿੰਨ ਕਾਰਜ ਪ੍ਰਣਾਲੀਆਂ", desc: "ਸਮਾਰਟਫੋਨ ਐਪ (ਮੋਡ 1), ਬਟਨਾਂ ਵਾਲੇ ਫੋਨ ਲਈ SMS (ਮੋਡ 2), ਜਾਂ ਪ੍ਰਿੰਟਿਡ ਸ਼ੀਟ (ਮੋਡ 3) ਰਾਹੀਂ ਕੰਮ ਕਰੋ।" },
        { title: "📍 2. ਸਰਗਰਮ ਕੁਲੈਕਸ਼ਨ ਡਿਊਟੀ", desc: "ਘਰਾਂ ਦੇ ਪਤੇ ਅਤੇ ਕਬਾੜ ਦੀ ਕਿਸਮ ਵੇਖੋ। ਮੌਕੇ 'ਤੇ ਪਹੁੰਚ ਕੇ ਸਮਾਨ ਦੀ ਜਾਂਚ ਕਰੋ।" },
        { title: "📦 3. ਸੀਲ ਕਰੋ ਅਤੇ QR ਕੋਡ ਬਣਾਓ", desc: "ਕੰਡੇ 'ਤੇ ਤੋਲੋ, ਬੋਰੀ ਸੀਲ ਕਰੋ ਅਤੇ 'ਸੀਲ ਲਾਟ' ਦਬਾਓ। ਸੁਰੱਖਿਅਤ QR ਕੋਡ ਤਿਆਰ ਹੋਵੇਗਾ।" },
        { title: "⚖️ 4. ਸਟੋਰੇਜ ਹੱਬ 'ਤੇ ਵਜ਼ਨ ਤਸਦੀਕ", desc: "ਸੀਲ ਲਾਟ ਹੱਬ ਪਹੁੰਚਾਓ। ਡਿਜੀਟਲ ਕੰਡੇ 'ਤੇ ਤੋਲਦੇ ਹੀ ਤੁਰੰਤ ਭੁਗਤਾਨ ਜਾਰੀ ਹੋਵੇਗਾ।" },
        { title: "📴 5. ਫੋਨ-ਰਹਿਤ ਸਾਥੀਆਂ ਦੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ", desc: "ਬਿਨਾਂ ਫੋਨ ਵਾਲਿਆਂ ਨੂੰ COL-NP ਪਾਸ ਦਿਓ। ਨਿਯਮਾਂ ਅਨੁਸਾਰ ਫੋਨ ਤੋਂ ਡਾਟਾ ਮਿਟ ਜਾਂਦਾ ਹੈ।" }
      ],
      as: [
        { title: "📱 1. তিনিটা কাৰ্য্যপদ্ধতি (ম'ড)", desc: "স্মাৰ্টফোন এপ (ম'ড ১), বুটাম ফোনৰ বাবে SMS (ম'ড ২), বা প্ৰিণ্ট কৰা শ্বীট (ম'ড ৩)ৰে কাম কৰক।" },
        { title: "📍 2. সক্ৰিয় সংগ্ৰহ কাৰ্য্যসূচী", desc: "ঠিকনা আৰু আৱৰ্জনাৰ শ্ৰেণী চাওক। স্থানত উপস্থিত হৈ সামগ্ৰী নিৰীক্ষণ কৰক।" },
        { title: "📦 3. ছীল কৰক আৰু QR ক'ড তৈয়াৰ কৰক", desc: "ওজন জোখক, বস্তা বান্ধক আৰু ছীল কৰক। সুৰক্ষিত ডিজিটেল QR ক'ড ওলাব।" },
        { title: "⚖️ 4. ষ্ট'ৰেজ হাবত ডিজিটেল পৰীক্ষা", desc: "ছীল কৰা বস্তা হাবলৈ লৈ যাওক। ওজন নিশ্চিত হোৱাৰ লগে লগে ধন পৰিশোধ হ'ব।" },
        { title: "📴 5. ফোনবিহীন ব্যক্তিৰ পঞ্জীয়ন", desc: "ফোন নথকাসকলক COL-NP টোকেন দিয়ক। গোপনীয়তা সুৰক্ষাৰ বাবে ফ'নৰ পৰা তথ্য মচি দিয়া হয়।" }
      ],
      bn: [
        { title: "📱 1. তিনটি কাজের মোড", desc: "স্মার্টফোন অ্যাপ (মোড ১), বোতাম ফোনের জন্য SMS (মোড ২), অথবা প্রিন্ট করা শিট (মোড ৩)।" },
        { title: "📍 2. সক্রিয় সংগ্রহ অ্যাসাইনমেন্ট", desc: "গ্রাহকের ঠিকানা ও বর্জ্যের ধরণ দেখুন। সরাসরি ঠিকানায় পৌঁছে যাচাই করুন।" },
        { title: "📦 3. সিল করুন ও লট QR তৈরি করুন", desc: "ওজন করুন, বস্তা সিল করুন এবং QR তৈরি করুন। ডিজিটাল রেকর্ড সুরক্ষিত হবে।" },
        { title: "⚖️ 4. স্টোরেজ হাবে ওজন যাচাই", desc: "সিল করা লট হাবে পৌঁছে দিন। ডিজিটাল স্কেলে ওজন যাচাইয়ের সাথে সাথেই পেমেন্ট সম্পন্ন হবে।" },
        { title: "📴 5. ফোনহীন ব্যক্তিদের রেজিস্ট্রেশন", desc: "স্মার্টফোনহীন সংগ্রাহকদের COL-NP পাস প্রদান করুন। সুরক্ষার স্বার্থে ফোন থেকে ডেটা মুছে যায়।" }
      ],
      or: [
        { title: "📱 1. ତିନୋଟି କାର୍ଯ୍ୟ ପଦ୍ଧତି", desc: "ସ୍ମାର୍ଟଫୋନ୍ ଆପ୍ (ମୋଡ୍ 1), କିପ୍ୟାଡ୍ SMS (ମୋଡ୍ 2), କିମ୍ବା ପ୍ରିଣ୍ଟେଡ୍ ସିଟ୍ (ମୋଡ୍ 3)।" },
        { title: "📍 2. ସକ୍ରିୟ ସଂଗ୍ରହ ଦାୟିତ୍ୱ", desc: "ଘରର ଠିକଣା ଏବଂ ବର୍ଜ୍ୟ ବର୍ଗ ଦେଖନ୍ତୁ। ସିଧାସଳଖ ପହଞ୍ଚି ଯାଞ୍ଚ କରନ୍ତୁ।" },
        { title: "📦 3. ସିଲ୍ ଏବଂ QR କୋଡ୍ ସୃଷ୍ଟି", desc: "ଓଜନ ମାପନ୍ତୁ, ଅଖା ସିଲ୍ କରନ୍ତୁ ଏବଂ 'ସିଲ୍ ଲଟ୍' ଦବାନ୍ତୁ। ସୁରକ୍ଷିତ QR ସୃଷ୍ଟି ହେବ।" },
        { title: "⚖️ 4. ଷ୍ଟୋରେଜ୍ ହବ୍ ଯାଞ୍ଚ କେନ୍ଦ୍ର", desc: "ସିଲ୍ ଲଟ୍ ହବ୍‌ରେ ପହଞ୍ଚାନ୍ତୁ। ଡିଜିଟାଲ୍ କଣ୍ଟାରେ ଓଜନ ହେବା କ୍ଷଣି ଟଙ୍କା ପ୍ରଦାନ ହେବ।" },
        { title: "📴 5. ଫୋନ୍ ନଥିବା ଲୋକଙ୍କ ପଞ୍ଜୀକରଣ", desc: "ଫୋନ୍ ନଥିବା ବ୍ୟକ୍ତିଙ୍କୁ COL-NP ପାସ୍ ଦିଅନ୍ତୁ। ଗୋପନୀୟତା ରକ୍ଷା ପାଇଁ ଡିଭାଇସରୁ ତଥ୍ୟ ଲିଭିଯାଏ।" }
      ],
      ur: [
        { title: "📱 1. کام کرنے کے تین طریقے", desc: "اسمارٹ فون ایپ (موڈ 1)، بٹن والے فون کے لیے SMS (موڈ 2)، یا پرنٹ شدہ شیٹ (موڈ 3)۔" },
        { title: "📍 2. فعال وصولی کا کام", desc: "صارفین کا پتہ اور کچرے کی قسم دیکھیں۔ موقع پر پہنچ کر جائزہ لیں۔" },
        { title: "📦 3. سیل کریں اور QR کوڈ بنائیں", desc: "وزن کریں، بوری سیل کریں اور QR کوڈ تیار کریں۔ ڈیجیٹل ریکارڈ محفوظ ہو جائے گا۔" },
        { title: "⚖️ 4. اسٹوریج ہب پر تصدیق", desc: "سیل شدہ لاٹ کو ہب پہنچائیں۔ وزن کی تصدیق ہوتے ہی ادائیگی کر دی جائے گی۔" },
        { title: "📴 5. فون کے بغیر افراد کی رجسٹریشن", desc: "بغیر فون والے افراد کو COL-NP ٹوکن دیں۔ رازداری کے تحت فون سے ڈیٹا مٹا دیا جاتا ہے۔" }
      ],
      es: [
        { title: "📱 1. Tres modos de operación", desc: "App de teléfono (Modo 1), SMS para móviles básicos (Modo 2) u hojas impresas (Modo 3)." },
        { title: "📍 2. Asignación de recolección activa", desc: "Vea direcciones y categorías de residuos. Navegue directamente al domicilio." },
        { title: "📦 3. Sellar y generar QR de lote", desc: "Pese en báscula portátil, selle el saco y genere el código QR inviolable." },
        { title: "⚖️ 4. Entrega y pesaje en el Centro Hub", desc: "Entregue lotes sellados en el Hub municipal. La báscula oficial valida el pago." },
        { title: "📴 5. Registro sin teléfono (COL-NP)", desc: "Emita pases oficiales COL-NP a recicladores sin teléfono con borrado seguro de datos." }
      ],
      fr: [
        { title: "📱 1. Trois modes d'intervention", desc: "App smartphone (Mode 1), SMS interactif (Mode 2) ou feuilles imprimées (Mode 3)." },
        { title: "📍 2. Missions de collecte actives", desc: "Consultez les adresses et types de ferraille. Rendez-vous sur place pour vérification." },
        { title: "📦 3. Sceller et générer le QR du lot", desc: "Pesez les matières, scellez le sac et apposez le QR code cryptographique." },
        { title: "⚖️ 4. Contrôle au Hub municipal", desc: "Livrez au centre. Le pesage officiel déclenche le règlement immédiat." },
        { title: "📴 5. Enregistrement sans mobile (COL-NP)", desc: "Enregistrez des ramasseurs sans téléphone avec effacement garanti des données." }
      ],
      de: [
        { title: "📱 1. Drei Betriebsmodi", desc: "Smartphone-App (Modus 1), SMS für Tastenhandys (Modus 2) oder gedruckte Listen (Modus 3)." },
        { title: "📍 2. Aktive Sammelaufträge", desc: "Adressen und Schrottkategorien einsehen. Direkt zum Kunden navigieren." },
        { title: "📦 3. Charge versiegeln & QR erzeugen", desc: "Vor Ort wiegen, Sack versiegeln und unveränderlichen QR-Code generieren." },
        { title: "⚖️ 4. Übergabe & Wiegung am Hub", desc: "Lieferung an kommunalen Hub. Digitale Waage löst sofortige Abrechnung aus." },
        { title: "📴 5. Registrierung ohne Handy (COL-NP)", desc: "Ausgabe von COL-NP-Pässen für Sammler ohne Smartphone mit Datenschutzlöschung." }
      ],
      ja: [
        { title: "📱 1. 3つの運用モード", desc: "スマホアプリ（モード1）、SMS端末（モード2）、印刷伝票（モード3）に対応。" },
        { title: "📍 2. 収集割当と現場確認", desc: "依頼元の住所と品目を確認し、現地で回収物の事前確認を行います。" },
        { title: "📦 3. ロット密封とQR生成", desc: "計量後に袋を密封し、改ざん防止の暗号化QRコードを発行します。" },
        { title: "⚖️ 4. 集積拠点での公式計量", desc: "拠点のデジタル台秤で公式検量を受け、即座に決済が完了します。" },
        { title: "📴 5. 携帯を持たない方の登録 (COL-NP)", desc: "端末不要の特別トークンを発行。情報は端末から即座に完全消去されます。" }
      ],
      ar: [
        { title: "📱 1. ثلاث طرق للتشغيل", desc: "تطبيق الهاتف الذكي (النمط 1)، رسائل SMS للهواتف العادية (النمط 2)، أو الكشوفات المطبوعة (النمط 3)." },
        { title: "📍 2. مهام الجمع الميداني", desc: "عرض عناوين المنازل وفئات الخردة. التوجه مباشرة إلى الموقع للفحص." },
        { title: "📦 3. ختم الشحنة وإنشاء رمز QR", desc: "الوزن بالميزان الميداني، إغلاق الكيس، وإصدار رمز QR رقمي محمي." },
        { title: "⚖️ 4. التسليم في مركز التجميع", desc: "تسليم الشحنات المختومة. الميزان الرسمي يؤكد الوزن ويصرف المستحقات." },
        { title: "📴 5. تسجيل الأفراد دون هواتف (COL-NP)", desc: "إصدار بطاقات رسمية للأفراد غير الحاملين لهواتف مع حذف البيانات من جهازك فوراً." }
      ]
    };

    // -------------------------------------------------------------
    // Multilingual Video Catalog Metadata & Step Captions
    // -------------------------------------------------------------
    this.videos = {
      hh_impact: {
        title: "Verified Recycling & Weight Match Overview",
        subtitle: "How verified weights, segregation scores, and green incentives work",
        interface: "household",
        duration: 20,
        steps: [
          { time: 0, text: "Household dashboard shows verified recycling weight from Storage Hub.", visual: "counter" },
          { time: 5, text: "Segregation score increases when dry and wet waste are segregated.", visual: "score" },
          { time: 11, text: "When your estimate matches hub scale weight within ±5%, celebration unlocks!", visual: "match" },
          { time: 16, text: "Transparent receipts show verified weight multiplied by company buying rate.", visual: "settlement" }
        ]
      },
      hh_scanner: {
        title: "Local AI Waste Scanner Demonstration",
        subtitle: "Neural on-device waste classification with regional Indian presets",
        interface: "household",
        duration: 20,
        steps: [
          { time: 0, text: "Point camera or select regional scrap preset like Copper Wires or PCB.", visual: "scan_camera" },
          { time: 5, text: "On-device AI analyzes visual texture, copper sheen, and solder points.", visual: "scan_ai" },
          { time: 11, text: "Classification complete: Copper Wires (94.4% Confidence, Segregation 93/100).", visual: "scan_result" },
          { time: 16, text: "Instant indicative price calculated: ₹5,800. Tap to schedule doorstep pickup!", visual: "scan_price" }
        ]
      },
      hh_pickup: {
        title: "Booking a Doorstep Scrap Pickup",
        subtitle: "Confirmed location, preferred date/time slots, and zonal collector assignment",
        interface: "household",
        duration: 20,
        steps: [
          { time: 0, text: "Open Request Pickup modal from Home or Scanner screen.", visual: "pickup_open" },
          { time: 5, text: "Confirm your household address on the interactive location map.", visual: "pickup_map" },
          { time: 11, text: "Choose preferred date and convenient time slot (e.g. 10 AM - 12 PM).", visual: "pickup_slot" },
          { time: 16, text: "Request confirmed! Nearest zonal collector receives assignment immediately.", visual: "pickup_done" }
        ]
      },
      hh_settlement: {
        title: "Transparent Digital Settlements & Tolerance Matches",
        subtitle: "Verified Weight × Buying Rate with zero hidden deductions",
        interface: "household",
        duration: 20,
        steps: [
          { time: 0, text: "Field collector delivers your scrap lot to the official Storage Hub.", visual: "settle_hub" },
          { time: 5, text: "Hub digital scale verifies physical weight (e.g. 10.0 kg).", visual: "settle_scale" },
          { time: 11, text: "Celebration popup triggers: Congratulations! Cleaner & Greener Environment!", visual: "settle_celeb" },
          { time: 16, text: "Final payment calculated: 10.0 kg × ₹504.40/kg = ₹5,044.00 direct settlement.", visual: "settle_calc" }
        ]
      },
      hh_rewards: {
        title: "Eco Rewards & Multilingual Voice Guide",
        subtitle: "Earning green tokens and dictating notes in 19 Indian languages",
        interface: "household",
        duration: 20,
        steps: [
          { time: 0, text: "Earn Eco Reward tokens for every kilogram of verified segregated waste.", visual: "reward_tokens" },
          { time: 5, text: "Tap the Voice Assistant button to speak instructions in your mother tongue.", visual: "reward_mic" },
          { time: 11, text: "Speech recognition converts spoken notes into verified pickup instructions.", visual: "reward_text" },
          { time: 16, text: "End-to-end QR digital chain ensures full traceability from your doorstep.", visual: "reward_qr" }
        ]
      },
      col_modes: {
        title: "Three Multi-Mode Field Collector Workflows",
        subtitle: "Mode 1 Smartphone App, Mode 2 Basic SMS, Mode 3 Physical Sheets",
        interface: "collector",
        duration: 20,
        steps: [
          { time: 0, text: "EcoFlow empowers all collectors: smartphone users and basic phone users alike.", visual: "modes_intro" },
          { time: 5, text: "Mode 1: Smartphone app with GPS navigation, live assignments, and offline QR.", visual: "mode1_app" },
          { time: 11, text: "Mode 2: Two-way SMS interactive terminal for simple keypad phones.", visual: "mode2_sms" },
          { time: 16, text: "Mode 3: Printed coordinator dispatch sheets for non-phone collectors.", visual: "mode3_sheet" }
        ]
      },
      col_assignment: {
        title: "Receiving & Executing Collection Assignments",
        subtitle: "Live assignment cards, customer verification, and doorstep arrival",
        interface: "collector",
        duration: 20,
        steps: [
          { time: 0, text: "Toggle your status to ONLINE to receive nearby household pickup requests.", visual: "assign_online" },
          { time: 5, text: "New assignment card pops up with customer name, zone, and scrap category.", visual: "assign_card" },
          { time: 11, text: "Arrive at customer doorstep and perform preliminary physical check.", visual: "assign_doorstep" },
          { time: 16, text: "Customer confirms scrap handoff. Ready to weigh and seal lot!", visual: "assign_confirm" }
        ]
      },
      col_seallot: {
        title: "Sealing Digital Waste Lot & QR Generation",
        subtitle: "Tamper-evident lot sealing and end-to-end cryptographic QR code",
        interface: "collector",
        duration: 20,
        steps: [
          { time: 0, text: "Weigh the collected scrap sack using portable spring or digital scale.", visual: "seal_weigh" },
          { time: 5, text: "Enter collector observed weight (e.g. 10 kg Copper & E-Waste).", visual: "seal_input" },
          { time: 11, text: "Tap 'Seal & Generate Waste Lot QR'. Unique LOT-2026 QR is generated!", visual: "seal_qr" },
          { time: 16, text: "Tie tamper-evident seal. Digital custody is permanently locked on device.", visual: "seal_complete" }
        ]
      },
      col_transfer: {
        title: "Storage Hub Custody Transfer & Digital Weighing",
        subtitle: "Handoff to official hub digital scale verification station",
        interface: "collector",
        duration: 20,
        steps: [
          { time: 0, text: "Transport sealed lots to the designated municipal Storage Hub.", visual: "trans_arrive" },
          { time: 5, text: "Storage Hub authority scans your lot QR code at the intake station.", visual: "trans_scan" },
          { time: 11, text: "Calibrated digital scale weighs the lot to establish source of truth.", visual: "trans_scale" },
          { time: 16, text: "Lot verified! Immediate settlement released to household and collector logged.", visual: "trans_done" }
        ]
      },
      col_grassroots: {
        title: "Grassroots Peer Registration (Phone-less COL-NP)",
        subtitle: "Registering informal waste-pickers with special NP code and privacy erasure",
        interface: "collector",
        duration: 20,
        steps: [
          { time: 0, text: "Empower informal waste-pickers who do not possess a smartphone or SIM.", visual: "grass_intro" },
          { time: 5, text: "Open Peer Registration modal and enter their name and operating area.", visual: "grass_form" },
          { time: 11, text: "System generates official unique ID with special 'NP' code (e.g. COL-NP-0024).", visual: "grass_token" },
          { time: 16, text: "Zero-knowledge privacy: All candidate data is wiped from your device.", visual: "grass_privacy" }
        ]
      }
    };
  }

  // ==========================================
  // STEP-BY-STEP TUTORIAL GUIDE CONTROLLER
  // ==========================================
  startGuide(context) {
    this.currentContext = context;
    this.currentStepIndex = 0;
    this.isSpeakingGuide = false;

    const modal = document.getElementById("tutorial-guide-modal");
    if (modal) {
      modal.classList.add("active");
    }

    this.renderCurrentGuideStep();
  }

  closeGuide() {
    const modal = document.getElementById("tutorial-guide-modal");
    if (modal) {
      modal.classList.remove("active");
    }
    this.clearSpotlight();
    this.isSpeakingGuide = false;
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    this.updateSpeakButton(false);
  }

  getStepsList() {
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';
    const isCol = (this.currentContext === 'collector');
    const baseList = isCol ? this.collectorBaseSteps : this.householdBaseSteps;
    const textDict = isCol ? this.collectorStepsI18n : this.householdStepsI18n;
    const texts = textDict[lang] || textDict['en'] || [];

    return baseList.map((base, idx) => {
      const t = texts[idx] || {};
      return {
        ...base,
        title: t.title || `Step ${idx + 1}`,
        desc: t.desc || ""
      };
    });
  }

  renderCurrentGuideStep() {
    const steps = this.getStepsList();
    if (this.currentStepIndex >= steps.length) {
      this.closeGuide();
      return;
    }

    const step = steps[this.currentStepIndex];
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';

    // Update Modal DOM
    const badgeEl = document.getElementById("tut-guide-badge");
    const titleEl = document.getElementById("tut-guide-title");
    const descEl = document.getElementById("tut-guide-desc");
    const counterEl = document.getElementById("tut-guide-counter");
    const prevBtn = document.getElementById("tut-guide-btn-prev");
    const nextBtn = document.getElementById("tut-guide-btn-next");
    const dotsContainer = document.getElementById("tut-guide-dots");
    const videoBtn = document.getElementById("tut-guide-btn-video");
    const speakBtn = document.getElementById("tut-guide-btn-speak");

    const badges = {
      en: this.currentContext === 'collector' ? "🚚 Field Collector Training" : "🏠 Household Recycling Guide",
      hi: this.currentContext === 'collector' ? "🚚 फील्ड कलेक्टर प्रशिक्षण" : "🏠 घरेलू रीसाइक्लिंग गाइड",
      mr: this.currentContext === 'collector' ? "🚚 फील्ड कलेक्टर प्रशिक्षण" : "🏠 घरगुती पुनर्वापर मार्गदर्शक",
      gu: this.currentContext === 'collector' ? "🚚 ફીલ્ડ કલેક્ટર તાલીમ" : "🏠 ઘરગથ્થુ રિસાયક્લિંગ ગાઇડ",
      mwr: this.currentContext === 'collector' ? "🚚 फील्ड कलेक्टर ट्रेनिंग" : "🏠 घरेलू रिसाइक्लिंग गाइड सा",
      te: this.currentContext === 'collector' ? "🚚 ఫీల్డ్ కలెక్టర్ శిక్షణ" : "🏠 గృహ రీసైక్లింగ్ గైడ్",
      ta: this.currentContext === 'collector' ? "🚚 கள சேகரிப்பாளர் பயிற்சி" : "🏠 வீட்டு மறுசுழற்சி வழிகாட்டி",
      kn: this.currentContext === 'collector' ? "🚚 ಫೀಲ್ಡ್ ಕಲೆಕ್ಟರ್ ತರಬೇತಿ" : "🏠 ಮನೆಬಳಕೆ ಮರುಬಳಕೆ ಮಾರ್ಗದರ್ಶಿ",
      ml: this.currentContext === 'collector' ? "🚚 ഫീൽഡ് കളക്ടർ പരിശീലനം" : "🏠 ഗാർഹിക പുനരുപയോഗ ഗൈഡ്",
      pa: this.currentContext === 'collector' ? "🚚 ਫੀਲਡ ਕੁਲੈਕਟਰ ਸਿਖਲਾਈ" : "🏠 ਘਰੇਲੂ ਰੀਸਾਈਕਲਿੰਗ ਗਾਈਡ",
      as: this.currentContext === 'collector' ? "🚚 সংগ্ৰাহক প্ৰশিক্ষণ" : "🏠 ঘৰুৱা পুনৰ্ব্যৱহাৰ গাইড",
      bn: this.currentContext === 'collector' ? "🚚 ফিল্ড কালেক্টর ট্রেনিং" : "🏠 গার্হস্থ্য পুনর্ব্যবহার গাইড",
      or: this.currentContext === 'collector' ? "🚚 ଫିଲ୍ଡ କଲେକ୍ଟର ତାଲିମ" : "🏠 ଘରୋଇ ପୁନଃଚକ୍ରଣ ଗାଇଡ୍",
      ur: this.currentContext === 'collector' ? "🚚 فیلڈ کلیکٹر ٹریننگ" : "🏠 گھریلو ری سائیکلنگ گائیڈ",
      es: this.currentContext === 'collector' ? "🚚 Entrenamiento de Recolector" : "🏠 Guía de Reciclaje del Hogar",
      fr: this.currentContext === 'collector' ? "🚚 Formation des Collecteurs" : "🏠 Guide de Recyclage Domestique",
      de: this.currentContext === 'collector' ? "🚚 Schulung der Sammler" : "🏠 Haushalts-Recyclingführer",
      ja: this.currentContext === 'collector' ? "🚚 フィールドコレクター研修" : "🏠 家庭用リサイクルガイド",
      ar: this.currentContext === 'collector' ? "🚚 تدريب جامع النفايات الميداني" : "🏠 دليل إعادة التدوير المنزلي"
    };

    const nextTexts = {
      en: "Next Step ▶", hi: "अगला कदम ▶", mr: "पुढील पायरी ▶", gu: "આગળનું પગલું ▶",
      mwr: "आगलो कदम ▶", te: "తరువాతి దశ ▶", ta: "அடுத்த படி ▶", kn: "ಮುಂದಿನ ಹಂತ ▶",
      ml: "അടുത്ത ഘട്ടം ▶", pa: "ਅਗਲਾ ਕਦਮ ▶", as: "পৰৱৰ্তী পদক্ষেপ ▶", bn: "পরবর্তী ধাপ ▶",
      or: "ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ ▶", ur: "اگلا مرحلہ ▶", es: "Siguiente ▶", fr: "Suivant ▶",
      de: "Nächster Schritt ▶", ja: "次へ ▶", ar: "الخطوة التالية ▶"
    };

    const finishTexts = {
      en: "🎉 Finish Guide", hi: "🎉 गाइड पूरा करें", mr: "🎉 पूर्ण करा", gu: "🎉 પૂર્ણ કરો",
      mwr: "🎉 काम पूरो सा", te: "🎉 పూర్తి చేయండి", ta: "🎉 வழிகாட்டியை முடிக்கவும்", kn: "🎉 ಮುಕ್ತಾಯ",
      ml: "🎉 പൂർത്തിയാക്കുക", pa: "🎉 ਮੁਕੰਮਲ ਕਰੋ", as: "🎉 সমাপ্ত কৰক", bn: "🎉 সম্পন্ন করুন",
      or: "🎉 ସମାପ୍ତ କରନ୍ତୁ", ur: "🎉 مکمل کریں", es: "🎉 Finalizar Guía", fr: "🎉 Terminer le Guide",
      de: "🎉 Leitfaden beenden", ja: "🎉 ガイド完了", ar: "🎉 إنهاء الدليل"
    };

    const prevTexts = {
      en: "◀ Previous", hi: "◀ पिछला", mr: "◀ मागे", gu: "◀ પાછળ",
      mwr: "◀ पाछलो", te: "◀ మునుపటిది", ta: "◀ முந்தைய", kn: "◀ ಹಿಂದಿನ",
      ml: "◀ മുൻപത്തെ", pa: "◀ ਪਿਛਲਾ", as: "◀ পূৰ্বৱৰ্তী", bn: "◀ পূর্ববর্তী",
      or: "◀ ପୂର୍ବବର୍ତ୍ତୀ", ur: "◀ پچھلا", es: "◀ Anterior", fr: "◀ Précédent",
      de: "◀ Zurück", ja: "◀ 前へ", ar: "◀ السابق"
    };

    const videoBtnTexts = {
      en: "🎥 Watch Video", hi: "🎥 वीडियो देखें", mr: "🎥 व्हिडिओ पहा", gu: "🎥 વિડિયો જુઓ",
      mwr: "🎥 वीडियो देखो सा", te: "🎥 వీడియో చూడండి", ta: "🎥 வீடியோ காண்க", kn: "🎥 ವೀಡಿಯೊ ನೋಡಿ",
      ml: "🎥 വീഡിയോ കാണുക", pa: "🎥 ਵੀਡੀਓ ਵੇਖੋ", as: "🎥 ভিডিঅ' চাওক", bn: "🎥 ভিডিও দেখুন",
      or: "🎥 ଭିଡିଓ ଦେଖନ୍ତୁ", ur: "🎥 ویڈیو دیکھیں", es: "🎥 Ver Video", fr: "🎥 Voir la Vidéo",
      de: "🎥 Video ansehen", ja: "🎥 動画を見る", ar: "🎥 مشاهدة الفيديو"
    };

    if (badgeEl) badgeEl.textContent = badges[lang] || badges.en;
    if (titleEl) titleEl.textContent = step.title;
    if (descEl) descEl.textContent = step.desc;
    if (counterEl) counterEl.textContent = `${this.currentStepIndex + 1} / ${steps.length}`;

    if (prevBtn) {
      prevBtn.textContent = prevTexts[lang] || prevTexts.en;
      prevBtn.style.display = (this.currentStepIndex === 0) ? "none" : "inline-flex";
    }

    if (nextBtn) {
      const isLast = (this.currentStepIndex === steps.length - 1);
      nextBtn.textContent = isLast ? (finishTexts[lang] || finishTexts.en) : (nextTexts[lang] || nextTexts.en);
    }

    if (videoBtn) {
      videoBtn.textContent = videoBtnTexts[lang] || videoBtnTexts.en;
      videoBtn.onclick = () => {
        this.openVideo(step.videoKey);
      };
    }

    this.updateSpeakButton(this.isSpeakingGuide);

    // Render Progress Dots
    if (dotsContainer) {
      dotsContainer.innerHTML = steps.map((s, idx) => `
        <span class="tut-dot ${idx === this.currentStepIndex ? 'active' : ''}" onclick="tutorialController.jumpToStep(${idx})"></span>
      `).join("");
    }

    // Spotlight target element on page
    this.highlightTarget(step.targetSelector);
  }

  highlightTarget(selector) {
    this.clearSpotlight();
    if (!selector) return;

    try {
      const el = document.querySelector(selector);
      if (el) {
        el.classList.add("tut-spotlight-active");
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) {}
  }

  clearSpotlight() {
    document.querySelectorAll(".tut-spotlight-active").forEach(el => {
      el.classList.remove("tut-spotlight-active");
    });
  }

  nextStep() {
    const steps = this.getStepsList();
    if (this.currentStepIndex < steps.length - 1) {
      this.currentStepIndex++;
      this.renderCurrentGuideStep();
      if (this.isSpeakingGuide) {
        this.speakCurrentStep();
      }
    } else {
      this.closeGuide();
    }
  }

  prevStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.renderCurrentGuideStep();
      if (this.isSpeakingGuide) {
        this.speakCurrentStep();
      }
    }
  }

  jumpToStep(index) {
    const steps = this.getStepsList();
    if (index >= 0 && index < steps.length) {
      this.currentStepIndex = index;
      this.renderCurrentGuideStep();
      if (this.isSpeakingGuide) {
        this.speakCurrentStep();
      }
    }
  }

  updateSpeakButton(speaking) {
    const speakBtn = document.getElementById("tut-guide-btn-speak");
    if (!speakBtn) return;
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';

    const speakLabels = {
      en: "🔊 Speak", hi: "🔊 बोलकर सुनाएं", mr: "🔊 ऐका", gu: "🔊 સાંભળો",
      mwr: "🔊 सुणो सा", te: "🔊 వినండి", ta: "🔊 கேட்க", kn: "🔊 ಕೇಳಿ",
      ml: "🔊 കേൾക്കുക", pa: "🔊 ਸੁਣੋ", as: "🔊 শুনক", bn: "🔊 শুনুন",
      or: "🔊 ଶୁଣନ୍ତୁ", ur: "🔊 سنیں", es: "🔊 Escuchar", fr: "🔊 Écouter",
      de: "🔊 Vorlesen", ja: "🔊 音声再生", ar: "🔊 استمع"
    };

    const speakingLabels = {
      en: "🔊 Speaking...", hi: "🔊 बोल रहा है...", mr: "🔊 सुरू आहे...", gu: "🔊 બોલી રહ્યું છે...",
      mwr: "🔊 बोल रियो है...", te: "🔊 మాట్లాడుతోంది...", ta: "🔊 பேசுகிறது...", kn: "🔊 ಮಾತನಾಡುತ್ತಿದೆ...",
      ml: "🔊 സംസാരിക്കുന്നു...", pa: "🔊 ਬੋਲ ਰਿਹਾ ਹੈ...", as: "🔊 কৈ থকা হৈছে...", bn: "🔊 বলছে...",
      or: "🔊 ବୋଲୁଛି...", ur: "🔊 بول رہا ہے...", es: "🔊 Hablando...", fr: "🔊 En cours...",
      de: "🔊 Liest vor...", ja: "🔊 再生中...", ar: "🔊 يتحدث..."
    };

    if (speaking) {
      speakBtn.textContent = speakingLabels[lang] || speakingLabels.en;
      speakBtn.classList.add("active");
    } else {
      speakBtn.textContent = speakLabels[lang] || speakLabels.en;
      speakBtn.classList.remove("active");
    }
  }

  speakCurrentStep() {
    const steps = this.getStepsList();
    const step = steps[this.currentStepIndex];
    if (!step || !('speechSynthesis' in window)) return;

    if (this.isSpeakingGuide) {
      window.speechSynthesis.cancel();
      this.isSpeakingGuide = false;
      this.updateSpeakButton(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const textToSpeak = `${step.title}. ${step.desc}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';
      const localeMap = {
        hi: 'hi-IN', mr: 'mr-IN', gu: 'gu-IN', mwr: 'hi-IN', te: 'te-IN',
        ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', as: 'bn-IN',
        bn: 'bn-IN', or: 'hi-IN', ur: 'ur-PK', es: 'es-ES', fr: 'fr-FR',
        de: 'de-DE', ja: 'ja-JP', ar: 'ar-SA', en: 'en-IN'
      };
      utterance.lang = localeMap[lang] || 'en-IN';
      utterance.rate = 0.95;

      this.isSpeakingGuide = true;
      this.updateSpeakButton(true);

      utterance.onend = () => {
        this.isSpeakingGuide = false;
        this.updateSpeakButton(false);
      };
      utterance.onerror = () => {
        this.isSpeakingGuide = false;
        this.updateSpeakButton(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Guide speech synthesis error:", e);
      this.isSpeakingGuide = false;
      this.updateSpeakButton(false);
    }
  }

  /**
   * Called automatically when UI language changes
   */
  onLanguageChange(lang) {
    const guideModal = document.getElementById("tutorial-guide-modal");
    if (guideModal && guideModal.classList.contains("active")) {
      const wasSpeaking = this.isSpeakingGuide;
      if (wasSpeaking && window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      this.renderCurrentGuideStep();
      if (wasSpeaking) {
        setTimeout(() => this.speakCurrentStep(), 200);
      }
    }

    const videoModal = document.getElementById("tutorial-video-modal");
    if (videoModal && videoModal.classList.contains("active") && this.activeVideoKey) {
      const v = this.videos[this.activeVideoKey];
      if (v) {
        this.renderVideoPlaylist(v.interface);
      }
    }
  }

  // ==========================================
  // TUTORIAL VIDEO DEMONSTRATION PLAYER
  // ==========================================
  openVideo(videoKey) {
    const videoData = this.videos[videoKey];
    if (!videoData) return;

    this.activeVideoKey = videoKey;
    this.videoDuration = videoData.duration || 20;
    this.videoCurrentTime = 0;
    this.isPlayingVideo = true;

    const modal = document.getElementById("tutorial-video-modal");
    if (modal) {
      modal.classList.add("active");
    }

    // Populate Video Metadata
    const titleEl = document.getElementById("tut-video-title");
    const subEl = document.getElementById("tut-video-sub");
    if (titleEl) titleEl.textContent = videoData.title;
    if (subEl) subEl.textContent = videoData.subtitle;

    // Render Side Menu for features of that interface
    this.renderVideoPlaylist(videoData.interface);

    // Start video animation loop
    this.startVideoAnimation();
  }

  closeVideo() {
    this.pauseVideo();
    const modal = document.getElementById("tutorial-video-modal");
    if (modal) {
      modal.classList.remove("active");
    }
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
  }

  renderVideoPlaylist(interfaceType) {
    const listContainer = document.getElementById("tut-video-playlist-items");
    if (!listContainer) return;

    const keys = Object.keys(this.videos).filter(k => this.videos[k].interface === interfaceType);

    listContainer.innerHTML = keys.map(k => {
      const v = this.videos[k];
      const isActive = (k === this.activeVideoKey);
      return `
        <div class="tut-playlist-item ${isActive ? 'active' : ''}" onclick="tutorialController.openVideo('${k}')">
          <div class="tut-pl-icon">🎥</div>
          <div class="tut-pl-text">
            <strong>${v.title}</strong>
            <span class="small text-muted">0:${v.duration}s Tutorial</span>
          </div>
        </div>
      `;
    }).join("");
  }

  toggleVideoPlay() {
    if (this.isPlayingVideo) {
      this.pauseVideo();
    } else {
      this.playVideo();
    }
  }

  playVideo() {
    this.isPlayingVideo = true;
    const playBtn = document.getElementById("tut-video-play-btn");
    if (playBtn) playBtn.innerHTML = "❚❚";
    this.startVideoAnimation();
  }

  pauseVideo() {
    this.isPlayingVideo = false;
    clearInterval(this.videoTimer);
    const playBtn = document.getElementById("tut-video-play-btn");
    if (playBtn) playBtn.innerHTML = "▶";
    if (window.speechSynthesis) {
      try { window.speechSynthesis.pause(); } catch (e) {}
    }
  }

  restartVideo() {
    this.videoCurrentTime = 0;
    this.playVideo();
  }

  seekVideo(percent) {
    this.videoCurrentTime = (percent / 100) * this.videoDuration;
    this.updateVideoFrame();
  }

  setSpeed(speed) {
    this.videoSpeed = speed;
    document.querySelectorAll(".tut-speed-btn").forEach(btn => {
      btn.classList.toggle("active", parseFloat(btn.dataset.speed) === speed);
    });
    if (this.isPlayingVideo) {
      clearInterval(this.videoTimer);
      this.startVideoAnimation();
    }
  }

  toggleVoiceover() {
    this.videoVoiceoverEnabled = !this.videoVoiceoverEnabled;
    const btn = document.getElementById("tut-video-voice-btn");
    if (btn) {
      btn.classList.toggle("active", this.videoVoiceoverEnabled);
      btn.title = this.videoVoiceoverEnabled ? "Voiceover narration: ON" : "Voiceover narration: OFF";
    }
    if (!this.videoVoiceoverEnabled && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
  }

  startVideoAnimation() {
    clearInterval(this.videoTimer);
    const intervalMs = 100 / this.videoSpeed;

    this.videoTimer = setInterval(() => {
      if (this.videoCurrentTime >= this.videoDuration) {
        this.videoCurrentTime = this.videoDuration;
        this.pauseVideo();
        return;
      }
      this.videoCurrentTime += 0.1;
      this.updateVideoFrame();
    }, intervalMs);

    this.updateVideoFrame();
  }

  updateVideoFrame() {
    const videoData = this.videos[this.activeVideoKey];
    if (!videoData) return;

    // 1. Update Time Display
    const currentSec = Math.floor(this.videoCurrentTime);
    const timeDisplay = document.getElementById("tut-video-time-display");
    if (timeDisplay) {
      timeDisplay.textContent = `0:${currentSec < 10 ? '0' + currentSec : currentSec} / 0:${videoData.duration}`;
    }

    // 2. Update Progress Bar
    const progressFill = document.getElementById("tut-video-progress-fill");
    if (progressFill) {
      const pct = (this.videoCurrentTime / videoData.duration) * 100;
      progressFill.style.width = `${Math.min(pct, 100)}%`;
    }

    // 3. Find Active Subtitle / Step
    let activeStep = videoData.steps[0];
    for (const s of videoData.steps) {
      if (this.videoCurrentTime >= s.time) {
        activeStep = s;
      }
    }

    // Update Subtitle & Caption
    const captionEl = document.getElementById("tut-video-caption-text");
    if (captionEl && captionEl.textContent !== activeStep.text) {
      captionEl.textContent = activeStep.text;
      if (this.videoVoiceoverEnabled && this.isPlayingVideo) {
        this.speakCaption(activeStep.text);
      }
    }

    // 4. Render Animated Canvas Frame
    this.renderCanvasFrame(activeStep.visual, this.videoCurrentTime);
  }

  speakCaption(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';
      const localeMap = {
        hi: 'hi-IN', mr: 'mr-IN', gu: 'gu-IN', mwr: 'hi-IN', te: 'te-IN',
        ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', as: 'bn-IN',
        bn: 'bn-IN', or: 'hi-IN', ur: 'ur-PK', es: 'es-ES', fr: 'fr-FR',
        de: 'de-DE', ja: 'ja-JP', ar: 'ar-SA', en: 'en-IN'
      };
      utterance.lang = localeMap[lang] || 'en-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }

  renderCanvasFrame(visualType, time) {
    const canvas = document.getElementById("tut-video-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Dark sleek backdrop with grid
    ctx.fillStyle = "#0B132B";
    ctx.fillRect(0, 0, w, h);

    // Subtle background mesh grid
    ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Dynamic Visual Renderer based on visualType
    ctx.save();

    if (visualType.startsWith("scan_")) {
      const cx = w / 2;
      const cy = h / 2 - 20;

      // Scrap bundle illustration
      ctx.fillStyle = "#B45309";
      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillText("⚡ COPPER", cx, cy + 10);

      // Scanning HUD box
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 3;
      ctx.strokeRect(cx - 100, cy - 80, 200, 160);

      // Animated green laser line moving up and down
      const laserY = cy - 80 + ((Math.sin(time * 3) + 1) / 2) * 160;
      ctx.strokeStyle = "#34D399";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#34D399";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(cx - 95, laserY);
      ctx.lineTo(cx + 95, laserY);
      ctx.stroke();

      // Confidence badge
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
      ctx.fillRect(cx - 85, cy + 95, 170, 26);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("AI: 94.4% CONFIDENCE", cx, cy + 113);
    } else if (visualType.startsWith("mode2_sms")) {
      const cx = w / 2;
      const cy = h / 2 - 10;

      // Mobile phone body
      ctx.fillStyle = "#1E293B";
      ctx.roundRect(cx - 80, cy - 110, 160, 220, 16);
      ctx.fill();
      ctx.strokeStyle = "#64748B";
      ctx.stroke();

      // Phone screen
      ctx.fillStyle = "#0284C7";
      ctx.fillRect(cx - 70, cy - 95, 140, 120);

      // SMS bubble
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "10px monospace";
      ctx.fillText("📨 NEW PICKUP!", cx - 60, cy - 70);
      ctx.fillText("Zone B • 10kg Copper", cx - 60, cy - 50);
      ctx.fillStyle = "#FEF08A";
      ctx.fillText("Reply 1 to ACCEPT", cx - 60, cy - 30);
      ctx.fillText("Reply 2 to DECLINE", cx - 60, cy - 10);

      // Keypad buttons
      ctx.fillStyle = "#334155";
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.fillRect(cx - 50 + c * 38, cy + 35 + r * 22, 28, 16);
        }
      }
    } else if (visualType.startsWith("settle_") || visualType === "counter") {
      const cx = w / 2;
      const cy = h / 2 - 15;

      // Digital Scale Station
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(cx - 120, cy + 20, 240, 50);
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 120, cy + 20, 240, 50);

      // Scale Digital Display
      ctx.fillStyle = "#000000";
      ctx.fillRect(cx - 70, cy - 40, 140, 50);
      ctx.fillStyle = "#34D399";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      const liveWeight = (Math.min(10.0, 7.5 + (time % 5) * 0.6)).toFixed(1);
      ctx.fillText(`${liveWeight} kg`, cx, cy - 6);

      // Green celebratory badge
      ctx.fillStyle = "#10B981";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("🎉 WEIGHT MATCHED (±5%)", cx, cy + 100);
      ctx.fillStyle = "#93C5FD";
      ctx.font = "13px monospace";
      ctx.fillText("Formula: 10.0kg × ₹504.40 = ₹5,044.00", cx, cy + 124);
    } else if (visualType.startsWith("seal_") || visualType.includes("token") || visualType.includes("qr")) {
      const cx = w / 2;
      const cy = h / 2 - 20;

      // Tamper-evident lot sack
      ctx.fillStyle = "#374151";
      ctx.beginPath();
      ctx.arc(cx, cy + 20, 60, 0, Math.PI);
      ctx.fill();

      // Big QR Code Box
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(cx - 55, cy - 80, 110, 110);
      ctx.fillStyle = "#000000";
      ctx.fillRect(cx - 45, cy - 70, 30, 30);
      ctx.fillRect(cx + 15, cy - 70, 30, 30);
      ctx.fillRect(cx - 45, cy - 10, 30, 30);
      ctx.fillStyle = "#10B981";
      ctx.fillRect(cx - 10, cy - 35, 20, 20);

      ctx.fillStyle = "#34D399";
      ctx.font = "bold 15px monospace";
      ctx.textAlign = "center";
      ctx.fillText("LOT-2026-000184 [SEALED]", cx, cy + 65);

      ctx.fillStyle = "#A7F3D0";
      ctx.font = "12px sans-serif";
      ctx.fillText("🔒 Cryptographically Verified by Coordinator", cx, cy + 90);
    } else {
      const cx = w / 2;
      const cy = h / 2 - 10;

      ctx.strokeStyle = "#38BDF8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#0284C7";
      ctx.beginPath();
      ctx.arc(cx, cy, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("EcoFlow AI", cx, cy - 5);
      ctx.font = "12px monospace";
      ctx.fillStyle = "#BAE6FD";
      ctx.fillText("Active Step", cx, cy + 16);
    }

    ctx.restore();
  }
}

// Global instance
const tutorialController = new TutorialController();

// Global invocation helpers
function openStepTutorial(context) {
  tutorialController.startGuide(context);
}

function closeStepTutorial() {
  tutorialController.closeGuide();
}

function openVideoModal(videoKey) {
  tutorialController.openVideo(videoKey);
}

function closeVideoModal() {
  tutorialController.closeVideo();
}
