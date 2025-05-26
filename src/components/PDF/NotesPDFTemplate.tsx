/**
 * Notes PDF Template
 * 
 * React-PDF template component for generating nutrition note PDFs.
 * Creates a professional, well-formatted document with the app's design theme.
 * 
 * @author NutriPeek Team
 * @version 1.0.0
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import nutriPeekLogo from '@/../public/nutripeek.png';
import { PDFTemplateProps } from '@/types/pdf';

// Define styles using the app's color scheme
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#10B981', // Green-500
  },
  
  headerContent: {
    flex: 1,
  },
  
  logo: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#065F46', // Green-800
    marginBottom: 5,
  },
  
  subtitle: {
    fontSize: 12,
    color: '#6B7280', // Gray-500
    marginBottom: 10,
  },
  
  // Child info styles
  childInfo: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4', // Green-50
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  
  childDetails: {
    flex: 1,
  },
  
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46', // Green-800
    marginBottom: 2,
  },
  
  childMeta: {
    fontSize: 10,
    color: '#6B7280', // Gray-500
  },
  
  // Score section styles
  scoreSection: {
    backgroundColor: '#F9FAFB', // Gray-50
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Gray-200
  },
  
  scoreHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151', // Gray-700
    marginBottom: 10,
  },
  
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 10,
  },
  
  scoreLabel: {
    fontSize: 12,
    color: '#6B7280', // Gray-500
  },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  
  statLabel: {
    fontSize: 10,
    color: '#6B7280', // Gray-500
  },
  
  // Section styles
  section: {
    marginBottom: 20,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151', // Gray-700
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB', // Gray-300
  },
  
  // Food items styles
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  foodItem: {
    backgroundColor: '#F3F4F6', // Gray-100
    padding: 8,
    borderRadius: 6,
    marginBottom: 5,
    minWidth: '45%',
    maxWidth: '48%',
  },
  
  foodItemRecommended: {
    backgroundColor: '#ECFDF5', // Green-50
    borderWidth: 1,
    borderColor: '#D1FAE5', // Green-100
  },
  
  foodName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151', // Gray-700
    marginBottom: 2,
  },
  
  foodCategory: {
    fontSize: 9,
    color: '#6B7280', // Gray-500
  },
  
  // Nutrient table styles
  nutrientTable: {
    marginBottom: 10,
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6', // Gray-100
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB', // Gray-300
  },
  
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB', // Gray-200
    minHeight: 20,
  },
  
  tableCell: {
    flex: 1,
    fontSize: 10,
    paddingRight: 4,
  },
  
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151', // Gray-700
    paddingRight: 4,
  },
  
  // Status indicators
  statusAdequate: {
    color: '#059669', // Green-600
  },
  
  statusDeficient: {
    color: '#DC2626', // Red-600
  },
  
  statusExcess: {
    color: '#D97706', // Amber-600
  },
  
  // Activity section
  activityGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  
  activityItem: {
    backgroundColor: '#FEF3C7', // Amber-100
    padding: 10,
    borderRadius: 6,
    flex: 1,
  },
  
  activityLabel: {
    fontSize: 10,
    color: '#92400E', // Amber-800
    marginBottom: 2,
  },
  
  activityValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E', // Amber-800
  },
  
  // Recommendations styles - Fixed overlapping text
  recommendationSection: {
    marginBottom: 15,
  },
  
  recommendationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  
  recommendationText: {
    fontSize: 11,
    lineHeight: 1.4,
    color: '#374151',
    marginBottom: 5,
  },
  
  recommendationList: {
    paddingLeft: 10,
  },
  
  recommendationItem: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 3,
    lineHeight: 1.3,
  },
  
  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // Gray-200
  },
  
  footerText: {
    fontSize: 8,
    color: '#9CA3AF', // Gray-400
  },
  
  // Page break utilities
  pageBreak: {
    pageBreakBefore: 'always',
  },
  
  // Utility styles
  row: {
    flexDirection: 'row',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  mb5: {
    marginBottom: 5,
  },
  
  mb10: {
    marginBottom: 10,
  },
  
  mb15: {
    marginBottom: 15,
  },
});

/**
 * Main PDF template component
 */
