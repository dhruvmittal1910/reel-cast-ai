import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white px-8">
      <div className="container flex flex-col items-center justify-center gap-12 py-16">
        {/* Hero Section */}
        <header className="text-center">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-4">
            Unlock Audio Insights with <span className="text-[hsl(280,100%,70%)]">AI Podcast Clipper</span>
          </h1>
          <p className="mt-4 text-lg sm:text-2xl max-w-3xl mx-auto text-white/80">
            Effortlessly summarize, search, and share moments from your favorite podcast episodes—powered by state-of-the-art AI.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/signup" className="rounded-xl px-8 py-4 bg-[hsl(280,100%,70%)] text-lg font-semibold shadow hover:bg-[hsl(280,80%,60%)] transition">
              Get Started Free
            </Link>
            <Link href="#features" className="rounded-xl px-8 py-4 bg-white/10 text-lg font-semibold hover:bg-white/20 transition">
              Explore Features
            </Link>
          </div>
        </header>

        {/* Features Section */}
        <section id="features" className="w-full mt-20">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">What Makes Us Awesome?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 p-6 rounded-xl shadow flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-2">AI Clipping</h3>
              <p className="text-white/80 text-center">
                Instantly find and share key moments from hours of content—no more manual scrubbing!
              </p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl shadow flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-2">Smart Summaries</h3>
              <p className="text-white/80 text-center">
                Get concise, accurate episode summaries and topic highlights, ready to share with listeners.
              </p>
            </div>
            <div className="bg-white/10 p-6 rounded-xl shadow flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
              <p className="text-white/80 text-center">
                Share clips across all platforms with one click—perfect for creators, fans, and marketers.
              </p>
            </div>
          </div>
        </section>

        {/* Call-To-Action Footer */}
        <footer className="mt-20 text-center">
          <h3 className="text-2xl font-extrabold mb-4">Try It Now—It is Free!</h3>
          <Link href="/signup" className="inline-block rounded-xl px-8 py-4 bg-[hsl(280,100%,70%)] text-lg font-semibold hover:bg-[hsl(280,80%,60%)] transition">
            Sign Up & Start Clipping
          </Link>
          <p className="mt-6 text-md text-white/60">No credit card required · Cancel anytime</p>
        </footer>
      </div>
    </main>
  );
}
