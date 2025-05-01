/**
 * Activity intensity levels
 * - low: Activities that require minimal physical effort
 * - medium: Activities that require moderate physical effort
 * - high: Activities that require significant physical effort
 */
export type ActivityIntensity = 'low' | 'medium' | 'high';

/**
 * Activity data structure
 */
export interface Activity {
  name: string;
  description: string;
  intensity: ActivityIntensity;
  category: string;
  color?: string;
}

/**
 * Maps activity names to their intensity level
 * This is used to determine the visual appearance of activity blocks
 */
export const activityIntensityMap: Record<string, ActivityIntensity> = {
  // Sedentary activities
  'Sleeping': 'low',
  'Sitting (watching TV, reading)': 'low',
  'Light office work': 'low',
  'Standing quietly': 'low',
  'Playing video games': 'low',
  'Using computer': 'low',
  'Watching Tv/Dvd - Lying': 'low',
  'Watching Tv/Dvd - Sitting': 'low',
  'Watching Tv/Dvd - Standing': 'low',
  'Computer Work': 'low',
  'Computer Games (Compilation Of Games)': 'low',
  'Video Games (Compilation Of Games)': 'low',
  'Quietly Lying': 'low',
  'Quietly Sitting': 'low',
  'Reading': 'low',
  'Reading A Book And Listening To Music': 'low',
  'Listening To Radio': 'low',
  'Listening To Story': 'low',
  'Board Games': 'low',
  'Writing': 'low',
  'Talking With Friend': 'low',
  'Standing': 'low',
  'Coloring, Reading Writing, Internet': 'low',
  'Puzzles': 'low',
  'Playing Quietly': 'low',
  'Playing With Toys (Cards, Puzzles, Cars, Trains)': 'low',
  'Giving A Speech': 'low',
  'Schoolwork': 'low',
  
  // Light activities
  'Walking, slow pace': 'low',
  'Light household chores': 'low',
  'Playing musical instrument': 'low',
  'Light play': 'low',
  'Art activities': 'low',
  'Arts And Crafts': 'low',
  'Drawing, Coloring - Standing': 'low',
  'Playing With Bricks': 'low',
  'Playing Stringed Instrument': 'low',
  'Sewing': 'low',
  'Singing': 'low',
  'Singing - Standing': 'low',
  'Carpentry': 'low',
  'Setting The Table': 'low',
  'Dressing And Undressing': 'low',
  'Dusting': 'low',
  'Dusting And Sweeping': 'low',
  'Light Activity': 'low', 
  'Walk 0.5': 'low',
  'Walk 1.0': 'low',
  'Walk 1.5': 'low',
  'Walk 2.0': 'low',
  'Walk Self-Paced Casual': 'low',
  'Washing The Dishes': 'low',
  'Laundry': 'low',
  'Bedmaking': 'low',
  'Housework': 'low',
  'Hanging Out Washing': 'low',
  'Arcade Games - Table Football': 'low',
  'Video Games - Bowling': 'low',
  'Video Games - Driving Simulator': 'low',
  'Video Games - Gameboy': 'low',
  'Video Games - Gamepad': 'low',
  'Video Games - Mobile Phone': 'low',
  'Video Games - Nintendo': 'low',
  'Video Games - Ps2': 'low',
  'Video Games - Ps3': 'low',
  'Video Games - Standing': 'low',
  'Video Games - Xbox360': 'low',
  'Arcade Video Game - Driving Simulation': 'low',
  'Board Games - Standing': 'low',
  'Stacking Cups': 'low',
  
  // Moderate activities
  'Walking, moderate pace': 'medium',
  'Bicycling, light effort': 'medium',
  'Dancing, moderate': 'medium',
  'Gymnastics': 'medium',
  'Active play': 'medium',
  'Yard work': 'medium',
  'Walking the dog': 'medium',
  'Walk 2.5': 'medium',
  'Walk 3.0': 'medium',
  'Walk 3.5': 'medium',
  'Walk Self-Paced Brisk': 'medium',
  'Jog - Slow': 'medium',
  'Jog Self-Paced': 'medium',
  'Bowling - Game': 'medium',
  'Golf - Game (Mini Golf)': 'medium',
  'Table Tennis': 'medium',
  'Riding A Bike - Slow Speed': 'medium',
  'Riding A Bike - Medium Speed': 'medium',
  'Riding A Mini - Scooter': 'medium',
  'Riding Scooter': 'medium',
  'Active Classroom Instruction': 'medium',
  'Miscellaneous Games - Moderate  (E.G.,  Simon\'S Spotlight)': 'medium',
  'Sweeping': 'medium',
  'Vacuuming': 'medium',
  'Aerobic Dance/Dance': 'medium',
  'Hopscotch': 'medium', 
  'Catch/Throw Ball': 'medium',
  'Playing Tag - Moderate': 'medium',
  'Obstacle/Locomotor Course - Moderate': 'medium',
  'Freeze/Zone Tag (Moderate Intensity)': 'medium',
  'Stair Walking - Ascending': 'medium',
  'Stair Walking - Descending': 'medium',
  'Stair Walking - Ascending/Descending': 'medium',
  'Stair Walking - Ascending 80 Steps/Min': 'medium',
  'Loading/Unloading Boxes': 'medium',
  'Hiking': 'medium',
  'Calisthenics - Light': 'medium',
  'Step Board': 'medium',
  'Stepping - Height 30%-50% Leg Length': 'medium',
  'Strength Exercises - Curl-Ups': 'medium',
  'Strength Exercises - Push-Ups': 'medium',
  'Juggling': 'medium',
  'Trampoline': 'medium',
  'Broadcast Calisthenics - \'Colourful Sunshine\'': 'medium',
  'Broadcast Calisthenics - \'Flourishing Youth\'': 'medium',
  'Broadcast Calisthenics - \'Flying Ideal\'': 'medium',
  'Broadcast Calisthenics - \'Hopeful Sail\'': 'medium',
  'Radio Gymnastics': 'medium',
  'Active Video Games (Compilation Of Games)': 'medium',
  'Active Video Games - Bowling': 'medium',
  'Active Video Games - Dance': 'medium',
  'Active Video Games - Driving Simulator': 'medium',
  'Active Video Games - Golf': 'medium',
  'Active Video Games - Balance': 'medium',
  'Active Video Games - Lightspace': 'medium',
  'Active Video Games - Step': 'medium',
  'Active Video Games - Yoga': 'medium',
  'Active Video Games - Wii (Compilation Of Games)': 'medium',
  'Active Video Games - Wii Balance': 'medium',
  'Active Video Games - Wii Golf': 'medium',
  'Active Video Games - Wii Step': 'medium',
  'Active Video Games - Wii Yoga': 'medium',
  'Active Video Games - Xavix': 'medium',
  'Arcade Video Game - Air Hockey': 'medium',
  'Arcade Video Game - Horse Riding Simulation': 'medium',
  'Arcade Video Game - Shooting Hoops': 'medium',
  
  // Vigorous activities
  'Running': 'high',
  'Swimming': 'high',
  'Tennis': 'high',
  'Basketball': 'high',
  'Soccer': 'high',
  'Football': 'high',
  'Martial arts': 'high',
  'Bicycling, vigorous': 'high',
  'Jumping rope': 'high',
  'Circuit training': 'high',
  'Walk 4.0': 'high',
  'Run 3.0': 'high',
  'Run 3.5': 'high',
  'Run 4.0': 'high',
  'Run 4.5': 'high',
  'Run 5.0': 'high',
  'Run 5.5': 'high',
  'Run 6.0': 'high',
  'Run 6.5': 'high',
  'Run 7.0': 'high',
  'Run 7.5': 'high',
  'Run 8.0': 'high',
  'Run Self-Paced': 'high',
  'Jog - Fast': 'high',
  'Basketball - Game': 'high',
  'Basketball Game (Mini Basketball)': 'high',
  'Basketball - Shooting And Retrieving A Basketball, Continuously, Without Stopping': 'high',
  'Soccer - Game': 'high',
  'Soccer - Around Cones': 'high',
  'Handball': 'high',
  'Hockey - Game (Mini Floor Hockey)': 'high',
  'Jump Rope': 'high',
  'Jumping Jacks': 'high',
  'Kickball, Continuous Movement': 'high',
  'Volleyball': 'high',
  'Tennis Practice And Games': 'high',
  'Ultimate Frisbbe': 'high',
  'Swimming - 200M': 'high',
  'Swimming - Front Crawl 0.9 M.Sec': 'high',
  'Swimming - Front Crawl 1.0 M.Sec': 'high',
  'Swimming - Front Crawl 1.1 M.Sec': 'high',
  'Swimming - Self-Selected Pace': 'high',
  'Synchronised Swimming': 'high',
  'Boxing - Punching Bag And Gloves': 'high',
  'Riding A Bike - Fast Speed': 'high',
  'Riding A Bike - Self Paced': 'high',
  'Rollerblading': 'high',
  'Skiing': 'high',
  'Shovelling': 'high',
  'Playing Tag-Vigorous': 'high',
  'Relay': 'high',
  'Playing Games (Catch And Throw Balls, Jumping Jacks)': 'high',
  'Free Play (Basketball, Rope, Hoop, Climb, Ladder, Frisbee)': 'high',
  'Obstacle/Locomotor Course - Vigorous': 'high',
  'Miscellaneous Games - Vigorous (E.G.,  Slap The Ball, Builders And Bulldozers, Clean The Room)': 'high',
  'Ball Games - Bouncing, Kicking, Dribbling Ball, Reaction Ball (Moderate Intensity)': 'medium',
  'Ball Games - Bouncing, Kicking, Dribbling Ball, Reaction Ball (Vigorous Intensity)': 'high',
  'Freeze/Zone Tag (Vigorous Intensity)': 'high',
  'Sharks And Minoows': 'high',
  'Dodgeball Type Games (E.G., Castles, Hot Feet)': 'high',
  'Slide Board - 40 Slides/Min': 'high',
  'Slide Board - 50 Slides/Min': 'high',
  'Slide Board - 60 Slides/Min': 'high',
  'Slide Board - 70 Slides/Min': 'high',
  'Slide Board - 80 Slides/Min': 'high',
  'Active Video Games - Action Running': 'high',
  'Active Video Games - Baseball': 'high',
  'Active Video Games - Boxing': 'high',
  'Active Video Games - Catching Targets': 'high',
  'Active Video Games - Hoverboard': 'high',
  'Active Video Games - Kinect Adventure Games And Sports': 'high',
  'Active Video Games - Olympic Games': 'high',
  'Active Video Games - Sportwall': 'high',
  'Active Video Games - Trazer': 'high',
  'Active Video Games - Walking On Treadmill And Bowling': 'medium',
  'Active Video Games - Watching Tv/Dvd - Walking': 'medium',
  'Active Video Games - Wii Aerobics': 'high',
  'Active Video Games - Wii Basketball': 'high',
  'Active Video Games - Wii Boxing/Tennis': 'high',
  'Active Video Games - Wii Hockey': 'high',
  'Active Video Games - Wii Muscle Conditioning': 'high',
  'Active Video Games - Wii Skiing': 'high',
  'Active Video Games - Wii Tennis': 'high',
  'Marching - 75M.Min Instruments': 'high',
  'Marching - 75M.Min No Instruments': 'high',
  'Marching - 91M.Min No Instruments': 'high',
};

