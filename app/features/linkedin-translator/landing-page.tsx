/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  ChevronDown, 
  ArrowRight, 
  Zap, 
  Shield, 
  Eye, 
  MessageSquare, 
  Settings2, 
  FileText,
  Check,
  Menu,
  X,
  Languages,
  ArrowRightLeft,
  Sliders,
  Cpu,
  Wand2,
  RefreshCcw,
  Clock,
  TrendingUp,
  Target,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { GoogleOAuth } from "~/features/oauth/google";
import { useUser } from "~/store";

import { TranslationInterface } from './translation-interface';
import {
  LINKEDIN_TRANSLATOR_PRICING_CARDS,
  LINKEDIN_TRANSLATOR_PRO_PACK,
  LINKEDIN_TRANSLATOR_SUPPORT_EMAIL,
} from "./pricing";

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'jp', name: 'Japanese' },
];

const COMPARISONS = [
  {
    friction: "Traffic was bad",
    pivot: "Thank you for your patience as I navigated unforeseen logistical constraints..."
  },
  {
    friction: "I'm not doing that",
    pivot: "This task might be better aligned with our specialized operations team to ensure maximum efficiency..."
  },
  {
    friction: "This is a stupid idea",
    pivot: "I have some concerns about the current alignment of this strategy with our long-term goals."
  },
  {
    friction: "Stop micromanaging me",
    pivot: "I believe I can take full ownership of this workflow to streamline our delivery process."
  }
];

const FAQS = [
  {
    question: "Is the LinkedIn Translator free to use?",
    answer: "Yes. Free usage now requires sign-in. New accounts get <strong>5 starter credits</strong>, and signed-in users receive <strong>5 free translations per day</strong> before paid credits are needed."
  },
  {
    question: "How are credits billed?",
    answer: "Each successful paid translation deducts exactly <strong>1 credit</strong> from your balance, making usage simple and predictable."
  },
  {
    question: "What happens when credits run out?",
    answer: "When your paid balance hits zero, <strong>Extreme</strong> locks again automatically. Signed-in users can still use their <strong>5 free daily translations</strong> for quick checks."
  },
  {
    question: "Do you offer refunds or team plans?",
    answer: "Refund handling follows our posted <strong>Refund Policy</strong>. We now offer a self-serve <strong>500-credit Team pack</strong>, and if you need custom volume or rollout support you can still contact us at <strong>support@linkedintranslator.online</strong>."
  }
];

interface LazyGoogleOAuthProps {
  className?: string;
}

function LazyGoogleOAuth({ className }: LazyGoogleOAuthProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  if (shouldLoad) {
    return <GoogleOAuth />;
  }

  return (
    <button
      type="button"
      className={`btn btn-primary ${className ?? ""}`.trim()}
      onClick={() => setShouldLoad(true)}
    >
      Sign In
    </button>
  );
}

