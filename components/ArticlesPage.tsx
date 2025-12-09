import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { ArrowLeft } from 'lucide-react';
import { fetchPexelsImages } from '../services/pexelsService';

interface ArticlesPageProps {
  onNavigate: (page: Page) => void;
}

const ArticleContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="prose prose-lg prose-invert max-w-none prose-p:text-slate-300 prose-headings:font-brand prose-headings:text-white prose-strong:text-white prose-ul:text-slate-300 prose-li:marker:text-cyan-400">
        {children}
    </div>
);


const ArticlesPage: React.FC<ArticlesPageProps> = ({ onNavigate }) => {
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        const loadImages = async () => {
            const [img1, img2, img3, img4] = await Promise.all([
                fetchPexelsImages('elderly parent talking with adult child', 1),
                fetchPexelsImages('old family photo album', 1),
                fetchPexelsImages('person organizing digital files on computer', 1),
                fetchPexelsImages('old handwritten recipe book', 1),
            ]);
            setImages([
                img1[0]?.src.large2x || '',
                img2[0]?.src.large2x || '',
                img3[0]?.src.large2x || '',
                img4[0]?.src.large2x || '',
            ]);
        };
        loadImages();
    }, []);

    const articles = [
        {
            id: 'interview-parents',
            title: "How to Interview Elderly Parents About Their Life",
            image: images[0],
            content: (
                <ArticleContent>
                    <p>Preserving the life stories of our parents is one of the most precious gifts we can give to them, to ourselves, and to future generations. But starting that conversation can feel daunting. The key is to create a comfortable, loving environment where stories can flow naturally. Here are some tips to help you begin.</p>
                    <h3>Create a Comfortable Setting</h3>
                    <p>Choose a time and place where your parents feel relaxed and won't be interrupted. This could be their favorite armchair, a quiet spot in the garden, or over a cup of tea. The goal is to make it a special, shared experience, not a formal interview.</p>
                    <h3>Use Photos and Mementos as Prompts</h3>
                    <p>Old photo albums, letters, or family heirlooms are powerful catalysts for memory. Go through them together and ask open-ended questions like, "Tell me about this day," or "What do you remember about this person?"</p>
                    <h3>Be an Active, Patient Listener</h3>
                    <p>Your role is to listen, not to lead. Avoid interrupting, and give them space to pause, reflect, and even get emotional. Sometimes the most beautiful stories emerge from silence. Show you're engaged by nodding, asking gentle follow-up questions, and offering encouragement.</p>
                    <h3>Record the Conversation</h3>
                    <p>With their permission, record the audio or video of your conversation. A smartphone can work perfectly. Explain that it's to ensure their stories are preserved accurately. Platforms like æternacy can then help you transcribe and attach these recordings to the memories they describe, creating a living archive.</p>
                    <h3>Break It Into Multiple Sessions</h3>
                    <p>Remembering a lifetime is a marathon, not a sprint. Keep sessions short—perhaps an hour at a time—to avoid fatigue. This makes the process enjoyable and gives your parents time to recall more details between your chats.</p>
                    <p>Every story, no matter how small it seems, is a thread in the beautiful tapestry of your family's history. Cherish this process; it's a memory in itself.</p>
                </ArticleContent>
            )
        },
        {
            id: 'ten-questions',
            title: "10 Questions to Ask Before It's Too Late",
            image: images[1],
            content: (
                <ArticleContent>
                    <p>Sometimes the most important conversations are the hardest to start. These ten questions are designed to be gentle entry points into the vast, beautiful landscape of your loved one's life story. They are not a checklist, but a beginning.</p>
                    <ol>
                        <li>What is your earliest memory?</li>
                        <li>What was your childhood home like?</li>
                        <li>Tell me about your parents and grandparents. What were they like?</li>
                        <li>How did you meet your spouse/partner? What was your wedding day like?</li>
                        <li>What accomplishment are you most proud of in your life?</li>
                        <li>What was the happiest time of your life? What about the most challenging?</li>
                        <li>Is there anything you regret, or wish you had done differently?</li>
                        <li>What are the most important lessons you've learned in life?</li>
                        <li>What are your hopes for the future of our family?</li>
                        <li>How do you want to be remembered?</li>
                    </ol>
                    <p>Let these questions be the start. The most important part is to listen with an open heart and let the conversation wander where it may. The stories you'll hear are treasures.</p>
                </ArticleContent>
            )
        },
        {
            id: 'digital-legacy',
            title: "Digital Legacy Planning: A Complete Guide",
            image: images[2],
            content: (
                <ArticleContent>
                    <p>In today's world, our lives are documented across countless digital platforms. A digital legacy is the collection of all your digital assets—photos, social media profiles, emails, documents—that you leave behind. Planning for it ensures your story is preserved and managed according to your wishes.</p>
                    <h3>1. Inventory Your Digital Assets</h3>
                    <p>Make a list of all your online accounts and digital files. This includes social media (Facebook, Instagram), photo storage (Google Photos, iCloud), email accounts, and any files stored on your computer or in the cloud.</p>
                    <h3>2. Decide What to Preserve</h3>
                    <p>Not everything needs to be saved. Curate what's most important. This is where a platform like æternacy excels, helping you consolidate your most meaningful photos and stories into one, secure timestream.</p>
                    <h3>3. Choose a Digital Steward</h3>
                    <p>Appoint a "digital executor" or a Steward—someone you trust to manage your digital assets after you're gone. This person will carry out your wishes, whether it's preserving your æternacy timestream, closing certain social media accounts, or sharing specific memories with loved ones.</p>
                    <h3>4. Consolidate and Document</h3>
                    <p>Use a secure password manager and document your wishes for each account. For your most precious memories, consolidate them into a dedicated legacy platform. The Lægacy Trust feature in æternacy is designed for this, allowing you to set up stewards and protocols for the future.</p>
                    <p>Taking control of your digital story is an act of love for those you'll one day leave behind. It ensures your narrative remains coherent, private, and preserved for generations.</p>
                </ArticleContent>
            )
        },
        {
            id: 'family-recipes',
            title: "Preserving Family Recipes and Traditions",
            image: images[3],
            content: (
                <ArticleContent>
                    <p>A faded, flour-dusted recipe card is more than just instructions; it’s a story. It’s the memory of a grandmother's kitchen, the taste of a holiday tradition, a direct link to your heritage. Preserving these recipes is preserving a piece of your family's heart.</p>
                    <h3>Digitize and Document</h3>
                    <p>The first step is to protect the originals. Scan or take high-quality photos of handwritten recipe cards and pages. In æternacy, you can create a "Momænt" for each recipe, uploading the image of the card itself.</p>
                    <h3>Record the Story</h3>
                    <p>The magic isn't just in the ingredients; it's in the context. While you have the chance, ask your relatives about the story behind the recipe. Where did it come from? Who taught them to make it? When was it traditionally served? Add this narrative to the description of the Momænt.</p>
                    <h3>Capture the Process</h3>
                    <p>If possible, record audio or video of your loved one preparing the dish. The way they measure ingredients by feel, the specific technique they use—these are details that written words can't capture. This recording becomes a priceless part of the recipe's legacy.</p>
                    <h3>Create a Shared Tradition</h3>
                    <p>Use the Fæmily Space in æternacy to create a collaborative cookbook. Invite family members to add their own signature recipes and the stories behind them. Cooking these dishes together then becomes a new tradition, built upon the foundation of the old.</p>
                    <p>By preserving these culinary traditions, you're not just saving recipes; you're passing down a taste of home to future generations.</p>
                </ArticleContent>
            )
        },
    ];

    return (
        <div className="bg-slate-900 text-white animate-fade-in -mt-20">
            <header className="sticky top-0 bg-slate-900/80 backdrop-blur-sm z-20">
                <div className="container mx-auto px-6 py-4">
                    <button onClick={() => onNavigate(Page.Landing)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </button>
                </div>
            </header>

            <section className="pt-24 pb-16 text-center">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-white font-brand">The æternacy Journal</h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto mt-4">
                        Guidance and inspiration for preserving the stories that matter most.
                    </p>
                </div>
            </section>
            
            <section className="container mx-auto px-6 pb-16 max-w-3xl">
                <div className="bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10">
                    <h2 className="text-xl font-bold mb-4">In this issue:</h2>
                    <ul className="space-y-3">
                        {articles.map(article => (
                            <li key={article.id}>
                                <a href={`#${article.id}`} className="block p-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <p className="font-semibold text-cyan-400">{article.title}</p>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <main className="container mx-auto px-6 pb-20 max-w-3xl space-y-20">
                {articles.map(article => (
                    <article key={article.id} id={article.id} className="scroll-mt-24">
                        <h2 className="text-3xl font-bold text-white font-brand mb-6">{article.title}</h2>
                        {article.image && <img src={article.image} alt={article.title} className="w-full h-64 object-cover rounded-lg mb-6" />}
                        {article.content}
                    </article>
                ))}
            </main>
        </div>
    );
};

export default ArticlesPage;