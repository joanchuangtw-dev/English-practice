import { Scenario } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'coffee_shop',
    title: '點咖啡 (Ordering Coffee)',
    description: '你在一間忙碌的紐約咖啡廳。練習點餐、詢問推薦以及處理訂單錯誤。',
    emoji: '☕',
    difficulty: 'Beginner',
    systemInstruction: `You are a friendly but busy barista at a popular coffee shop in New York City. 
    The user is a customer. Your goal is to take their order, ask about sizes (Tall, Grande, Venti), milk preferences, or if they want food. 
    Keep your responses concise and conversational. Speak clearly. 
    Correct the user gently if they make major grammar mistakes, but prioritize flow.`,
  },
  {
    id: 'job_interview',
    title: '工作面試 (Job Interview)',
    description: '你是面試官，正在面試一位軟體工程師候選人。練習自我介紹與回答常見問題。',
    emoji: '👔',
    difficulty: 'Advanced',
    systemInstruction: `You are a professional hiring manager for a tech company. You are interviewing the user for a software engineering role. 
    Ask standard interview questions (e.g., "Tell me about yourself", "What is your greatest strength?", "Why do you want to work here?"). 
    Listen to their answers and ask follow-up questions. Be polite but professional.`,
  },
  {
    id: 'airport_customs',
    title: '機場海關 (Immigration)',
    description: '你剛抵達倫敦希斯洛機場。海關官員會詢問你的旅程目的與停留時間。',
    emoji: '✈️',
    difficulty: 'Intermediate',
    systemInstruction: `You are a stern but fair immigration officer at London Heathrow Airport. 
    The user is a traveler arriving at the border. Ask them for their passport, the purpose of their visit, how long they are staying, and where they will be staying. 
    If their answers are vague, ask for clarification.`,
  },
  {
    id: 'casual_chat',
    title: '閒聊 (Small Talk)',
    description: '你的鄰居在電梯裡遇到你。練習輕鬆的社交對話、談論天氣或週末計畫。',
    emoji: '👋',
    difficulty: 'Beginner',
    systemInstruction: `You are a friendly neighbor living in the same apartment building. You just bumped into the user in the elevator or lobby. 
    Start a casual conversation about the weather, weekend plans, or a local event. Be warm, encourage the user to speak more, and use natural idioms.`,
  }
];