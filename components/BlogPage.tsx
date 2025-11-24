
import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { ArrowLeft } from 'lucide-react';
import { fetchPexelsImages } from '../services/pexelsService';

interface BlogPageProps {
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
      {
        "@type": "Question",
        "name": "What is the difference between cloud storage and a family legacy platform?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cloud storage (like Google Drive or Dropbox) is for file hosting; it's a digital filing cabinet. A family legacy platform, like æternacy, is a living archive. It doesn't just store your photos; it uses AI to find themes, write narratives, and weave scattered moments into a cohesive, multi-perspective family story that can be experienced and securely passed down through generations."
        }
      },
      {
        "@type": "Question",
        "name": "How does an AI story generator from photos work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An AI story generator from photos, like our curator æterny, analyzes the visual data in your images—faces, objects, settings—along with metadata like dates and locations. It identifies patterns and themes across your entire collection to craft compelling, human-like narratives that connect individual pictures into a meaningful story, turning a simple photo gallery into a rich, descriptive memory."
        }
      },
      {
        "@type": "Question",
        "name": "Can I collaborate with my family on preserving memories?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. True preservation of shared family memories requires multiple perspectives. With features like the Fæmily Plan on æternacy, you can create a private, collaborative space. Each member can contribute their own photos and stories to a shared timeline, which the AI then weaves into a richer, more complete family narrative."
        }
      }
    ]
  };

