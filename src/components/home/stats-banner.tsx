export function StatsBanner() {
  const stats = [
    { number: "2.5B", label: "Files Processed" },
    { number: "10M+", label: "Active Users" },
    { number: "130+", label: "Tools Available" },
  ];

  return (
    <div className="bg-gradient-to-br from-primary-900 to-primary-700 py-16 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-24">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl md:text-[48px] font-extrabold text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {stat.number}
              </div>
              <div className="text-white/90 text-sm md:text-base font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
