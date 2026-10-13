/**
 * MeaBit AI service (simulated).
 *
 * The intent-matcher below returns pre-written bilingual answers so the demo
 * feels real without calling a paid API. Replace `ask()` with a call to an
 * LLM endpoint (passing language + wallet context) later — the UI contract
 * does not change.
 */
import type { Language } from '../types';

export interface AiAnswer {
  text: string;
  /** True when the assistant is confident the question was understood. */
  matched: boolean;
}

interface Intent {
  keywords: string[];
  en: string;
  sw: string;
}

const INTENTS: Intent[] = [
  {
    keywords: [
      'what is bitcoin',
      'bitcoin ni',
      'about bitcoin',
      'eleza bitcoin',
      'sfb',
      'maana ya bitcoin',
      'man ya bitcoin',
      'maana ya btc',
      'bitcoin nini',
      'meaning of bitcoin',
      'kuhusu bitcoin',
      'bitcoin ni nini',
      'maana yake',
    ],
    en: 'Bitcoin is digital money that operates without banks or middlemen. It lets anyone send and receive value anywhere in the world instantly and securely using the internet. With MeaBit, you hold Bitcoin and can spend or view it in local currency, with zero complex math required.',
    sw: 'Bitcoin ni pesa ya kidijitali inayofanya kazi bila benki au mtu wa kati. Inawezesha mtu yeyote kutuma na kupokea pesa popote duniani kwa haraka, salama na kwa gharama ndogo sana. Kwenye pochi yako ya MeaBit, unamiliki Bitcoin na unaweza kuitumia au kuitazama kwa Shilingi kwa urahisi kabisa.',
  },
  {
    keywords: ['what is lightning', 'lightning ni', 'lightning network', 'tofauti gani'],
    en: 'The Lightning Network is a layer built on top of Bitcoin for instant, low-fee payments. MeaBit uses Lightning for everyday payments — buying lunch, paying a fare, sending money to family — while on-chain Bitcoin is used for larger savings. In your wallet the two are separate balances: Lightning Balance and Bitcoin Balance.',
    sw: 'Lightning Network ni tabaka lililojengwa juu ya Bitcoin kwa ajili ya malipo ya papo hapo na ada ndogo. MeaBit inatumia Lightning kwa malipo ya kila siku — kununua chakula, kulipa nauli, kutuma pesa kwa familia — wakati Bitcoin on-chain inatumika kwa akiba kubwa. Kwenye pochi yako mizani ni tofauti: Salio la Lightning na Salio la Bitcoin.',
  },
  {
    keywords: ['pending', 'inasubiri', 'why is my transaction', 'delay'],
    en: 'A pending status usually means the Bitcoin network has not confirmed your transaction yet. Lightning payments confirm instantly, so a pending item is almost always an on-chain transaction. On-chain transactions need miners to include them in a block — typically 10 to 30 minutes with the Standard fee. Open Transactions to watch confirmations grow, and MeaBit will notify you the moment it completes.',
    sw: 'Hali ya "inasubiri" kwa kawaida inamaanisha mtandao wa Bitcoin bado haujathibitisha miamala yako. Malipo ya Lightning huthibitishwa papo hapo, hivyo kiasi kinachosubiri karibu ni cha on-chain. Miamala ya on-chain inahitaji wachimbaji kuiweka kwenye block — kwa kawaida dakika 10 hadi 30 kwa ada ya Standard. Fungua Miamala kuona uthibitisho ukiongezeka, na MeaBit itakuarifa mara inapokamilika.',
  },
  {
    keywords: ['on-chain', 'onchain', 'blockchain transaction', 'kwenye blockchain'],
    en: 'An on-chain transaction is recorded directly on the Bitcoin blockchain — the global, public ledger. It is the most secure way to move Bitcoin and is best for larger amounts or savings. On-chain transfers pay a network fee and wait for confirmations (each block, roughly every 10 minutes). MeaBit always labels these clearly as Bitcoin On-chain so you never confuse them with instant Lightning payments.',
    sw: 'Miamala ya on-chain hurekodiwa moja kwa moja kwenye blockchain ya Bitcoin — leja ya umma ya kimataifa. Ni njia salama zaidi ya kuhamisha Bitcoin na ni bora kwa kiasi kikubwa au akiba. Uhamisho wa on-chain hulipa ada ya mtandao na husubiri uthibitisho (kila block, takriban kila dakika 10). MeaBit huainisha vizuri kama Bitcoin On-chain ili usichanganye na malipo ya papo hapo ya Lightning.',
  },
  {
    keywords: ['how do i receive', 'receive bitcoin', 'pokea', 'getting paid'],
    en: 'To receive Bitcoin, open Receive in the menu. You have three options: share your Lightning address (enea@meabit.wallet) for instant payments, share your MeaBit phone number (+255 712 345 678) so other MeaBit users can find you, or share your Bitcoin address (bc1q…) for on-chain transfers. Each option shows a QR code the sender can scan.',
    sw: 'Kupokea Bitcoin, fungua Pokea kwenye menyu. Una chaguo tatu: sambaza anwani yako ya Lightning (enea@meabit.wallet) kwa malipo ya papo hapo, sambaza namba yako ya MeaBit (+255 712 345 678) ili watumiaji wengine wakupate, au sambaza anwani yako ya Bitcoin (bc1q…) kwa uhamisho wa on-chain. Kila chaguo lina msimbo wa QR unaoweza kusomwa na mtumaji.',
  },
  {
    keywords: ['invoice', 'ankara', 'lightning invoice'],
    en: 'A Lightning invoice is a payment request for a specific amount. It contains the amount, a description and an expiry — usually 24 hours. When someone pays your invoice, the money arrives instantly and you get a notification. In MeaBit, generating an invoice is as easy as opening Receive and choosing Lightning.',
    sw: 'Ankara ya Lightning ni ombi la malipo la kiasi maalum. Lina kiasi, maelezo na muda wa kuisha — mara nyingi saa 24. Mtumaji akilipa, pesa inafika papo hapo na unapata arifa. Kwenye MeaBit, kutengeneza ankara ni rahisi kama kufungua Pokea na kuchagua Lightning.',
  },
  {
    keywords: ['send', 'tuma', 'how to send'],
    en: 'To send Bitcoin: open Send, choose Lightning for instant low-fee payments or Bitcoin On-chain for blockchain transfers. Enter a phone number, lightning address, invoice or scan a QR, type the amount in TZS or BTC, review the fee, then confirm. MeaBit resolves phone numbers to the right payment identity automatically.',
    sw: 'Kutuma Bitcoin: fungua Tuma, chagua Lightning kwa malipo ya papo hapo na ada ndogo, au Bitcoin On-chain kwa uhamisho wa blockchain. Weka namba ya simu, anwani ya Lightning, ankara au soma QR, weka kiasi kwa TZS au BTC, kagua ada, kisha thibitisha. MeaBit hutambua namba za simu na kupata kitambulisho sahihi cha malipo kiotomatiki.',
  },
  {
    keywords: ['vikoba', 'kikundi', 'group', 'savings group'],
    en: 'Vikoba are community savings groups — a trusted Tanzanian tradition. On MeaBit, each group has a shared balance, contribution schedule and member list. Contributions are paid with Lightning or Bitcoin, recorded transparently, and visible to everyone in the group. Open Vikoba to see your groups, contribute, or create a new one.',
    sw: 'Vikoba ni vikundi vya kuweka akiba vya jamii — mila ya kuaminika Tanzania. Kwenye MeaBit, kila kikundi kina salio la pamoja, ratiba ya michango na orodha ya wanachama. Michango inalipwa kwa Lightning au Bitcoin, inarekodiwa kwa uwazi na inaonekana na kila mwanachama. Fungua Vikoba kuona vikundi vyako, kuchangia, au kutengeneza kikundi kipya.',
  },
  {
    keywords: ['buy', 'nunua', 'purchase'],
    en: 'To buy Bitcoin, open Buy, enter the amount in TZS, and choose a payment method — mobile payment, bank or other. You will see the estimated BTC, the service fee and the total before you confirm. Note: in this frontend demo no real payment is processed.',
    sw: 'Kununua Bitcoin, fungua Nunua, weka kiasi kwa TZS, uchague njia ya malipo — malipo ya simu, benki au nyingine. Utaona BTC iliyokadiriwa, ada ya huduma na jumla kabla ya kuthibitisha. Kumbuka: kwenye onyesho hili hakuna malipo halisi yanayofanyika.',
  },
  {
    keywords: ['fee', 'ada', 'cost'],
    en: 'MeaBit keeps fees simple: Lightning payments cost a fraction of a cent (about 0.2%, minimum TZS 1). On-chain transactions pay a network fee that varies with Bitcoin network activity — MeaBit shows you the estimate before you confirm, with Slow, Standard and Fast options.',
    sw: 'MeaBit inarahisha ada: malipo ya Lightning gharama yake ni chini ya senti moja (takriban 0.2%, kiwango cha chini TZS 1). Miamala ya on-chain hulipa ada ya mtandao inayobadilika kulingana na shughuli za mtandao wa Bitcoin — MeaBit inaonyesha makadirio kabla ya kuthibitisha, na chaguo za Slow, Standard na Fast.',
  },
  {
    keywords: ['safe', 'security', 'usalama', 'scam'],
    en: 'Keep your wallet safe with these habits: never share your PIN, password or recovery phrase; only scan QR codes from people you trust; double-check the first and last characters of on-chain addresses; and enable a transaction PIN in Settings → Security. MeaBit staff will never ask for your PIN or recovery phrase.',
    sw: 'Linda pochi yako kwa tabia hizi: usiwahi kushiriki PIN, neno la siri au maneno ya urejesho; soma misimbo ya QR kutoka kwa watu unaoaamini; angalia tena herufi za mwanzo na mwisho za anwani za on-chain; na wezesha PIN ya miamala kwenye Mipangilio → Usalama. Wafanyakazi wa MeaBit hawaombi PIN au maneno ya urejesho.',
  },
];