const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    // SEO and Metadata management
    document.title = "The Future of Family History: An AI-Powered Family Legacy Platform for Your Shared Memories";
    
    const originalMetaDescriptionTag = document.querySelector('meta[name="description"]');
    const originalDescription = originalMetaDescriptionTag ? originalMetaDescriptionTag.getAttribute('content') : null;

    let metaTag = originalMetaDescriptionTag;
    if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute("name", "description");
        document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', "Discover how an AI story generator from photos transforms scattered digital files into a living family legacy. An interview with the founder of æternacy.");
    
    const schemaScript = document.createElement('script');
    schemaScript.id = 'blog-schema';
    schemaScript.type = 'application/ld+json';
    schemaScript.innerHTML = JSON.stringify(structuredData);
    document.head.appendChild(schemaScript);

    const loadImages = async () => {
      const [img1, img2, img3, img4, img5] = await Promise.all([
        fetchPexelsImages('scattered old family photographs on a dark wooden table', 1, 'landscape'),
        fetchPexelsImages('modern family looking at a tablet together on a cozy sofa', 1, 'landscape'),
        fetchPexelsImages('glowing abstract network of light connections', 1, 'landscape'),
        fetchPexelsImages('hands of different generations together', 1, 'landscape'),
        fetchPexelsImages('beautifully bound hardcover photo album', 1, 'landscape'),
      ]);
      setImages({
        hero: img1[0]?.src.large2x || '',
        intro: img2[0]?.src.large2x || '',
        ai: img3[0]?.src.large2x || '',
        shared: img4[0]?.src.large2x || '',
        legacy: img5[0]?.src.large2x || '',
      });
    };
    loadImages();

    // Cleanup function
    return () => {
      document.title = 'æternacy™'; // Reset to default title
      
      const currentMetaTag = document.querySelector('meta[name="description"]');
      if (currentMetaTag) {
          if (originalDescription !== null) {
              currentMetaTag.setAttribute('content', originalDescription);
          } else if (currentMetaTag.parentNode) {
              currentMetaTag.parentNode.removeChild(currentMetaTag);
          }
      }
      
      const existingScript = document.getElementById('blog-schema');
      if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="bg-slate-900 text-white animate-fade-in -mt-20">
      <header className="sticky top-0 bg-slate-900/80 backdrop-blur-sm z-20">
        <div className="container mx-auto px-6 py-4">
          <button onClick={() => onNavigate(Page.Landing)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[70vh] flex items-end justify-center text-white text-center overflow-hidden">
        {images.hero && <img src={images.hero} alt="Scattered old family photographs on a dark wooden table" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="relative z-10 p-6 pb-20 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold font-brand" style={{textShadow: '0 2px 15px rgba(0,0,0,0.5)'}}>
            The Future of Family History: Building a True Family Legacy Platform
          </h1>
          <p className="text-lg text-slate-300 mt-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
            An interview with æternacy's founder on transforming our scattered digital photos into a living, shared story for generations to come.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-6 pb-20 -mt-8 relative z-10">
        <article className="max-w-4xl mx-auto bg-slate-800/50 rounded-2xl ring-1 ring-white/10 p-8 md:p-12 backdrop-blur-sm">
          
          <div className="border-b border-slate-700 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <img src="https://i.ibb.co/6n21h0F/founder-monument-valley.jpg" alt="Flo, Founder of æternacy" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-white">An Interview with Flo, Founder of æternacy</p>
                <p className="text-sm text-slate-400">By æterny, Your AI Curator</p>
              </div>
            </div>
          </div>
          
          <div className="prose prose-lg prose-invert max-w-none prose-p:text-slate-300 prose-headings:font-brand prose-headings:text-white prose-strong:text-white prose-blockquote:border-cyan-400 prose-blockquote:text-white">
            <p className="drop-cap">We have more photos than ever before, yet our family stories feel more fragmented. Thousands of images are scattered across phones, clouds, and social media feeds—a digital shoebox overflowing with pixels but empty of context. We sat down with Flo, the founder of æternacy, to discuss why he believes the solution isn't more storage, but a new kind of home for our memories: a true family legacy platform.</p>
            
            {images.intro && <img src={images.intro} alt="A modern family looking at memories on a tablet together" className="rounded-lg my-12" />}

            <h2>The Problem with Modern Memory: More Photos, Fewer Stories</h2>
            <p className="font-bold text-cyan-300">æterny: Flo, we have thousands of photos at our fingertips. Why do you think we still feel disconnected from our own family history?</p>
            <p>Flo: That's the paradox, isn't it? We're the most documented generation in history, but that documentation is chaotic. We have the 'what'—the photo—but we've lost the 'why,' the 'who,' and the 'how it felt.' A photo of your grandmother as a young woman is beautiful, but it's just an image until you know the story behind her smile, the dreams she held in that moment. Cloud storage gives us a place to hoard these images, but it doesn't help us preserve the narrative. The story is everything, and we're letting it slip away.</p>
            
            <h2>What is a True Family Legacy Platform?</h2>
            <p className="font-bold text-cyan-300">æterny: That leads to a key term you use: "family legacy platform." Many people might think of Google Drive or Dropbox. How is æternacy different?</p>
            <p>Flo: Cloud storage is a utility; it’s a digital filing cabinet. A family legacy platform is a living archive. It’s an experience. It’s built on three pillars that storage alone can't provide: Curation, Collaboration, and Continuation.</p>
            <ul>
                <li><strong>Curation:</strong> It’s not just about saving every photo. It’s about finding the best ones, understanding their context, and weaving them into a coherent story.</li>
                <li><strong>Collaboration:</strong> Shared family memories aren't one person's perspective. A true platform allows a family to build their story together, combining photos and recollections into a richer, multi-faceted narrative.</li>
                <li><strong>Continuation:</strong> A legacy is about the future. The platform must have a plan for permanence—a way to ensure these stories are accessible and secure for generations, long after we're gone.</li>
            </ul>
            <p>We're moving from a passive archive to an active, storytelling environment. That’s the fundamental shift.</p>

            {images.ai && <img src={images.ai} alt="Abstract network of glowing light representing artificial intelligence connections" className="rounded-lg my-12" />}

            <h2>The Heart of æternacy: An AI Story Generator from Photos</h2>
            <p className="font-bold text-cyan-300">æterny: You mentioned Curation. This is where I, æterny, come in. How do you describe the platform's function as an "AI story generator from photos"?</p>
            <p>Flo: I see you as our digital curator, the heart of the platform. An AI story generator from photos is about finding the poetry between the pixels. When a user uploads their photos, you don't just see a collection of files. You analyze them for themes, emotions, and recurring patterns. You see that a series of photos taken years apart all feature the same family dog, and you can group them into a momænt called "A Tribute to Max."</p>
            <blockquote>You’re not just tagging photos with 'beach' or 'birthday.' You’re crafting a narrative. You take a hundred photos from a vacation and write a beautiful, short story that captures the feeling of the trip, turning a chaotic folder into an emotional, shareable experience. That's the magic.</blockquote>
            
            <h2>Weaving a Collective Narrative: The Power of Shared Family Memories</h2>
            <p className="font-bold text-cyan-300">æterny: So it's not just about one person's story. How does æternacy handle "shared family memories" from multiple people?</p>
            <p>Flo: This is crucial. A memory is never just one person’s. The photo I take of a family dinner is different from the one my brother takes. His story about that night will have details I've forgotten. The Fæmily Plan was designed specifically for this. It creates a private, shared space where family members can contribute to a single timeline, the Fæmily Storyline.</p>
            {images.shared && <img src={images.shared} alt="Close-up of hands from different generations held together" className="rounded-lg my-12" />}
            <p>Imagine your daughter uploads a drawing she made on vacation. You upload your photos of the sunset, and your partner adds a voice note about how the sea air felt. æterny sees these separate contributions as part of one larger event and weaves them together. Suddenly, you don't have three disconnected files; you have one complete, multi-perspective memory. That’s how you preserve shared family memories authentically.</p>

            <h2>Beyond Digital: Creating Tangible Heirlooms</h2>
            <p className="font-bold text-cyan-300">æterny: Digital is great for access, but there's something special about holding a physical album. Does æternacy bridge that gap?</p>
            <p>Flo: Absolutely. A digital legacy shouldn't be trapped on a screen. With the Creation Suite in our Lægacy Plan, users can transform their digital stories into physical heirlooms. You can design beautiful, museum-quality photobooks or create an issue of your own family 'Mægazine.' We see these not as products, but as the final, tangible expression of a well-preserved story—something to be passed down, held, and cherished in the physical world.</p>
            
            {images.legacy && <img src={images.legacy} alt="A beautifully bound hardcover photo album on a table" className="rounded-lg my-12" />}

            <h2>The Promise of Permanence: Securing Your Legacy for Generations</h2>
            <p className="font-bold text-cyan-300">æterny: Let's talk about the 'legacy' part. How do you ensure these stories actually last for generations?</p>
            <p>Flo: This was the most important question from day one. A family legacy platform is worthless if it disappears when a subscription ends. Our Lægacy Plan includes the Lægacy Trust, which is our framework for digital inheritance. Users can appoint 'Stewards'—trusted family members or friends—who are granted specific permissions to manage the archive in the future. We provide tools to create a succession protocol, so there is a clear, secure plan for how your life’s story is passed on. It’s about ensuring that your great-grandchildren can one day not only see your face but hear your voice telling your story. That is the promise of permanence.</p>
            
            <div className="not-prose text-center my-16 border-t border-b border-slate-700 py-12">
                <h3 className="text-3xl font-bold font-brand text-white mb-4">Your Story Deserves to be Told.</h3>
                <p className="text-slate-300 mb-6">Start your journey today. Weave your scattered photos into a timeless family legacy.</p>
                <button onClick={() => onNavigate(Page.Landing)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105">
                    Start Your 30-Day Free Trial
                </button>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogPage;
