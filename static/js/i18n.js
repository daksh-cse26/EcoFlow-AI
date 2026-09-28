/**
 * EcoFlow AI - Multilingual Localization Dictionary
 * Supported Languages: English (en), Hindi (hi), Assamese (as), Bengali (bn)
 * Section 7: Localization keys architecture
 */

const I18N = {
  en: {
    "app.name": "EcoFlow AI",
    "app.tagline": "AI-Assisted. Human-Verified. Digitally Traceable.",
    "nav.home": "Home",
    "nav.pickups": "Pickups",
    "nav.scan": "Scan Waste",
    "nav.rewards": "Rewards",
    "nav.profile": "Profile",
    "nav.command_map": "Command Map",
    "nav.hub_station": "Storage Hub",
    "nav.recyclers": "Recyclers",
    "nav.ai_admin": "AI Models",
    "greeting.title": "Good Morning, Rahul Sharma 🌱",
    "greeting.subtitle": "Your Household Recycling Impact Overview",
    "impact.verified_weight": "Verified Recycling",
    "impact.pickups_count": "Completed Pickups",
    "impact.segregation_score": "Segregation Score",
    "impact.weight_matches": "Weight Matches",
    "action.scan_waste": "Scan Waste",
    "action.request_pickup": "Request Pickup",
    "action.track_pickup": "Track Pickup",
    "action.view_settlements": "View Settlements",
    "scanner.title": "Local AI Waste Scanner",
    "scanner.subtitle": "On-Device & Regional Waste Neural Classification",
    "scanner.disclaimer": "AI assessment is preliminary. Final material, weight and quality will be verified at the storage hub.",
    "scanner.detected_material": "Detected Material",
    "scanner.confidence": "Confidence Score",
    "scanner.segregation_score": "Segregation Score",
    "scanner.recommendation": "Segregation Recommendation",
    "scanner.sample_presets": "Select Sample Regional Scrap:",
    "weight.estimated_label": "User Estimated Weight (kg):",
    "weight.disclaimer": "This is an estimated value. Final weight will be determined during physical verification.",
    "pricing.indicative_rate": "Indicative Rate",
    "pricing.indicative_value": "Indicative Value",
    "pricing.disclaimer": "Indicative value only. Final settlement depends on verified material, weight and quality.",
    "pickup.title": "Confirm & Schedule Pickup",
    "pickup.address": "Household Address",
    "pickup.landmark": "Landmark / Sector",
    "pickup.zone": "Service Zone",
    "pickup.date": "Preferred Date",
    "pickup.slot": "Preferred Time Slot",
    "pickup.notes": "Instructions for Collector",
    "pickup.submit": "Submit Pickup Request",
    "pickup.success": "Pickup request created successfully.",
    "rewards.coming_soon": "COMING SOON",
    "rewards.locked_msg": "Rewards program launching soon across municipal zones.",
    "voice.tap_to_speak": "Tap to Speak",
    "voice.listening": "Listening... Speak in English, Hindi, Assamese or Bengali",
    "voice.confirm": "Confirm Speech",
    "voice.edit": "Edit",
    "voice.cancel": "Cancel",
    "settlement.title": "Verified Recycling Settlement",
    "settlement.ai_assessment": "AI Assessment",
    "settlement.user_estimate": "User Estimate",
    "settlement.hub_verified": "Hub Verified",
    "settlement.quality": "Quality Grade",
    "settlement.buying_rate": "Company Buying Rate",
    "settlement.calculation": "Settlement Calculation",
    "settlement.final_amount": "Final Payable Amount",
    "settlement.weight_match_celebration": "Congratulations! You are making a Cleaner and Greener Environment.",
    "settlement.weight_match_subtext": "Your estimated weight matched the verified weight within acceptable tolerance.",
    "settlement.weight_diff_notice": "Your estimated and verified weights are different. The verified weight will be used for the final settlement.",
    "traceability.title": "Complete Digital Traceability Chain",
    "traceability.step1": "Household Request",
    "traceability.step2": "Assignment",
    "traceability.step3": "Field Collection",
    "traceability.step4": "Digital Lot (QR)",
    "traceability.step5": "AI Assessment",
    "traceability.step6": "Hub Verification",
    "traceability.step7": "Settlement",
    "traceability.step8": "Aggregated Inventory",
    "traceability.step9": "Recycler Offer & Sale",
    "traceability.step10": "Dispatch"
  },
  hi: {
    "app.name": "इकोफ्लो एआई (EcoFlow AI)",
    "app.tagline": "एआई-सहायक। मानव-सत्यापित। डिजिटल रूप से ट्रैक करने योग्य।",
    "nav.home": "होम",
    "nav.pickups": "पिकअप्स",
    "nav.scan": "कचरा स्कैन करें",
    "nav.rewards": "रिवार्ड्स",
    "nav.profile": "प्रोफ़ाइल",
    "nav.command_map": "कमांड मैप",
    "nav.hub_station": "स्टोरेज हब",
    "nav.recyclers": "रीसाइक्लर्स",
    "nav.ai_admin": "एआई मॉडल्स",
    "greeting.title": "शुभ प्रभात, राहुल शर्मा 🌱",
    "greeting.subtitle": "आपके घरेलू पुनर्चक्रण प्रभाव का अवलोकन",
    "impact.verified_weight": "सत्यापित पुनर्चक्रण",
    "impact.pickups_count": "पूर्ण पिकअप्स",
    "impact.segregation_score": "पृथक्करण स्कोर",
    "impact.weight_matches": "वजन समानताएं",
    "action.scan_waste": "कचरा स्कैन करें",
    "action.request_pickup": "पिकअप का अनुरोध करें",
    "action.track_pickup": "पिकअप ट्रैक करें",
    "action.view_settlements": "भुगतान देखें",
    "scanner.title": "स्थानीय एआई अपशिष्ट स्कैनर",
    "scanner.subtitle": "क्षेत्रीय अपशिष्ट वर्गीकरण मॉडल",
    "scanner.disclaimer": "एआई मूल्यांकन प्रारंभिक है। अंतिम सामग्री, वजन और गुणवत्ता स्टोरेज हब पर सत्यापित की जाएगी।",
    "scanner.detected_material": "पहचानी गई सामग्री",
    "scanner.confidence": "विश्वास स्कोर",
    "scanner.segregation_score": "पृथक्करण स्कोर",
    "scanner.recommendation": "पृथक्करण अनुशंसा",
    "scanner.sample_presets": "क्षेत्रीय नमूना कचरा चुनें:",
    "weight.estimated_label": "अनुमानित वजन (किग्रा):",
    "weight.disclaimer": "यह एक अनुमानित मान है। भौतिक सत्यापन के दौरान अंतिम वजन निर्धारित किया जाएगा।",
    "pricing.indicative_rate": "संकेतक दर",
    "pricing.indicative_value": "संकेतक मूल्य",
    "pricing.disclaimer": "केवल संकेतक मूल्य। अंतिम निपटान सत्यापित सामग्री, वजन और गुणवत्ता पर निर्भर करता है।",
    "pickup.title": "स्थान पुष्टि और पिकअप शेड्यूलिंग",
    "pickup.address": "घर का पता",
    "pickup.landmark": "लैंडमार्क",
    "pickup.zone": "सेवा क्षेत्र (Zone)",
    "pickup.date": "पसंदीदा तारीख",
    "pickup.slot": "पसंदीदा समय",
    "pickup.notes": "कलेक्टर के लिए निर्देश",
    "pickup.submit": "पिकअप अनुरोध सबमिट करें",
    "pickup.success": "पिकअप अनुरोध सफलतापूर्वक बनाया गया।",
    "rewards.coming_soon": "जल्द आ रहा है (COMING SOON)",
    "rewards.locked_msg": "रिवार्ड्स कार्यक्रम जल्द ही नगर निगम क्षेत्र में शुरू किया जाएगा।",
    "voice.tap_to_speak": "बोलने के लिए टैप करें",
    "voice.listening": "सुन रहा है... बोलिए",
    "voice.confirm": "पुष्टि करें",
    "voice.edit": "संपादित करें",
    "voice.cancel": "रद्द करें",
    "settlement.title": "सत्यापित पुनर्चक्रण निपटान",
    "settlement.ai_assessment": "एआई मूल्यांकन",
    "settlement.user_estimate": "उपयोगकर्ता अनुमान",
    "settlement.hub_verified": "हब सत्यापित",
    "settlement.quality": "गुणवत्ता ग्रेड",
    "settlement.buying_rate": "कंपनी खरीद दर",
    "settlement.calculation": "निपटान गणना",
    "settlement.final_amount": "अंतिम देय राशि",
    "settlement.weight_match_celebration": "बधाई हो! आप एक स्वच्छ और हरित पर्यावरण बना रहे हैं।",
    "settlement.weight_match_subtext": "आपका अनुमानित वजन स्वीकार्य सहनशीलता के भीतर सत्यापित वजन से मेल खाता है।",
    "settlement.weight_diff_notice": "आपका अनुमानित और सत्यापित वजन अलग है। अंतिम निपटान के लिए सत्यापित वजन का उपयोग किया जाएगा।",
    "traceability.title": "पूर्ण डिजिटल ट्रैसेबिलिटी श्रृंखला",
    "traceability.step1": "घरेलू अनुरोध",
    "traceability.step2": "असाइनमेंट",
    "traceability.step3": "फील्ड संग्रह",
    "traceability.step4": "डिजिटल लॉट (QR)",
    "traceability.step5": "एआई मूल्यांकन",
    "traceability.step6": "हब सत्यापन",
    "traceability.step7": "निपटान",
    "traceability.step8": "एकत्रित इन्वेंटरी",
    "traceability.step9": "रीसाइक्लर प्रस्ताव व बिक्री",
    "traceability.step10": "डिस्पैच"
  },
  as: {
    "app.name": "ইকোফ্ল' এআই (EcoFlow AI)",
    "app.tagline": "এআই-সহায়তা প্ৰাপ্ত। মানৱ-পৰীক্ষিত। ডিজিটেলভাৱে সন্ধানযোগ্য।",
    "nav.home": "গৃহ (Home)",
    "nav.pickups": "পিকআপসমূহ",
    "nav.scan": "আৱৰ্জনা স্কেন",
    "nav.rewards": "পুৰস্কাৰ",
    "nav.profile": "প্ৰফাইল",
    "nav.command_map": "কমাণ্ড মেপ",
    "nav.hub_station": "সংগ্ৰহ কেন্দ্ৰ (Hub)",
    "nav.recyclers": "পুনৰ্ব্যৱহাৰকাৰী",
    "nav.ai_admin": "এআই মডেল",
    "greeting.title": "সুপ্ৰভাত, ৰাহুল শৰ্মা 🌱",
    "greeting.subtitle": "আপোনাৰ ঘৰুৱা পুনৰ্ব্যৱহাৰ প্ৰভাৱ",
    "impact.verified_weight": "পৰীক্ষিত পুনৰ্ব্যৱহাৰ",
    "impact.pickups_count": "সম্পূৰ্ণ হোৱা পিকআপ",
    "impact.segregation_score": "পৃথকীকৰণ স্কোৰ",
    "impact.weight_matches": "ওজনৰ মিল",
    "action.scan_waste": "আৱৰ্জনা স্কেন কৰক",
    "action.request_pickup": "পিকআপৰ বাবে অনুৰোধ",
    "action.track_pickup": "পিকআপ অনুসৰণ কৰক",
    "action.view_settlements": "হিচাপ/পেমেন্ট চাওক",
    "scanner.title": "স্থানীয় এআই আৱৰ্জনা স্কেনাৰ",
    "scanner.subtitle": "স্থানীয় আৱৰ্জনা চিনাক্তকৰণ ব্যৱস্থা",
    "scanner.disclaimer": "এআই মূল্যায়ন প্ৰাথমিক। চূড়ান্ত সামগ্ৰী, ওজন আৰু মান সংগ্ৰহ কেন্দ্ৰত ভৌতিকভাৱে পৰীক্ষা কৰা হ'ব।",
    "scanner.detected_material": "চিনাক্ত কৰা সামগ্ৰী",
    "scanner.confidence": "আত্মবিশ্বাসৰ মাত্ৰা",
    "scanner.segregation_score": "পৃথকীকৰণ স্কোৰ",
    "scanner.recommendation": "পৃথকীকৰণ পৰামৰ্শ",
    "scanner.sample_presets": "স্থানীয় আৱৰ্জনা বাছক:",
    "weight.estimated_label": "আনুমানিক ওজন (কেজি):",
    "weight.disclaimer": "ই এটা আনুমানিক ওজন। চূড়ান্ত ওজন সংগ্ৰহ কেন্দ্ৰত নিৰ্ণয় কৰা হ'ব।",
    "pricing.indicative_rate": "প্ৰস্তাবিত দৰ",
    "pricing.indicative_value": "আনুমানিক মূল্য",
    "pricing.disclaimer": "কেৱল আনুমানিক মূল্য। চূড়ান্ত ধন পৰীক্ষিত ওজন আৰু গুণমানৰ ওপৰত নিৰ্ভৰ কৰিব।",
    "pickup.title": "স্থান নিশ্চিতকৰণ আৰু পিকআপ সময়",
    "pickup.address": "ঠিকনা",
    "pickup.landmark": "নৈকট্য চিন (Landmark)",
    "pickup.zone": "সেৱা মণ্ডল (Zone)",
    "pickup.date": "পছন্দৰ তাৰিখ",
    "pickup.slot": "পছন্দৰ সময়",
    "pickup.notes": "সংগ্ৰাহকৰ বাবে নিৰ্দেশনা",
    "pickup.submit": "পিকআপ অনুৰোধ প্ৰেৰণ কৰক",
    "pickup.success": "পিকআপ অনুৰোধ সফলভাৱে সৃষ্টি হ'ল।",
    "rewards.coming_soon": "শীঘ্ৰেই আহি আছে (COMING SOON)",
    "rewards.locked_msg": "শীঘ্ৰেই পুৰস্কাৰ কাৰ্যসূচী মুকলি কৰা হ'ব।",
    "voice.tap_to_speak": "ক'বলৈ স্পৰ্শ কৰক",
    "voice.listening": "শুনি থকা হৈছে... কওক",
    "voice.confirm": "নিশ্চিত কৰক",
    "voice.edit": "সম্পাদনা কৰক",
    "voice.cancel": "বাতিল কৰক",
    "settlement.title": "পৰীক্ষিত পুনৰ্ব্যৱহাৰ নিষ্পত্তি",
    "settlement.ai_assessment": "এআই মূল্যায়ন",
    "settlement.user_estimate": "ব্যৱহাৰকাৰীৰ অনুমান",
    "settlement.hub_verified": "হাব পৰীক্ষিত",
    "settlement.quality": "গুণমান গ্ৰেড",
    "settlement.buying_rate": "সংস্থাৰ ক্ৰয় দৰ",
    "settlement.calculation": "হিচাপ পদ্ধতি",
    "settlement.final_amount": "চূড়ান্ত প্ৰাপ্য ধন",
    "settlement.weight_match_celebration": "অভিনন্দন! আপুনি সেউজ আৰু পৰিষ্কাৰ পৰিৱেশ গঢ়াত সহায় কৰিছে।",
    "settlement.weight_match_subtext": "আপোনাৰ আনুমানিক ওজন সংগ্ৰহ কেন্দ্ৰৰ পৰীক্ষিত ওজনৰ লগত মিলি গৈছে।",
    "settlement.weight_diff_notice": "আপোনাৰ আনুমানিক ওজন আৰু পৰীক্ষিত ওজন ভিন্ন। চূড়ান্ত নিষ্পত্তি পৰীক্ষিত ওজন অনুসৰি হ'ব।",
    "traceability.title": "সম্পূৰ্ণ ডিজিটেল সন্ধান ব্যৱস্থা",
    "traceability.step1": "ঘৰুৱা অনুৰোধ",
    "traceability.step2": "দায়িত্ব অৰ্পণ",
    "traceability.step3": "ক্ষেত্ৰ সংগ্ৰহ",
    "traceability.step4": "ডিজিটেল লট (QR)",
    "traceability.step5": "এআই মূল্যায়ন",
    "traceability.step6": "হাব পৰীক্ষা",
    "traceability.step7": "পেমেন্ট নিষ্পত্তি",
    "traceability.step8": "পুঞ্জীভূত সামগ্ৰী",
    "traceability.step9": "পুনৰ্ব্যৱহাৰকাৰীৰ ক্ৰয়",
    "traceability.step10": "প্ৰেৰণ (Dispatch)"
  },
  bn: {
    "app.name": "ইকোফ্লো এআই (EcoFlow AI)",
    "app.tagline": "এআই-সহায়তাপ্রাপ্ত। মানব-যাচাইকৃত। ডিজিটাল ট্র্যাকিংযোগ্য।",
    "nav.home": "হোম",
    "nav.pickups": "পিকআপসমূহ",
    "nav.scan": "বর্জ্য স্ক্যান",
    "nav.rewards": "পুরস্কার",
    "nav.profile": "প্রোফাইল",
    "nav.command_map": "কমান্ড ম্যাপ",
    "nav.hub_station": "স্টোরেজ হাব",
    "nav.recyclers": "রিসাইক্লার",
    "nav.ai_admin": "এআই মডেল",
    "greeting.title": "সুপ্রভাত, রাহুল শর্মা 🌱",
    "greeting.subtitle": "আপনার পারিবারিক পুনর্ব্যবহার প্রভাব",
    "impact.verified_weight": "যাচাইকৃত পুনর্ব্যবহার",
    "impact.pickups_count": "সম্পন্ন পিকআপ",
    "impact.segregation_score": "পৃথকীকরণ স্কোর",
    "impact.weight_matches": "ওজনের মিল",
    "action.scan_waste": "বর্জ্য স্ক্যান করুন",
    "action.request_pickup": "পিকআপের অনুরোধ করুন",
    "action.track_pickup": "পিকআপ ট্র্যাক করুন",
    "action.view_settlements": "পেমেন্ট দেখুন",
    "scanner.title": "স্থানীয় এআই বর্জ্য স্ক্যানার",
    "scanner.subtitle": "স্থানীয় বর্জ্য শ্রেণীকরণ মডেল",
    "scanner.disclaimer": "এআই মূল্যায়ন প্রাথমিক। চূড়ান্ত উপাদান, ওজন এবং গুণমান স্টোরেজ হাবে শারীরিকভাবে যাচাই করা হবে।",
    "scanner.detected_material": "শনাক্তকৃত উপাদান",
    "scanner.confidence": "নির্ভুলতা স্কোর",
    "scanner.segregation_score": "পৃথকীকরণ স্কোর",
    "scanner.recommendation": "পৃথকীকরণ পরামর্শ",
    "scanner.sample_presets": "নমুনা বর্জ্য নির্বাচন করুন:",
    "weight.estimated_label": "আনুমানিক ওজন (কেজি):",
    "weight.disclaimer": "এটি একটি আনুমানিক ওজন। স্টোরেজ হাবে চূড়ান্ত ওজন নির্ধারণ করা হবে।",
    "pricing.indicative_rate": "প্রস্তাবিত দর",
    "pricing.indicative_value": "আনুমানিক মূল্য",
    "pricing.disclaimer": "শুধুমাত্র আনুমানিক মূল্য। চূড়ান্ত নিষ্পত্তি যাচাইকৃত উপাদান এবং ওজনের উপর নির্ভর করবে।",
    "pickup.title": "অবস্থান নিশ্চিতকরণ ও পিকআপ শিডিউল",
    "pickup.address": "ঠিকানা",
    "pickup.landmark": "ল্যান্ডমার্ক",
    "pickup.zone": "সার্ভিস জোন",
    "pickup.date": "পছন্দের তারিখ",
    "pickup.slot": "পছন্দের সময়",
    "pickup.notes": "কালেক্টরের জন্য নির্দেশ",
    "pickup.submit": "পিকআপ অনুরোধ জমা দিন",
    "pickup.success": "পিকআপ অনুরোধ সফলভাবে তৈরি হয়েছে।",
    "rewards.coming_soon": "শীঘ্রই আসছে (COMING SOON)",
    "rewards.locked_msg": "রিওয়ার্ডস প্রোগ্রাম খুব শীঘ্রই চালু করা হবে।",
    "voice.tap_to_speak": "কথা বলতে ট্যাপ করুন",
    "voice.listening": "শুনছি... বলুন",
    "voice.confirm": "নিশ্চিত করুন",
    "voice.edit": "সম্পাদনা করুন",
    "voice.cancel": "বাতিল করুন",
    "settlement.title": "যাচাইকৃত পুনর্ব্যবহার নিষ্পত্তি",
    "settlement.ai_assessment": "এআই মূল্যায়ন",
    "settlement.user_estimate": "ব্যবহারকারীর অনুমান",
    "settlement.hub_verified": "হাব যাচাইকৃত",
    "settlement.quality": "গুণমান গ্রেড",
    "settlement.buying_rate": "কোম্পানি ক্রয় দর",
    "settlement.calculation": "হিসাব পদ্ধতি",
    "settlement.final_amount": "চূড়ান্ত প্রদেয় অর্থ",
    "settlement.weight_match_celebration": "অভিনন্দন! আপনি একটি পরিচ্ছন্ন ও সবুজ পরিবেশ তৈরিতে অবদান রাখছেন।",
    "settlement.weight_match_subtext": "আপনার আনুমানিক ওজন স্টোরেজ হাবের যাচাইকৃত ওজনের সাথে মিলে গেছে।",
    "settlement.weight_diff_notice": "আপনার আনুমানিক ওজন এবং যাচাইকৃত ওজন ভিন্ন। চূড়ান্ত নিষ্পত্তির জন্য যাচাইকৃত ওজন ব্যবহৃত হবে।",
    "traceability.title": "সম্পূর্ণ ডিজিটাল ট্র্যাকিং চেইন",
    "traceability.step1": "গৃহস্থালী অনুরোধ",
    "traceability.step2": "দায়িত্ব অর্পণ",
    "traceability.step3": "মাঠ সংগ্রহ",
    "traceability.step4": "ডিজিটাল লট (QR)",
    "traceability.step5": "এআই মূল্যায়ন",
    "traceability.step6": "হাব যাচাই",
    "traceability.step7": "পেমেন্ট নিষ্পত্তি",
    "traceability.step8": "একত্রিত ইনভেন্টরি",
    "traceability.step9": "রিসাইক্লার প্রস্তাব ও বিক্রি",
    "traceability.step10": "প্রেরণ (Dispatch)"
  },
  mr: {
    "app.name": "इकोफ्लो एआय (EcoFlow AI)",
    "app.tagline": "एआय-सहाय्यित. मानवाद्वारे सत्यापित. डिजिटल स्वरूपात ट्रॅक करण्यायोग्य.",
    "nav.home": "मुख्यपृष्ठ",
    "nav.pickups": "पिकअप्स",
    "nav.scan": "कचरा स्कॅन करा",
    "nav.rewards": "बक्षिसे",
    "nav.profile": "प्रोफाइल",
    "nav.command_map": "कमांड मॅप",
    "nav.hub_station": "स्टोरेज हब",
    "nav.recyclers": "रीसायक्लर्स",
    "nav.ai_admin": "एआय मॉडेल्स",
    "greeting.title": "शुभ प्रभात, राहुल शर्मा 🌱",
    "greeting.subtitle": "आपल्या घरगुती पुनर्वापर प्रभावाचा आढावा",
    "impact.verified_weight": "सत्यापित पुनर्वापर",
    "impact.pickups_count": "पूर्ण झालेले पिकअप्स",
    "impact.segregation_score": "वर्गीकरण स्कोअर",
    "impact.weight_matches": "वजन समानता",
    "action.scan_waste": "कचरा स्कॅन करा",
    "action.request_pickup": "पिकअप विनंती करा",
    "action.track_pickup": "पिकअप ट्रॅक करा",
    "action.view_settlements": "पारदर्शक सेटलमेंट्स",
    "scanner.title": "स्थानिक एआय कचरा स्कॅनर",
    "scanner.sample_presets": "नमुना प्रादेशिक भंगार निवडा:",
    "scanner.disclaimer": "एआय मूल्यांकन प्राथमिक आहे. स्टोरेज हबवर अंतिम वजन आणि दर्जा तपासला जाईल.",
    "scanner.detected_material": "ओळखलेली सामग्री",
    "scanner.confidence": "विश्वासार्हता स्कोअर",
    "voice.tap_to_speak": "बोलण्यासाठी टॅप करा",
    "rewards.coming_soon": "लवकरच येत आहे",
    "rewards.locked_msg": "महानगरपालिका क्षेत्रांमध्ये लवकरच बक्षीस कार्यक्रम सुरू होत आहे.",
    "settlement.title": "सत्यापित पुनर्वापर सेटलमेंट",
    "settlement.buying_rate": "कंपनी खरेदी दर",
    "settlement.final_amount": "अंतिम देय रक्कम",
    "settlement.weight_match_celebration": "अभिनंदन! आपण स्वच्छ आणि हरित पर्यावरण घडवत आहात."
  },
  gu: {
    "app.name": "ઇકોફ્લો એઆઈ (EcoFlow AI)",
    "app.tagline": "એઆઈ-સહાયિત. માનવ-પ્રમાણિત. ડિજિટલ ટ્રેસેબલ.",
    "nav.home": "હોમ",
    "nav.pickups": "પિકઅપ્સ",
    "nav.scan": "કચરો સ્કેન કરો",
    "nav.rewards": "પુરસ્કારો",
    "greeting.title": "સુપ્રભાત, રાહુલ શર્મા 🌱",
    "greeting.subtitle": "તમારા ઘરગથ્થુ રિસાયક્લિંગ પ્રભાવની ઝાંખી",
    "impact.verified_weight": "પ્રમાણિત રિસાયક્લિંગ",
    "impact.pickups_count": "પૂર્ણ પિકઅપ્સ",
    "impact.segregation_score": "વર્ગીકરણ સ્કોર",
    "impact.weight_matches": "વજન મેળ",
    "action.scan_waste": "કચરો સ્કેન કરો",
    "action.request_pickup": "ભંગાર પિકઅપ વિનંતી કરો",
    "action.view_settlements": "પારદર્શક પતાવટ",
    "scanner.sample_presets": "નમૂનાનો પ્રાદેશિક ભંગાર પસંદ કરો:",
    "voice.tap_to_speak": "બોલવા માટે ટૅપ કરો",
    "rewards.coming_soon": "ટૂંક સમયમાં આવી રહ્યું છે",
    "settlement.title": "પ્રમાણિત રિસાયક્લિંગ પતાવટ",
    "settlement.buying_rate": "કંપની ખરીદ દર",
    "settlement.final_amount": "અંતિમ ચૂકવવાપાત્ર રકમ",
    "settlement.weight_match_celebration": "અભિનંદન! તમે સ્વચ્છ અને હરિયાળું પર્યાવરણ બનાવી રહ્યા છો."
  },
  mwr: {
    "app.name": "इकोफ्लो एआई (EcoFlow AI)",
    "app.tagline": "एआई सू सहायित। मिनख सू जाँचेड़ो। डिजिटल हिसाब-किताब।",
    "nav.home": "घर / होम",
    "nav.pickups": "कबाड़ उठाव",
    "nav.scan": "कचरो जाँचे",
    "nav.rewards": "इनाम",
    "greeting.title": "खम्मा घणी, राहुल शर्मा 🌱",
    "greeting.subtitle": "थारो घर रो कबाड़ री रीसाइक्लिंग रो ब्यौरो",
    "impact.verified_weight": "जाँचेड़ो तोल",
    "impact.pickups_count": "पूरा होया उठाव",
    "impact.segregation_score": "छांटबा रो नंबर",
    "impact.weight_matches": "तोल रो मेल",
    "action.scan_waste": "एआई सू कचरो जाँचे",
    "action.request_pickup": "कबाड़ उठाव रो संदेसो",
    "action.view_settlements": "साफ-सुथरो भुगतान",
    "scanner.sample_presets": "कबाड़ रो नमुनो चुणो:",
    "voice.tap_to_speak": "बोलबा सारू दबाओ",
    "rewards.coming_soon": "जल्दी ही आवेगो",
    "settlement.buying_rate": "कंपनी रो खरीद भाव",
    "settlement.final_amount": "पूरो मिलबा वाळो रुपियो",
    "settlement.weight_match_celebration": "बधाई हो! थे एक साफ़ अर हरियाळो पर्यावरण बणा रया हो।"
  },
  te: {
    "app.name": "ఎకోఫ్లో ఏఐ (EcoFlow AI)",
    "app.tagline": "ఏఐ-సహాయం. మానవ-ధృవీకరణ. డిజిటల్ ట్రేసింగ్.",
    "nav.home": "హోమ్",
    "nav.pickups": "పికప్‌లు",
    "nav.scan": "వ్యర్థాలను స్కాన్ చేయండి",
    "nav.rewards": "రివార్డులు",
    "greeting.title": "శుభోదయం, రాహుల్ శర్మ 🌱",
    "greeting.subtitle": "మీ గృహ రీసైక్లింగ్ ప్రభావ సారాంశం",
    "impact.verified_weight": "ధృవీకరించిన రీసైక్లింగ్",
    "impact.pickups_count": "పూర్తయిన పికప్‌లు",
    "impact.segregation_score": "వేరుచేసే స్కోరు",
    "impact.weight_matches": "బరువు మ్యాచ్‌లు",
    "action.scan_waste": "వ్యర్థాలను స్కాన్ చేయండి",
    "action.request_pickup": "పికప్ షెడ్యూల్ చేయండి",
    "action.view_settlements": "పారదర్శక చెల్లింపులు",
    "scanner.sample_presets": "నమూనా వ్యర్థాలను ఎంచుకోండి:",
    "voice.tap_to_speak": "మాట్లాడటానికి నొక్కండి",
    "rewards.coming_soon": "త్వరలో రాబోతోంది",
    "settlement.buying_rate": "కంపెనీ కొనుగోలు ధర",
    "settlement.final_amount": "తుది చెల్లింపు మొత్తం",
    "settlement.weight_match_celebration": "అభినందనలు! మీరు పరిశుభ్రమైన మరియు పచ్చని పర్యావరణాన్ని నిర్మిస్తున్నారు."
  },
  ta: {
    "app.name": "எக்கோஃப்ளோ ஏஐ (EcoFlow AI)",
    "app.tagline": "ஏஐ-உதவி. மனித-சரிபார்ப்பு. டிஜிட்டல் கண்காணிப்பு.",
    "nav.home": "முகப்பு",
    "nav.pickups": "பிக்அப்கள்",
    "nav.scan": "குப்பையை ஸ்கேன் செய்",
    "nav.rewards": "வெகுமதிகள்",
    "greeting.title": "காலை வணக்கம், ராகுல் சர்மா 🌱",
    "greeting.subtitle": "உங்கள் வீட்டு மறுசுழற்சி விவரங்கள்",
    "impact.verified_weight": "சரிபார்க்கப்பட்ட மறுசுழற்சி",
    "impact.pickups_count": "முடிக்கப்பட்ட பிக்அப்கள்",
    "impact.segregation_score": "பிரித்தல் மதிப்பெண்",
    "impact.weight_matches": "எடைப் பொருத்தங்கள்",
    "action.scan_waste": "குப்பையை ஸ்கேன் செய்",
    "action.request_pickup": "பிக்அப் கோரிக்கை",
    "action.view_settlements": "வெளிப்படையான தீர்வுகள்",
    "scanner.sample_presets": "மாதிரி பழைய பொருட்களைத் தேர்வுசெய்க:",
    "voice.tap_to_speak": "பேச தட்டவும்",
    "rewards.coming_soon": "விரைவில் வருகிறது",
    "settlement.buying_rate": "நிறுவன கொள்முதல் விலை",
    "settlement.final_amount": "இறுதி தொகை",
    "settlement.weight_match_celebration": "வாழ்த்துக்கள்! தூய்மையான மற்றும் பசுமையான சூழலை உருவாக்குகிறீர்கள்."
  },
  kn: {
    "app.name": "ಎಕೋಫ್ಲೋ ಎಐ (EcoFlow AI)",
    "app.tagline": "ಎಐ-ಸಹಾಯ. ಮಾನವ-ಪರಿಶೀಲನೆ. ಡಿಜಿಟಲ್ ಟ್ರೇಸಿಂಗ್.",
    "nav.home": "ಮುಖಪುಟ",
    "nav.pickups": "ಪಿಕಪ್‌ಗಳು",
    "nav.scan": "ತ್ಯಾಜ್ಯ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    "nav.rewards": "ಬಹುಮಾನಗಳು",
    "greeting.title": "ಶುಭೋದಯ, ರಾಹುಲ್ ಶರ್ಮಾ 🌱",
    "impact.verified_weight": "ಪರಿಶೀಲಿಸಿದ ಮರುಬಳಕೆ",
    "action.scan_waste": "ತ್ಯಾಜ್ಯ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    "action.request_pickup": "ಪಿಕಪ್ ವಿನಂತಿಸಿ",
    "voice.tap_to_speak": "ಮಾತನಾಡಲು ಸ್ಪರ್ಶಿಸಿ",
    "rewards.coming_soon": "ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ",
    "settlement.weight_match_celebration": "ಅಭಿನಂದನೆಗಳು! ನೀವು ಸ್ವಚ್ಛ ಮತ್ತು ಹಸಿರು ಪರಿಸರವನ್ನು ನಿರ್ಮಿಸುತ್ತಿದ್ದೀರಿ."
  },
  ml: {
    "app.name": "എക്കോഫ്ലോ എഐ (EcoFlow AI)",
    "app.tagline": "എഐ സഹായം. മനുഷ്യ പരിശോധന. ഡിജിറ്റൽ ട്രാക്കിംഗ്.",
    "nav.home": "ഹോം",
    "nav.pickups": "പിക്കപ്പുകൾ",
    "nav.scan": "മാലിന്യം സ്കാൻ ചെയ്യുക",
    "greeting.title": "സുപ്രഭാതം, രാഹുൽ ശർമ്മ 🌱",
    "impact.verified_weight": "സ്ഥിരീകരിച്ച പുനരുപയോഗം",
    "action.scan_waste": "മാലിന്യം സ്കാൻ ചെയ്യുക",
    "action.request_pickup": "പിക്കപ്പ് ഷെഡ്യൂൾ ചെയ്യുക",
    "voice.tap_to_speak": "സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക",
    "rewards.coming_soon": "ഉടൻ വരുന്നു",
    "settlement.weight_match_celebration": "അഭിനന്ദനങ്ങൾ! നിങ്ങൾ ശുചിത്വമുള്ളതും ഹരിതാഭവുമായ ഒരു പരിസ്ഥിതി സൃഷ്ടിക്കുന്നു."
  },
  pa: {
    "app.name": "ਈਕੋਫਲੋ ਏਆਈ (EcoFlow AI)",
    "app.tagline": "ਏਆਈ-ਸਹਾਇਤਾ। ਮਨੁੱਖੀ-ਤਸਦੀਕ। ਡਿਜੀਟਲ ਟ੍ਰੇਸਿੰਗ।",
    "nav.home": "ਮੁੱਖ ਪੰਨਾ",
    "nav.pickups": "ਪਿਕਅੱਪ",
    "nav.scan": "ਕੂੜਾ ਸਕੈਨ ਕਰੋ",
    "greeting.title": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਰਾਹੁਲ ਸ਼ਰਮਾ 🌱",
    "impact.verified_weight": "ਤਸਦੀਕਸ਼ੁਦਾ ਰੀਸਾਈਕਲਿੰਗ",
    "action.scan_waste": "ਕੂੜਾ ਸਕੈਨ ਕਰੋ",
    "action.request_pickup": "ਪਿਕਅੱਪ ਬੇਨਤੀ ਕਰੋ",
    "voice.tap_to_speak": "ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ",
    "rewards.coming_soon": "ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ",
    "settlement.weight_match_celebration": "ਮੁਬਾਰਕਾਂ! ਤੁਸੀਂ ਇੱਕ ਸਾਫ਼ ਅਤੇ ਹਰਿਆ-ਭਰਿਆ ਵਾਤਾਵਰਣ ਬਣਾ ਰਹੇ ਹੋ।"
  },
  or: {
    "app.name": "ଇକୋଫ୍ଲୋ ଏଆଇ (EcoFlow AI)",
    "app.tagline": "ଏଆଇ-ସହାୟତା। ମାନବ-ଯାଞ୍ଚ। ଡିଜିଟାଲ୍ ଟ୍ରାକିଂ।",
    "greeting.title": "ଶୁଭ ସକାଳ, ରାହୁଲ ଶର୍ମା 🌱",
    "impact.verified_weight": "ଯାଞ୍ଚ ହୋଇଥିବା ରିସାଇକ୍ଲିଂ",
    "action.scan_waste": "ବର୍ଜ୍ୟବସ୍ତୁ ସ୍କାନ୍ କରନ୍ତୁ",
    "settlement.weight_match_celebration": "ଅଭିନନ୍ଦନ! ଆପଣ ଏକ ସ୍ୱଚ୍ଛ ଓ ସବୁଜ ପରିବେଶ ଗଠନ କରୁଛନ୍ତି।"
  },
  ur: {
    "app.name": "ایکو فلو اے آئی (EcoFlow AI)",
    "app.tagline": "اے آئی کی مدد۔ انسانی تصدیق۔ ڈیجیٹل نگرانی۔",
    "nav.home": "ہوم",
    "nav.pickups": "پک اپس",
    "nav.scan": "کچرا اسکین کریں",
    "greeting.title": "صبح بخیر، راہول شرما 🌱",
    "impact.verified_weight": "تصدیق شدہ ری سائیکلنگ",
    "action.scan_waste": "کچرا اسکین کریں",
    "action.request_pickup": "پک اپ کی درخواست",
    "voice.tap_to_speak": "بولنے کے لیے ٹیپ کریں",
    "rewards.coming_soon": "جلد آ رہا ہے",
    "settlement.weight_match_celebration": "مبارک ہو! آپ ایک صاف اور سرسبز ماحول بنا رہے ہیں۔"
  },
  es: {
    "app.name": "EcoFlow AI",
    "app.tagline": "Asistido por IA. Verificado por Humanos. Digitalmente Trazable.",
    "nav.home": "Inicio",
    "nav.pickups": "Recolecciones",
    "nav.scan": "Escanear Residuos",
    "nav.rewards": "Recompensas",
    "greeting.title": "Buenos Días, Rahul Sharma 🌱",
    "greeting.subtitle": "Resumen del Impacto de Reciclaje en su Hogar",
    "impact.verified_weight": "Reciclaje Verificado",
    "impact.pickups_count": "Recolecciones Completadas",
    "impact.segregation_score": "Puntuación de Segregación",
    "impact.weight_matches": "Coincidencias de Peso",
    "action.scan_waste": "Escanear Residuos con IA",
    "action.request_pickup": "Programar Recolección",
    "action.view_settlements": "Liquidaciones Transparentes",
    "voice.tap_to_speak": "Toque para Hablar",
    "rewards.coming_soon": "PRÓXIMAMENTE",
    "settlement.weight_match_celebration": "¡Felicitaciones! Estás creando un entorno más limpio y verde."
  },
  fr: {
    "app.name": "EcoFlow AI",
    "app.tagline": "Assisté par IA. Vérifié par l'humain. Numériquement traçable.",
    "nav.home": "Accueil",
    "nav.pickups": "Collectes",
    "nav.scan": "Scanner Déchets",
    "nav.rewards": "Récompenses",
    "greeting.title": "Bonjour, Rahul Sharma 🌱",
    "greeting.subtitle": "Aperçu de l'impact du recyclage de votre foyer",
    "impact.verified_weight": "Recyclage Vérifié",
    "action.scan_waste": "Scanner avec l'IA",
    "action.request_pickup": "Demander une Collecte",
    "voice.tap_to_speak": "Appuyez pour Parler",
    "rewards.coming_soon": "BIENTÔT DISPONIBLE",
    "settlement.weight_match_celebration": "Félicitations ! Vous contribuez à un environnement plus propre et plus vert."
  },
  de: {
    "app.name": "EcoFlow AI",
    "app.tagline": "KI-unterstützt. Menschlich verifiziert. Digital rückverfolgbar.",
    "nav.home": "Startseite",
    "nav.pickups": "Abholungen",
    "nav.scan": "Müll Scannen",
    "greeting.title": "Guten Morgen, Rahul Sharma 🌱",
    "impact.verified_weight": "Verifiziertes Recycling",
    "action.scan_waste": "Mit KI Scannen",
    "action.request_pickup": "Abholung Anfordern",
    "voice.tap_to_speak": "Tippen zum Sprechen",
    "rewards.coming_soon": "DEMNÄCHST",
    "settlement.weight_match_celebration": "Herzlichen Glückwunsch! Sie schaffen eine sauberere und grünere Umwelt."
  },
  ja: {
    "app.name": "EcoFlow AI",
    "app.tagline": "AI支援・人間検証・デジタル追跡可能",
    "nav.home": "ホーム",
    "nav.pickups": "回収履歴",
    "nav.scan": "ゴミをスキャン",
    "greeting.title": "おはようございます、ラフル・シャルマ様 🌱",
    "impact.verified_weight": "検証済みリサイクル",
    "action.scan_waste": "AIでゴミをスキャン",
    "action.request_pickup": "回収をリクエスト",
    "voice.tap_to_speak": "タップして話す",
    "rewards.coming_soon": "近日公開",
    "settlement.weight_match_celebration": "おめでとうございます！より清潔で環境に優しい未来を築いています。"
  },
  ar: {
    "app.name": "إيكوفلو ذكاء اصطناعي (EcoFlow AI)",
    "app.tagline": "بمساعدة الذكاء الاصطناعي. موثق بشرياً. قابل للتتبع رقمياً.",
    "nav.home": "الرئيسية",
    "nav.pickups": "الشحنات المستلمة",
    "nav.scan": "مسح النفايات",
    "greeting.title": "صباح الخير، راهول شارما 🌱",
    "impact.verified_weight": "إعادة التدوير الموثقة",
    "action.scan_waste": "مسح النفايات بالذكاء الاصطناعي",
    "action.request_pickup": "طلب استلام المخلفات",
    "voice.tap_to_speak": "اضغط للتحدث",
    "rewards.coming_soon": "قريباً",
    "settlement.weight_match_celebration": "تهانينا! أنت تسهم في بناء بيئة أنظف وأكثر خضرة."
  }
};

