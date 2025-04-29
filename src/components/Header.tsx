
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Book } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-primary/20 fixed top-0 left-0 right-0 z-20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="mr-2 md:hidden" 
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </Button>
          <div className="flex items-center space-x-2">
            <Book className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Knowledge Islands</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">About</Button>
          <Button variant="ghost" size="sm">Help</Button>
          <Button variant="default" size="sm">Contribute</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
