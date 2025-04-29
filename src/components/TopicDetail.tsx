
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TopicNode } from '../data/sampleData';
import { X } from 'lucide-react';

interface TopicDetailProps {
  topic: TopicNode;
  onClose: () => void;
}

const TopicDetail: React.FC<TopicDetailProps> = ({ topic, onClose }) => {
  return (
    <Card className="topic-detail w-full max-w-md border border-primary/20 animate-scale-in">
      <CardHeader className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2 rounded-full"
          onClick={onClose}
        >
          <X size={18} />
        </Button>
        <div 
          className="w-12 h-1.5 mb-4 rounded-full"
          style={{ backgroundColor: topic.color || '#4CAF50' }}
        />
        <CardTitle className="text-2xl">{topic.name}</CardTitle>
        <CardDescription className="flex items-center mt-1">
          <Badge variant="outline" className="mr-2">
            {topic.category}
          </Badge>
          <span className="text-sm">Importance: {topic.importance}/10</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium text-lg">{topic.description}</p>
        <p>{topic.content}</p>
        
        <div>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Related to:</h4>
          <div className="flex flex-wrap gap-2">
            {topic.links.map(linkId => (
              <Badge key={linkId} variant="secondary">
                {linkId.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="default" className="w-full">
          Explore More on Wikipedia
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TopicDetail;
