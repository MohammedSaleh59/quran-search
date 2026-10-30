
import React, { useState, useEffect, useMemo, useRef } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  StatusBar,
  ScrollView,
 Animated,
  Modal,
  Alert
} from 'react-native';
import * as Font from 'expo-font';
//import { Audio } from 'expo-av';
import {
  searchInQuran,
  searchByTopic,
  searchInJuz,
  getTopics,
  getWordMeaning,
  searchSajdaVerses,
  getVerseCount,
  normalizeArabic,
  getNormalizedChar
} from './src/searchHelper';

/* كلمات السر التي تستدعي آيات السجدات مباشرة */
const SAJDA_QUERIES = ['سجدة', 'سجدات', 'السجده', 'السجدات','سجده'];


const RECITERS = [
  /* ===== القراء المشهورون (رواية حفص) ===== */
  { id: 'Abdul_Basit_Murattal_192kbps', name: 'عبدالباسط عبدالصمد (مرتل)' },
  { id: 'Alafasy_128kbps', name: 'مشاري راشد العفاسي' },
  { id: 'Abdurrahmaan_As-Sudais_192kbps', name: 'عبدالرحمن السديس' },
  { id: 'Saood_ash-Shuraym_128kbps', name: 'سعود الشريم' },
  { id: 'Husary_128kbps', name: 'محمود خليل الحصري (مرتل)' },
  { id: 'Minshawy_Murattal_128kbps', name: 'محمد صديق المنشاوي (مرتل)' },
  { id: 'Abdullah_Basfar_192kbps', name: 'عبدالله بصفر' },
  { id: 'Abu_Bakr_Ash-Shaatree_128kbps', name: 'أبو بكر الشاطري' },
  { id: 'Hani_Rifai_192kbps', name: 'هاني الرفاعي' },
  { id: 'Hudhaify_128kbps', name: 'علي الحذيفي' },
  { id: 'Ibrahim_Akhdar_64kbps', name: 'إبراهيم الأخضر' },
  { id: 'Mohammad_al_Tablaway_128kbps', name: 'محمد الطبلاوي' },
  { id: 'Muhammad_Ayyoub_128kbps', name: 'محمد أيوب' },
  { id: 'Muhammad_Jibreel_128kbps', name: 'محمد جبريل' },
  { id: 'Mustafa_Ismail_48kbps', name: 'مصطفى إسماعيل' },
  { id: 'Ghamadi_40kbps', name: 'سعد الغامدي' },
  { id: 'MaherAlMuaiqly128kbps', name: 'ماهر المعيقلي' }, // ✅ مُعاد
  { id: 'Salaah_AbdulRahman_Bukhatir_128kbps', name: 'صلاح بوخاطر' },
  { id: 'Muhsin_Al_Qasim_192kbps', name: 'محسن القاسم' },
  { id: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps', name: 'عبدالله عواد الجهني' },
  { id: 'Salah_Al_Budair_128kbps', name: 'صلاح البدير' },
  { id: 'Abdullah_Matroud_128kbps', name: 'عبدالله مطرود' },
  { id: 'Ahmed_Neana_128kbps', name: 'أحمد نعينع' },
  { id: 'Muhammad_AbdulKareem_128kbps', name: 'محمد عبدالكريم' },
  { id: 'khalefa_al_tunaiji_64kbps', name: 'خليفة الطنيجي' },
  { id: 'mahmoud_ali_al_banna_32kbps', name: 'محمود علي البنا' },
  { id: 'Karim_Mansoori_40kbps', name: 'كريم منصوري' },
  { id: 'Khaalid_Abdullaah_al-Qahtaanee_192kbps', name: 'خالد القحطاني' },
  { id: 'Yasser_Ad-Dussary_128kbps', name: 'ياسر الدوسري' },
  { id: 'Nasser_Alqatami_128kbps', name: 'ناصر القطامي' },
  { id: 'Ali_Hajjaj_AlSuesy_128kbps', name: 'علي حجاج السويسي' },
  { id: 'Sahl_Yassin_128kbps', name: 'سهل ياسين' },
  { id: 'ahmed_ibn_ali_al_ajamy_128kbps', name: 'أحمد بن علي العجمي' }, // ✅ مُعاد
  { id: 'aziz_alili_128kbps', name: 'عزيز العليلي' },
  { id: 'Yaser_Salamah_128kbps', name: 'ياسر سلامة' },
  { id: 'Akram_AlAlaqimy_128kbps', name: 'أكرم العلاقمي' },
  { id: 'Ali_Jaber_64kbps', name: 'علي جابر' },
  { id: 'Fares_Abbad_64kbps', name: 'فارس عباد' },
  { id: 'Ayman_Sowaid_64kbps', name: 'أيمن سويد' },
  { id: 'Parhizgar_48kbps', name: 'پرويز شهریاری (Parhizgar)' },
  { id: 'Abdul_Basit_Mujawwad_128kbps', name: 'عبدالباسط عبدالصمد (مجود)' },
  { id: 'Husary_Mujawwad_64kbps', name: 'محمود خليل الحصري (مجود)' }, // ✅ مُعاد
  { id: 'Husary_Muallim_128kbps', name: 'محمود خليل الحصري (معلم)' },
  { id: 'Minshawy_Mujawwad_192kbps', name: 'محمد صديق المنشاوي (مجود)' },
  { id: 'warsh/warsh_Abdul_Basit_128kbps', name: '(ورش) عبدالباسط عبدالصمد' },
  { id: 'warsh/warsh_ibrahim_aldosary_128kbps', name: '(ورش) إبراهيم الدوسري' },
  { id: 'warsh/warsh_yassin_al_jazaery_64kbps', name: '(ورش) ياسين الجزائري' }
];

const EVERYAYAH_BASE = 'https://everyayah.com/data/';
const isQuranSymbol = (ch) =>
  ch === '\u06DD' || ch === '\u06DE' || ch === '\u06E5' ||
  ch === '\u06E6' || ch === '\u06E9' || ch === '\u06EB' || ch === '\u06EC';

function splitSymbols(str) {
  const out = [];
  let buf = '';
  for (const ch of str) {
    if (isQuranSymbol(ch)) {
      if (buf) { out.push({ s: false, v: buf }); buf = ''; }
      out.push({ s: true, v: ch });
    } else {
      buf += ch;
    }
  }
  if (buf) out.push({ s: false, v: buf });
  return out;
}

function textWithSymbols(str, keyPrefix, symbolStyle) {
  const segs = splitSymbols(str);
  if (segs.length === 1 && !segs[0].s) return str;
  return segs.map((seg, i) =>
    seg.s
      ? <Text key={keyPrefix + '-s' + i} style={symbolStyle}>{seg.v}</Text>
      : <Text key={keyPrefix + '-t' + i}>{seg.v}</Text>
  );
}

/* ===== دالة تظليل جزء من الكلمة مع الحفاظ على التشكيل ===== */
const highlightPartialWord = (decoratedWord, cleanWord, term) => {
  const idx = cleanWord.indexOf(term);
  if (idx === -1) return <Text>{decoratedWord}</Text>; 

  const decChars = [...decoratedWord];
  let c = 0;
  let startDecIdx = -1;
  let endDecIdx = -1;

  for (let i = 0; i < decChars.length; i++) {
    const norm = getNormalizedChar(decChars[i]);
    if (norm && norm.trim() !== '') {
      if (c === idx) startDecIdx = i;
      c++;
    }
  }

  c = 0;
  for (let i = 0; i < decChars.length; i++) {
    const norm = getNormalizedChar(decChars[i]);
    if (norm && norm.trim() !== '') {
      if (c === idx + term.length) {
        endDecIdx = i;
        break;
      }
      c++;
    }
  }
  if (endDecIdx === -1) endDecIdx = decChars.length;

  const before = decChars.slice(0, startDecIdx).join('');
  const match = decChars.slice(startDecIdx, endDecIdx).join('');
  const after = decChars.slice(endDecIdx).join('');

  return (
    <>
      <Text>{before}</Text>
      <Text style={styles.highlight}>{match}</Text>
      <Text>{after}</Text>
    </>
  );
};

const BlinkingIcon = ({ emoji = '👈', style, active = true }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (stopped || !active) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [fadeAnim, active, stopped]);

  useEffect(() => {
    // إيقاف نهائي عند أول فتح للإحصائيات
    if (!active && !stopped) {
      setStopped(true);
    }
  }, [active, stopped]);

  return (
    <Animated.Text style={[{ opacity: fadeAnim }, style]}>
      {emoji}
    </Animated.Text>
  );
};