const LANG_NAMES = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
  gu: "ગુજરાતી",
  mwr: "मारवाड़ी",
  te: "తెలుగు",
  ta: "தமிழ்",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  pa: "ਪੰਜਾਬੀ",
  as: "অসমীয়া",
  bn: "বাংলা",
  or: "ଓଡ଼ିଆ",
  ur: "اردو",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ar: "العربية"
};

let currentLang = 'en';

function setLanguage(lang) {
  if (I18N[lang]) {
    currentLang = lang;
    localStorage.setItem('ecoflow_lang', lang);
    applyTranslations();

    // Update printed label on the trigger box
    const labelEl = document.getElementById("lang-current-label");
    if (labelEl) {
      labelEl.textContent = LANG_NAMES[lang] || lang.toUpperCase();
    }
    document.querySelectorAll(".lang-option-item").forEach(item => {
      item.classList.toggle("active", item.dataset.lang === lang);
    });
  }
}

function toggleLanguageDropdown(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById("lang-dropdown-menu");
  const btn = document.getElementById("lang-current-btn");
  if (!menu || !btn) return;
  const isOpen = menu.classList.toggle("open");
  btn.classList.toggle("open", isOpen);
  btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function closeLanguageDropdown() {
  const menu = document.getElementById("lang-dropdown-menu");
  const btn = document.getElementById("lang-current-btn");
  if (menu) menu.classList.remove("open");
  if (btn) {
    btn.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }
}

function selectLanguage(lang, displayName) {
  setLanguage(lang);
  const labelEl = document.getElementById("lang-current-label");
  if (labelEl) {
    labelEl.textContent = displayName || LANG_NAMES[lang] || lang.toUpperCase();
  }
  closeLanguageDropdown();
}

// Global click outside listener
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("lang-dropdown");
  if (dropdown && !dropdown.contains(e.target)) {
    closeLanguageDropdown();
  }
});

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeLanguageDropdown();
  }
});

function t(key, fallback = '') {
  if (I18N[currentLang] && I18N[currentLang][key]) {
    return I18N[currentLang][key];
  }
  if (I18N['en'] && I18N['en'][key]) {
    return I18N['en'][key];
  }
  return fallback || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  document.querySelectorAll('.lang-option-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("ecoflow_lang") || "en";
  if (I18N[savedLang]) {
    setLanguage(savedLang);
    const labelEl = document.getElementById("lang-current-label");
    if (labelEl) {
      labelEl.textContent = LANG_NAMES[savedLang] || "English";
    }
  }
});

