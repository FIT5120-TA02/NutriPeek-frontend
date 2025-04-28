'use client';

import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { Database, ArrowSquareOut } from 'phosphor-react';
import SectionContainer from './SectionContainer';

/**
 * Tools & Integration section component
 * Highlights the data sources and integrations that power NutriPeek
 * Builds trust by showing reliable sources of information
 */
export default function ToolsIntegrationSection() {
  const integrations = [
    {
      name: "Australian Guide to Healthy Eating",
      description: "Recommendations aligned with the Australian Dietary Guidelines",
      icon: <Database size={32} className="text-green-600" />,
      link: "https://www.eatforhealth.gov.au/"
    },
    {
      name: "FoodData Central",
      description: "Comprehensive nutritional information database",
      icon: <Database size={32} className="text-blue-600" />,
      link: "https://fdc.nal.usda.gov/"
    },
    {
      name: "Australian Food Composition Database",
      description: "Detailed nutritional data for Australian foods",
      icon: <Database size={32} className="text-orange-600" />,
      link: "https://www.foodstandards.gov.au/science/monitoringnutrients/afcd/"
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
        <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-4">Tools & Integrations</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          NutriPeek leverages reliable data sources to provide accurate and trusted nutritional information.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {integrations.map((integration, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <Card className="h-full bg-gray-50/80 backdrop-blur-sm hover:bg-green-50/60 transition-colors border border-white/20">
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-4">
                  {integration.icon}
                  <h3 className="text-lg font-bold ml-3 text-gray-800">{integration.name}</h3>
                </div>
                <p className="text-gray-600 mb-4 flex-grow">{integration.description}</p>
                <a 
                  href={integration.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 font-medium flex items-center hover:text-green-700 transition-colors"
                >
                  Learn more
                  <ArrowSquareOut size={18} className="ml-1" />
                </a>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="max-w-4xl mx-auto mt-16 bg-green-50/70 backdrop-blur-sm p-8 rounded-xl border border-white/30"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <h3 className="text-xl font-bold text-green-700 mb-4 text-center">Powered by Reliable Data</h3>
        <p className="text-gray-700 text-center">
          We combine multiple trusted sources to ensure our nutritional recommendations are accurate, 
          up-to-date, and specific to Australian dietary guidelines and food products.
        </p>
      </motion.div>
    </SectionContainer>
  );
}