export default function App() {
	
  
  const [showAboutMessage, setShowAboutMessage] = useState(false);
    const [multiWordBackup, setMultiWordBackup] = useState(null); // حفظ البحث المتعدد
  const listRef = useRef(null);
    /* ✅ رقم عملية البحث الحالية — لإلغاء أي بحث قديم لم يكتمل */
  const searchRunRef = useRef(0);
  const [ignoredWords, setIgnoredWords] = useState([]);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isExactMatch, setIsExactMatch] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const [showTopics, setShowTopics] = useState(false);
  const [topics] = useState(() => {
    try { return getTopics(); } catch (e) { return []; }
  });

  const [showJuzPicker, setShowJuzPicker] = useState(false);
  const [selectedJuz, setSelectedJuz] = useState(null);

  const [showWordMeaning, setShowWordMeaning] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [selectedMeaning, setSelectedMeaning] = useState('');

  const [highlightWords, setHighlightWords] = useState([]);
    const audioRef = useRef(null);
 // const [sound, setSound] = useState(null);
  const [playingVerseKey, setPlayingVerseKey] = useState(null); // "surah-ayah"
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0].id);
  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  
    const [activeTerms, setActiveTerms] = useState([]);   /* new الكلمات الفعلية بعد التفكيك */
  
    
  const [selectedSurahFilter, setSelectedSurahFilter] = useState(null);  // ← أضف هذا السطر

  const surahStats = useMemo(() => {
    if (!results.length) return [];
    const stats = {};
    results.forEach(item => {
      if (!stats[item.surahName]) {
        stats[item.surahName] = { count: 0, surahNumber: item.surahNumber };
      }
      stats[item.surahName].count += item.count;
    });
    return Object.keys(stats)
      .map(name => ({ name, ...stats[name] }))
      .sort((a, b) => a.surahNumber - b.surahNumber);
  }, [results]);

  const wordSummary = useMemo(() => {
    if (!results.length || !searchWord.trim()) return [];
    if (highlightWords.length > 0) return [];
	
    /* const terms = normalizeArabic(searchWord).split(/\s+/).filter(Boolean);
    if (terms.length < 2) return []; */
	
	/// new
	
	    const terms = activeTerms.length > 0
      ? activeTerms
      : normalizeArabic(searchWord).split(/\s+/).filter(Boolean);
    if (terms.length < 2) return [];
	
	
	////
	
    const summary = terms.map(term => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'g');
      let count = 0;
      for (const item of results) {
        const nv = normalizeArabic(item.text);
        re.lastIndex = 0;
        const m = nv.match(re);
        if (m) count += m.length;
      }
      return { word: term, count };
    });
    return summary.filter(s => s.count > 0);
	
	
  /* }, [results, searchWord, highlightWords]);*/
 
 /// new
 
 
   }, [results, searchWord, highlightWords, activeTerms]);
 
 /////
 
 

 
 ////////////
 
 
  /* النتائج المصفاة حسب السورة المختارة */
  const filteredResults = useMemo(() => {
    if (!selectedSurahFilter) return results;
    return results.filter(item => item.surahName === selectedSurahFilter);
  }, [results, selectedSurahFilter]);

///////////////////

 /* ✅ حساب إجمالي مرات التكرار في السورة المختارة (ليطابق شاشة الإحصائيات تماماً) */
  const selectedSurahCount = useMemo(() => {
    if (!selectedSurahFilter || !surahStats.length) return 0;
    const stat = surahStats.find(s => s.name === selectedSurahFilter);
    return stat ? stat.count : 0;
  }, [selectedSurahFilter, surahStats]);



