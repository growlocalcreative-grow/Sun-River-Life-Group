import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TabType, AppUser, Lesson, LoungeMessage } from './types';
import { Home, Soup, BookOpen, Users, LogIn, LogOut, Shield, Calendar, Check, X, ArrowLeft, GraduationCap, Settings, Plus, Loader2, AlertTriangle, Trash2, MapPin, ExternalLink, Sun, Utensils, Book, Send, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gathering, 
  GatheringItem, 
  subscribeToActiveGathering, 
  subscribeToGatheringItems, 
  claimItem, 
  unclaimItem,
  initializeGatheringBlueprint,
  updateActiveGathering,
  deleteSpecificGathering,
  createNewGathering,
  subscribeToUpcomingGatherings,
  generateSchedule,
  archiveCurrentSeason,
  deleteAllGatherings,
  suggestItem,
  subscribeToConnections,
  addConnection,
  subscribeToAddresses,
  addAddress,
  deleteAddress,
  seedInitialAddresses,
  AddressEntry,
  subscribeToSettings,
  updateAppSettings,
  AppSetting,
  syncActiveGatheringFromSchedule,
  subscribeToLessons,
  createLesson,
  deleteLesson,
  addLoungeMessage,
  subscribeToLoungeMessages
} from './services/gatheringService';

const MOCK_LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'Wisdom & Instruction',
    subtitle: 'April 22 – The Foundation of Wisdom',
    date: '2026-04-22',
    content: "### The Beginning of Knowledge\n\nWisdom is not merely intellectual, but a posture of the heart before the Creator. The fear of the LORD is the beginning of knowledge.\n\n**Scripture Focus:** Proverbs 1:1–7",
    questions: [
      "What does it mean to 'know wisdom and instruction' (v. 2)?",
      "Who is the target audience in this passage?",
      "Why is it necessary for the 'wise' to continue learning (v. 5)?",
      "How does the passage distinguish between righteous wisdom and the 'fool' (v. 7)?",
      "What is the relationship between 'the fear of the LORD' and knowledge?"
    ]
  },
  {
    id: 'l2',
    title: 'A Prayer for Wisdom',
    subtitle: 'April 29 – Requesting a Discerning Heart',
    date: '2026-04-29',
    content: "### Solomon's Request\n\nWhen given the opportunity to ask for anything, Solomon asked for a discerning heart to govern well and distinguish between right and wrong.\n\n**Scripture Focus:** 1 Kings 3:5–14",
    questions: [
      "What is humility, and why is it essential for the Christian life?",
      "How do Christians grow in humility?",
      "What does Solomon’s request reveal about his faith and his view of his calling?",
      "How has God shown favor towards us, similar to Solomon?"
    ]
  },
  {
    id: 'l3',
    title: 'Extraordinary Wisdom',
    subtitle: 'May 6 – The Breath of God’s Insight',
    date: '2026-05-06',
    content: "### A Gift from Above\n\nGod gave Solomon wisdom and very great insight, and a breadth of understanding as measureless as the sand on the seashore.\n\n**Scripture Focus:** 1 Kings 4:29–34",
    questions: [
      "What is the difference between information and 'breadth of mind'?",
      "How do we discern worldly wisdom from Godly wisdom today?",
      "How does looking at Jesus reshape our understanding of discernment?"
    ]
  },
  {
    id: 'l4',
    title: 'Wholehearted Trust',
    subtitle: 'May 13 – Leaning Not on Your Own Understanding',
    date: '2026-05-13',
    content: "### The Path of Submission\n\nTrust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him.\n\n**Scripture Focus:** Proverbs 3:1–12",
    questions: [
      "What are the 'commands' we are told to keep in our hearts (v. 1)?",
      "Why is it dangerous to 'lean on your own understanding' (v. 5)?",
      "What does it mean to acknowledge God in 'all your ways' (v. 6)?",
      "How does 'fear of the LORD' relate to physical and spiritual health (v. 8)?",
      "Why is the discipline of the LORD described as a sign of love (v. 11-12)?"
    ]
  },
  {
    id: 'l5',
    title: 'Asking in Faith',
    subtitle: 'May 20 – The Generosity of God',
    date: '2026-05-20',
    content: "### Seeking Without Doubting\n\nIf any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.\n\n**Scripture Focus:** James 1:5–8",
    questions: [
      "Why does James start with 'lacking wisdom' in the context of trials?",
      "What does it mean that God gives 'without finding fault' (v. 5)?",
      "How do we 'ask in faith' without doubting (v. 6)?",
      "What is the result of being 'double-minded' (v. 8)?"
    ]
  },
  {
    id: 'l6',
    title: 'Wisdom from Above',
    subtitle: 'May 27 – The Character of True Insight',
    date: '2026-05-27',
    content: "### Heavenly vs. Earthly Wisdom\n\nBut the wisdom that comes from heaven is first of all pure; then peace-loving, considerate, submissive, full of mercy and good fruit.\n\n**Scripture Focus:** James 3:13–18",
    questions: [
      "How is wisdom 'shown' through deeds and humility (v. 13)?",
      "How does James contrast the wisdom that is 'earthly, unspiritual, and demonic' (v. 15)?",
      "What are the specific attributes of 'wisdom from above' (v. 17)?",
      "How does 'peace' act as a soil for a harvest of righteousness (v. 18)?"
    ]
  },
  {
    id: 'l7',
    title: 'Spiritual Maturity',
    subtitle: 'June 3 – Training the Senses',
    date: '2026-06-03',
    content: "### Solid Food for the Mature\n\nBut solid food is for the mature, who by constant use have trained themselves to distinguish good from evil.\n\n**Scripture Focus:** Hebrews 5:11–14",
    questions: [
      "Why had the audience become 'slow to learn' (v. 11)?",
      "What is the difference between 'spiritual milk' and 'solid food' (v. 12)?",
      "How does 'constant use' of truth help us train our senses to distinguish good from evil (v. 14)?",
      "Why is solid food necessary for true discernment?"
    ]
  },
  {
    id: 'l8',
    title: 'Love & Discernment',
    subtitle: 'June 10 – Abounding in Knowledge',
    date: '2026-06-10',
    content: "### Love Governed by Truth\n\nAnd this is my prayer: that your love may abound more and more in knowledge and depth of insight, so that you may be able to discern what is best.\n\n**Scripture Focus:** Philippians 1:9–10",
    questions: [
      "Why does Paul pray for love to 'abound more and more' in the context of discernment (v. 9)?",
      "What is the link between love, knowledge, and depth of insight?",
      "How does discernment help us choose what is 'best' rather than just 'good' (v. 10)?",
      "What does it mean to be filled with the 'fruit of righteousness' through Jesus Christ (v. 11)?"
    ]
  }
];

