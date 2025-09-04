import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({ 
  images, 
  title, 
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter out empty, duplicate, and failed images
  const uniqueImages = images
    .filter((img, index, array) => 
      img && // Remove empty/null images
      img.trim() !== '' && // Remove empty strings
      img !== '/placeholder.svg' && // Remove placeholder
      array.indexOf(img) === index // Remove duplicates (keep first occurrence)
    );
  
  const validImages = uniqueImages.filter((_, index) => !failedImages.has(index));
  const currentValidIndex = Math.min(currentIndex, validImages.length - 1);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const handleImageLoad = (index: number) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleImageError = (index: number) => {
    console.log(`Image ${index + 1} failed to load:`, images[index]);
    setFailedImages(prev => new Set([...prev, index]));
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleImageLoadStart = (index: number) => {
    setLoadingImages(prev => new Set([...prev, index]));
  };

  if (validImages.length === 0) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center h-[400px] ${className}`}>
        <div className="text-center">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Keine Bilder verfügbar</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Image */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <div className="relative h-[400px] rounded-lg overflow-hidden bg-muted cursor-pointer group">
            {validImages.length > 0 && (
              <>
                <img
                  src={validImages[currentValidIndex]}
                  alt={`${title} - Bild ${currentValidIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                  onLoadStart={() => handleImageLoadStart(currentValidIndex)}
                  onLoad={() => handleImageLoad(currentValidIndex)}
                  onError={() => handleImageError(currentValidIndex)}
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/90 text-black px-4 py-2 rounded-lg text-sm font-medium">
                    Klicken für Vollbild
                  </div>
                </div>
            
                {loadingImages.has(currentValidIndex) && (
                  <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </>
            )}

            {/* Navigation Buttons */}
            {validImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            {validImages.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-10">
                {currentValidIndex + 1} / {validImages.length}
              </div>
            )}
          </div>
        </DialogTrigger>

        {/* Full-size Dialog */}
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={validImages[currentValidIndex]}
              alt={`${title} - Bild ${currentValidIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            
            {/* Navigation in fullscreen */}
            {validImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/20"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/20"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image counter in fullscreen */}
            {validImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                {currentValidIndex + 1} / {validImages.length}
              </div>
            )}

            {/* Close button */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white border-white/20"
              onClick={() => setIsDialogOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="mt-4 flex space-x-3 overflow-x-auto pb-2">
          {validImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentValidIndex
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <img
                src={image}
                alt={`${title} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(index)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyImageGallery;