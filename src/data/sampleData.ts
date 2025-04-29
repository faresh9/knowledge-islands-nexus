
export interface TopicNode {
  id: string;
  name: string;
  category: string;
  size: number; // Relative size of the island
  description: string;
  content: string;
  links: string[]; // IDs of connected topics
  color?: string; // Optional custom color
  importance: number; // 1-10 scale of importance
}

export interface TopicLink {
  source: string;
  target: string;
  strength: number; // 0-1 scale of relationship strength
  description?: string;
}

export interface KnowledgeGraphData {
  nodes: TopicNode[];
  links: TopicLink[];
}

// Sample data structure representing various knowledge domains
export const sampleGraphData: KnowledgeGraphData = {
  nodes: [
    {
      id: "mathematics",
      name: "Mathematics",
      category: "Formal Science",
      size: 100,
      description: "The abstract science of number, quantity, and space",
      content: "Mathematics includes the study of topics such as quantity (number theory), structure (algebra), space (geometry), and change (analysis). It has no generally accepted definition.",
      links: ["physics", "computerScience", "philosophy", "statistics"],
      color: "#4CAF50",
      importance: 10
    },
    {
      id: "physics",
      name: "Physics",
      category: "Natural Science",
      size: 90,
      description: "The study of matter, energy, and the interaction between them",
      content: "Physics is the natural science that studies matter, its motion and behavior through space and time, and the related entities of energy and force.",
      links: ["mathematics", "chemistry", "astronomy", "engineering"],
      color: "#2196F3",
      importance: 9
    },
    {
      id: "biology",
      name: "Biology",
      category: "Natural Science",
      size: 85,
      description: "The study of life and living organisms",
      content: "Biology is the scientific study of life. It is a natural science with a broad scope but has several unifying themes that tie it together as a single, coherent field.",
      links: ["chemistry", "medicine", "ecology", "psychology"],
      color: "#8BC34A",
      importance: 8
    },
    {
      id: "chemistry",
      name: "Chemistry",
      category: "Natural Science",
      size: 80,
      description: "The study of substances and their interactions",
      content: "Chemistry is the scientific study of the properties and behavior of matter. It is a natural science that covers the elements that make up matter to the compounds made of atoms, molecules and ions.",
      links: ["physics", "biology", "materials", "medicine"],
      color: "#FF9800",
      importance: 8
    },
    {
      id: "computerScience",
      name: "Computer Science",
      category: "Formal Science",
      size: 85,
      description: "The study of computation and information processing",
      content: "Computer science is the study of computation, automation, and information. Computer science spans theoretical disciplines to practical disciplines.",
      links: ["mathematics", "engineering", "informationSystems", "artificialIntelligence"],
      color: "#9C27B0",
      importance: 9
    },
    {
      id: "history",
      name: "History",
      category: "Humanities",
      size: 75,
      description: "The study of past events",
      content: "History is the study and the documentation of the past. Events before the invention of writing systems are considered prehistory.",
      links: ["archaeology", "politics", "literature", "geography"],
      color: "#795548",
      importance: 7
    },
    {
      id: "philosophy",
      name: "Philosophy",
      category: "Humanities",
      size: 70,
      description: "The study of fundamental questions about existence, knowledge, values, reason, mind, and language",
      content: "Philosophy is the systematic and critical study of fundamental questions that arise both in everyday life and through the practice of other disciplines.",
      links: ["mathematics", "ethics", "psychology", "religion"],
      color: "#607D8B",
      importance: 8
    },
    {
      id: "literature",
      name: "Literature",
      category: "Arts",
      size: 65,
      description: "Written works, especially those considered of superior or lasting artistic merit",
      content: "Literature broadly refers to any collection of written work, but it is also used more narrowly for writings specifically considered to be an art form.",
      links: ["history", "languages", "philosophy", "psychology"],
      color: "#FF5722",
      importance: 7
    },
    {
      id: "psychology",
      name: "Psychology",
      category: "Social Science",
      size: 75,
      description: "The scientific study of the mind and behavior",
      content: "Psychology is the scientific study of mind and behavior. Psychology includes the study of conscious and unconscious phenomena, including feelings and thoughts.",
      links: ["biology", "medicine", "sociology", "philosophy"],
      color: "#E91E63",
      importance: 8
    },
    {
      id: "economics",
      name: "Economics",
      category: "Social Science",
      size: 70,
      description: "The study of how societies use scarce resources",
      content: "Economics is the social science that studies how people interact with value; in particular, the production, distribution, and consumption of goods and services.",
      links: ["politics", "sociology", "mathematics", "history"],
      color: "#FFEB3B",
      importance: 8
    },
    {
      id: "astronomy",
      name: "Astronomy",
      category: "Natural Science",
      size: 65,
      description: "The study of celestial objects and phenomena",
      content: "Astronomy is a natural science that studies celestial objects and phenomena. Objects of interest include planets, moons, stars, nebulae, galaxies, and comets.",
      links: ["physics", "geography", "mathematics"],
      color: "#673AB7",
      importance: 7
    },
    {
      id: "engineering",
      name: "Engineering",
      category: "Applied Science",
      size: 80,
      description: "The application of scientific knowledge to solve problems",
      content: "Engineering is the use of scientific principles to design and build machines, structures, and other items, including bridges, tunnels, roads, vehicles, and buildings.",
      links: ["physics", "computerScience", "materials", "mathematics"],
      color: "#F44336",
      importance: 9
    },
    {
      id: "medicine",
      name: "Medicine",
      category: "Applied Science",
      size: 85,
      description: "The science and practice of the diagnosis, treatment, and prevention of disease",
      content: "Medicine encompasses a variety of health care practices evolved to maintain and restore health by the prevention and treatment of illness.",
      links: ["biology", "chemistry", "psychology", "publicHealth"],
      color: "#00BCD4",
      importance: 9
    },
    {
      id: "artificialIntelligence",
      name: "Artificial Intelligence",
      category: "Applied Science",
      size: 75,
      description: "The simulation of human intelligence in machines",
      content: "Artificial intelligence is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans.",
      links: ["computerScience", "mathematics", "psychology", "philosophy"],
      color: "#3F51B5",
      importance: 9
    },
    {
      id: "ecology",
      name: "Ecology",
      category: "Natural Science",
      size: 60,
      description: "The study of organisms and their interactions with the environment",
      content: "Ecology is the study of the relationships between living organisms, including humans, and their physical environment.",
      links: ["biology", "geography", "environmentalScience"],
      color: "#4CAF50",
      importance: 7
    }
  ],
  links: [
    { source: "mathematics", target: "physics", strength: 0.9, description: "Mathematical principles underpin physics theories" },
    { source: "mathematics", target: "computerScience", strength: 0.8, description: "Discrete mathematics is fundamental to computer science" },
    { source: "physics", target: "engineering", strength: 0.8, description: "Physics principles are applied in engineering" },
    { source: "biology", target: "medicine", strength: 0.9, description: "Biological understanding enables medical advances" },
    { source: "chemistry", target: "biology", strength: 0.7, description: "Biochemistry connects these fields" },
    { source: "chemistry", target: "physics", strength: 0.6, description: "Chemical reactions are governed by physical laws" },
    { source: "computerScience", target: "artificialIntelligence", strength: 0.9, description: "AI is a subfield of computer science" },
    { source: "mathematics", target: "philosophy", strength: 0.5, description: "Mathematical logic connects to philosophical inquiry" },
    { source: "philosophy", target: "psychology", strength: 0.6, description: "Philosophy of mind relates to psychological theories" },
    { source: "history", target: "literature", strength: 0.7, description: "Historical contexts influence literary works" },
    { source: "physics", target: "astronomy", strength: 0.8, description: "Physics explains astronomical phenomena" },
    { source: "psychology", target: "medicine", strength: 0.6, description: "Understanding of mind affects medical treatments" },
    { source: "economics", target: "politics", strength: 0.7, description: "Economic policies are central to political decisions" },
    { source: "biology", target: "ecology", strength: 0.8, description: "Ecology is a subfield of biology" },
    { source: "computerScience", target: "engineering", strength: 0.7, description: "Software engineering applies computer science principles" },
    { source: "philosophy", target: "ethics", strength: 0.8, description: "Ethics is a branch of philosophy" },
    { source: "philosophy", target: "religion", strength: 0.6, description: "Philosophical inquiry often examines religious concepts" },
    { source: "mathematics", target: "economics", strength: 0.6, description: "Mathematical models are used in economics" }
  ]
};
