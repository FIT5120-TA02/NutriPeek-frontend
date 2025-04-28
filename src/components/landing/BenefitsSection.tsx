'use client';

import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { Clock, Brain, ShieldCheck } from 'phosphor-react';
import SectionContainer from './SectionContainer';

/**
 * Benefits section component
 * Showcases the key benefits users get from using NutriPeek
 * Uses icons and cards to emphasize the value proposition
 */
export default function BenefitsSection() {
  const benefits = [
    {
      title: "Save Time",
      description: "Quickly decide what to include in your child's lunchbox using what you already have at home.",
      icon: <Clock size={48} weight="duotone" className="text-blue-500" />,
    },
    {
      title: "Better Decisions",
      description: "Make informed nutritional choices that support your child's development and learning.",
      icon: <Brain size={48} weight="duotone" className="text-purple-500" />,
    },
    {
      title: "Peace of Mind",
      description: "Ensure lunch boxes meet dietary restrictions and nutritional requirements with confidence.",
      icon: <ShieldCheck size={48} weight="duotone" className="text-green-500" />,
    }
  ];

  return (
    <SectionContainer>
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-4">What You Get</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          NutriPeek provides tangible benefits to help you navigate the daily challenge of preparing healthy school lunches.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="flex h-full"
          >
            <Card className="h-full bg-white/80 backdrop-blur-sm hover:shadow-xl border border-white/20">
              <div className="flex flex-col items-center text-center h-full">
                <div className="mb-6 p-4 rounded-full bg-green-50/60">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.6 }}
      >
        <p className="text-lg text-green-700 font-medium italic">
          "NutriPeek makes healthy lunch preparation quick, easy and informative."
        </p>
      </motion.div>
    </SectionContainer>
  );
}