const LessonModal = ({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) => {
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  const toggleQuestion = (index: number) => {
    setCompleted(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] bg-parchment overflow-y-auto"
    >
      <div className="max-w-2xl mx-auto px-6 py-12">
        <button 
          id="close-lesson-btn"
          onClick={onClose}
          className="mb-12 flex items-center gap-2 text-forest/40 hover:text-forest transition-colors font-sans text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Library
        </button>

        <article className="space-y-12">
          <header className="space-y-4">
            <div className="flex items-center gap-2 text-forest/40 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
              <Calendar size={12} />
              {new Date(lesson.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <h1 className="font-serif text-5xl font-medium tracking-tight text-forest leading-none">{lesson.title}</h1>
            <p className="font-serif italic text-xl text-forest/60 max-w-lg">{lesson.subtitle}</p>
            <div className="h-1 w-24 bg-forest/20 rounded-full" />
          </header>

          <div className="markdown-body font-serif text-2xl leading-relaxed text-forest space-y-6">
            <ReactMarkdown
              components={{
                h2: ({ ...props }) => <h2 className="text-2xl font-medium pt-8 pb-2 text-forest" {...props} />,
                h3: ({ ...props }) => <h3 className="text-xl font-medium pt-6 pb-2 text-forest/80" {...props} />,
                p: ({ ...props }) => <p className="mb-4" {...props} />,
                ul: ({ ...props }) => <ul className="list-disc ml-6 space-y-2 mb-4" {...props} />,
                li: ({ ...props }) => <li {...props} />,
                strong: ({ ...props }) => <strong className="font-bold text-forest" {...props} />,
                blockquote: ({ ...props }) => (
                  <blockquote className="bg-forest/5 border-l-8 border-forest p-10 my-12 rounded-r-[3rem] italic font-serif text-3xl text-forest/90 leading-snug shadow-sm" {...props} />
                ),
              }}
            >
              {lesson.content}
            </ReactMarkdown>
          </div>

          <section className="space-y-6 pt-12 border-t border-forest/10">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-forest/40" />
              <h3 className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-forest/40">Discussion Checklist</h3>
            </div>
            <ul className="space-y-4">
              {lesson.questions.map((q, i) => (
                <li 
                  key={i} 
                  onClick={() => toggleQuestion(i)}
                  className={`flex gap-5 items-start p-6 rounded-3xl cursor-pointer transition-all border ${
                    completed[i] 
                      ? 'bg-forest/10 border-forest/20 shadow-inner translate-x-1' 
                      : 'bg-white border-forest/5 hover:border-forest/20 shadow-sm'
                  }`}
                >
                  <div className={`mt-1 min-w-[24px] h-6 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                    completed[i] 
                      ? 'bg-forest border-forest text-parchment scale-110' 
                      : 'bg-parchment/50 border-forest/20'
                  }`}>
                    {completed[i] && <Check size={14} className="stroke-[3px]" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-serif text-lg leading-snug transition-all duration-300 ${
                      completed[i] ? 'text-forest/30 line-through italic' : 'text-forest/80'
                    }`}>
                      {q}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </motion.div>
  );
};

const StudyView = ({ lessons }: { lessons: Lesson[] }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  const visibleLessons = lessons;

  return (
    <div id="study-view" className="p-6 space-y-8">
      <header className="space-y-1">
        <p className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-forest/40">Resource Library</p>
        <h1 className="text-4xl font-semibold tracking-tight">The Study Grid</h1>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {visibleLessons.map((lesson) => (
          <motion.div 
            key={lesson.id}
            id={`study-card-${lesson.id}`}
            whileHover={{ y: -4 }}
            className="bg-white/40 border border-forest/5 p-8 rounded-[2rem] space-y-6 group cursor-pointer hover:bg-white/60 transition-all duration-300 shadow-sm relative overflow-hidden"
            onClick={() => setSelectedLesson(lesson)}
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <BookOpen size={80} />
            </div>
            <div className="space-y-2 relative z-10">
              <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest/40">
                {new Date(lesson.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <h2 className="font-serif font-medium text-2xl tracking-tight text-forest leading-tight">{lesson.title}</h2>
              <p className="font-serif italic text-forest/50 text-sm line-clamp-2">{lesson.subtitle}</p>
            </div>
            <button 
              id={`read-lesson-${lesson.id}`}
              className="relative z-10 font-sans text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2.5 bg-forest text-parchment rounded-xl hover:bg-forest/90 transition-all shadow-md shadow-forest/10"
            >
              Read Lesson
            </button>
          </motion.div>
        ))}
        {visibleLessons.length === 0 && (
          <div className="p-12 text-center text-forest/20 italic font-serif bg-white/20 rounded-3xl border-2 border-dashed border-forest/5">
            New lessons arriving soon.
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedLesson && (
          <LessonModal 
            lesson={selectedLesson} 
            onClose={() => setSelectedLesson(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminView = ({ gathering, addresses, appSettings, onShowToast, lessons }: { gathering: Gathering | null; addresses: AddressEntry[]; appSettings: AppSetting; onShowToast: (msg: string) => void; lessons: Lesson[] }) => {
  const [theme, setTheme] = useState(gathering?.theme || '');
  const [date, setDate] = useState(gathering?.date || '');
  const [desc, setDesc] = useState(gathering?.description || '');
  const [locationName, setLocationName] = useState(gathering?.location || '');
  const [locationAddress, setLocationAddress] = useState(gathering?.address || '');
  const [sessionTitle, setSessionTitle] = useState(appSettings.sessionTitle || '');
  
  // Lesson Manager State
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonSubtitle, setNewLessonSubtitle] = useState('');
  const [newLessonDate, setNewLessonDate] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonQuestions, setNewLessonQuestions] = useState('');
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);
  
  // Address Manager State
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrVal, setNewAddrVal] = useState('');
  const [isAddingAddr, setIsAddingAddr] = useState(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [bulkMarkdown, setBulkMarkdown] = useState('');
  const [parsedLessons, setParsedLessons] = useState<Omit<Lesson, 'id'>[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);

  const [startNew, setStartNew] = useState(false);

  // Parsing Logic for Bulk Markdown
  const handleParseBulk = () => {
    try {
      const blocks = bulkMarkdown.split('## ').filter(b => b.trim());
      const monthMap: Record<string, string> = {
        'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06',
        'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12'
      };

      const parsed = blocks.map(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        const header = lines[0]; // e.g. "April 22" or "April 22 (Proverbs 1)"
        
        // Extract Month and Day
        const match = header.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d+)/i);
        if (!match) return null;
        
        const month = monthMap[match[1]];
        const day = match[2].padStart(2, '0');
        const dateIso = `2026-${month}-${day}`;

        // Infer Title and Subtitle from content
        // We'll look for Title: or ### headers
        let title = 'Study Guide';
        let subtitle = `${match[1]} ${match[2]} – Weekly Study`;
        let content = block;
        let questions: string[] = [];

        const titleMatch = block.match(/Title:\s*['"]?([^'"\n]+)['"]?/i) || block.match(/###\s+([^\n]+)/);
        if (titleMatch) title = titleMatch[1];

        const scriptureMatch = block.match(/Scripture:\s*([^\n]+)/i) || block.match(/\*\*Scripture Focus:\*\*\s*([^\n]+)/i);
        if (scriptureMatch) subtitle = `${match[1]} ${match[2]} – ${scriptureMatch[1]}`;

        // Questions: look for lines starting with - or 1.
        questions = lines.filter(l => l.startsWith('- ') || l.match(/^\d+\.\s/)).map(l => l.replace(/^- |\d+\.\s/, '').trim());

        // Extract Summary from "### ... \n\n (Summary) \n\n **Scripture**"
        // For simplicity, we'll just keep the whole block as content as it was before
        
        return {
          title,
          subtitle,
          date: dateIso,
          content: block.split('\n').filter(l => !l.includes('Questions:') && !questions.includes(l.replace(/^- |\d+\.\s/, '').trim())).join('\n').trim(),
          questions
        };
      }).filter(p => p !== null) as Omit<Lesson, 'id'>[];

      setParsedLessons(parsed);
      onShowToast(`Detected ${parsed.length} lessons`);
    } catch (err) {
      onShowToast('Parsing failed. Check format.');
    }
  };

  const handleSeedLibrary = async () => {
    if (parsedLessons.length === 0) return;
    setIsSeeding(true);
    try {
      const { bulkSeedLessons } = await import('./services/gatheringService');
      await bulkSeedLessons(parsedLessons);
      onShowToast('Library Seeded Successfully');
      setBulkMarkdown('');
      setParsedLessons([]);
    } catch (err) {
      onShowToast('Seeding failed');
    } finally {
      setIsSeeding(false);
    }
  };
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showScheduleConfirm, setShowScheduleConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAddrId, setDeletingAddrId] = useState<string | null>(null);
  const [upcoming, setUpcoming] = useState<Gathering[]>([]);

  useEffect(() => {
    if (deletingAddrId) {
      const timer = setTimeout(() => setDeletingAddrId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [deletingAddrId]);

  useEffect(() => {
    if (deletingId) {
      const timer = setTimeout(() => setDeletingId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [deletingId]);
  
  useEffect(() => {
    if (gathering && !startNew) {
      setTheme(gathering.theme || '');
      setDate(gathering.date || '');
      setDesc(gathering.description || '');
      setLocationName(gathering.location || '');
      setLocationAddress(gathering.address || '');
    }
  }, [gathering, startNew]);

  // Bulk Scheduler State
  const [bulkStart, setBulkStart] = useState('2026-04-29');
  const [bulkEnd, setBulkEnd] = useState('2026-06-10');
  const [bulkDay, setBulkDay] = useState(3); // Wednesday
  const [bulkTime, setBulkTime] = useState('18:00');
  const [bulkSession, setBulkSession] = useState('Spring 2026');
  const [bulkLocationName, setBulkLocationName] = useState('');
  const [bulkLocationAddress, setBulkLocationAddress] = useState('');
  const [bulkActive, setBulkActive] = useState(false);

  useEffect(() => {
    const unsub = subscribeToUpcomingGatherings(setUpcoming);
    return () => unsub();
  }, []);

  const getLocalDatetimeValue = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      const tzOffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const handleUpdateGathering = async (e: React.FormEvent) => {
    e.preventDefault();
    const themeChanged = gathering && theme !== gathering.theme;
    if (!showConfirm && (startNew || themeChanged)) {
      setShowConfirm(true);
      return;
    }
    setIsSaving(true);
    setShowConfirm(false);
    try {
      let gatheringId = gathering?.id || null;
      if (startNew) {
        gatheringId = await createNewGathering({ 
          theme, 
          date, 
          description: desc, 
          session: bulkSession,
          location: locationName,
          address: locationAddress
        });
        if (theme.trim()) await initializeGatheringBlueprint(gatheringId, theme);
      } else if (gatheringId) {
        await updateActiveGathering(gatheringId, { 
          theme, 
          date, 
          description: desc,
          location: locationName,
          address: locationAddress
        });
        if (themeChanged && theme.trim()) await initializeGatheringBlueprint(gatheringId, theme, true);
      } else {
        gatheringId = await createNewGathering({ 
          theme, 
          date, 
          description: desc, 
          session: bulkSession,
          location: locationName,
          address: locationAddress
        });
        if (theme.trim()) await initializeGatheringBlueprint(gatheringId, theme);
      }
      setIsSaved(true);
      onShowToast(startNew ? 'New Gathering Started!' : 'Event Updated Successfully!');
      setStartNew(false);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update gathering:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditScheduled = (g: Gathering) => {
    setTheme(g.theme);
    setDate(g.date);
    setDesc(g.description || '');
    setLocationName(g.location || '');
    setLocationAddress(g.address || '');
    setStartNew(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateSchedule = async () => {
    if (!showScheduleConfirm) {
      setShowScheduleConfirm(true);
      return;
    }
    setBulkActive(true);
    setShowScheduleConfirm(false);
    await generateSchedule({
      startDate: bulkStart,
      endDate: bulkEnd,
      dayOfWeek: Number(bulkDay),
      time: bulkTime,
      session: bulkSession,
      location: bulkLocationName,
      address: bulkLocationAddress
    });
    setBulkActive(false);
    onShowToast('Schedule Generated Successfully!');
  };

  const handleArchiveSeason = async () => {
    if (!showArchiveConfirm) {
      setShowArchiveConfirm(true);
      return;
    }
    setIsSaving(true);
    setShowArchiveConfirm(false);
    await archiveCurrentSeason();
    setIsSaving(false);
    onShowToast('Season Archived');
  };

  const handlePurgeAll = async () => {
    if (!showPurgeConfirm) {
      setShowPurgeConfirm(true);
      return;
    }
    setIsSaving(true);
    setShowPurgeConfirm(false);
    await deleteAllGatherings();
    setIsSaving(false);
    onShowToast('Hub Purged - Ready for a fresh start!');
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    await updateAppSettings({ sessionTitle });
    setIsUpdatingSettings(false);
    onShowToast('Global Settings Updated');
  };

  const handleSyncWithSchedule = async () => {
    setIsSyncing(true);
    await syncActiveGatheringFromSchedule();
    setIsSyncing(false);
    onShowToast('Sync with Schedule Complete');
  };

  const handleDeleteGathering = async (id: string) => {
    if (deletingId !== id) {
      setDeletingId(id);
      return;
    }
    setIsSaving(true);
    setDeletingId(null);
    try {
      await deleteSpecificGathering(id);
      onShowToast('Meeting deleted.');
    } catch (err) {
      onShowToast('Deletion failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="admin-view" className="p-6 space-y-12">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Hub Control</h1>
        <p className="font-sans text-sm text-forest/60">Professional scheduling & management.</p>
      </header>

      {/* Primary Editor */}
      <div className="space-y-6">
        <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest/40 flex items-center gap-2">
          <Settings size={12} /> Active Gathering Editor
        </h3>
        <form onSubmit={handleUpdateGathering} className="space-y-6 bg-white border border-forest/10 p-8 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-3 p-4 bg-forest/5 rounded-2xl border border-forest/5">
            <input 
              type="checkbox" 
              id="start-new"
              checked={startNew}
              onChange={(e) => {
                setStartNew(e.target.checked);
                setShowConfirm(false);
              }}
              className="w-5 h-5 accent-forest rounded border-forest/20 cursor-pointer"
            />
            <label htmlFor="start-new" className="font-sans text-xs font-bold uppercase tracking-widest text-forest select-none cursor-pointer">
              Start New Gathering
            </label>
          </div>

          <AnimatePresence>
            {showConfirm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle size={16} />
                    <p className="font-sans text-[10px] font-bold uppercase tracking-widest">Warning</p>
                  </div>
                  <p className="font-serif italic text-sm">
                    {startNew ? "This will archive current meetings and start a new record." : "Theme changes will reset unclaimed gathering items."}
                  </p>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-2 bg-amber-600 text-white rounded-lg font-sans text-[10px] font-bold uppercase tracking-widest uppercase">Confirm</button>
                    <button type="button" onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-white border border-amber-200 text-amber-800 rounded-lg font-sans text-[10px] font-bold uppercase tracking-widest">Abort</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">Theme</label>
              <input type="text" value={theme} onChange={(e) => { setTheme(e.target.value); setShowConfirm(false); }} className="w-full bg-forest/5 border border-forest/10 p-4 rounded-xl font-serif text-lg focus:outline-none focus:ring-2 focus:ring-forest/20" placeholder="e.g. Taco Night" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">Date & Time</label>
              <input 
                type="datetime-local" 
                value={getLocalDatetimeValue(date)} 
                onChange={(e) => {
                  const localVal = e.target.value; // YYYY-MM-DDTHH:mm
                  if (localVal) {
                    const [yyyy, mm, dd, hh, mins] = localVal.split(/[-T:]/).map(Number);
                    const d = new Date(yyyy, mm - 1, dd, hh, mins);
                    setDate(d.toISOString());
                  } else {
                    setDate('');
                  }
                }} 
                className="w-full bg-forest/5 border border-forest/10 p-4 rounded-xl font-serif text-lg focus:outline-none focus:ring-2 focus:ring-forest/20" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">Host / Location</label>
              <select 
                value={locationName}
                onChange={(e) => {
                  const loc = addresses.find(l => l.name === e.target.value);
                  setLocationName(e.target.value);
                  if (loc) setLocationAddress(loc.address);
                }}
                className="w-full bg-forest/5 border border-forest/10 p-4 rounded-xl font-serif text-lg focus:outline-none focus:ring-2 focus:ring-forest/20"
              >
                <option value="">Select Host...</option>
                {addresses.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
              </select>
            </div>
            {locationName && !addresses.find(a => a.name === locationName) && (
              <div className="space-y-1">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">Stored Address</label>
                <input type="text" readOnly value={locationAddress} className="w-full bg-forest/[0.02] border border-forest/10 p-4 rounded-xl font-serif text-sm text-forest/40" />
              </div>
            )}
          </div>

          <motion.button 
            type="submit" 
            disabled={isSaving || isSaved} 
            animate={isSaved ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            className={`w-full py-4 rounded-xl font-sans font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isSaved ? 'bg-green-600 text-white shadow-lg' : 'bg-forest text-parchment shadow-lg'}`}
          >
            {isSaving && <Loader2 className="animate-spin" size={18} />}
            {isSaving ? 'Processing...' : isSaved ? 'SUCCESS' : 'Save Changes'}
          </motion.button>
        </form>
      </div>

      {/* Bulk Scheduler */}
      <div className="space-y-6">
        <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest/40 flex items-center gap-2">
          <Calendar size={12} /> Bulk Schedule Creator
        </h3>
        <div className="bg-white border border-forest/10 p-8 rounded-[2rem] shadow-sm space-y-6">
          <AnimatePresence>
            {showScheduleConfirm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="bg-forest/5 border border-forest/10 p-6 rounded-2xl space-y-4 mb-4">
                  <div className="flex items-center gap-2 text-forest">
                    <Calendar size={16} />
                    <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest">Schedule Preview</p>
                  </div>
                  <p className="font-serif italic text-sm text-forest/80">
                    This will create a series of weekly gatherings from {new Date(bulkStart).toLocaleDateString()} to {new Date(bulkEnd).toLocaleDateString()} at {bulkTime}.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateSchedule}
                      className="flex-1 py-2 bg-forest text-parchment rounded-lg font-sans text-[10px] font-bold uppercase tracking-widest"
                    >
                      Confirm Schedule
                    </button>
                    <button 
                      onClick={() => setShowScheduleConfirm(false)}
                      className="px-4 py-2 bg-white border border-forest/20 text-forest rounded-lg font-sans text-[10px] font-bold uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">Range Start</label>
              <input type="date" value={bulkStart} onChange={(e) => setBulkStart(e.target.value)} className="w-full bg-forest/5 border border-forest/10 p-3 rounded-xl font-sans text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">Range End</label>
              <input type="date" value={bulkEnd} onChange={(e) => setBulkEnd(e.target.value)} className="w-full bg-forest/5 border border-forest/10 p-3 rounded-xl font-sans text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">Day of Week</label>
              <select value={bulkDay} onChange={(e) => setBulkDay(Number(e.target.value))} className="w-full bg-forest/5 border border-forest/10 p-3 rounded-xl font-sans text-sm">
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">Default Time</label>
              <input type="time" value={bulkTime} onChange={(e) => setBulkTime(e.target.value)} className="w-full bg-forest/5 border border-forest/10 p-3 rounded-xl font-sans text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">Session Label</label>
              <input type="text" value={bulkSession} onChange={(e) => setBulkSession(e.target.value)} className="w-full bg-forest/5 border border-forest/10 p-3 rounded-xl font-sans text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">Host</label>
              <select 
                value={bulkLocationName}
                onChange={(e) => {
                  const loc = addresses.find(l => l.name === e.target.value);
                  setBulkLocationName(e.target.value);
                  if (loc) setBulkLocationAddress(loc.address);
                }}
                className="w-full bg-forest/5 border border-forest/10 p-3 rounded-xl font-sans text-sm outline-none focus:ring-2 focus:ring-forest/20"
              >
                <option value="">Select Host...</option>
                {addresses.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <button 
            disabled={bulkActive}
            onClick={handleGenerateSchedule}
            className="w-full py-3 bg-forest text-parchment rounded-xl font-sans font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {bulkActive ? 'Generating...' : 'Generate Weekly Schedule'}
          </button>
        </div>
      </div>

      {/* Address Library Management */}
      <div className="space-y-6">
        <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest/40 flex items-center gap-2">
          <BookOpen size={12} /> Host Address Manager
        </h3>
        <div className="bg-white border border-forest/10 p-8 rounded-[2rem] shadow-sm space-y-8">
          <div className="grid grid-cols-1 gap-3">
            {addresses.map(addr => (
              <div key={addr.id} className="flex items-center justify-between p-5 bg-forest/[0.02] border border-forest/10 rounded-3xl group hover:bg-white hover:border-forest/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-forest/5 flex items-center justify-center text-forest/20">
                    <MapPin size={18} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-serif font-medium text-lg text-forest">{addr.name}</span>
                    <span className="font-sans text-[10px] text-forest/40 uppercase tracking-widest">{addr.address}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (deletingAddrId === addr.id) {
                      deleteAddress(addr.id);
                      setDeletingAddrId(null);
                      onShowToast('Address Removed');
                    } else {
                      setDeletingAddrId(addr.id);
                    }
                  }}
                  className={`p-2 transition-all rounded-xl flex items-center gap-2 ${
                    deletingAddrId === addr.id 
                      ? "bg-red-600 text-white px-4 py-2 sm:opacity-100 shadow-md animate-pulse" 
                      : "text-red-400 hover:text-red-600 sm:opacity-0 group-hover:opacity-100 hover:bg-red-50"
                  }`}
                >
                  {deletingAddrId === addr.id ? (
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest whitespace-nowrap">CONFIRM?</span>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            ))}
            {addresses.length === 0 && (
              <div className="text-center py-12 px-6 border-2 border-dashed border-forest/10 rounded-[2rem]">
                <p className="italic font-serif text-forest/30">Your address library is empty.</p>
              </div>
            )}
          </div>
          
          <div className="pt-8 border-t border-forest/5 space-y-6">
            <div className="flex flex-col gap-1">
              <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest">Add Private Host</p>
              <p className="font-serif italic text-xs text-forest/40 text-left">Saved addresses will appear in the gathering editor dropdown.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">Host Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. The Gaw House"
                  value={newAddrName}
                  onChange={(e) => setNewAddrName(e.target.value)}
                  className="w-full bg-forest/5 border border-forest/10 p-4 rounded-xl font-serif text-sm outline-none focus:ring-2 focus:ring-forest/20 transition-all px-6"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">Full Address</label>
                <input 
                  type="text" 
                  placeholder="Street, City, State, Zip"
                  value={newAddrVal}
                  onChange={(e) => setNewAddrVal(e.target.value)}
                  className="w-full bg-forest/5 border border-forest/10 p-4 rounded-xl font-serif text-sm outline-none focus:ring-2 focus:ring-forest/20 transition-all px-6"
                />
              </div>
            </div>
            <button 
              id="add-addr-btn"
              onClick={async () => {
                if (!newAddrName || !newAddrVal) return;
                setIsAddingAddr(true);
                await addAddress(newAddrName, newAddrVal);
                setNewAddrName('');
                setNewAddrVal('');
                setIsAddingAddr(false);
                onShowToast('Address Registered');
              }}
              disabled={isAddingAddr || !newAddrName || !newAddrVal}
              className="w-full py-4 bg-forest text-parchment rounded-xl font-sans font-bold uppercase tracking-widest text-[11px] shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 hover:bg-forest/90"
            >
              {isAddingAddr ? 'Registering...' : 'Register Host Address'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Resource Library Manager */}
      <div className="space-y-6">
        <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest/40 flex items-center gap-2">
          <BookOpen size={12} /> Resource Library Manager
        </h3>
        <div className="bg-white border border-forest/10 p-8 rounded-[2rem] shadow-sm space-y-10">
          {/* Library List */}
          <div className="grid grid-cols-1 gap-3">
            {lessons.map(lesson => (
              <div key={lesson.id} className="flex items-center justify-between p-5 bg-forest/[0.02] border border-forest/10 rounded-3xl group hover:bg-white hover:border-forest/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-forest/5 flex items-center justify-center text-forest/20">
                    <Book size={18} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-serif font-medium text-lg text-forest">{lesson.title}</span>
                    <span className="font-sans text-[10px] text-forest/40 uppercase tracking-widest">{lesson.date}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (deletingLessonId === lesson.id) {
                      deleteLesson(lesson.id);
                      setDeletingLessonId(null);
                      onShowToast('Lesson Removed');
                    } else {
                      setDeletingLessonId(lesson.id);
                    }
                  }}
                  className={`p-2 transition-all rounded-xl flex items-center gap-2 ${
                    deletingLessonId === lesson.id 
                      ? "bg-red-600 text-white px-4 py-2 shadow-md animate-pulse" 
                      : "text-red-400 hover:text-red-600 sm:opacity-0 group-hover:opacity-100 hover:bg-red-50"
                  }`}
                >
                  {deletingLessonId === lesson.id ? (
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest whitespace-nowrap">CONFIRM?</span>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            ))}
            {lessons.length === 0 && (
              <div className="text-center py-12 px-6 border-2 border-dashed border-forest/10 rounded-[2rem]">
                <p className="italic font-serif text-forest/30">Library is empty.</p>
              </div>
            )}
          </div>

          {/* Bulk Import Section */}
          <div className="pt-8 border-t border-forest/5 space-y-6">
            <div className="flex flex-col gap-1">
              <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest">Bulk Markdown Import</p>
              <p className="font-serif italic text-xs text-forest/40 text-left">Paste your full study document here. We'll split it by ## Date headers.</p>
            </div>
            <textarea 
              placeholder="## April 22&#10;### Title: Wisdom&#10;**Scripture:** Proverbs 1:1-7..."
              value={bulkMarkdown}
              onChange={(e) => setBulkMarkdown(e.target.value)}
              rows={8}
              className="w-full bg-forest/5 border border-forest/10 p-4 rounded-xl font-mono text-sm px-6 resize-none focus:ring-2 focus:ring-forest/20 outline-none transition-all"
            />
            <div className="flex gap-2">
              <button 
                onClick={handleParseBulk}
                className="flex-1 py-3 bg-sage-100 text-forest border border-forest/10 rounded-xl font-sans text-[10px] font-bold uppercase tracking-widest hover:bg-sage-200 transition-all"
              >
                Process & Preview
              </button>
            </div>

            <AnimatePresence>
              {parsedLessons.length > 0 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-forest/5 rounded-2xl border border-forest/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-forest">
                        <Check size={16} />
                        <p className="font-sans text-[10px] font-bold uppercase tracking-widest">Bulk Sync Preview</p>
                      </div>
                      <span className="bg-forest text-parchment px-3 py-1 rounded-full text-[10px] font-bold">{parsedLessons.length} Lessons Found</span>
                    </div>
                    
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {parsedLessons.map((p, i) => (
                        <div key={i} className="flex justify-between items-center text-[11px] font-serif italic text-forest/60 border-b border-forest/5 pb-1">
                          <span>{p.title}</span>
                          <span>{p.date}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={handleSeedLibrary}
                      disabled={isSeeding}
                      className="w-full py-4 bg-forest text-parchment rounded-xl font-sans font-bold uppercase tracking-widest text-[11px] shadow-lg flex items-center justify-center gap-2"
                    >
                      {isSeeding ? <Loader2 className="animate-spin" size={14} /> : <BookOpen size={14} />}
                      {isSeeding ? 'Seeding...' : 'Confirm & Seed Library'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Individual Add Section */}
          <div className="pt-8 border-t border-forest/5 space-y-6">
            <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest">Manual Lesson Entry</p>
            <div className="grid grid-cols-1 gap-4">
              <input 
                type="text" 
                placeholder="Lesson Title"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                className="w-full bg-forest/5 border border-forest/10 p-4 rounded-xl font-serif text-sm px-6"
              />
              <input 
                type="text" 
                placeholder="Subtitle / Summary"
                value={newLessonSubtitle}
                onChange={(e) => setNewLessonSubtitle(e.target.value)}
                className="w-full bg-forest/5 border border-forest/10 p-4 rounded-xl font-serif text-sm px-6"
              />
              <input 
                type="date" 
                value={newLessonDate}
                onChange={(e) => setNewLessonDate(e.target.value)}
                className="w-full bg-forest/5 border border-forest/10 p-4 rounded-xl font-sans text-sm px-6"
              />
              <textarea 
                placeholder="Study Content (Markdown supported)"
                value={newLessonContent}
                onChange={(e) => setNewLessonContent(e.target.value)}
                rows={4}
                className="w-full bg-forest/5 border border-forest/10 p-4 rounded-xl font-serif text-sm px-6 resize-none"
              />
              <textarea 
                placeholder="Discussion Questions (One per line)"
                value={newLessonQuestions}
                onChange={(e) => setNewLessonQuestions(e.target.value)}
                rows={3}
                className="w-full bg-forest/5 border border-forest/10 p-4 rounded-xl font-serif text-sm px-6 resize-none"
              />
            </div>
            <button 
              onClick={async () => {
                if (!newLessonTitle || !newLessonDate || !newLessonContent) return;
                setIsAddingLesson(true);
                await createLesson({
                  title: newLessonTitle,
                  subtitle: newLessonSubtitle,
                  date: newLessonDate,
                  content: newLessonContent,
                  questions: newLessonQuestions.split('\n').filter(q => q.trim())
                });
                setNewLessonTitle('');
                setNewLessonSubtitle('');
                setNewLessonDate('');
                setNewLessonContent('');
                setNewLessonQuestions('');
                setIsAddingLesson(false);
                onShowToast('Study Guide Added');
              }}
              disabled={isAddingLesson || !newLessonTitle || !newLessonDate || !newLessonContent}
              className="w-full py-4 bg-forest text-parchment rounded-xl font-sans font-bold uppercase tracking-widest text-[11px] shadow-lg disabled:opacity-50"
            >
              {isAddingLesson ? 'Creating...' : 'Deploy Study Guide'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Global Settings Hub */}
      <div className="space-y-6">
        <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest/40 flex items-center gap-2">
          <Settings size={12} /> Global Settings Hub
        </h3>
        <div className="bg-white border border-forest/10 p-8 rounded-[2rem] shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">Current Session Title</label>
              <input 
                type="text" 
                placeholder="e.g. Spring Session – The Discipline of Discernment"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full bg-forest/5 border border-forest/10 p-4 rounded-xl font-serif text-sm outline-none focus:ring-2 focus:ring-forest/20 transition-all px-6 text-forest"
              />
            </div>
            <button 
              onClick={handleUpdateSettings}
              disabled={isUpdatingSettings || !sessionTitle.trim()}
              className="w-full py-4 bg-forest text-parchment rounded-xl font-sans font-bold uppercase tracking-widest text-[11px] shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 hover:bg-forest/90 flex items-center justify-center gap-2"
            >
              {isUpdatingSettings && <Loader2 className="animate-spin" size={14} />}
              Update Hub Subheading
            </button>
          </div>

          <div className="pt-6 border-t border-forest/5 space-y-4">
            <div className="flex flex-col gap-1">
              <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest">Smart Sync</p>
              <p className="font-serif italic text-xs text-forest/40 text-left">Align active gathering with the closest upcoming Wednesday in your schedule.</p>
            </div>
            <button 
              onClick={handleSyncWithSchedule}
              disabled={isSyncing}
              className="w-full py-4 bg-sage-300 text-forest rounded-xl font-sans font-bold uppercase tracking-widest text-[11px] shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 hover:bg-sage-200 flex items-center justify-center gap-2"
            >
              {isSyncing ? <Loader2 className="animate-spin" size={14} /> : <Calendar size={14} />}
              {isSyncing ? 'Syncing...' : 'Sync with Schedule'}
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance */}
      <div className="space-y-4">
        <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest/40">Maintenance Tools</h3>
        
        <AnimatePresence>
          {showArchiveConfirm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl space-y-4 mb-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle size={16} />
                  <p className="font-sans text-[10px] font-bold uppercase tracking-widest">Archive Season</p>
                </div>
                <p className="font-serif italic text-sm text-amber-900">Are you sure you want to archive all currently active meetings? They will remain in history but disappear from the current view.</p>
                <div className="flex gap-2">
                  <button 
                    onClick={handleArchiveSeason} 
                    disabled={isSaving}
                    className="flex-1 py-2 bg-amber-600 text-white rounded-lg font-sans text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {isSaving && <Loader2 className="animate-spin" size={14} />}
                    Confirm Archive
                  </button>
                  <button onClick={() => setShowArchiveConfirm(false)} className="px-4 py-2 bg-white border border-amber-200 text-amber-800 rounded-lg font-sans text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}

          {showPurgeConfirm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="bg-red-50 border border-red-200 p-6 rounded-2xl space-y-4 mb-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle size={16} />
                  <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-red-600">Total Purge</p>
                </div>
                <p className="font-serif italic text-sm text-red-900">CRITICAL: This will permanently delete ALL meetings and ALL gathering items. This cannot be undone.</p>
                <div className="flex gap-2">
                  <button 
                    onClick={handlePurgeAll} 
                    disabled={isSaving}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg font-sans text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {isSaving && <Loader2 className="animate-spin" size={14} />}
                    Purge Database
                  </button>
                  <button onClick={() => setShowPurgeConfirm(false)} className="px-4 py-2 bg-white border border-red-200 text-red-800 rounded-lg font-sans text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-4">
          <button onClick={() => setShowArchiveConfirm(true)} className="flex-1 py-3 bg-amber-600/10 text-amber-800 border border-amber-600/20 rounded-xl font-sans text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600/20 transition-all min-w-[140px]">Archive Season</button>
          <button onClick={() => setShowPurgeConfirm(true)} className="flex-1 py-3 bg-red-600/10 text-red-800 border border-red-600/20 rounded-xl font-sans text-[10px] font-bold uppercase tracking-widest hover:bg-red-600/20 transition-all min-w-[140px]">Purge All</button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-6 pb-12">
        <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest/40">Scheduled Meetings</h3>
        <div className="space-y-3">
          {upcoming.map((g) => (
            <div key={g.id} className="bg-white border border-forest/5 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <p className="font-serif font-medium">{g.theme || 'Theme TBD'}</p>
                <div className="flex gap-2 items-center">
                  <p className="font-sans text-[10px] text-forest/60">
                    {new Date(g.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  {lessons.some(l => l.date === g.date.split('T')[0]) && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-forest/5 rounded-full border border-forest/10" title="Study guide available">
                      <BookOpen size={10} className="text-forest/60" />
                      <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-forest/60">Study Ready</span>
                    </div>
                  )}
                  <div className="w-1 h-1 rounded-full bg-forest/20" />
                  <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest">
                    {new Date(g.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditScheduled(g)} 
                  className="p-2 bg-forest/5 hover:bg-forest/10 rounded-xl text-forest/60 transition-colors"
                  title="Edit details"
                >
                  <Settings size={14} />
                </button>
                {deletingId === g.id ? (
                  <button 
                    onClick={() => handleDeleteGathering(g.id)} 
                    className="px-3 py-2 bg-red-600 text-white rounded-xl font-sans text-[10px] font-bold uppercase tracking-widest animate-pulse"
                  >
                    CONFIRM?
                  </button>
                ) : (
                  <button 
                    onClick={() => handleDeleteGathering(g.id)} 
                    className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors"
                    title="Delete meeting"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {upcoming.length === 0 && (
            <div className="p-12 text-center text-forest/30 italic font-serif">No schedule found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

function formatRelativeTime(date: any) {
  if (!date) return '';
  const now = new Date();
  const then = (date && typeof date.toDate === 'function') ? date.toDate() : new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

const LoungeView = ({ 
  messages, 
  onSendMessage, 
  user, 
  activeLesson 
}: { 
  messages: LoungeMessage[]; 
  onSendMessage: (text: string) => void; 
  user: AppUser | null; 
  activeLesson: Lesson | null 
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div id="lounge-view" className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif font-medium text-forest tracking-tight">The Lounge</h1>
        <p className="font-serif italic text-forest/40">Mid-week encouragement and community connection.</p>
      </header>

      {/* Featured Takeaway */}
      {activeLesson && (
        <div className="bg-[#1B263B] text-parchment p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen size={80} />
          </div>
          <div className="relative z-10 space-y-5 text-center">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-sage-300">This Week's Takeaway</p>
            <h2 className="text-2xl font-serif leading-tight italic">
              {activeLesson.subtitle.split(' – ')[1] || activeLesson.title}
            </h2>
            <div className="h-px bg-white/20 w-12 mx-auto" />
            <div className="font-serif text-sm opacity-80 leading-relaxed italic max-w-sm mx-auto line-clamp-3">
              <ReactMarkdown>
                {activeLesson.content.split('\n\n')[1] || activeLesson.content.substring(0, 150) + "..."}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Message Board */}
      <div className="bg-white border border-forest/10 rounded-[3rem] shadow-sm flex flex-col h-[550px] overflow-hidden">
        <div className="px-8 py-6 border-b border-forest/5 flex items-center justify-between bg-forest/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
            <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-forest">Encouragement Board</h3>
          </div>
          <p className="font-serif italic text-[10px] text-forest/40 uppercase tracking-tighter">Live Updates</p>
        </div>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-forest/[0.01]">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <img 
                  src={msg.authorPhotoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.authorName)}&background=random`} 
                  alt={msg.authorName}
                  className="w-10 h-10 rounded-2xl border-2 border-white shadow-sm object-cover flex-shrink-0"
                />
                <div className="space-y-1 pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-sans text-[11px] font-bold text-forest">{msg.authorName}</span>
                    <span className="font-serif italic text-[10px] text-forest/30">{formatRelativeTime(msg.createdAt)}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-forest/5 shadow-sm text-sm font-serif text-forest/80 leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
              <MessageCircle size={40} className="text-forest" />
              <p className="font-serif italic">No notes yet. Be the first to share!</p>
            </div>
          )}
        </div>

        {/* Input Field */}
        <div className="p-6 bg-white border-t border-forest/10">
          {user ? (
            <form onSubmit={handleSubmit} className="relative">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Share a word of encouragement..."
                className="w-full bg-forest/5 border border-forest/10 rounded-2xl py-4 pl-6 pr-14 font-serif text-sm focus:ring-2 focus:ring-forest/20 outline-none transition-all placeholder:text-forest/30"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="absolute right-2 top-2 p-2.5 bg-forest text-parchment rounded-xl hover:opacity-90 disabled:opacity-30 disabled:hover:opacity-30 transition-all shadow-lg flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </form>
          ) : (
            <div className="text-center py-2">
              <p className="font-serif italic text-xs text-forest/40">Please sign in to share a note.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ 
  id, 
  active, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  id: TabType; 
  active: boolean; 
  onClick: (id: TabType) => void; 
  icon: any; 
  label: string 
}) => (
  <button
    id={`nav-item-${id}`}
    onClick={() => onClick(id)}
    className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
      active ? 'text-forest' : 'text-forest/40'
    }`}
  >
    <Icon size={20} className={active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'} />
    <span className={`text-[10px] mt-1 font-sans font-medium uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-60'}`}>
      {label}
    </span>
    {active && (
      <motion.div
        layoutId="active-tab"
        className="w-1 h-1 rounded-full bg-forest mt-0.5"
      />
    )}
  </button>
);

const ViewContainer = ({ activeTab, gathering, addresses, appSettings, lessons, activeLesson }: { activeTab: TabType; gathering: Gathering | null; addresses: AddressEntry[]; appSettings: AppSetting; lessons: Lesson[]; activeLesson: Lesson | null }) => {
  const { user, signInWithGoogle } = useAuth();
  const [gatheringItems, setGatheringItems] = useState<GatheringItem[]>([]);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [suggestion, setSuggestion] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [loungeMessages, setLoungeMessages] = useState<LoungeMessage[]>([]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  useEffect(() => {
    const unsub = subscribeToLoungeMessages(setLoungeMessages);
    return () => unsub();
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!user) return;
    await addLoungeMessage(text, user);
    showToast('Encouragement Shared!');
  };

  useEffect(() => {
    if (activeTab === 'gathering' && gathering) {
      setGatheringItems([]); // Strict reset to prevent old theme data
      const unsub = subscribeToGatheringItems(gathering.id, (items) => {
        setGatheringItems(items);
        if (items.length === 0) {
          initializeGatheringBlueprint(gathering.id, gathering.theme);
        }
      });
      return () => unsub();
    }
  }, [activeTab, gathering?.id]); // Use ID for deep equality check

  const handleClaim = async (itemId: string, itemName: string) => {
    if (!user) return;
    await claimItem(itemId, user);
    showToast(`${itemName} Claimed!`);
  };

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !gathering || !suggestion.trim()) return;
    setIsSuggesting(true);
    await suggestItem(gathering.id, suggestion.trim(), user);
    setSuggestion('');
    setIsSuggesting(false);
    showToast('Item Claimed!');
  };

  const getGreeting = () => {
    return "Good to see you!";
  };

  const content = {
    home: (
      <div id="home-view" className="space-y-12 pb-12 pt-20 md:pt-24 text-center">
        <div className="px-6 space-y-12">
          <header className="space-y-4 flex flex-col items-center text-center">
            <div className="flex flex-col gap-2 items-center">
              <h1 className="text-5xl font-serif font-medium leading-none tracking-tight text-forest">Sun River Church</h1>
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-sage-600 max-w-[280px]">
                Spring Session – The Discipline of Discernment
              </p>
            </div>
            <div className="h-px bg-forest/10 w-16" />
          </header>

          <section className="space-y-8">
            <div className="bg-white border border-forest/5 p-10 rounded-[3rem] space-y-8 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-forest/40">
                  <Calendar size={14} />
                  <span className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold">Upcoming Gathering</span>
                </div>
                <h2 className="text-4xl font-serif font-medium tracking-tight leading-tight text-forest">
                  {gathering ? (gathering.theme || "Theme Coming Soon!") : "Our Next Meeting"}
                </h2>
                <p className="font-serif italic text-lg text-forest/60 leading-relaxed max-w-sm">
                  {gathering?.description && gathering.description !== 'Theme coming soon!' 
                    ? gathering.description 
                    : (gathering?.theme 
                      ? `Join us for a wonderful evening as we enjoy ${gathering.theme} together.` 
                      : "We are a community dedicated to growing together, sharing meals, and supporting one another.")
                  }
                </p>
              </div>

              {gathering && (
                <div className="flex flex-col gap-6 pt-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                    <div className="flex items-center gap-3 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-forest/70 bg-forest/5 px-5 py-3 rounded-2xl w-full sm:w-auto">
                      <Calendar size={16} className="text-forest/30" />
                      {new Date(gathering.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-forest/70 bg-forest/5 px-5 py-3 rounded-2xl w-full sm:w-auto">
                      <LogIn size={16} className="text-forest/30" />
                      {new Date(gathering.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>

                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'gathering' }))}
                    className="flex items-center gap-3 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-forest/70 bg-forest/5 px-5 py-4 rounded-2xl w-full hover:bg-forest/10 transition-all border border-forest/5"
                  >
                    <Utensils size={16} className="text-forest/30" />
                    View Gathering Table
                  </button>

                  {gathering.address && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gathering.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-2 p-6 bg-forest/[0.02] border border-forest/10 rounded-3xl hover:border-forest/30 hover:bg-white transition-all shadow-sm text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-forest/40">
                          <MapPin size={16} />
                          <p className="font-sans text-[10px] font-bold uppercase tracking-widest">Navigation</p>
                        </div>
                        <ExternalLink size={14} className="text-forest/20 group-hover:text-forest transition-colors" />
                      </div>
                      <div className="flex flex-col">
                        <p className="font-serif font-medium text-xl text-forest group-hover:text-forest transition-colors">{gathering.location || 'Meeting Point'}</p>
                        <div className="flex items-center gap-1">
                          <MapPin size={10} className="text-forest/20" />
                          <p className="font-sans text-xs text-forest/40">{gathering.address}</p>
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <div 
                onClick={() => activeTab !== 'study' && window.dispatchEvent(new CustomEvent('changeTab', { detail: 'study' }))}
                style={{ backgroundColor: '#1B263B' }}
                className="group w-full max-w-md aspect-[4/3] rounded-[2.5rem] p-10 flex flex-col justify-between cursor-pointer hover:opacity-95 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BookOpen size={120} />
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white/80 relative z-10">
                  <BookOpen size={24} />
                </div>
                <div className="space-y-3 relative z-10">
                  <span className="text-[10px] font-sans uppercase tracking-[0.3em] font-bold text-white/30">Active Study</span>
                  <div className="space-y-1">
                    <p className="text-[clamp(1.5rem,5vw,2.5rem)] font-serif font-medium text-parchment leading-none transition-colors">
                      {activeLesson ? activeLesson.title : 'Study: The Discipline of Discernment'}
                    </p>
                    {activeLesson?.subtitle ? (
                      <p className="text-sm font-serif italic text-white/50 max-w-xs line-clamp-2 leading-relaxed">
                        {activeLesson.subtitle}
                      </p>
                    ) : (
                      <p className="text-sm font-serif italic text-white/50 max-w-xs line-clamp-2 leading-relaxed">
                        Weekly Discussion Guide
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    ),
    gathering: (
      <div id="gathering-view" className="p-6 space-y-6 relative min-h-[400px]">
        <header className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold">The Gathering Table</h1>
            <p className="font-sans text-sm text-forest/60">
              {gathering ? (gathering.theme ? `Signing up for ${gathering.theme}` : "Theme coming soon!") : "No active gathering found."}
            </p>
          </div>
          {gathering && (
            <div className="flex gap-4 items-center p-4 bg-white/40 border border-forest/5 rounded-2xl">
              <div className="flex items-center gap-2 text-forest/60">
                <Calendar size={14} />
                <p className="font-sans text-[10px] font-bold uppercase tracking-wider">
                  {new Date(gathering.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2 text-forest/60 border-l border-forest/10 pl-4">
                <LogIn size={14} />
                <p className="font-sans text-[10px] font-bold uppercase tracking-wider">
                  {new Date(gathering.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )}
        </header>

        <AnimatePresence>
          {toast.visible && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-0 right-0 z-[70] bg-forest text-parchment px-4 py-2 rounded-full font-sans text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-2"
            >
              <Check size={14} /> {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {!user ? (
          <div className="bg-white/50 border border-forest/5 p-8 rounded-3xl text-center space-y-4">
            <p className="font-sans text-sm opacity-60">Please sign in to join the feast.</p>
            <button
              onClick={signInWithGoogle}
              className="px-6 py-2 bg-forest text-parchment rounded-full text-sm font-sans font-medium"
            >
              Sign In to Sign Up
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleSuggest} className="flex gap-2">
              <input 
                type="text" 
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="What are you bringing to the gathering?"
                className="flex-1 bg-white/40 border border-forest/10 px-4 py-2 rounded-full font-serif text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all"
              />
              <button 
                type="submit"
                disabled={isSuggesting || !suggestion.trim()}
                className="bg-forest text-parchment p-2 rounded-full disabled:opacity-50 transition-all"
              >
                <Plus size={20} />
              </button>
            </form>

            <div className="space-y-3">
              {gatheringItems.length > 0 ? (
                gatheringItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white/40 border border-forest/5 rounded-2xl group hover:bg-white/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.claimedByUid && (
                      <div className="w-8 h-8 rounded-full bg-forest/5 flex-shrink-0 flex items-center justify-center overflow-hidden border border-forest/10">
                        {item.claimedByPhotoURL ? (
                          <img src={item.claimedByPhotoURL} alt={item.claimedByName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-forest text-parchment flex items-center justify-center font-bold text-xs">
                            {item.claimedByName?.[0] || '?'}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <p className="text-lg font-medium leading-tight">{item.name}</p>
                      {item.claimedByUid ? (
                        <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-green-700/60 flex items-center gap-1">
                          <Check size={10} /> Claimed by {item.claimedByName}
                        </p>
                      ) : (
                        <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-forest/30">Available</p>
                      )}
                    </div>
                  </div>
                  
                  {item.claimedByUid ? (
                    item.claimedByUid === user.uid && (
                      <button 
                        onClick={() => unclaimItem(item.id)}
                        className="p-2 text-forest/40 hover:text-red-500 transition-colors"
                        title="Unclaim"
                      >
                        <X size={18} />
                      </button>
                    )
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleClaim(item.id, item.name)}
                      className="px-5 py-2 bg-forest text-parchment rounded-full text-[10px] font-sans font-bold uppercase tracking-widest shadow-md shadow-forest/20 hover:opacity-90 transition-all border border-white/10"
                    >
                      Claim
                    </motion.button>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white/40 border-2 border-dashed border-forest/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                <Soup size={40} className="text-forest/20" />
                <p className="italic text-lg">Setting up the table...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  ),
    study: <StudyView lessons={lessons} />,
    admin: <AdminView gathering={gathering} addresses={addresses} appSettings={appSettings} onShowToast={showToast} lessons={lessons} />,
    connect: <LoungeView messages={loungeMessages} onSendMessage={handleSendMessage} user={user} activeLesson={activeLesson} />,
  };

  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="pb-24 pt-4"
    >
      {content[activeTab]}
    </motion.div>
  );
};

function MainLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [addresses, setAddresses] = useState<AddressEntry[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [appSettings, setAppSettings] = useState<AppSetting>({ sessionTitle: 'Spring Session' });
  const { user, loading, signInWithGoogle, logout, isDatabaseReady, setDatabaseReady } = useAuth();

  useEffect(() => {
    const unsub = subscribeToActiveGathering(setGathering);
    const unsubAddr = subscribeToAddresses(setAddresses);
    const unsubSettings = subscribeToSettings(setAppSettings);
    const unsubLessons = subscribeToLessons((data) => {
      console.log('App received lessons update:', data);
      if (data.length > 0) {
        setLessons(data);
      }
    });
    
    // Smart Sync on Load
    syncActiveGatheringFromSchedule();
    seedInitialAddresses();
    
    const handleTabChange = (e: any) => setActiveTab(e.detail);
    window.addEventListener('changeTab', handleTabChange);
    return () => {
      unsub();
      unsubAddr();
      unsubSettings();
      // unsubLessons?.();
      window.removeEventListener('changeTab', handleTabChange);
    };
  }, []);

  useEffect(() => {
    if (gathering && lessons.length > 0) {
      const gDate = gathering.date.split('T')[0];
      const found = lessons.find(l => l.date === gDate);
      setActiveLesson(found || null);
    } else {
      setActiveLesson(null);
    }
  }, [gathering, lessons]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-forest/20 border-t-forest rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto relative shadow-2xl bg-parchment">
      {/* Top Header */}
      <header className="p-4 flex justify-between items-center bg-parchment/80 backdrop-blur-md sticky top-0 z-50 border-b border-forest/5">
        <div className="flex items-center gap-2">
          <span className="font-serif italic font-bold tracking-tight text-forest/80">Sun River Church</span>
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-sans tracking-tight opacity-70 truncate max-w-[120px]">{user.displayName}</span>
              <button 
                id="sign-out-btn"
                onClick={logout}
                className="p-2 hover:bg-forest/5 rounded-full transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} className="text-forest/60" />
              </button>
            </div>
          ) : (
            <button
              id="google-sign-in-btn"
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-4 py-1.5 bg-forest text-parchment rounded-full text-sm font-sans font-medium hover:opacity-90 transition-opacity"
            >
              <LogIn size={14} />
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Database Ready Alert */}
      <AnimatePresence>
        {isDatabaseReady && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[320px]"
          >
            <div className="bg-forest text-parchment p-4 rounded-2xl shadow-xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-parchment/20 p-2 rounded-full">
                  <Check size={16} />
                </div>
                <div>
                  <p className="font-sans font-bold text-xs uppercase tracking-widest">Success</p>
                  <p className="font-serif italic text-sm">Database Ready</p>
                </div>
              </div>
              <button 
                onClick={() => setDatabaseReady(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait">
          <ViewContainer 
          activeTab={activeTab} 
          gathering={gathering} 
          addresses={addresses} 
          appSettings={appSettings}
          lessons={lessons}
          activeLesson={activeLesson}
        />
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav id="bottom-nav" className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-parchment border-t border-forest/10 px-6 py-2 pb-8 flex justify-around items-center z-50">
        <NavItem id="home" active={activeTab === 'home'} onClick={setActiveTab} icon={Home} label="Home" />
        <NavItem id="gathering" active={activeTab === 'gathering'} onClick={setActiveTab} icon={Utensils} label="The Table" />
        <NavItem id="study" active={activeTab === 'study'} onClick={setActiveTab} icon={BookOpen} label="Study" />
        <NavItem id="connect" active={activeTab === 'connect'} onClick={setActiveTab} icon={Users} label="Lounge" />
        {user?.isAdmin && (
          <NavItem id="admin" active={activeTab === 'admin'} onClick={setActiveTab} icon={Settings} label="Admin" />
        )}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}


