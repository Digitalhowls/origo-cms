import React, { useState } from 'react';
import { Block, BlockType } from '@shared/types';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  X,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GalleryBlockProps {
  block: Block;
  onClick?: () => void;
  isPreview?: boolean;
}

// Definimos la interface GallerySettings para tipos específicos de la galería
// Esto debe estar en sincronía con las propiedades definidas en shared/types.ts
interface GallerySettings {
  style: 'basic' | 'thumbnails' | 'grid' | 'masonry';
  autoplay: boolean;
  autoplaySpeed: number;
  showDots: boolean;
  showArrows: boolean;
  infinite: boolean;
  enableLightbox: boolean;
  enableCaptions: boolean;
  enableFullscreen: boolean;
  aspectRatio: '1:1' | '4:3' | '16:9' | 'auto';
  animation: 'slide' | 'fade' | 'zoom';
  imgFit: 'cover' | 'contain' | 'fill';
}

interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  caption?: string;
  altText?: string;
}

/**
 * Componente de bloque de Galería para el constructor de páginas
 * Permite mostrar múltiples imágenes en diferentes formatos: carrusel, grid, masonry
 */
const GalleryBlock: React.FC<GalleryBlockProps> = ({ block, onClick, isPreview = false }) => {
  // Extraer las configuraciones del bloque
  const defaultSettings: GallerySettings = {
    style: 'basic',
    autoplay: false,
    autoplaySpeed: 3000,
    showDots: true,
    showArrows: true,
    infinite: true,
    enableLightbox: true,
    enableCaptions: true,
    enableFullscreen: false,
    aspectRatio: '16:9',
    animation: 'slide',
    imgFit: 'cover'
  };

  // Extraemos las configuraciones específicas de galería de block.data?.settings
  // y nos aseguramos de convertir cualquier estilo no compatible a uno de los que soportamos
  const rawSettings = block.data?.settings || {};
  // Verificar que el estilo sea uno de los permitidos para la galería
  let galleryStyle: 'basic' | 'grid' | 'thumbnails' | 'masonry' = defaultSettings.style;
  
  // Casting explícito del estilo para asegurar que sea uno de los valores permitidos
  const style = rawSettings.style as string;
  if (style === 'basic' || style === 'grid' || style === 'thumbnails' || style === 'masonry') {
    galleryStyle = style as 'basic' | 'grid' | 'thumbnails' | 'masonry';
  }
  
  // Crear un objeto de configuración compatible con GallerySettings
  const settings: GallerySettings = {
    ...defaultSettings,
    style: galleryStyle,
    autoplay: rawSettings.autoplay ?? defaultSettings.autoplay,
    autoplaySpeed: rawSettings.autoplaySpeed ?? defaultSettings.autoplaySpeed,
    showDots: rawSettings.showDots ?? defaultSettings.showDots,
    showArrows: rawSettings.showArrows ?? defaultSettings.showArrows,
    infinite: rawSettings.infinite ?? defaultSettings.infinite,
    enableLightbox: rawSettings.enableLightbox ?? defaultSettings.enableLightbox,
    enableCaptions: rawSettings.enableCaptions ?? defaultSettings.enableCaptions,
    enableFullscreen: rawSettings.enableFullscreen ?? defaultSettings.enableFullscreen,
    aspectRatio: (rawSettings.aspectRatio as '1:1' | '4:3' | '16:9' | 'auto') ?? defaultSettings.aspectRatio,
    animation: (rawSettings.animation as 'slide' | 'fade' | 'zoom') ?? defaultSettings.animation,
    imgFit: (rawSettings.imgFit as 'cover' | 'contain' | 'fill') ?? defaultSettings.imgFit
  };

  const images: GalleryImage[] = block.data?.images || [];
  const title = block.data?.title || 'Galería de Imágenes';
  const description = block.data?.description || 'Colección de imágenes';

  // Estado para el carrusel
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Navegar a la siguiente/anterior imagen
  const goToNextSlide = () => {
    setCurrentSlide((prev) => 
      settings.infinite 
        ? (prev + 1) % images.length 
        : Math.min(prev + 1, images.length - 1)
    );
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => 
      settings.infinite 
        ? (prev - 1 + images.length) % images.length 
        : Math.max(prev - 1, 0)
    );
  };

  // Iniciar/detener autoplay
  React.useEffect(() => {
    if (settings.autoplay && !isLightboxOpen) {
      const interval = setInterval(() => {
        goToNextSlide();
      }, settings.autoplaySpeed);
      
      return () => clearInterval(interval);
    }
  }, [settings.autoplay, settings.autoplaySpeed, isLightboxOpen, currentSlide]);

  // Abrir/cerrar lightbox
  const openLightbox = (index: number) => {
    if (settings.enableLightbox) {
      setCurrentSlide(index);
      setIsLightboxOpen(true);
    }
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  // Diferentes estilos de renderizado
  const renderBasicSlider = () => (
    <div className="relative overflow-hidden rounded-lg">
      {/* Contenedor del carrusel */}
      <div 
        className="relative w-full h-full"
        style={{
          aspectRatio: settings.aspectRatio === 'auto' ? 'auto' : settings.aspectRatio.replace(':', '/'),
        }}
      >
        {/* Slides */}
        <div 
          className="w-full h-full transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            display: 'flex',
          }}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="min-w-full"
              style={{
                flex: '0 0 100%'
              }}
            >
              <div className="relative w-full h-full">
                <img
                  src={image.url}
                  alt={image.altText || `Imagen ${index + 1}`}
                  className={cn(
                    "w-full h-full cursor-pointer rounded-lg transition-opacity",
                    settings.imgFit === 'cover' ? 'object-cover' : 
                    settings.imgFit === 'contain' ? 'object-contain' : 'object-fill'
                  )}
                  onClick={() => openLightbox(index)}
                />
                {settings.enableCaptions && (image.title || image.caption) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 backdrop-blur-sm">
                    {image.title && <h4 className="text-lg font-medium">{image.title}</h4>}
                    {image.caption && <p className="text-sm">{image.caption}</p>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Flechas de navegación */}
        {settings.showArrows && images.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevSlide();
              }}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                goToNextSlide();
              }}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Indicadores/puntos */}
      {settings.showDots && images.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {images.map((_, index) => (
            <button
              key={`dot-${index}`}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                index === currentSlide ? "bg-primary" : "bg-gray-300"
              )}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderThumbnailSlider = () => (
    <div className="space-y-4">
      {/* Slide principal */}
      <div className="relative overflow-hidden rounded-lg">
        <div 
          className="relative w-full"
          style={{
            aspectRatio: settings.aspectRatio === 'auto' ? 'auto' : settings.aspectRatio.replace(':', '/'),
          }}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                "absolute top-0 left-0 w-full h-full transition-opacity duration-300",
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              <img
                src={image.url}
                alt={image.altText || `Imagen ${index + 1}`}
                className={cn(
                  "w-full h-full rounded-lg",
                  settings.imgFit === 'cover' ? 'object-cover' : 
                  settings.imgFit === 'contain' ? 'object-contain' : 'object-fill'
                )}
                onClick={() => openLightbox(index)}
              />
              {settings.enableCaptions && (image.title || image.caption) && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 backdrop-blur-sm">
                  {image.title && <h4 className="text-lg font-medium">{image.title}</h4>}
                  {image.caption && <p className="text-sm">{image.caption}</p>}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Flechas de navegación */}
        {settings.showArrows && images.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevSlide();
              }}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                goToNextSlide();
              }}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      <div className="flex overflow-x-auto space-x-2 py-2 hide-scrollbar">
        {images.map((image, index) => (
          <div
            key={`thumb-${image.id}`}
            className={cn(
              "flex-shrink-0 cursor-pointer rounded overflow-hidden transition-all",
              index === currentSlide ? "ring-2 ring-primary" : "ring-1 ring-gray-200 opacity-70"
            )}
            style={{ width: '80px', height: '60px' }}
            onClick={() => setCurrentSlide(index)}
          >
            <img
              src={image.thumbnailUrl || image.url}
              alt={`Miniatura ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="relative group cursor-pointer overflow-hidden rounded-lg"
          onClick={() => openLightbox(index)}
        >
          <div className="aspect-square relative">
            <img
              src={image.url}
              alt={image.altText || `Imagen ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            {settings.enableCaptions && (image.title || image.caption) && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                {image.title && <h4 className="text-sm font-medium truncate">{image.title}</h4>}
                {image.caption && <p className="text-xs truncate">{image.caption}</p>}
              </div>
            )}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Maximize className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMasonry = () => (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="relative break-inside-avoid group cursor-pointer overflow-hidden rounded-lg"
          onClick={() => openLightbox(index)}
        >
          <img
            src={image.url}
            alt={image.altText || `Imagen ${index + 1}`}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
          {settings.enableCaptions && (image.title || image.caption) && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              {image.title && <h4 className="text-sm font-medium truncate">{image.title}</h4>}
              {image.caption && <p className="text-xs truncate">{image.caption}</p>}
            </div>
          )}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Maximize className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        </div>
      ))}
    </div>
  );

  // Lightbox
  const renderLightbox = () => {
    if (!isLightboxOpen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center" onClick={closeLightbox}>
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          {/* Botón para cerrar */}
          <button
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full z-10"
            onClick={closeLightbox}
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Imagen actual */}
          <div className="relative max-w-full max-h-[80vh] flex items-center justify-center">
            <img
              src={images[currentSlide]?.url}
              alt={images[currentSlide]?.altText || `Imagen ${currentSlide + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Información de la imagen */}
          {settings.enableCaptions && (images[currentSlide]?.title || images[currentSlide]?.caption) && (
            <div className="text-white text-center mt-4 max-w-2xl">
              {images[currentSlide]?.title && (
                <h3 className="text-xl font-semibold">{images[currentSlide].title}</h3>
              )}
              {images[currentSlide]?.caption && (
                <p className="text-sm mt-1">{images[currentSlide].caption}</p>
              )}
            </div>
          )}

          {/* Controles de navegación */}
          <div className="absolute inset-x-0 bottom-8 flex justify-center space-x-4">
            <button
              className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevSlide();
              }}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="text-white">
              {currentSlide + 1} / {images.length}
            </div>
            <button
              className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              onClick={(e) => {
                e.stopPropagation();
                goToNextSlide();
              }}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Renderizado de la galería según el estilo seleccionado
  const renderGallery = () => {
    switch (settings.style) {
      case 'thumbnails':
        return renderThumbnailSlider();
      case 'grid':
        return renderGrid();
      case 'masonry':
        return renderMasonry();
      case 'basic':
      default:
        return renderBasicSlider();
    }
  };

  // Mensaje si no hay imágenes
  if (images.length === 0) {
    return (
      <div 
        className={cn(
          "bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center",
          isPreview ? "" : "cursor-pointer hover:border-gray-400"
        )}
        onClick={!isPreview ? onClick : undefined}
      >
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-gray-500 mt-2">{description}</p>
        <p className="text-gray-400 mt-4">No hay imágenes en esta galería</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "gallery-block rounded-lg overflow-hidden",
        isPreview ? "" : "cursor-pointer hover:ring-2 hover:ring-gray-200"
      )}
      onClick={!isPreview ? onClick : undefined}
    >
      {/* Header con título y descripción */}
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-xl font-semibold text-gray-800">{title}</h3>}
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>
      )}

      {/* Galería */}
      {renderGallery()}

      {/* Lightbox */}
      {renderLightbox()}
    </div>
  );
};

export default GalleryBlock;