///////////////////////


 
	 
	   /* الرجوع لأعلى القائمة عند كل نتيجة جديدة */
   useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({ Amiri: require('./assets/fonts/Amiri-Regular.ttf') });
      } catch (e) { console.warn('Font error:', e); }
      finally { setFontsLoaded(true); }
    }
    prepare();
  }, []);

  /* الرجوع لأعلى القائمة عند كل نتيجة جديدة */
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [results]);

  const handleSearchWithTopic = async (topic) => {
    setSearchWord(topic.name);
    setHighlightWords(topic.keywords || []);
    setSelectedJuz(null);
    setLoading(true);
    setErrorMessage('');
    setIgnoredWords([]);
    try {
      const res = await searchByTopic(topic.keywords);
      setResults(res.verses || []);
      setTotalCount(res.count || 0);
    } catch (e) {
      setErrorMessage('حدث خطأ أثناء البحث');
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

 
 //// new new 
  
  const handleSearch = async () => {
    /* ✅ كل بحث جديد يُبطل البحث السابق فوراً */
    const runId = ++searchRunRef.current;
    const trimmed = searchWord.trim();

    /* ✅ بحث جديد = لا مكان لتصفية قديمة أو نسخة احتياطية قديمة */
    setSelectedSurahFilter(null);
    setMultiWordBackup(null);

    if (!trimmed) {
      setResults([]);
      setTotalCount(0);
      setErrorMessage('');
      setIgnoredWords([]);
      setActiveTerms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setIgnoredWords([]);
    setHighlightWords([]);
    setActiveTerms([]);

    try {
      let res;
      const normalizedInput = normalizeArabic(searchWord);

      if (SAJDA_QUERIES.indexOf(normalizedInput) !== -1) {
        res = await searchSajdaVerses();
        if (runId !== searchRunRef.current) return; // ✅ البحث أُلغي
        setHighlightWords(['سجد']);
      } else if (selectedJuz) {
        res = await searchInJuz(selectedJuz, searchWord, isExactMatch);
      } else {
        res = await searchInQuran(searchWord, isExactMatch);
      }

      /* ✅ إذا تغيّر الجزء أو كلمة البحث أثناء الانتظار → تجاهل هذه النتيجة */
      if (runId !== searchRunRef.current) return;

      setResults(res.verses || []);
      setTotalCount(res.count || 0);
      setIgnoredWords(res.ignored || []);
      setActiveTerms(res.termsUsed || []);
      if (res.error) setErrorMessage(res.error);

    } catch (e) {
      if (runId !== searchRunRef.current) return;
      setErrorMessage('حدث خطأ أثناء البحث');
      setResults([]);
      setTotalCount(0);
      setActiveTerms([]);
    } finally {
      /* ✅ لا يُطفئ التحميل إلا البحث صاحب الحق في ذلك */
      if (runId === searchRunRef.current) setLoading(false);
    }
  };
  
  
   
  
  
  
  ///
    /* ============================================================
   * تشغيل تلاوة الآية من الإنترنت
   * ============================================================ */
  const playVerseAudio = async (surahNumber, ayahNumber) => {
    const key = `${surahNumber}-${ayahNumber}`;

    // إذا كانت نفس الآية تلعب → أوقفها
    if (playingVerseKey === key && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setPlayingVerseKey(null);
      return;
    }

    // أوقف أي تلاوة سابقة
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setAudioLoading(true);
    setErrorMessage('');

    try {
      const surahStr = String(surahNumber).padStart(3, '0');
      const ayahStr = String(ayahNumber).padStart(3, '0');
      const url = `https://everyayah.com/data/${selectedReciter}/${surahStr}${ayahStr}.mp3`;

      console.log('🎧 تشغيل:', url);

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingVerseKey(null);
        setAudioLoading(false);
      };

      audio.onerror = (e) => {
        console.error('خطأ في التشغيل:', e);
        setErrorMessage('تعذر تشغيل التلاوة — تأكد من اتصالك بالإنترنت');
        setPlayingVerseKey(null);
        setAudioLoading(false);
      };

      await audio.play();
      setPlayingVerseKey(key);
      setAudioLoading(false);
    } catch (e) {
      console.error('خطأ:', e);
      setErrorMessage('تعذر تشغيل التلاوة');
      setPlayingVerseKey(null);
      setAudioLoading(false);
    }
  };
 
  /* ============================================================
   * نسخ الآية ورابط الصوت إلى الحافظة (متوافق مع الويب والجوال)
   * ============================================================ */
  const copyVerseToClipboard = async (item) => {
    try {
      const surahStr = String(item.surahNumber).padStart(3, '0');
      const ayahStr = String(item.ayahNumber).padStart(3, '0');
      const audioUrl = `https://everyayah.com/data/${selectedReciter}/${surahStr}${ayahStr}.mp3`;
      const reciterName = RECITERS.find(r => r.id === selectedReciter)?.name || 'القارئ';
      
      const cleanVerseText = item.text.replace(/[\uFD3E\uFD3F]/g, '');
      const textToCopy = `📖 سورة ${item.surahName} - الآية ${toArabicDigits(item.ayahNumber)}\n\n${cleanVerseText}\n\n🎧 رابط التلاوة بصوت ${reciterName}:\n${audioUrl}`;

      let copied = false;
      
      // 1. محاولة استخدام واجهة النسخ القياسية للمتصفح (الأفضل والأكثر استقراراً للويب)
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        copied = true;
      } 
      // 2. محاولة استخدام expo-clipboard كخطة احتياطية لأجهزة الجوال
      else if (Clipboard && typeof Clipboard.setStringAsync === 'function') {
        await Clipboard.setStringAsync(textToCopy);
        copied = true;
      }

      if (copied) {
        Alert.alert('✅ تم النسخ', 'تم نسخ الآية ورابط الصوت بنجاح', [{ text: 'حسناً', style: 'default' }]);
      } else {
        throw new Error('Clipboard API not supported in this environment');
      }
    } catch (error) {
      console.error('خطأ في النسخ:', error);
      Alert.alert(
        'عذراً', 
        'متصفحك الحالي لا يدعم النسخ التلقائي. يرجى تحديد النص ونسخه يدوياً.', 
        [{ text: 'حسناً', style: 'default' }]
      );
    }
  };
 
 
 
 

  /* تنظيف الصوت عند إغلاق التطبيق */
   useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  
  

/// new new

  const handleSearchWithSingleWord = async (word) => {
    const runId = ++searchRunRef.current;   // ✅ نفس رقم الحماية

    if (multiWordBackup?.searchWord !== word && results.length > 0) {
      setMultiWordBackup({
        searchWord,
        results,
        totalCount,
        ignoredWords,
        highlightWords: [...highlightWords],
        activeTerms: [...activeTerms],
        selectedJuz: selectedJuz
      });
    }

    setShowStats(false);
    setSelectedSurahFilter(null);
    setSearchWord(word);
    setHighlightWords([]);
    setLoading(true);
    setErrorMessage('');
    setIgnoredWords([]);

    try {
      let res;
      if (selectedJuz) {
        res = await searchInJuz(selectedJuz, word, isExactMatch);
      } else {
        res = await searchInQuran(word, isExactMatch);
      }

      if (runId !== searchRunRef.current) return;  // ✅ أُلغي

      setResults(res.verses || []);
      setTotalCount(res.count || 0);
      setIgnoredWords(res.ignored || []);
      setActiveTerms(res.termsUsed || []);
      if (res.error) setErrorMessage(res.error);

    } catch (e) {
      if (runId !== searchRunRef.current) return;
      setErrorMessage('حدث خطأ أثناء البحث');
      setResults([]);
      setTotalCount(0);
      setActiveTerms([]);
    } finally {
      if (runId === searchRunRef.current) setLoading(false);
    }
  };


//////////


		
		
    /* ♻️ استعادة البحث المتعدد المحفوظ */
   const restoreMultiWordSearch = () => {
    if (!multiWordBackup) return;
    
    // ✅ استعادة شاملة لكل متغيرات البحث الأصلية
    setSearchWord(multiWordBackup.searchWord);
    setResults(multiWordBackup.results);
    setTotalCount(multiWordBackup.totalCount);
    setIgnoredWords(multiWordBackup.ignoredWords);
    setHighlightWords(multiWordBackup.highlightWords);
    setActiveTerms(multiWordBackup.activeTerms || []);
    setSelectedJuz(multiWordBackup.selectedJuz || null); // ✅ استعادة الجزء إن كان محدداً
    
    setMultiWordBackup(null); // إخفاء شريط الاستعادة بعد الضغط عليه
  };
 
   /* ============================================================
   * عرض رسالة "حول التطبيق" التي تومض ثم تختفي
   * ============================================================ */
  const showAboutToast = () => {
    setShowAboutMessage(true);
    setTimeout(() => {
      setShowAboutMessage(false);
    }, 3000); // تختفي بعد 3 ثوانٍ
  };
    
   /* ============================================================
   * ✅ إعادة البحث تلقائياً عند:
   *    1) تغيير الجزء (اختيار جزء / إلغاء الجزء)
   *    2) التبديل بين يحتوي / مطابقة
   * ============================================================ */
  useEffect(() => {
    /* إنهاء كل آثار البحث القديم قبل بدء الجديد */
    setSelectedSurahFilter(null);
    setMultiWordBackup(null);
    setActiveTerms([]);
    setIgnoredWords([]);
    setResults([]);
    setTotalCount(0);
    setShowStats(false);

    if (searchWord.trim()) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJuz, isExactMatch]);



    const renderVerse = (item) => {
    const verse = item.text || '';
    const clean = item.cleanText || verse;

    let terms;
    if (highlightWords.length > 0) {
      terms = highlightWords.map(k => normalizeArabic(k)).filter(k => k.length > 0);
    } else if (activeTerms.length > 0) {
      terms = activeTerms.map(k => normalizeArabic(k)).filter(k => k.length > 0);
    } else {
      terms = normalizeArabic(searchWord).split(/\s+/).filter(Boolean);
    }

    const needles = [];
    terms.forEach(term => {
      const key = (term.startsWith('و') && term.length > 2) ? term.slice(1) : term;
      if (isExactMatch) {
        needles.push({ str: key, whole: true });
        needles.push({ str: 'و' + key, whole: true });
      } else {
        needles.push({ str: term, whole: false });
        if (key !== term) needles.push({ str: key, whole: true });
      }
    });

    const dWords = verse.trim().split(/\s+/);
    const cWords = clean.trim().split(/\s+/);
    const aligned = dWords.length === cWords.length;

    const wordMatches = (w) => {
      const nw = normalizeArabic(w);
      if (!nw) return false;
      for (const nd of needles) {
        if (nd.whole ? nw === nd.str : nw.includes(nd.str)) return true;
      }
      return false;
    };

    const parts = [];
    dWords.forEach((w, i) => {
      if (i > 0) parts.push(<Text key={'sp-' + i}>{' '}</Text>);
      
      const cw = aligned ? cWords[i] : w;
      const ncw = normalizeArabic(cw);
      const nw = normalizeArabic(w);
      
      let matchedTerm = null;
      for (const nd of needles) {
        if (nd.whole ? (ncw === nd.str || nw === nd.str) : (ncw.includes(nd.str) || nw.includes(nd.str))) {
          matchedTerm = nd.str;
          break;
        }
      }

      if (matchedTerm) {
        parts.push(
          <Text key={'w-' + i}>
            {highlightPartialWord(w, cw, matchedTerm)}
          </Text>
        );
      } else {
        parts.push(
          <Text key={'w-' + i}>
            {textWithSymbols(w, 'w-' + i, styles.symbolFont)}
          </Text>
        );
      }
    });
    return parts;
  };
 
 
 //////////////////
 
   /* ✅ دالة لضبط قواعد العدد والمعدود في اللغة العربية بدقة */
  const getCountWord = (count) => {
    if (count === 1) return 'مرة';
    if (count === 2) return 'مرتان';
    if (count >= 3 && count <= 10) return 'مرات';
    return 'مرة'; // للأعداد من 11 إلى 99 (مفرد المعدود)
  };
 
 ////////////////////
 
 
 
 
  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1a5276" />
        <Text style={styles.loadingText}>جاري تحميل الخطوط...</Text>
      </View>
    );
  }

  const toArabicDigits = (str) => {
    return String(str)
      .replace(/0/g, '٠').replace(/1/g, '١').replace(/2/g, '٢')
      .replace(/3/g, '٣').replace(/4/g, '٤').replace(/5/g, '٥')
      .replace(/6/g, '٦').replace(/7/g, '٧').replace(/8/g, '٨')
      .replace(/9/g, '٩');
  };

  const AYAH_OPEN = '\uFD3E';
  const AYAH_CLOSE = '\uFD3F';


   const VerseCard = ({ item }) => {
    const key = `${item.surahNumber}-${item.ayahNumber}`;
    const isPlaying = playingVerseKey === key;

    return (
      <TouchableOpacity
        style={[styles.verseCard, isPlaying && styles.verseCardPlaying]}
        activeOpacity={0.8}
        onPress={() => playVerseAudio(item.surahNumber, item.ayahNumber)}
		onLongPress={() => copyVerseToClipboard(item)}
        delayLongPress={400}
		
      >
        <Text style={styles.verseText}>
          {renderVerse(item)}
          {'  '}
          <Text style={styles.ayahDecoration}>
            {AYAH_CLOSE}{toArabicDigits(item.ayahNumber)}{AYAH_OPEN}
          </Text>
        </Text>


        {/* زر الاستماع - صغير وغير مزعج */}
			<View style={styles.audioRow}>
          <TouchableOpacity
            style={[styles.audioBtn, isPlaying && styles.audioBtnPlaying]}
            onPress={(e) => {
              
              if (e && e.stopPropagation) e.stopPropagation();
              playVerseAudio(item.surahNumber, item.ayahNumber);
            }}
            disabled={audioLoading && isPlaying}
          >
            {audioLoading && isPlaying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.audioBtnLabel}>
                {isPlaying ? '⏸ إيقاف' : '🎧 استماع'}
              </Text>
            )}
          </TouchableOpacity>
		  
		   <TouchableOpacity style={styles.copyBtn} onPress={() => copyVerseToClipboard(item)}>
            <Text style={styles.copyBtnLabel}>📋 نسخ</Text>
          </TouchableOpacity>
		  
		  {/* <TouchableOpacity style={styles.copyBtn}  onPress={showAboutToast}>
            <Text style={styles.aboutBtnLabel}>📋 حول</Text>
          </TouchableOpacity> */}
		  
		  
			</View>
			
			
			

        <View style={styles.metaContainer}>
          <Text style={styles.metaGreen}> صفحة {item.pageNumber} | جزء {item.juzNumber}</Text>
          <Text style={styles.metaRed}>{item.revelation}</Text>
          <Text style={styles.metaBlue}>سورة {item.surahName}</Text>
        </View>
      </TouchableOpacity>
    );
  };
 
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f5f0" />

        <View style={styles.header}>
        
		
		<View style={styles.headerSide}></View>
        <Text style={styles.title}>الْبَاحِثُ الْقُرْآنِيُّ</Text>
		<View style={styles.headerSide}></View>
		
         <TouchableOpacity
          style={styles.reciterBtn}
          onPress={() => setShowReciterPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.reciterNameText} numberOfLines={1}
		  >
            {RECITERS.find(r => r.id === selectedReciter)?.name || 'اختر القارئ'}
          </Text>
        </TouchableOpacity> 
		
		
		 		
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.input}
          placeholder="أدخل(سجده)للبحث.."
          placeholderTextColor="#999"
          value={searchWord}
          autoCorrect={false}
          spellCheck={false}
          autoCapitalize="none"
          onChangeText={(t) => {
            setSearchWord(t);
            setHighlightWords([]);
            setSelectedSurahFilter(null);
            if (!t.trim()) {
              setResults([]);
              setTotalCount(0);
              setIgnoredWords([]);
            }
          }}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
 <TouchableOpacity
          style={styles.searchIconBtn}
          onPress={handleSearch}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#1a5276" />
          ) : (
            <Text style={{ fontSize: 22 }}>🔍</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, isExactMatch && styles.toggleBtnActive]}
          onPress={() => setIsExactMatch(!isExactMatch)}
        >
          <Text style={[styles.toggleText, isExactMatch && styles.toggleTextActive]}>
            {isExactMatch ? 'مطابقة' : 'يحتوي'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, selectedJuz && styles.toggleBtnActive]}
          onPress={() => setShowJuzPicker(true)}
        >
          <Text style={[styles.toggleText, selectedJuz && styles.toggleTextActive]}>
            {selectedJuz ? toArabicDigits(selectedJuz) : 'جزء'}
          </Text>
        </TouchableOpacity>

    
       
      </View>
        


      {errorMessage ? (
        <View style={styles.errorBox}><Text style={styles.errorText}>{errorMessage}</Text></View>
      ) : null}

      <View style={styles.mainBody}>
	          {selectedJuz && (
          <TouchableOpacity
            style={styles.juzActiveBanner}
            onPress={() => setSelectedJuz(null)}
          >
            <Text style={styles.juzActiveText}>
              🔎 البحث محصور في الجزء {toArabicDigits(selectedJuz)} — اضغط هنا للإلغاء والبحث في كامل المصحف
            </Text>
			<BlinkingIcon emoji="↩" style={{ fontSize: 18, color: '#1c03ff' }} />

          </TouchableOpacity>
        )}
      


        {totalCount > 0 && (
          <>
            <TouchableOpacity
              style={styles.resultsCountBar}
              onPress={() => setShowStats(true)}
              activeOpacity={0.6}
            >
              <Text style={styles.resultsCountText}>
                {selectedJuz
                  ? `عدد النتائج ${toArabicDigits(totalCount)} مرة في الجزء ${toArabicDigits(selectedJuz)}`
                  : `عدد النتائج : ${toArabicDigits(totalCount)} مرة`
                }
              </Text>
              <BlinkingIcon emoji=" 👈 اضغط هنا " style={styles.resultsCountIcon} active={!showStats} />
            </TouchableOpacity>

           

            {multiWordBackup && (
              <TouchableOpacity
                style={styles.restoreBanner}
                onPress={restoreMultiWordSearch}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Text style={styles.restoreBannerText}>
                    🔍 نتائج كلمة «{searchWord}» فقط — اضغط هنا لعرض نتائج البحث الأصلي ({multiWordBackup.searchWord})
                  </Text>
                  <BlinkingIcon emoji="↩" style={{ fontSize: 18, color: '#e65100' }} />
                </View>
              </TouchableOpacity>
            )}
          </>
        )}



                {/* ✅ شريط نتائج السورة المختارة (مصحح لغوياً مع التفاف النص) */}
        {selectedSurahFilter && (
          <TouchableOpacity
            style={styles.surahFilterBanner}
            onPress={() => setSelectedSurahFilter(null)}
            activeOpacity={0.7}
          >
            <View style={styles.surahFilterContent}>
              <Text style={styles.surahFilterText}>
                 نتائج سورة {selectedSurahFilter} — {toArabicDigits(selectedSurahCount)} {getCountWord(selectedSurahCount)} — اضغط هنا لعرض جميع النتائج
              </Text>
              <BlinkingIcon emoji="↩" style={styles.surahFilterIcon} />
            </View>
          </TouchableOpacity>
        )}
	   
	   
	<FlatList
          ref={listRef}
          data={filteredResults}
		  
		  
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <VerseCard item={item} />}
          contentContainerStyle={styles.resultsList}
                  ListEmptyComponent={
            !loading && searchWord.trim() && totalCount === 0 ? (
              <Text style={styles.emptyText}>
                {selectedJuz
                  ? `لا توجد نتائج في الجزء ${toArabicDigits(selectedJuz)} — ألغِ تحديد الجزء للبحث في كامل المصحف`
                  : 'لا توجد نتائج مطابقة'
                }
              </Text>
            ) : null
          }
        />
      </View>

      <Modal visible={showReciterPicker} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.headerSide} />
              <Text style={styles.modalTitle}>اختر القارئ</Text>
              <TouchableOpacity onPress={() => setShowReciterPicker(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.statsList}>
              {RECITERS.map((reciter) => (
                <TouchableOpacity
                  key={reciter.id}
                  style={[styles.topicItem, selectedReciter === reciter.id && { backgroundColor: '#e8f5e9' }]}
                  onPress={() => {
                    setSelectedReciter(reciter.id);
                    setShowReciterPicker(false);
                  }}
                >
                  <Text style={[styles.topicName, selectedReciter === reciter.id && { color: '#2e7d32', fontWeight: 'bold' }]}>
                    {reciter.name} {selectedReciter === reciter.id ? '✓' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>



      <Modal visible={showStats} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.headerSide} />
              <Text style={styles.modalTitle}>إحصائيات السور</Text>
              <TouchableOpacity onPress={() => setShowStats(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.statsList}>
			

			  
			              {wordSummary.length > 0 && (
                <View style={styles.wordSummaryBox}>
                  <Text style={styles.wordSummaryTitle}>
                    {selectedJuz
                      ? `ملخص الكلمات في الجزء ${toArabicDigits(selectedJuz)}`
                                            : 'ملخص الكلمات — اضغط على أي كلمة لعرض آياتها (يمكنك الرجوع ↩)'
                    }
                  </Text>
                  {wordSummary.map((ws, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.wordSummaryRow}
                      activeOpacity={0.6}
                      onPress={() => {
                        setShowStats(false);
                        setSearchWord(ws.word);
                        setHighlightWords([]);
                        handleSearchWithSingleWord(ws.word);
                      }}
                    >
                      <Text style={styles.wordSummaryWord}>{ws.word}</Text>
                      <Text style={styles.wordSummaryCount}>{toArabicDigits(ws.count)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}  
			  
			  
			  
			  
              {surahStats.map((stat, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.statRowClickable}
                  onPress={() => {
                    setSelectedSurahFilter(stat.name);
                    setShowStats(false);
                  }}
                >   
                  <Text style={styles.statCount}>{toArabicDigits(stat.count)}</Text>
                  <Text style={styles.statName}>سورة {stat.name}</Text>
                </TouchableOpacity>
              ))}
			  
			  
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showTopics} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.headerSide} />
              <Text style={styles.modalTitle}>آيات عن...</Text>
              <TouchableOpacity onPress={() => setShowTopics(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.statsList}>
              {topics.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.topicItem}
                  onPress={() => {
                    setShowTopics(false);
                    handleSearchWithTopic(topic);
                  }}
                >
                  <Text style={styles.topicName}>{topic.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showJuzPicker} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.headerSide} />
              <Text style={styles.modalTitle}>اختر الجزء</Text>
              <TouchableOpacity onPress={() => setShowJuzPicker(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.statsList}>
              <View style={styles.juzGrid}>
                {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.juzItem, selectedJuz === num && styles.juzItemActive]}
                    onPress={() => {
                      setSelectedJuz(num);
                      setShowJuzPicker(false);
                    }}
                  >
                    <Text style={[styles.juzItemText, selectedJuz === num && styles.juzItemTextActive]}>
                      {toArabicDigits(num)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedJuz && (
                <TouchableOpacity
                  style={styles.juzCancelBtn}
                  onPress={() => {
                    setSelectedJuz(null);
                    setShowJuzPicker(false);
                  }}
                >
                  <Text style={styles.juzCancelText}>إلغاء تحديد الجزء</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showWordMeaning} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.wordMeaningOverlay}
          activeOpacity={1}
          onPress={() => setShowWordMeaning(false)}
        >
          <View style={styles.wordMeaningCard}>
            <View style={styles.wordMeaningHeader}>
              <Text style={styles.wordMeaningWord}>{selectedWord}</Text>
              <TouchableOpacity onPress={() => setShowWordMeaning(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.wordMeaningDivider} />
            <Text style={styles.wordMeaningText}>{selectedMeaning}</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.footer}>
        <Text style={styles.footerText}>عدد الآيات: {getVerseCount()} — البحث يتجاهل التشكيل</Text>
      </View>
	  
	        {/* ✅ رسالة "حول التطبيق" المنبثقة */}
      {showAboutMessage && (
        <TouchableOpacity
          style={styles.aboutToast}
          activeOpacity={1}
          onPress={() => setShowAboutMessage(false)}
        >
          <Text style={styles.aboutToastTitle}>📖 الباحث القرآني</Text>
          <Text style={styles.aboutToastText}>
            تطبيق مجاني لوجه الله تعالى{'\n'}
            للبحث الذكي في القرآن الكريم{'\n'}
            الإصدار 1.0.0
          </Text>
        </TouchableOpacity>
      )}
	  
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  
  container: { 
  flex: 1, 
  backgroundColor: '#fdfbf7',
  width: '100%',
  minHeight: '100vh',  
},
  
  
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 18, fontFamily: 'Amiri' },


  header: {
    backgroundColor: '#d4af37',
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#b8962e'
  },
  headerSide: {
    width: 50, /* عرض ثابت للجانبين لضمان التوسيط الدقيق */
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    flex: 1, /* يأخذ المساحة المتبقية */
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Amiri',
    fontWeight: 'bold',
    textAlign: 'center' /* توسيط النص داخل مساحته */
  },
    searchBarContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    flexWrap: 'wrap', // ✅ يسمح للعناصر بالنزول لسطر جديد إذا ضاق المكان
  },
  input: {
    flex: 1,
    minWidth: 120, // ✅ حد أدنى للعرض حتى لا ينكمش حقل البحث تماماً
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    textAlign: 'right',
    height: 38
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1a5276',
    backgroundColor: 'transparent',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0, 
  },
  toggleText: { 
    fontFamily: 'Amiri', 
    fontSize: 13, 
    color: '#1a5276',
    whiteSpace: 'nowrap'  
  },

  toggleBtnActive: { backgroundColor: '#1a5276' },
  toggleText: { fontFamily: 'Amiri', fontSize: 13, color: '#1a5276' },
  toggleTextActive: { color: '#fff' },
  searchBtn: {
    backgroundColor: '#1a5276',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center'
  },
  searchBtnText: { color: '#fff', fontFamily: 'Amiri', fontSize: 16 },

  errorBox: { backgroundColor: '#f8d7da', margin: 10, padding: 10, borderRadius: 8, alignItems: 'center' },
  errorText: { color: '#721c24', fontFamily: 'Amiri' },

 /*  mainBody: { flex: 1, overflow: 'hidden' }, */

mainBody: { 
  flex: 1, 
  overflow: 'hidden',
  width: '100%',
},


  juzActiveBanner: {
    backgroundColor: '#fff3cd',
    marginHorizontal: 15,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffc107',
    alignItems: 'center'
  },
  juzActiveText: {
    fontFamily: 'Amiri',
    fontSize: 13,
    color: '#856404',
    fontWeight: 'bold',
    textAlign: 'center'
  },

    resultsCountBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    marginHorizontal: 15,
    marginTop: 8,
    marginBottom: 4,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c8e6c9'
  }, 
  

    resultsCountIcon: {
    fontSize: 14,
    color: '#f70202'
  }, 
  resultsCountText: {
    color: '#2e7d32',
    fontFamily: 'Amiri',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center'
  }, 
   
  ignoredNote: {
    textAlign: 'center',
    color: '#999',
    fontFamily: 'Amiri',
    fontSize: 12,
    marginBottom: 4
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0
  },

  modalContent: {
  width: '90%',           
  maxHeight: '80%',       
  maxWidth: 600,          
  alignSelf: 'center',
  backgroundColor: '#fff',
  borderRadius: 16,
  overflow: 'hidden',
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4
},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a5276'
  },
  headerSide: { width: 40, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { color: 'yellow', alignSelf: 'stretch', textAlign: 'center', fontFamily: 'Amiri', fontSize: 18, fontWeight: 'bold' },
  closeBtn: { padding: 5 },
  closeBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  statsList: { padding: 10 },
  statRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  
    statRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  statRowClickable: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9'
  },

    surahFilterBanner: {
    backgroundColor: '#d4edda',
    marginHorizontal: 15,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c3e6cb',
    alignItems: 'center',
  },
  surahFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  surahFilterText: {
    fontFamily: 'Amiri',
    fontSize: 13,
    color: '#155724',
    fontWeight: 'bold',
    flex: 1,  // يأخذ المساحة المتبقية
    textAlign: 'right',
    lineHeight: 20,
    flexWrap: 'wrap',  // يسمح بالتفاف النص
  },
  surahFilterIcon: {
    fontSize: 18,
    color: '#155724',
    flexShrink: 0,  // يمنع انكماش الأيقونة
  },
  statCount: {
    fontFamily: 'Amiri',
    fontSize: 16,
    color: '#c0392b',
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center'
  },
  statName: {
    fontFamily: 'Amiri',
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right'
  },

  wordSummaryBox: {
    backgroundColor: '#fff8e1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffe082'
  },
  wordSummaryTitle: {
    fontFamily: 'Amiri',
    fontSize: 15,
    color: '#f57f17',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8
  },
    wordSummaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fff3c4',
    borderRadius: 6,
    backgroundColor: '#fffde7'
  },
  wordSummaryWord: {
    fontFamily: 'Amiri',
    fontSize: 16,
    color: '#1a5276',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right'
  },
  wordSummaryCount: {
    fontFamily: 'Amiri',
    fontSize: 16,
    color: '#c0392b',
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center'
  },
  
    restoreBanner: {
    backgroundColor: '#fff3e0',
    marginHorizontal: 15,
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffb74d',
    alignItems: 'center'
  },
  restoreBannerText: {
    fontFamily: 'Amiri',
    fontSize: 13,
    color: '#e65100',
    fontWeight: 'bold',
    textAlign: 'center'
  },

  topicItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row-reverse',
    alignItems: 'center'
  },
  topicName: {
    fontFamily: 'Amiri',
    fontSize: 17,
    color: '#1a5276',
    flex: 1,
    textAlign: 'right'
  },

  juzGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
    gap: 8
  },
  juzItem: {
    width: 55,
    height: 55,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  juzItemActive: { backgroundColor: '#1a5276', borderColor: '#1a5276' },
  juzItemText: { fontFamily: 'Amiri', fontSize: 18, color: '#333', fontWeight: 'bold' },
  juzItemTextActive: { color: '#fff' },
  juzCancelBtn: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 15,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f8d7da',
    alignItems: 'center'
  },
  juzCancelText: { fontFamily: 'Amiri', fontSize: 15, color: '#721c24', fontWeight: 'bold' },

  wordMeaningOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  wordMeaningCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  wordMeaningHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a5276'
  },
  wordMeaningWord: {
    fontFamily: 'Amiri',
    fontSize: 24,
    color: '#ffd700',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center'
  },
  wordMeaningDivider: { height: 3, backgroundColor: '#d4af37' },
  wordMeaningText: {
    fontFamily: 'Amiri',
    fontSize: 18,
    color: '#2c3e50',
    padding: 20,
    textAlign: 'center',
    lineHeight: 32
  },

  /* resultsList: { padding: 15, paddingBottom: 50 }, */
  resultsList: { 
  padding: 15, 
  paddingBottom: 50,
  width: '100%',
  maxWidth: 900,         /* حد أقصى لعدم تمدد النص كثيراً على الشاشات الكبيرة */
  alignSelf: 'center',   /* توسيط المحتوى */
},
  verseCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eaeaea',
    elevation: 2
  },
  verseText: {
    fontSize: 22,
    color: '#000',
    fontFamily: 'Amiri',
    lineHeight: 40,
    textAlign: 'right',
    marginBottom: 10
  },
  highlight: { backgroundColor: '#fff59d', color: '#000' },
  hasMeaningWord: {
    textDecorationLine: 'underline',
    textDecorationColor: '#1a5276'
  },
  symbolFont: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'Geeza Pro'
  },
   ayahDecoration: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'Geeza Pro',
    fontSize: 20,
    color: '#1a5276',
    fontWeight: 'bold',
    marginRight: 3
  },

  metaContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8
  },
  metaGreen: { color: '#27ae60', fontFamily: 'Amiri', fontSize: 14 },
  metaRed: { color: '#c0392b', fontFamily: 'Amiri', fontSize: 14, fontWeight: 'bold' },
  metaBlue: { color: '#2980b9', fontFamily: 'Amiri', fontSize: 14, fontWeight: 'bold' },

  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, fontFamily: 'Amiri', color: '#999' },

  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    padding: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
    verseCardPlaying: {
    borderColor: '#2e7d32',
    borderWidth: 2,
    backgroundColor: '#f1f8e9'
  },
   playingIndicator: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center'
  },
  playingText: {
    fontFamily: 'Amiri',
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: 'bold'
  },
  
   audioBtnLabel: {
    fontFamily: 'Amiri',
    fontSize: 14,
    color: '#0800e3',
    fontWeight: 'bold'
  },
  reciterIcon: {
    fontFamily: 'Amiri',
    fontSize: 14,
    color: '#1d2470',
    fontWeight: 'bold'
  },
   
  aboutBtnLabel: {
    fontFamily: 'Amiri',
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold'
  },
   copyBtnLabel: {
    fontFamily: 'Amiri',
    fontSize: 14,
    color: '#e65100',
    fontWeight: 'bold'
  },
  hintText: {
    fontFamily: 'Amiri',
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
    fontStyle: 'italic'
  },
    reciterBtn: {
    Width: 80,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 6,
  },
  reciterNameText: {
    fontFamily: 'Amiri',
    fontSize: 11,   
    color: 'blue',
    
    textAlign: 'center',
  },
    
  welcomeContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  welcomeIcon: {
    fontSize: 60,
    marginBottom: 10
  },
  welcomeTitle: {
    fontFamily: 'Amiri',
    fontSize: 26,
    color: '#1a5276',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8
  },
  welcomeDivider: {
    width: 120,
    height: 3,
    backgroundColor: '#d4af37',
    borderRadius: 2,
    marginVertical: 10
  },
  welcomeSubtitle: {
    fontFamily: 'Amiri',
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20
  },
  featuresBox: {
    width: '100%',
    backgroundColor: '#fdfbf7',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e8e0c8',
    marginBottom: 15
  },
  featureRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e8d0'
  },
  featureIcon: {
    fontSize: 24,
    marginLeft: 12,
    marginTop: 2
  },
  featureText: {
    flex: 1
  },
  featureTitle: {
    fontFamily: 'Amiri',
    fontSize: 16,
    color: '#1a5276',
    fontWeight: 'bold',
    marginBottom: 3
  },
  featureDesc: {
    fontFamily: 'Amiri',
    fontSize: 13,
    color: '#666',
    lineHeight: 20
  },
  tipsBox: {
    width: '100%',
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    marginBottom: 15
  },
  tipsTitle: {
    fontFamily: 'Amiri',
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  tipText: {
    fontFamily: 'Amiri',
    fontSize: 13,
    color: '#1b5e20',
    lineHeight: 22,
    marginBottom: 4
  },
  welcomeFooter: {
    fontFamily: 'Amiri',
    fontSize: 15,
    color: '#d4af37',
    fontWeight: 'bold',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10
  },

    searchIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: '#e8f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a5276',
    marginHorizontal: 2,
  },
    resultsCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 8,
    marginBottom: 4,
    gap: 8
  },
  aboutBtn: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#90caf9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  aboutBtnLabel: {
    fontFamily: 'Amiri',
    fontSize: 13,
    color: '#1565c0',
    fontWeight: 'bold'
  },
  aboutToast: {
    position: 'absolute',
    bottom: 60,
    left: 120,
    right: 120,
    backgroundColor: 'rgba(26, 82, 118, 0.95)',
    borderRadius: 120,
    padding: 16,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6
  },
  aboutToastTitle: {
    fontFamily: 'Amiri',
    fontSize: 20,
    color: '#ffd700',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  aboutToastText: {
    fontFamily: 'Amiri',
    fontSize: 15,
    color: 'yellow',
    textAlign: 'center',
    lineHeight: 24
  },
  footerText: { fontSize: 12, color: '#888', fontFamily: 'Amiri' }
});