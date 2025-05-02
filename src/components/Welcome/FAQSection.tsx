'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, CaretUp } from 'phosphor-react';
import SectionContainer from './SectionContainer';

/**
 * FAQ section component
 * Displays common questions and answers in an interactive accordion
 * Helps address potential concerns and provide additional information
 */
export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How does the image recognition feature work?",
      answer: "Simply take a photo of items in your fridge or pantry with your smartphone camera. Our AI-powered image recognition technology identifies the food items and provides nutritional information instantly."
    },
    {
      question: "How does the plate builder feature help my child?",
      answer: "The interactive plate builder helps children learn good eating habits by visually showing what a balanced meal looks like. It makes healthy eating fun and educational, allowing kids to participate in creating their own balanced meals."
    },
    {
      question: "Is NutriPeek's database specific to Australian foods?",
      answer: "Yes, NutriPeek is designed specifically for Australian families and includes a comprehensive database of Australian food products, aligned with Australian dietary guidelines."
    },
    {
      question: "How can NutriPeek help with my morning time constraints?",
      answer: "NutriPeek streamlines the lunch preparation process by quickly identifying what you have available, suggesting balanced meal combinations, and providing time-saving recommendations based on your morning schedule."
    },
    {
      question: "How will the match & learn feature help my child to learn more about food and be interested in them?",
      answer: "The match & learn feature makes food education engaging through interactive games and colorful visuals. Children can discover where foods come from, learn about their nutritional benefits, and complete fun food-matching challenges. This gamified approach nurtures curiosity about healthy eating and helps children develop positive relationships with nutritious foods."
    },
    {
      question: "How are the ingredients being recommended to me?",
      answer: "Our recommendation system identifies nutritional gaps in your meal plan and searches our database for ingredients rich in those missing nutrients. We analyze your current ingredients, determine which food groups need supplementing, and suggest options that provide the highest nutritional value while complementing your existing food items."
    },
    {
      question: "What is METy?",
      answer: "METy (Youth Metabolic Equivalent) is a measurement unit for children's energy expenditure during physical activities. Unlike adult METs, METy values are specially adjusted for children's higher metabolic rates. One METy represents a child's basal metabolic rate, and activities are rated as multiples of this baseline. NutriPeek uses age-appropriate METy values to accurately assess your child's energy needs."
    },
    {
      question: "How is the Physical Activity Level (PAL) calculated?",
      answer: "Your PAL is calculated by tracking your daily activities and their intensity levels. We multiply the time spent on each activity by its corresponding METy value, sum these values, and divide by the total minutes in a day. This gives us an accurate picture of your overall physical activity, which helps determine your energy requirements."
    },
    {
      question: "How is the estimated energy requirement based on PAL calculated?",
      answer: "Your child's estimated energy requirement is calculated by mapping their age, gender, and physical activity level (PAL) to established nutritional guidelines. We use data from the Australian Dietary Guidelines to determine the appropriate energy needs based on these factors. This provides a personalized daily calorie target that supports healthy growth and development while accounting for their unique activity patterns."
    }
  ];

  return (
    <SectionContainer id="faq" backgroundClasses="bg-green-50/40 backdrop-blur-sm">
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-4">FAQ</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Got questions? We've got answers to help you get started with NutriPeek.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="mb-4"
          >
            <div 
              className={`bg-white/80 backdrop-blur-sm rounded-lg shadow-md overflow-hidden border ${openIndex === index ? 'border-green-300' : 'border-white/30'}`}
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span className="font-semibold text-gray-800">{faq.question}</span>
                {openIndex === index ? (
                  <CaretUp size={20} className="text-green-600" />
                ) : (
                  <CaretDown size={20} className="text-green-600" />
                )}
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        <p className="text-gray-700">
          Have more questions? <a href="#" className="text-green-600 font-medium hover:underline">Contact us</a>
        </p>
      </motion.div>
    </SectionContainer>
  );
}