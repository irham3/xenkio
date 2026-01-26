'use client';

import { useRef } from 'react';
import { FileText, Users, Wrench, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from '@/components/reactbits/CountUp';

interface StatProps {
  value: number;
  suffix: string;
  label: string;
  icon: LucideIcon;
  delay: number;
}

function AnimatedStat({ value, suffix, label, icon: Icon, delay }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="flex flex-col items-center text-center"
    >
      <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-white/10 backdrop-blur-sm shadow-inner shadow-white/10">
        <Icon className="w-7 h-7 text-white/90" strokeWidth={1.5} />
      </div>
      <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight flex items-center justify-center gap-1">
        <CountUp
          to={value}
          duration={2.5}
          delay={0.2}
          separator=","
          className="tabular-nums"
        />
        <span>{suffix}</span>
      </div>
      <div className="text-base text-white/70 font-medium">{label}</div>
    </motion.div>
  );
}

export function StatsBanner() {
  const stats = [
    {
      value: 2.5,
      suffix: 'B+',
      label: 'Files Processed',
      icon: FileText,
      delay: 0,
    },
    {
      value: 10,
      suffix: 'M+',
      label: 'Monthly Users',
      icon: Users,
      delay: 150,
    },
    {
      value: 130,
      suffix: '+',
      label: 'Tools Available',
      icon: Wrench,
      delay: 300,
    },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary-600 via-primary-700 to-primary-800" />

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 0v30M0 15h30' stroke='%23fff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`
      }} />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