export const NotesPDFTemplate: React.FC<PDFTemplateProps> = ({ data, options }) => {
  const {
    includeNutrientDetails = true,
    includeFoodItems = true,
    includeActivityInfo = true,
    includeRecommendations = true,
    customTitle,
    includeBranding = true,
  } = options;

  // Helper function to get score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#059669'; // Green-600
    if (score >= 60) return '#D97706'; // Amber-600
    return '#DC2626'; // Red-600
  };

  // Helper function to format percentage
  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  // Split nutrients into chunks for better pagination
  const nutrientChunks = data.nutrients.reduce((chunks: any[][], nutrient, index) => {
    const chunkIndex = Math.floor(index / 12); // 12 nutrients per chunk
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = [];
    }
    chunks[chunkIndex].push(nutrient);
    return chunks;
  }, []);

  return (
    <Document>
      {/* First Page */}
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            style={styles.logo}
            src={nutriPeekLogo.src}
          />
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              {customTitle || 'Nutrition Report'}
            </Text>
            <Text style={styles.subtitle}>
              Generated on {data.formattedDate} • NutriPeek
            </Text>
          </View>
        </View>

        {/* Child Information */}
        <View style={styles.childInfo}>
          <View style={styles.childDetails}>
            <Text style={styles.childName}>{data.child.name}</Text>
            <Text style={styles.childMeta}>
              {data.child.gender} • {data.child.age ? `Age: ${data.child.age}` : 'Age not specified'}
            </Text>
          </View>
        </View>

        {/* Nutritional Score */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreHeader}>Nutritional Score</Text>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreValue, { color: getScoreColor(data.nutrition.score) }]}>
              {data.nutrition.score}
            </Text>
            <Text style={styles.scoreLabel}>out of 100</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#2563EB' }]}>
                {Math.round(data.nutrition.totalCalories)} kJ
              </Text>
              <Text style={styles.statLabel}>Total Calories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#DC2626' }]}>
                {data.nutrition.missingCount}
              </Text>
              <Text style={styles.statLabel}>Missing Nutrients</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#D97706' }]}>
                {data.nutrition.excessCount}
              </Text>
              <Text style={styles.statLabel}>Excess Nutrients</Text>
            </View>
          </View>
        </View>

        {/* Food Items */}
        {includeFoodItems && (data.foods.original.length > 0 || data.foods.additional.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Food Items</Text>
            
            {data.foods.original.length > 0 && (
              <View style={styles.mb15}>
                <Text style={[styles.sectionTitle, { fontSize: 12, marginBottom: 8 }]}>
                  Selected Foods
                </Text>
                <View style={styles.foodGrid}>
                  {data.foods.original.map((food, index) => (
                    <View key={index} style={styles.foodItem}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodCategory}>{food.category}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {data.foods.additional.length > 0 && (
              <View style={styles.mb15}>
                <Text style={[styles.sectionTitle, { fontSize: 12, marginBottom: 8 }]}>
                  Added Recommendations
                </Text>
                <View style={styles.foodGrid}>
                  {data.foods.additional.map((food, index) => (
                    <View key={index} style={[styles.foodItem, styles.foodItemRecommended]}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodCategory}>{food.category}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Activity Information */}
        {includeActivityInfo && data.activity && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity & Energy</Text>
            <View style={styles.activityGrid}>
              {data.activity.pal && (
                <View style={styles.activityItem}>
                  <Text style={styles.activityLabel}>Activity Level (PAL)</Text>
                  <Text style={styles.activityValue}>{data.activity.pal.toFixed(2)}</Text>
                </View>
              )}
              {data.activity.energyRequirement && (
                <View style={styles.activityItem}>
                  <Text style={styles.activityLabel}>Daily Energy Needs</Text>
                  <Text style={styles.activityValue}>
                    {Math.round(data.activity.energyRequirement)} kJ
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Recommendations - Fixed overlapping text */}
        {includeRecommendations && (data.gaps.missing.length > 0 || data.gaps.excess.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            
            {data.gaps.missing.length > 0 && (
              <View style={styles.recommendationSection}>
                <Text style={[styles.recommendationTitle, { color: '#DC2626' }]}>
                  Nutrients to Increase:
                </Text>
                <View style={styles.recommendationList}>
                  {data.gaps.missing.map((nutrient, index) => (
                    <Text key={index} style={styles.recommendationItem}>
                      • {nutrient}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            
            {data.gaps.excess.length > 0 && (
              <View style={styles.recommendationSection}>
                <Text style={[styles.recommendationTitle, { color: '#D97706' }]}>
                  Nutrients to Reduce:
                </Text>
                <View style={styles.recommendationList}>
                  {data.gaps.excess.map((nutrient, index) => (
                    <Text key={index} style={styles.recommendationItem}>
                      • {nutrient}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        {includeBranding && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Generated by NutriPeek • Nutrition Analysis for Children
            </Text>
            <Text style={styles.footerText}>
              Report ID: {data.id} • {data.formattedDate}
            </Text>
          </View>
        )}
      </Page>

      {/* Detailed Nutrient Information - New Page */}
      {includeNutrientDetails && data.nutrients.length > 0 && (
        <Page size="A4" style={styles.page}>
          {/* Header with Logo */}
          <View style={styles.header}>
            <Image
              style={styles.logo}
              src={nutriPeekLogo.src}
            />
            <View style={styles.headerContent}>
              <Text style={styles.title}>Nutrient Analysis</Text>
              <Text style={styles.subtitle}>
                Detailed breakdown of nutritional intake
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.nutrientTable}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, { flex: 2 }]}>Nutrient</Text>
                <Text style={[styles.tableCellHeader, { flex: 1 }]}>Current</Text>
                <Text style={[styles.tableCellHeader, { flex: 1 }]}>Recommended</Text>
                <Text style={[styles.tableCellHeader, { flex: 1 }]}>% Met</Text>
                <Text style={[styles.tableCellHeader, { flex: 1 }]}>Status</Text>
              </View>
              
              {/* Table Rows - Show all nutrients */}
              {data.nutrients.map((nutrient, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{nutrient.name}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {nutrient.currentIntake.toFixed(1)} {nutrient.unit}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {nutrient.recommendedIntake.toFixed(1)} {nutrient.unit}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {formatPercentage(nutrient.percentage)}
                  </Text>
                  <Text style={[
                    styles.tableCell, 
                    { flex: 1 },
                    nutrient.status === 'adequate' ? styles.statusAdequate :
                    nutrient.status === 'deficient' ? styles.statusDeficient :
                    styles.statusExcess
                  ]}>
                    {nutrient.status.charAt(0).toUpperCase() + nutrient.status.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Footer */}
          {includeBranding && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Generated by NutriPeek • Nutrition Analysis for Children
              </Text>
              <Text style={styles.footerText}>
                Report ID: {data.id} • {data.formattedDate}
              </Text>
            </View>
          )}
        </Page>
      )}
    </Document>
  );
}; 