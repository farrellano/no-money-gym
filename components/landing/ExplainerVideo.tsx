export function ExplainerVideo() {
  return (
    <section className="flex justify-center px-4 py-8">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl">
        <video
          src="/explainer.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full aspect-[9/16] bg-black object-cover"
        />
      </div>
    </section>
  );
}
