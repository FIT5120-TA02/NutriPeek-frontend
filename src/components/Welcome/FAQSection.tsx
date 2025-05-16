'use client';

import { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  
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
      question: "How do you calculate nutrient gaps and daily intake requirements?",
      answer: "We calculate nutrient targets based on the Australian Health Survey data from the Australian Bureau of Statistics. This comprehensive dataset provides recommended daily intakes tailored to a child's age, gender, and activity level. Our system analyzes the ingredients in your child's meals and compares them against these standards. We classify nutrients as 'missing' if they're below 70% of the recommended intake, 'adequate' if between 70-110%, and 'excess' if above 110%. This helps us provide targeted recommendations to balance your child's nutrition."
    },
    {
      question: "How are the ingredients being recommended to me?",
      answer: (
        <div className="space-y-3">
          <p>Our recommendation system identifies nutritional gaps and suggests foods to balance your child's diet. We offer three different recommendation types:</p>
          
          <div className="mt-3 grid gap-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-1.5 bg-blue-100 rounded-md mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">
                <h4 className="font-semibold text-gray-800">Standard Recommendation</h4>
                <p className="text-gray-600">Shows foods with the highest nutrient content for each deficient nutrient. Ideal for discovering nutrient-dense foods that can address specific nutritional gaps.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 p-1.5 bg-purple-100 rounded-md mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">
                <h4 className="font-semibold text-gray-800">Optimized Recommendation</h4>
                <p className="text-gray-600">Suggests precise food amounts to efficiently fill nutrient gaps. This option provides specific serving sizes (in grams) to meet exact nutritional needs, making meal planning more efficient.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 p-1.5 bg-amber-100 rounded-md mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
              </div>
              <div className="ml-2">
                <h4 className="font-semibold text-gray-800">Seasonal Recommendation</h4>
                <p className="text-gray-600">Highlights foods that are currently in season in your region. Seasonal foods are typically fresher, more nutritious, environmentally friendly, and often more affordable.</p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mt-2">
            You can switch between these recommendation types at any time to find the approach that works best for your family's needs.
          </p>
        </div>
      )
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
    },
    {
      question: "What is the Seasonal Food feature and how does it work?",
      answer: (
        <div className="space-y-2">
          <p>
            The Seasonal Food feature helps you discover and use fresh, local produce that's currently in season in your region of Australia. Here's how it works:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <span className="font-medium">Regional Detection:</span> NutriPeek uses your location (with permission) or lets you manually select your state or territory to determine what's in season.
            </li>
            <li>
              <span className="font-medium">Season-Aware Recommendations:</span> When you use the seasonal recommendation mode, we prioritize foods that are currently at their peak in your area.
            </li>
            <li>
              <span className="font-medium">Pinning Favorites:</span> You can "pin" seasonal foods you love to get notifications when they come into season and recipe suggestions featuring them.
            </li>
          </ul>
          <p className="text-gray-600 mt-2">
            Eating seasonally helps your family get the freshest, most nutritious produce while supporting local Australian agriculture and reducing environmental impact from long-distance food transport.
          </p>
        </div>
      )
    },
    {
      question: "How does the Farmers Market finder help me access fresh local foods?",
      answer: (
        <div className="space-y-2">
          <p>
            Our Farmers Market finder makes it easy to source fresh, locally grown produce directly from producers in your area. This feature:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <span className="font-medium">Maps Nearby Markets:</span> Displays farmers markets near your location with operating hours, location details, and vendor information.
            </li>
            <li>
              <span className="font-medium">Market-to-Meal Planning:</span> Integrates with your nutritional recommendations, suggesting meals you can prepare using ingredients available at your local markets.
            </li>
          </ul>
          <p className="text-gray-600 mt-2">
            By connecting you with local farmers markets, we help your family access the freshest foods while supporting sustainable, local food systems and teaching children about where their food comes from.
          </p>
        </div>
      )
    }
  ];

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkIfMobile();
    
    // Update on resize
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <SectionContainer id="faq" backgroundClasses="bg-green-50/40 backdrop-blur-sm" removeMinHeight={true}>
      <motion.div 
        className="text-center mb-8 md:mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-3 md:mb-4">FAQ</h2>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          Got questions? We've got answers to help you get started with NutriPeek.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="mb-3 md:mb-4 px-4 sm:px-0"
          >
            <div 
              className={`bg-white/80 backdrop-blur-sm rounded-lg shadow-md overflow-hidden border ${openIndex === index ? 'border-green-300' : 'border-white/30'}`}
            >
              <button
                className="w-full px-4 py-3 md:px-6 md:py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span className="font-semibold text-sm sm:text-base text-gray-800">{faq.question}</span>
                {openIndex === index ? (
                  <CaretUp size={18} className="text-green-600 flex-shrink-0" />
                ) : (
                  <CaretDown size={18} className="text-green-600 flex-shrink-0" />
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
                    <div className="px-4 pb-3 md:px-6 md:pb-4 text-gray-600 text-sm sm:text-base">
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
        className="text-center mt-6 md:mt-8 mb-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-gray-700 text-sm sm:text-base">
            Have more questions? <a href="#" className="text-green-600 font-medium hover:underline">Contact us</a>
          </p>
        </div>
      </motion.div>
    </SectionContainer>
  );
}