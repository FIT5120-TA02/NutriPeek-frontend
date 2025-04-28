'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { Camera, Hamburger, ChartPie, Heart } from 'phosphor-react';
import SectionContainer from './SectionContainer';

/**
 * Features section component
 * Displays the key features of NutriPeek in a visually appealing grid
 * Designed to highlight the main capabilities of the app
 */
export default function FeatureSection() {
  const features = [
    {
      title: "Image Recognition",
      description: "Instantly identify food items in your fridge with our smart AI image recognition.",
      icon: <Camera size={48} weight="duotone" className="text-green-500" />,
      color: "bg-green-50/70"
    },
    {
      title: "Interactive Plate Builder",
      description: "Create balanced meals with our interactive plate builder that teaches good eating habits.",
      icon: <Hamburger size={48} weight="duotone" className="text-orange-500" />,
      color: "bg-orange-50/70"
    },
    {
      title: "Nutritional Analysis",
      description: "Get instant nutritional insights for better meal planning for your children.",
      icon: <ChartPie size={48} weight="duotone" className="text-blue-500" />,
      color: "bg-blue-50/70"
    },
    {
      title: "Dietary Preferences",
      description: "Tailor recommendations based on allergies and dietary preferences.",
      icon: <Heart size={48} weight="duotone" className="text-red-500" />,
      color: "bg-red-50/70"
    }
  ];

  return (
    <SectionContainer id="features">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-4">Features You'll Love</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover how NutriPeek helps you create healthier lunch boxes for your children with these powerful features.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={`h-full backdrop-blur-sm ${feature.color} border border-white/20 hover:border-green-200 hover:translate-y-[-5px]`}>
              <div className="flex flex-col items-center text-center h-full">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}