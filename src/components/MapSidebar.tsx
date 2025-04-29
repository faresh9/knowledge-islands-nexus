
import React, { useState } from 'react';
import { KnowledgeGraphData, TopicNode } from '../data/sampleData';
import { getConnectedNodes } from '../utils/graphUtils';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarFooter,
  SidebarProvider
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Book, Search, ArrowLeft } from 'lucide-react';

interface MapSidebarProps {
  data: KnowledgeGraphData;
  onSelectTopic: (topic: TopicNode) => void;
  selectedTopic: TopicNode | null;
  isMobile: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const MapSidebar: React.FC<MapSidebarProps> = ({ 
  data, 
  onSelectTopic, 
  selectedTopic,
  isMobile,
  isOpen,
  onToggle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Get all unique categories
  const categories = Array.from(new Set(data.nodes.map(node => node.category)));

  // Filter nodes based on search query and active category
  const filteredNodes = data.nodes.filter(node => {
    const matchesSearch = searchQuery === '' || 
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = activeCategory === null || node.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // If a topic is selected, get its related topics
  const relatedTopics = selectedTopic ? getConnectedNodes(data, selectedTopic.id) : [];

  return (
    <div className={`map-sidebar-container transition-all duration-300 z-10 ${
      isMobile 
        ? isOpen 
          ? 'translate-x-0 w-full' 
          : '-translate-x-full'
        : 'translate-x-0 w-[280px]'
    }`}>
      <SidebarProvider>
        <Sidebar className="h-full border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <Book className="mr-2" size={20} />
                Knowledge Islands
              </h2>
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={onToggle}>
                  <ArrowLeft size={20} />
                </Button>
              )}
            </div>
            <div className="relative mt-4">
              <Input 
                type="search" 
                placeholder="Search topics..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            {selectedTopic && (
              <SidebarGroup>
                <SidebarGroupLabel className="flex justify-between">
                  <span>Selected Topic</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onSelectTopic(selectedTopic)}
                    className="h-5 text-xs"
                  >
                    Focus
                  </Button>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="p-2">
                    <div className="p-3 rounded-lg bg-muted hover:bg-accent cursor-pointer transition-colors" 
                        onClick={() => onSelectTopic(selectedTopic)}>
                      <div className="font-medium">{selectedTopic.name}</div>
                      <div className="text-xs text-muted-foreground">{selectedTopic.category}</div>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
            
            {selectedTopic && relatedTopics.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Related Topics</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="p-2 space-y-1">
                    {relatedTopics.map(topic => (
                      <div 
                        key={topic.id} 
                        className="p-2 rounded-md hover:bg-accent cursor-pointer transition-colors flex items-center"
                        onClick={() => onSelectTopic(topic)}
                      >
                        <div 
                          className="w-2 h-2 rounded-full mr-2" 
                          style={{ backgroundColor: topic.color || '#4CAF50' }}
                        />
                        <div>
                          <div className="font-medium text-sm">{topic.name}</div>
                          <div className="text-xs text-muted-foreground">{topic.category}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
            
            <SidebarGroup>
              <SidebarGroupLabel>Categories</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="p-2">
                  <div 
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      activeCategory === null ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setActiveCategory(null)}
                  >
                    All Categories
                  </div>
                  {categories.map(category => (
                    <div 
                      key={category} 
                      className={`p-2 rounded-md cursor-pointer transition-colors ${
                        activeCategory === category ? 'bg-accent' : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setActiveCategory(category === activeCategory ? null : category)}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>Browse Topics</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                  {filteredNodes.map(node => (
                    <div 
                      key={node.id} 
                      className={`p-2 rounded-md cursor-pointer transition-colors flex items-center ${
                        selectedTopic?.id === node.id ? 'bg-accent' : 'hover:bg-accent/50'
                      }`}
                      onClick={() => onSelectTopic(node)}
                    >
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: node.color || '#4CAF50' }}
                      />
                      <div className="truncate">{node.name}</div>
                    </div>
                  ))}
                  {filteredNodes.length === 0 && (
                    <div className="text-center p-4 text-muted-foreground">
                      No topics found
                    </div>
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              Knowledge Islands v1.0
              <div className="mt-1">
                An interactive exploration of interconnected knowledge domains
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
};

export default MapSidebar;
