'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Link from 'next/link';
import { Database, ArrowSquareOut, FileCsv, Calendar, Shield, Activity, Lightning, CaretRight, Leaf, MapPin } from 'phosphor-react';
import SectionContainer from './SectionContainer';
import MobileCarousel, { CarouselItem } from '../ui/MobileCarousel';

/**
 * Tools & Integration section component
 * Highlights the data sources and integrations that power NutriPeek
 * Builds trust by showing reliable sources of information
 */
export default function ToolsIntegrationSection() {
  const [isMobile, setIsMobile] = useState(false);
  
  const integrations = [
    {
      name: "Food Nutrition Dataset",
      description: "Annual XLS updates • High granularity • CC BY 3.0 AU",
      icon: <FileCsv size={28} weight="duotone" className="text-green-600" />,
      link: "https://www.foodstandards.gov.au/science-data/food-composition-databases/ausnut/ausnut-datafiles"
    },
    {
      name: "Mean Child Nutrition Intake",
      description: "Updated with system upgrades • High granularity • CC BY 4.0", 
      icon: <Database size={28} weight="duotone" className="text-blue-600" />,
      link: "https://www.abs.gov.au/statistics/health/health-conditions-and-risks/australian-health-survey-nutrition-first-results-foods-and-nutrients/latest-release"
    },
    {
      name: "Australia Dietary Guidelines",
      description: "Annual manual XLS updates • High granularity • CC BY 4.0",
      icon: <Calendar size={28} weight="duotone" className="text-orange-600" />,
      link: "https://www.eatforhealth.gov.au/food-essentials/how-much-do-we-need-each-day/recommended-number-serves-children-adolescents-and-toddlers"
    },
    {
      name: "Accuracy Children's Intake",
      description: "Annual manual XLS updates • High granularity • CC BY 4.0",
      icon: <Shield size={28} weight="duotone" className="text-purple-600" />,
      link: "https://www.eatforhealth.gov.au/nutrient-reference-values/nutrients"
    },
    {
      name: "NCCOR Physical Activities",
      description: "Smoothed METy data • Age-based activity metrics • Excel format",
      icon: <Activity size={28} weight="duotone" className="text-pink-600" />,
      link: "https://www.nccor.org/tools-youthcompendium/downloads/"
    },
    {
      name: "Australian Child Energy Requirements",
      description: "Age/gender-based energy needs • MJ/day measurements • Table format",
      icon: <Lightning size={28} weight="duotone" className="text-amber-500" />,
      link: "https://www.eatforhealth.gov.au/nutrient-reference-values/nutrients/dietary-energy"
    },
    {
      name: "Regional Seasonal Foods in Australia",
      description: "CSV format • No regular update schedule • High granularity",
      icon: <Leaf size={28} weight="duotone" className="text-emerald-600" />,
      link: "https://didoesdigital.com/growing/seasonality"
    },
    {
      name: "Regional Farmers Markets",
      description: "Manual XLS creation • Annual updates • High granularity",
      icon: <MapPin size={28} weight="duotone" className="text-red-600" />,
      link: "http://seasonalfoodguide.com/#google_vignette"
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

  // Generate carousel items
  const carouselItems: CarouselItem[] = integrations.map((integration, index) => ({
    key: index,
    content: (
      <Card className="h-full bg-gray-50/80 backdrop-blur-sm border border-white/20">
        <div className="flex flex-col h-full p-4">
          <div className="flex items-start mb-3">
            <div className="p-1.5 bg-white rounded-full shadow-sm mr-3 flex-shrink-0">
              {integration.icon}
            </div>
            <h3 className="text-base font-bold text-gray-800 leading-tight">{integration.name}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3 flex-grow">{integration.description}</p>
          <a 
            href={integration.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-green-600 font-medium flex items-center hover:text-green-700 transition-colors"
          >
            View Source
            <ArrowSquareOut size={14} className="ml-1" />
          </a>
        </div>
      </Card>
    )
  }));

  return (
    <SectionContainer id="tools" removeMinHeight={true}>
      <motion.div 
        className="text-center mb-8 md:mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-3 md:mb-4">Tools & Integrations</h2>
        <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          NutriPeek leverages reliable datasets to provide accurate nutritional information for Australian families.
        </p>
      </motion.div>

      {/* Desktop View - Grid Layout */}
      {!isMobile ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-0">
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full bg-gray-50/80 backdrop-blur-sm hover:bg-green-50/60 transition-all duration-300 border border-white/20">
                <div className="flex flex-col h-full">
                  <div className="flex items-start sm:items-center mb-2 sm:mb-3">
                    <div className="p-1.5 bg-white rounded-full shadow-sm mr-2 sm:mr-3 flex-shrink-0">
                      {integration.icon}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-800 leading-tight">{integration.name}</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 sm:mb-3 flex-grow">{integration.description}</p>
                  <a 
                    href={integration.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 font-medium flex items-center hover:text-green-700 transition-colors"
                  >
                    View Source
                    <ArrowSquareOut size={14} className="ml-1" />
                  </a>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Mobile View - Carousel */
        <div className="md:hidden px-4">
          <MobileCarousel 
            items={carouselItems}
            className="mb-8"
            autoAdvance={true}
            autoAdvanceInterval={4000}
          />
        </div>
      )}

      <motion.div 
        className="max-w-4xl mx-auto mt-8 md:mt-12 bg-green-50/70 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/30"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <h3 className="text-base sm:text-lg font-bold text-green-700 mb-2 sm:mb-3 text-center">Data-Driven Nutritional Guidance</h3>
        <p className="text-xs sm:text-sm text-gray-700 text-center">
          Our nutritional recommendations are powered by high-quality datasets focused on 
          Australian dietary guidelines, regional seasonal foods, and children's nutritional needs, 
          updated regularly to ensure accuracy and relevance.
        </p>
      </motion.div>
    </SectionContainer>
  );
}