const FALLBACK: Record<Language, string> = {
  en: "I am still learning! I can answer questions about Bitcoin, Lightning, sending and receiving, fees, Vikoba, and wallet security. Try one of the suggested questions below, or ask me in English or Kiswahili — for example: \"What is Lightning?\" or \"Bitcoin na Lightning vina tofauti gani?\"",
  sw: "Bado najifunza! Naweza kujibu maswali kuhusu Bitcoin, Lightning, kutuma na kupokea, ada, Vikoba na usalama wa pochi. Jaribu maswali yanopendekezwa hapa chini, au niulize kwa Kiswahili au Kiingereza — mfano: \"Bitcoin ni nini?\" au \"Nawezaje kupokea Bitcoin?\"",
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[?!.,"']/g, ' ').replace(/\s+/g, ' ').trim();
}

export const aiService = {
  /**
   * Simulated AI call. Swap with a real LLM API later:
   * `POST /ai/ask { question, language, walletContext }`.
   */
  async ask(question: string, language: Language): Promise<AiAnswer> {
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 700));
    const q = normalize(question);
    let best: Intent | undefined;
    let bestScore = 0;
    for (const intent of INTENTS) {
      const score = intent.keywords.reduce((acc, kw) => (q.includes(kw) ? acc + kw.length : acc), 0);
      if (score > bestScore) {
        bestScore = score;
        best = intent;
      }
    }
    if (!best) {
      return { text: FALLBACK[language], matched: false };
    }
    return { text: language === 'sw' ? best.sw : best.en, matched: true };
  },

  /** Suggested questions per language, surfaced as chips in the UI. */
  suggestions(language: Language): string[] {
    return language === 'sw'
      ? [
          'Bitcoin ni nini?',
          'Bitcoin na Lightning vina tofauti gani?',
          'Miamala yangu inasubiri kwa nini?',
          'Nawezaje kupokea Bitcoin?',
          'Vikoba vinafanyaje kazi?',
        ]
      : [
          'What is Bitcoin?',
          'What is Lightning?',
          'Why is my transaction pending?',
          'How do I receive Bitcoin?',
          'What is a Lightning invoice?',
        ];
  },
};
