'use client';





export function StatsBanner() {


  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary-600 via-primary-700 to-primary-800" />

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0v30M0 15h30' stroke='%23fff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`
      }} />

      {/* Content */}
      {/* <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} {...stat} />
          ))}
        </div>
      </div> */}
    </section>
  );
}