export default function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [checkouting, setCheckouting] = useState(false);
  const [pricingMessage, setPricingMessage] = useState("");
  const user = useUser((state) => state.user);
  const credits = useUser((state) => state.credits);

  const handleCheckout = async (productId: string) => {
    setPricingMessage("");
    setCheckouting(true);

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.status === 401) {
        setPricingMessage("Sign in first, then come back here to complete checkout.");
        return;
      }

      if (!response.ok) {
        throw new Error((await response.text()) || "Unable to start checkout.");
      }

      const session = (await response.json()) as { checkout_url?: string };
      if (!session.checkout_url) {
        throw new Error("Invalid checkout session.");
      }

      window.location.href = session.checkout_url;
    } catch (error) {
      setPricingMessage(
        error instanceof Error
          ? error.message
          : "Unable to start checkout right now."
      );
    } finally {
      setCheckouting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/logo-64.png"
              alt="LinkedIn Translator logo"
              width={32}
              height={32}
              decoding="async"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="font-display font-bold text-xl text-primary">LinkedIn Translator</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {['About', 'How it Works', 'Why Us', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                {item}
              </a>
            ))}
          </div>

          {user ? (
            <a
              href="/base/credits"
              className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
            >
              Credits: {credits}
            </a>
          ) : (
            <LazyGoogleOAuth className="max-md:btn-sm" />
          )}
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-24 pb-32 px-6 bg-surface">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-secondary-fixed text-primary text-[10px] font-bold tracking-widest uppercase rounded-full mb-6">
              Elevate Your Narrative
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-on-surface mb-8 leading-[1.1]">
              LinkedIn Translator - Translate Profiles, Posts & Messages Instantly
            </h1>
            <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Use a LinkedIn translator to translate profiles, posts, and messages quickly and accurately. Ideal for professionals, recruiters, and global job seekers.
            </p>
          </div>

          {/* Translation Interface */}
          <div>
            <TranslationInterface />
          </div>
        </section>

        {/* What is LinkedIn Translator Section */}
        <section id="about" className="py-32 px-6 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4"
              >
                Definition & Core Values
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-extrabold mb-8"
              >
                What is <span className="text-primary">LinkedIn Translator</span>?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-on-surface-variant max-w-4xl mx-auto leading-relaxed"
              >
                An innovative <strong>AI-powered tool</strong> specifically designed for professionals to instantly transform everyday language, mundane task descriptions, or informal inspirations into highly attractive and etiquette-compliant <strong>professional LinkedIn posts</strong>. Unlike traditional translation software, this <strong>LinkedIn translator</strong> specializes in <strong>Tone Transformation</strong>, reshaping mediocre statements into authoritative narratives infused with a <strong>Growth Mindset</strong> and leadership flair.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Core Value 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white p-8 rounded-2xl ambient-shadow border border-outline-variant hover:border-primary/20 transition-all flex flex-col h-full"
              >
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3">Reimagining Personal Branding</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed flex-grow">
                  By utilizing a precise <strong>LinkedIn speak translator</strong>, you can convert daily "micro-wins" into significant professional milestones that demonstrate your influence and potential as a <strong>Thought Leader</strong>.
                </p>
              </motion.div>

              {/* Core Value 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white p-8 rounded-2xl ambient-shadow border border-outline-variant hover:border-primary/20 transition-all flex flex-col h-full"
              >
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 shrink-0">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3">Eliminating "Buzzword" Anxiety</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed flex-grow">
                  Avoid <strong>overused buzzwords</strong> such as "Strategic" or "Passionate", which recruiters dismiss as subjective "fluff". Instead, use <strong>quantifiable achievements</strong> and evidence-based results to stand out.
                </p>
              </motion.div>

              {/* Core Value 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="bg-white p-8 rounded-2xl ambient-shadow border border-outline-variant hover:border-primary/20 transition-all flex flex-col h-full"
              >
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3">Engagement Optimization</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed flex-grow">
                  The AI automatically integrates compelling <strong>hooks</strong>, strategic line breaks, professional <strong>emojis</strong>, and relevant hashtags. Ensure your content is polished and optimized to capture attention and increase interactions.
                </p>
              </motion.div>

              {/* Core Value 4 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="bg-white p-8 rounded-2xl ambient-shadow border border-outline-variant hover:border-primary/20 transition-all flex flex-col h-full"
              >
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 shrink-0">
                  <Languages className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3">Dual Direction Decoding</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed flex-grow">
                  In addition to generating posts, the tool acts as a <strong>corporate jargon</strong> decoder. Strip away complex "corporate nonsense," translating high-level business speak back into clear, plain English.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-32 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-24">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4"
              >
                Operations & Dual Direction
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-extrabold mb-8"
              >
                How It Works?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed"
              >
                Understanding <strong>how it works</strong> is the first step toward mastering your professional presence. Our <strong>LinkedIn Translator</strong> is designed for simplicity, providing a seamless experience to <strong>translate to LinkedIn speak</strong> or <strong>decode corporate jargon</strong> in seconds.
              </motion.p>
            </div>

            {/* Part 1: Three Simple Steps */}
            <div className="mb-32">
              <div className="text-center mb-16">
                <h3 className="text-3xl font-bold mb-4">1. Three Simple Steps to Transformation</h3>
                <p className="text-on-surface-variant">Mastering your professional narrative has never been easier. Here is <strong>how it works</strong>:</p>
              </div>
              <div className="grid md:grid-cols-3 gap-12">
                {[
                  { icon: FileText, title: "Step 1: Input Your Text", desc: "Paste your raw thoughts, daily \"micro-wins,\" or even a casual \"I finished a project\" into the input box." },
                  { icon: ArrowRightLeft, title: "Step 2: Select Your Mode", desc: "Our tool features a powerful <strong>dual direction</strong> toggle. Choose <strong>Human -> LinkedIn</strong> to <strong>translate to LinkedIn speak</strong> for your next post, or select <strong>LinkedIn -> Human</strong> to perform a <strong>LinkedIn translate to English</strong> conversion." },
                  { icon: Sliders, title: "Step 3: Refine with Intensity Control", desc: "Use our precise <strong>tone adjustment</strong> settings to find your perfect voice. You can choose from <strong>Light</strong> (subtle polish), <strong>Standard</strong> (professional balance), or <strong>Extreme</strong> (full \"hustle culture\" immersion)." }
                ].map((step, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                    className="text-left p-8 rounded-2xl hover:bg-surface-container-low transition-all border border-transparent hover:border-outline-variant"
                  >
                    <div className="w-12 h-12 bg-surface-container-high rounded-xl flex items-center justify-center mb-6">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-xl font-bold mb-4">{step.title}</h4>
                    <p className="text-on-surface-variant leading-relaxed" dangerouslySetInnerHTML={{ __html: step.desc }}></p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Part 2: Dual Direction */}
            <div className="mb-32">
              <div className="text-center mb-16">
                <h3 className="text-3xl font-bold mb-4">2. Dual Direction: Beyond Just Writing</h3>
                <p className="text-on-surface-variant max-w-2xl mx-auto">While most tools only focus on one-way generation, our <strong>LinkedIn Translator</strong> offers a true <strong>dual direction</strong> experience.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-primary/5 p-10 rounded-3xl border border-primary/10 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10"></div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <h4 className="text-2xl font-bold text-primary">Translate to LinkedIn Speak</h4>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed text-lg">
                    Turn mundane activities like "eating a banana" into a "strategic nutritional alignment roadmap" to boost your personal brand.
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-surface-container-high p-10 rounded-3xl border border-outline-variant relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-surface-container-highest rounded-bl-full -z-10"></div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-on-surface text-white rounded-full flex items-center justify-center">
                      <RefreshCcw className="w-5 h-5" />
                    </div>
                    <h4 className="text-2xl font-bold">LinkedIn Translate to English</h4>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed text-lg">
                    Use this mode to <strong>decode corporate jargon</strong>. When a boss mentions "leveraging cross-functional synergies for a paradigm-shifting ROI," our tool helps you <strong>LinkedIn translate to English</strong>, revealing the simple reality behind the fluff. This <strong>tone adjustment</strong> ensures you never get lost in translation during high-stakes meetings.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Part 3: Under the Hood */}
            <div>
              <div className="text-center mb-16">
                <h3 className="text-3xl font-bold mb-4">3. The Technical Logic: Under the Hood</h3>
                <p className="text-on-surface-variant max-w-2xl mx-auto">Ever wonder <strong>how it works</strong> technically? The <strong>LinkedIn Translator</strong> utilizes advanced <strong>Large Language Models (LLMs)</strong> and <strong>Natural Language Processing (NLP)</strong> to perform "LinkedIn-ification".</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Cpu, title: "Keyword Injection", desc: "The AI identifies opportunities to inject high-velocity industry terms like <strong>leverage</strong>, <strong>synergy</strong>, and <strong>high-impact</strong> into your sentences." },
                  { icon: Settings2, title: "Sentence Restructuring", desc: "It replaces short, direct statements with complex, authoritative narratives. For example, \"I quit\" becomes an \"exciting new chapter focused on personal growth\"." },
                  { icon: Eye, title: "Tone Modeling", desc: "Through sophisticated <strong>intensity control</strong>, the model adjusts the \"optimism levels\" and adds strategic hooks, line breaks, and professional emojis to ensure your content is optimized for engagement." }
                ].map((tech, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i }}
                    className="bg-white p-8 rounded-2xl ambient-shadow border-t-4 border-t-primary border-x border-b border-x-outline-variant border-b-outline-variant"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <tech.icon className="w-6 h-6 text-primary" />
                      <h4 className="text-lg font-bold">{tech.title}</h4>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed" dangerouslySetInnerHTML={{ __html: tech.desc }}></p>
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16 text-center max-w-3xl mx-auto bg-primary/5 p-8 rounded-2xl border border-primary/10"
              >
                <p className="text-lg text-on-surface-variant leading-relaxed">
                  By combining <strong>dual direction</strong> flexibility with granular <strong>intensity control</strong>, the <strong>LinkedIn Translator</strong> ensures every post you make or read aligns perfectly with your professional goals. Reach your peak performance today: simply input your text and <strong>translate to LinkedIn speak</strong> with a single click.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-32 px-6 bg-surface-container-low/50">
          <div className="max-w-5xl mx-auto space-y-6">
            {COMPARISONS.map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full p-8 bg-white rounded-xl border border-outline-variant">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-3">Common Friction</div>
                  <p className="text-lg font-medium italic text-on-surface-variant">"{item.friction}"</p>
                </div>
                <ArrowRight className="hidden md:block w-6 h-6 text-on-surface-variant/30" />
                <div className="flex-1 w-full p-8 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Executive Pivot</div>
                  <p className="text-lg font-semibold text-primary">"{item.pivot}"</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section id="why-choose-us" className="py-32 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4"
              >
                Core Advantages & Pain Points Solutions
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-extrabold mb-8"
              >
                Why Choose Us?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-on-surface-variant max-w-4xl mx-auto leading-relaxed"
              >
                Choosing the <strong>LinkedIn Translator</strong> is a strategic move to elevate your professional presence. In an era where your digital profile is your 24/7 resume, our tool ensures your <strong>personal branding</strong> stands out by bridging the gap between raw effort and high-impact storytelling.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Point 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white p-10 rounded-2xl ambient-shadow border border-outline-variant hover:border-primary/20 transition-all flex flex-col"
              >
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">1. Unmatched Efficiency: Save Writing Time and End Anxiety</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Stop staring at a blank page and struggling to find the right words. Our <strong>AI-powered tool</strong> allows you to <strong>save writing time</strong> by generating content <strong>10x faster than manual editing</strong>. Simply dump your raw ideas, and the <strong>LinkedIn Translator</strong> will instantly polish them into a professional narrative, complete with viral hooks and strategic formatting that would normally take hours to craft.
                </p>
              </motion.div>

              {/* Point 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white p-10 rounded-2xl ambient-shadow border border-outline-variant hover:border-primary/20 transition-all flex flex-col"
              >
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">2. Maximum Influence: Become a Recognized Thought Leader</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  To be perceived as a <strong>thought leader</strong>, you must transform mundane daily tasks into "strategic milestones". Our tool specializes in this transformation; for example, it can turn a simple task like "updating documentation" into "optimizing core assets to enhance scalable engineering standards". By consistently posting high-quality, authoritative content, you build the necessary authority to dominate your niche.
                </p>
              </motion.div>

              {/* Point 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="bg-white p-10 rounded-2xl ambient-shadow border border-outline-variant hover:border-primary/20 transition-all flex flex-col"
              >
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">3. The "Anti-Fluff" Guide: How to Avoid Buzzwords</h3>
                <p className="text-on-surface-variant leading-relaxed mb-6">
                  Most professionals unknowingly sabotage their profiles with subjective cliches that recruiters dismiss as "fluff". The <strong>LinkedIn Translator</strong> helps you <strong>avoid buzzwords</strong> such as "specialized," "passionate," "creative," and "strategic" terms that often trigger skepticism in hiring managers.
                </p>
                <ul className="space-y-4 mt-auto">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-on-surface-variant leading-relaxed"><strong>Instead of telling, we show:</strong> We replace vague descriptors with <strong>quantifiable achievements</strong> and metrics.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-on-surface-variant leading-relaxed"><strong>Evidence-based results:</strong> We help you swap "experienced leader" for "a 10-year track record of exceeding performance standards," ensuring your <strong>personal branding</strong> is built on provable facts rather than empty opinions.</span>
                  </li>
                </ul>
              </motion.div>

              {/* Point 4 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="bg-white p-10 rounded-2xl ambient-shadow border border-outline-variant hover:border-primary/20 transition-all flex flex-col"
              >
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">4. 2026 Social Proof: Dominating the Recruiter Search Engine</h3>
                <p className="text-on-surface-variant leading-relaxed mb-6">
                  By 2026, LinkedIn has fully transformed into a high-octane <strong>Recruiter Search Engine</strong>. Recruiters no longer "browse"; they use advanced AI filters to index your "About" section based on keyword density and <strong>AI-first matching logic</strong>.
                </p>
                <ul className="space-y-4 mt-auto">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-on-surface-variant leading-relaxed"><strong>Increase Engagement & Visibility:</strong> Without optimized professional language, you are effectively "invisible" to hiring systems.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-on-surface-variant leading-relaxed"><strong>The Growth Mindset Advantage:</strong> Our tool injects a <strong>growth mindset</strong> into your profile, ensuring every "micro-win" is indexed by the algorithm as a strategic contribution. This not only helps you rank higher in searches but also significantly helps <strong>increase engagement</strong> from both recruiters and peers.</span>
                  </li>
                </ul>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto bg-primary text-white p-10 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-full -z-10 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-tr-full -z-10 blur-2xl"></div>
              <p className="text-xl md:text-2xl leading-relaxed font-medium relative z-10">
                By choosing the <strong>LinkedIn Translator</strong>, you aren't just using a tool; you are <strong>leveraging a high-impact content delivery mechanism</strong> to reinforce your professional identity and ensure you are the first person recruiters see in 2026.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold mb-4">Pricing That Matches Real Usage</h2>
              <p className="text-on-surface-variant max-w-3xl mx-auto">
                Signed-in users get 5 free translations per day. Paid usage is straightforward: each successful request deducts 1 credit.
              </p>
            </div>

            {pricingMessage ? (
              <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-on-surface-variant">
                {pricingMessage}
              </div>
            ) : null}

            <div className="grid md:grid-cols-3 gap-8">
              {LINKEDIN_TRANSLATOR_PRICING_CARDS.map((card) => {
                const isPrimary = card.id === LINKEDIN_TRANSLATOR_PRO_PACK.id;
                const isTeamContactOnly =
                  card.id === "team" && !("productId" in card);

                return (
                  <motion.div
                    key={card.id}
                    whileHover={{ y: -8 }}
                    className={[
                      "bg-white p-10 rounded-2xl flex flex-col h-full relative",
                      isPrimary
                        ? "border border-primary/30 ambient-shadow"
                        : "border border-outline-variant",
                    ].join(" ")}
                  >
                    {isPrimary ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                        Unlocks Extreme
                      </div>
                    ) : null}

                    <div className="mb-8">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">
                        {card.name}
                      </h3>
                      <div className="text-4xl font-extrabold text-primary mb-3">
                        {card.priceLabel}
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-2">
                        {card.description}
                      </p>
                      <p className="text-sm text-on-surface-variant font-medium">
                        {card.badge}
                      </p>
                    </div>

                    {isTeamContactOnly ? (
                      <a
                        href={`mailto:${LINKEDIN_TRANSLATOR_SUPPORT_EMAIL}?subject=LinkedIn Translator Team Plan`}
                        className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-lg font-bold text-sm mb-10 transition-all inline-flex items-center justify-center gap-2"
                      >
                        {card.ctaLabel}
                      </a>
                    ) : "productId" in card && card.productId ? (
                      user ? (
                        <button
                          type="button"
                          onClick={() => handleCheckout(card.productId!)}
                          disabled={checkouting}
                          className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-lg font-bold text-sm mb-10 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          <Zap className="w-4 h-4" />
                          {checkouting ? "Starting checkout..." : card.ctaLabel}
                        </button>
                      ) : (
                        <div className="mb-10 space-y-3">
                          <div className="[&_button]:w-full [&_button]:justify-center">
                            <LazyGoogleOAuth className="w-full justify-center" />
                          </div>
                          <p className="text-xs text-on-surface-variant">
                            Sign in first, then complete checkout in one step.
                          </p>
                        </div>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-lg font-bold text-sm mb-10 transition-all"
                      >
                        {card.ctaLabel}
                      </button>
                    )}

                    <div className="space-y-4 flex-grow">
                      <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">
                        Includes
                      </div>
                      {card.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3 text-sm text-on-surface-variant">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-10 rounded-2xl border border-outline-variant bg-white/80 p-6 text-sm leading-7 text-on-surface-variant">
              Billing note: each successful paid translation deducts exactly <strong>1 credit</strong> from your balance, and both one-time packs unlock <strong>Extreme</strong> immediately after purchase.
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-32 px-6 bg-surface-container-low">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4"
              >
                Frequently Asked Questions & Long-tail Traffic
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-extrabold mb-8"
              >
                FAQ
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed"
              >
                Our <strong>LinkedIn Translator</strong> is designed to be a comprehensive <strong>LinkedIn speak Translator</strong> for modern professionals. Below are common questions about our <strong>free LinkedIn translator</strong>, how we compare with general tools like <strong>Google Translate</strong> and <strong>Kagi Translate</strong>, and how to handle <strong>corporate jargon</strong>.
              </motion.p>
            </div>
            
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-white rounded-xl border border-outline-variant overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-surface-container-low transition-colors"
                  >
                    <span className="font-bold text-lg">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-primary transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 text-on-surface-variant leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="py-32 px-6 bg-primary text-white text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-extrabold mb-6">Ready to Transform Your Professional Brand?</h2>
            <p className="text-xl text-white/80 mb-12">
              Experience the power of the ultimate <strong>LinkedIn Translator</strong>. Turn your everyday thoughts into high-impact, recruiter-optimized posts instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-surface-container-lowest transition-all">
                Get Started for Free
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface py-20 px-6 border-t border-outline-variant">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Languages className="text-white w-4 h-4" />
              </div>
              <span className="font-display font-bold text-lg text-primary">LinkedIn Translator</span>
            </div>
            <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
              AI tone translation for modern professionals. All rights reserved.
            </p>
            <p className="text-[10px] text-on-surface-variant/40 mt-8">
              漏 2026 LinkedIn Translator. All rights reserved.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant/60 mb-6">Legal</h4>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li><a href="/legal/privacy" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="/legal/terms" className="hover:text-primary">Terms of Service</a></li>
              <li><a href="/legal/cookie" className="hover:text-primary">Cookie Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant/60 mb-6">Support</h4>
            <ul className="space-y-4 text-sm font-medium text-on-surface-variant">
              <li><a href="mailto:support@linkedintranslator.online" className="hover:text-primary">support@linkedintranslator.online</a></li>
              <li><a href="https://linkedintranslator.online" className="hover:text-primary">linkedintranslator.online</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}


