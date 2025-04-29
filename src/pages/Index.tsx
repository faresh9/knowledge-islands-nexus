
import React, { useState, useEffect } from 'react';
import KnowledgeMap from '@/components/KnowledgeMap';
import MapSidebar from '@/components/MapSidebar';
import TopicDetail from '@/components/TopicDetail';
import Header from '@/components/Header';
import { sampleGraphData, TopicNode } from '@/data/sampleData';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [selectedTopic, setSelectedTopic] = useState<TopicNode | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 pt-16 h-[calc(100vh-64px)] overflow-hidden">
        <MapSidebar 
          data={sampleGraphData} 
          onSelectTopic={setSelectedTopic} 
          selectedTopic={selectedTopic}
          isMobile={isMobile}
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />
        
        <div className="flex-1 relative knowledge-map w-full h-full overflow-hidden">
          <KnowledgeMap 
            data={sampleGraphData} 
            onSelectTopic={setSelectedTopic} 
            selectedTopic={selectedTopic}
          />
          
          {selectedTopic && (
            <div className="absolute bottom-4 right-4 z-10 animate-fade-in">
              <TopicDetail topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
