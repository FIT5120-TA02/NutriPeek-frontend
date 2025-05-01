'use client';

import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { Hamburger, Barbell, GameController } from 'phosphor-react';
import SectionContainer from './SectionContainer';

/**
 * Apply Cases section component
 * Shows who the app is designed for - the target audience
 * Highlights specific use cases for different types of users
 */
export default function ApplyCasesSection() {
  const applyCases = [
    {
      title: "Ingredient-First Meal Planners",
      description: "Supports parents who want to use what's already at home to create healthy, balanced lunches.",
      icon: <Hamburger size={40} weight="duotone" className="text-orange-500" />,
    },
    {
      title: "Activity-Aware Families",
      description: "Supports parents who want meal ideas linked to their child's daily physical activity levels for better energy balance.",
      icon: <Barbell size={40} weight="duotone" className="text-green-500" />,
    },
    {
      title: "Gamified Nutrition Parents",
      description: "For parents who want their children to develop healthy eating behaviors through fun, gamified experiences.",
      icon: <GameController size={40} weight="duotone" className="text-purple-500" />,
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
        <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-4">For Who?</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          NutriPeek is designed specifically for Australian parents of primary school children who want to create healthier lunch boxes.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {applyCases.map((useCase, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index === 0 ? -20 : index === 1 ? 0 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="h-full flex flex-col items-center text-center p-8 bg-white/80 backdrop-blur-sm hover:bg-green-50/60 border border-white/20">
              <div className="bg-white p-4 rounded-full shadow-sm mb-6">
                {useCase.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">{useCase.title}</h3>
              <p className="text-gray-600">{useCase.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="mt-12 bg-green-50/70 backdrop-blur-sm p-8 rounded-xl max-w-4xl mx-auto border border-white/30"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <h3 className="text-xl font-bold text-green-700 mb-4">Did You Know?</h3>
        <p className="text-gray-700">
          Over 50% of Australian parents struggle to make healthy food choices for their children, and 1 in 3 are unsure which foods are best, according to the Royal Children's Hospital. NutriPeek aims to solve this problem.
        </p>
      </motion.div>
    </SectionContainer>
  );
}