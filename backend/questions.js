const QUESTIONS_BANK = [
  { 
    question: { en: "What year was the Eiffel Tower built?", ar: "في أي عام تم بناء برج إيفل؟" }, 
    answer: { en: "1889", ar: "1889" }, 
    category: "History" 
  },
  { 
    question: { en: "How many hearts does an octopus have?", ar: "كم قلباً للأخطبوط؟" }, 
    answer: { en: "3", ar: "3" }, 
    category: "Science" 
  },
  { 
    question: { en: "What is the capital city of Australia?", ar: "ما هي عاصمة أستراليا؟" }, 
    answer: { en: "Canberra", ar: "كانبيرا" }, 
    category: "Geography" 
  },
  { 
    question: { en: "How many bones are in the human body?", ar: "كم عدد العظام في جسم الإنسان؟" }, 
    answer: { en: "206", ar: "206" }, 
    category: "Science" 
  },
  { 
    question: { en: "What is the fastest land animal?", ar: "ما هو أسرع حيوان بري؟" }, 
    answer: { en: "Cheetah", ar: "الفهد" }, 
    category: "Animals" 
  },
  { 
    question: { en: "In what year did World War II end?", ar: "في أي عام انتهت الحرب العالمية الثانية؟" }, 
    answer: { en: "1945", ar: "1945" }, 
    category: "History" 
  },
  { 
    question: { en: "What is the smallest planet in our solar system?", ar: "ما هو أصغر كوكب في مجموعتنا الشمسية؟" }, 
    answer: { en: "Mercury", ar: "عطارد" }, 
    category: "Science" 
  },
  { 
    question: { en: "How many teeth does an adult human have?", ar: "كم عدد الأسنان لدى الإنسان البالغ؟" }, 
    answer: { en: "32", ar: "32" }, 
    category: "Science" 
  },
  { 
    question: { en: "What country has the most natural lakes?", ar: "أي دولة لديها أكبر عدد من البحيرات الطبيعية؟" }, 
    answer: { en: "Canada", ar: "كندا" }, 
    category: "Geography" 
  },
  { 
    question: { en: "How long does it take light from the sun to reach Earth (minutes)?", ar: "كم من الوقت يستغرق ضوء الشمس للوصول إلى الأرض (بالدقائق)؟" }, 
    answer: { en: "8", ar: "8" }, 
    category: "Science" 
  },
  { 
    question: { en: "What is the hardest natural substance on Earth?", ar: "ما هي أقسى مادة طبيعية على وجه الأرض؟" }, 
    answer: { en: "Diamond", ar: "الألماس" }, 
    category: "Science" 
  },
  { 
    question: { en: "How many legs does a spider have?", ar: "كم عدداً من الأرجل للعنكبوت؟" }, 
    answer: { en: "8", ar: "8" }, 
    category: "Animals" 
  },
  { 
    question: { en: "What is the largest ocean on Earth?", ar: "ما هو أكبر محيط على وجه الأرض؟" }, 
    answer: { en: "Pacific Ocean", ar: "المحيط الهادئ" }, 
    category: "Geography" 
  },
  { 
    question: { en: "In what year was the first iPhone released?", ar: "في أي عام تم إصدار أول هاتف آيفون؟" }, 
    answer: { en: "2007", ar: "2007" }, 
    category: "Technology" 
  },
  { 
    question: { en: "What is the longest river in the world?", ar: "ما هو أطول نهر في العالم؟" }, 
    answer: { en: "Nile", ar: "النيل" }, 
    category: "Geography" 
  },
  { 
    question: { en: "How many strings does a standard guitar have?", ar: "كم عدد أوتار الغيتار القياسي؟" }, 
    answer: { en: "6", ar: "6" }, 
    category: "Music" 
  },
  { 
    question: { en: "What gas do plants absorb from the atmosphere?", ar: "ما هي الغازات التي تمتصها النباتات من الغلاف الجوي؟" }, 
    answer: { en: "Carbon dioxide", ar: "ثاني أكسيد الكربون" }, 
    category: "Science" 
  },
  { 
    question: { en: "How many continents are there on Earth?", ar: "كم عدد القارات على كوكب الأرض؟" }, 
    answer: { en: "7", ar: "7" }, 
    category: "Geography" 
  },
];

const FUN_PROMPTS = [
  { 
    question: { en: "What do you think aliens would find most confusing about humans?", ar: "ما الذي تعتقد أن الكائنات الفضائية ستجده الأكثر إرباكاً في البشر؟" }, 
    answer: { en: "Funnest wins!", ar: "أكثر إجابة مضحكة تفوز!" }, 
    category: "Fun" 
  },
  { 
    question: { en: "If animals could talk, which would be the rudest?", ar: "إذا استطاعت الحيوانات التحدث، أيها سيكون الأكثر وقاحة؟" }, 
    answer: { en: "Funnest wins!", ar: "أكثر إجابة مضحكة تفوز!" }, 
    category: "Fun" 
  },
  { 
    question: { en: "What would be the worst superpower to have?", ar: "ما هي أسوأ قوة خارقة يمكن أن تمتلكها؟" }, 
    answer: { en: "Funnest wins!", ar: "أكثر إجابة مضحكة تفوز!" }, 
    category: "Fun" 
  },
];

async function getAIQuestion(apiKey) {
  if (!apiKey) return null;
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Generate a unique trivia question. Respond ONLY in JSON format: 
        {
          "question": { "en": "English question", "ar": "Arabic translation" },
          "answer": { "en": "English answer", "ar": "Arabic translation" },
          "category": "..."
        }. 
        Make it interesting and not too obvious.`
      }]
    });
    const text = response.content[0].text.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.log('AI question failed, using bank:', e.message);
    return null;
  }
}

function getRandomQuestions(count = 5) {
  const shuffled = [...QUESTIONS_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

module.exports = { getAIQuestion, getRandomQuestions, shuffleArray };