/**
 * Activity categories for grouping related activities
 */
export const activityCategories = [
  'Sedentary',
  'Light Activity',
  'Moderate Activity',
  'Vigorous Activity',
  'School',
  'Sports',
  'Household',
  'Recreation'
];

/**
 * Maps activity intensity to color for visual representation
 */
export const intensityColorMap: Record<ActivityIntensity, string> = {
  'low': 'green',
  'medium': 'yellow',
  'high': 'red'
};

/**
 * Groups activities by category for the UI
 * @param activities List of activity names
 * @returns Activities grouped by category with intensity information
 */
export function groupActivitiesByCategory(activities: string[]): Record<string, Activity[]> {
  const result: Record<string, Activity[]> = {};
  
  activities.forEach(name => {
    const intensity = activityIntensityMap[name] || 'medium';
    let category = 'Other';
    
    // Determine category based on activity name
    if (name.toLowerCase().includes('sleep') || 
        name.toLowerCase().includes('quietly') || 
        name.toLowerCase().includes('sitting') ||
        name.toLowerCase().includes('watching tv') ||
        name.toLowerCase().includes('reading') ||
        name.toLowerCase().includes('standing quietly')) {
      category = 'Sedentary';
    } else if (name.toLowerCase().includes('walk') || 
               name.toLowerCase().includes('light') ||
               name.toLowerCase().includes('dusting') ||
               name.toLowerCase().includes('washing') ||
               name.toLowerCase().includes('laundry') ||
               name.toLowerCase().includes('housework') ||
               name.toLowerCase().includes('arts') ||
               name.toLowerCase().includes('craft')) {
      category = 'Light Activity';
    } else if (name.toLowerCase().includes('run') || 
               name.toLowerCase().includes('swimming') || 
               name.toLowerCase().includes('tennis') || 
               name.toLowerCase().includes('basketball') ||
               name.toLowerCase().includes('soccer') ||
               name.toLowerCase().includes('vigorous') ||
               name.toLowerCase().includes('boxing') ||
               name.toLowerCase().includes('jumping')) {
      category = 'Vigorous Activity';
    } else if (name.toLowerCase().includes('school') || 
               name.toLowerCase().includes('homework') || 
               name.toLowerCase().includes('studying') ||
               name.toLowerCase().includes('classroom') ||
               name.toLowerCase().includes('writing') ||
               name.toLowerCase().includes('reading')) {
      category = 'School';
    } else if (name.toLowerCase().includes('soccer') || 
               name.toLowerCase().includes('football') || 
               name.toLowerCase().includes('basketball') || 
               name.toLowerCase().includes('volleyball') ||
               name.toLowerCase().includes('handball') ||
               name.toLowerCase().includes('tennis') ||
               name.toLowerCase().includes('hockey') ||
               name.toLowerCase().includes('skiing') ||
               name.toLowerCase().includes('swimming') ||
               name.toLowerCase().includes('table tennis') ||
               name.toLowerCase().includes('gymnastics')) {
      category = 'Sports';
    } else if (name.toLowerCase().includes('chores') || 
               name.toLowerCase().includes('cleaning') || 
               name.toLowerCase().includes('house') ||
               name.toLowerCase().includes('setting the table') ||
               name.toLowerCase().includes('vacuuming') ||
               name.toLowerCase().includes('dusting') ||
               name.toLowerCase().includes('sweeping') ||
               name.toLowerCase().includes('washing')) {
      category = 'Household';
    } else if (name.toLowerCase().includes('play') || 
               name.toLowerCase().includes('game') || 
               name.toLowerCase().includes('fun') ||
               name.toLowerCase().includes('video') ||
               name.toLowerCase().includes('wii') ||
               name.toLowerCase().includes('xbox') ||
               name.toLowerCase().includes('arcade') ||
               name.toLowerCase().includes('kinect') ||
               name.toLowerCase().includes('active video')) {
      category = 'Recreation';
    } else if (intensity === 'medium') {
      category = 'Moderate Activity';
    }
    
    // Create activity object
    const activity: Activity = {
      name,
      description: getActivityDescription(name, intensity),
      intensity,
      category,
      color: intensityColorMap[intensity]
    };
    
    // Add to result
    if (!result[category]) {
      result[category] = [];
    }
    result[category].push(activity);
  });
  
  return result;
}

/**
 * Generate a description for an activity based on its name and intensity
 */
function getActivityDescription(name: string, intensity: ActivityIntensity): string {
  const intensityDescriptions = {
    'low': 'Very little exertion required, minimal increase in heart rate.',
    'medium': 'Moderate exertion required, noticeable increase in heart rate and breathing.',
    'high': 'Significant exertion required, substantial increase in heart rate and breathing.'
  };
  
  return intensityDescriptions[intensity];
} 