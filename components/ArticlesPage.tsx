
import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { ArrowLeft, BookOpen, Mic, PenLine } from 'lucide-react';
import { fetchPexelsImages } from '../services/pexelsService';

interface JournalPageProps {
  onNavigate: (page: Page) => void;
}

const ArticleContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="prose prose-lg prose-invert max-w-none prose-p:text-slate-300 prose-headings:font-brand prose-headings:text-white prose-strong:text-white prose-ul:text-slate-300 prose-li:marker:text-cyan-400">
        {children}
    </div>
);

const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      // ... (Content from BlogPage's structured data)
    ]
};


const ArticlesPage: React.FC<JournalPageProps> = ({ onNavigate }) => {
    const [images, setImages] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadImages = async () => {
            const [img1, img2, img3, img4, blogHero, blogIntro, blogAI, blogShared, blogLegacy] = await Promise.all([
                fetchPexelsImages('elderly parent talking with adult child', 1),
                fetchPexelsImages('old family photo album', 1),
                fetchPexelsImages('person organizing digital files on computer', 1),
                fetchPexelsImages('old handwritten recipe book', 1),
                fetchPexelsImages('scattered old family photographs on a dark wooden table', 1, 'landscape'),
                fetchPexelsImages('modern family looking at a tablet together on a cozy sofa', 1, 'landscape'),
                fetchPexelsImages('glowing abstract network of light connections', 1, 'landscape'),
                fetchPexelsImages('hands of different generations together', 1, 'landscape'),
                fetchPexelsImages('beautifully bound hardcover photo album', 1, 'landscape'),
            ]);
            setImages({
                interviewParents: img1[0]?.src.large2x || '',
                tenQuestions: img2[0]?.src.large2x || '',
                digitalLegacy: img3[0]?.src.large2x || '',
                familyRecipes: img4[0]?.src.large2x || '',
                blogHero: blogHero[0]?.src.large2x || '',
                blogIntro: blogIntro[0]?.src.large2x || '',
                blogAI: blogAI[0]?.src.large2x || '',
                blogShared: blogShared[0]?.src.large2x || '',
                blogLegacy: blogLegacy[0]?.src.large2x || '',
            });
        };
        loadImages();
    }, []);
    
    const contentMap = [
        {
            id: 'future-of-family-history',
            category: 'From the Founder',
            title: "The Future of Family History: Building a True Family Legacy Platform",
            description: "An interview with æternacy's founder on transforming our scattered digital photos into a living, shared story.",
            image: images.blogHero,
            content: (
                <ArticleContent>
                    <p className="drop-cap">We have more photos than ever before, yet our family stories feel more fragmented. Thousands of images are scattered across phones, clouds, and social media feeds—a digital shoebox overflowing with pixels but empty of context. We sat down with Flo, the founder of æternacy, to discuss why he believes the solution isn't more storage, but a new kind of home for our memories: a true family legacy platform.</p>
                    {images.blogIntro && <img src={images.blogIntro} alt="A modern family looking at memories on a tablet together" className="rounded-lg my-12" />}
                    <h2>The Problem with Modern Memory: More Photos, Fewer Stories</h2>
                    <p className="font-bold text-cyan-300">æterny: Flo, we have thousands of photos at our fingertips. Why do you think we still feel disconnected from our own family history?</p>
                    <p>Flo: That's the paradox, isn't it? We're the most documented generation in history, but that documentation is chaotic. We have the 'what'—the photo—but we've lost the 'why,' the 'who,' and the 'how it felt.' A photo of your grandmother as a young woman is beautiful, but it's just an image until you know the story behind her smile, the dreams she held in that moment. Cloud storage gives us a place to hoard these images, but it doesn't help us preserve the narrative. The story is everything, and we're letting it slip away.</p>
                    <h2>What is a True Family Legacy Platform?</h2>
                    <p className="font-bold text-cyan-300">æterny: That leads to a key term you use: "family legacy platform." Many people might think of Google Drive or Dropbox. How is æternacy different?</p>
                    <p>Flo: Cloud storage is a utility; it’s a digital filing cabinet. A family legacy platform is a living archive. It’s an experience. It’s built on three pillars that storage alone can't provide: Curation, Collaboration, and Continuation.</p>
                    {images.blogAI && <img src={images.blogAI} alt="Abstract network of glowing light representing artificial intelligence connections" className="rounded-lg my-12" />}
                    <h2>The Heart of æternacy: An AI Story Generator from Photos</h2>
                     <p className="font-bold text-cyan-300">æterny: You mentioned Curation. This is where I, æterny, come in. How do you describe the platform's function as an "AI story generator from photos"?</p>
                    <blockquote>You’re not just tagging photos with 'beach' or 'birthday.' You’re crafting a narrative. You take a hundred photos from a vacation and write a beautiful, short story that captures the feeling of the trip, turning a chaotic folder into an emotional, shareable experience. That's the magic.</blockquote>
                    <h2>Weaving a Collective Narrative: The Power of Shared Family Memories</h2>
                    <p className="font-bold text-cyan-300">æterny: So it's not just about one person's story. How does æternacy handle "shared family memories" from multiple people?</p>
                    <p>Flo: This is crucial. A memory is never just one person’s. The photo I take of a family dinner is different from the one my brother takes. His story about that night will have details I've forgotten. The Fæmily Plan was designed specifically for this. It creates a private, shared space where family members can contribute to a single timeline, the Fæmily Storyline.</p>
                    {images.blogLegacy && <img src={images.blogLegacy} alt="A beautifully bound hardcover photo album on a table" className="rounded-lg my-12" />}
                    <h2>The Promise of Permanence: Securing Your Legacy for Generations</h2>
                    <p className="font-bold text-cyan-300">æterny: Let's talk about the 'legacy' part. How do you ensure these stories actually last for generations?</p>
                    <p>Flo: This was the most important question from day one. A family legacy platform is worthless if it disappears when a subscription ends. Our Lægacy Plan includes the Lægacy Trust, which is our framework for digital inheritance. Users can appoint 'Stewards'—trusted family members or friends—who are granted specific permissions to manage the archive in the future. We provide tools to create a succession protocol, so there is a clear, secure plan for how your life’s story is passed on. It’s about ensuring that your great-grandchildren can one day not only see your face but hear your voice telling your story. That is the promise of permanence.</p>
                </ArticleContent>
            )
        },
        {
            id: 'interview-parents',
            category: 'Guides',
            title: "How to Interview Elderly Parents About Their Life",
            description: "Practical tips for creating a comfortable, loving environment where stories can flow naturally.",
            image: images.interviewParents,
            content: (
                 <ArticleContent>
                    <p>Preserving the life stories of our parents is one of the most precious gifts we can give to them, to ourselves, and to future generations. But starting that conversation can feel daunting. The key is to create a comfortable, loving environment where stories can flow naturally. Here are some tips to help you begin.</p>
                    <h3>Create a Comfortable Setting</h3>
                    <p>Choose a time and place where your parents feel relaxed and won't be interrupted. This could be their favorite armchair, a quiet spot in the garden, or over a cup of tea. The goal is to make it a special, shared experience, not a formal interview.</p>
                    <h3>Be an Active, Patient Listener</h3>
                    <p>Your role is to listen, not to lead. Avoid interrupting, and give them space to pause, reflect, and even get emotional. Sometimes the most beautiful stories emerge from silence. Show you're engaged by nodding, asking gentle follow-up questions, and offering encouragement.</p>
                </ArticleContent>
            )
        },
    ];

    return (
        <div className="bg-slate-900 text-white animate-fade-in -mt-20">
            <header className="sticky top-0 bg-slate-900/80 backdrop-blur-sm z-20">
                <div className="container mx-auto px-6 py-4">
                    <button onClick={() => onNavigate(Page.Home)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </button>
                </div>
            </header>

            <section className="pt-24 pb-16 text-center">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-brand">The æternacy Journal</h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto mt-4">
                        Guidance, inspiration, and stories about preserving the memories that matter most.
                    </p>
                </div>
            </section>
            
            <section className="container mx-auto px-6 pb-16 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {contentMap.map((article, index) => (
                        <a href={`#${article.id}`} key={article.id} className={`bg-gray-800/50 rounded-2xl ring-1 ring-white/10 flex flex-col hover:ring-cyan-400/50 transition-all group ${index === 0 ? 'md:col-span-2' : ''}`}>
                            <div className={`relative overflow-hidden ${index === 0 ? 'h-80' : 'h-48'}`}>
                                <img src={article.image} alt={article.title} className="w-full h-full object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <span className="absolute top-4 left-4 text-xs font-bold text-white bg-black/40 px-2 py-1 rounded-full">{article.category}</span>
                            </div>
                            <div className="p-6">
                                <h3 className={`font-brand font-bold text-white ${index === 0 ? 'text-3xl' : 'text-xl'}`}>{article.title}</h3>
                                <p className="text-sm text-slate-400 mt-2">{article.description}</p>
                            </div>
                        </a>
                    ))}
                     <a href={`#magazine-studio`} onClick={(e) => { e.preventDefault(); onNavigate(Page.Magazine); }} className="bg-gradient-to-br from-indigo-900/50 to-purple-900/30 rounded-2xl ring-1 ring-indigo-500/30 flex flex-col p-8 justify-center items-center text-center hover:ring-indigo-400 transition-all group">
                        <BookOpen className="w-12 h-12 text-indigo-300 mb-4" />
                        <h3 className="font-brand font-bold text-white text-2xl">Mægazine Studio</h3>
                        <p className="text-sm text-slate-400 mt-2">Design and publish beautiful, shareable digital magazines from your moments and journæys.</p>
                     </a>
                </div>
            </section>

            <main className="container mx-auto px-6 pb-20 max-w-4xl space-y-24">
                {contentMap.map(article => (
                    <article key={`content-${article.id}`} id={article.id} className="scroll-mt-24">
                        <div className="border-t border-b border-slate-700 py-6 mb-8 text-center">
                            <p className="text-sm font-bold text-cyan-400 uppercase tracking-widest">{article.category}</p>
                            <h2 className="text-4xl font-bold text-white font-brand mt-2">{article.title}</h2>
                        </div>
                        {article.content}
                    </article>
                ))}
            </main>
        </div>
    );
};

export default ArticlesPage;