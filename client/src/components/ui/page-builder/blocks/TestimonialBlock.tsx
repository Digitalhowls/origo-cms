import React, { useState, useEffect } from 'react';
import { StyleTransition } from '@/components/ui/transitions/StyleTransition';
import { AnimateCss } from '@/components/ui/transitions/AnimateCss';
import { Block } from '@shared/types';
import { Edit, Quote, Star, ChevronLeft, ChevronRight, MessageSquare, ThumbsUp, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Definir los estilos de diseño disponibles
enum TestimonialLayout {
  GRID = 'grid',
  SLIDER = 'slider',
  MASONRY = 'masonry',
  CARDS = 'cards',
  QUOTES = 'quotes',
  MINIMAL = 'minimal'
}

// Definir los estilos de diseño disponibles para las tarjetas
enum TestimonialCardStyle {
  BASIC = 'basic',
  BORDERED = 'bordered',
  SHADOWED = 'shadowed',
  HIGHLIGHTED = 'highlighted',
  MODERN = 'modern',
  COMPACT = 'compact',
  ELEVATED = 'elevated'
}

// Estructura para el rating
interface Rating {
  value: number;
  maxValue: number;
  showStars?: boolean;
}

// Estructura para los testimonios
interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  company?: string;
  companyLogo?: string;
  date?: string;
  rating?: Rating;
  highlighted?: boolean;
  verified?: boolean;
}

interface TestimonialBlockProps {
  block: Block;
  onClick?: () => void;
}

const TestimonialBlock: React.FC<TestimonialBlockProps> = ({ block, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  // Extraer propiedades del contenido del bloque
  const { 
    title = 'Lo que dicen nuestros clientes', 
    subtitle = 'Testimonios',
    testimonials = [
      {
        id: '1',
        quote: 'El mejor servicio que he experimentado. Totalmente recomendado para cualquier empresa.',
        author: 'Ana García',
        role: 'CEO, Empresa ABC',
        avatar: '',
        company: 'Empresa ABC',
        companyLogo: '',
        date: '15/03/2025',
        rating: { value: 5, maxValue: 5, showStars: true },
        verified: true
      },
      {
        id: '2',
        quote: 'Increíble plataforma, fácil de usar y muy potente. Ha transformado nuestro negocio.',
        author: 'Carlos Rodríguez',
        role: 'Director de Marketing, XYZ Inc',
        avatar: '',
        company: 'XYZ Inc',
        companyLogo: '',
        date: '10/03/2025',
        rating: { value: 4, maxValue: 5, showStars: true },
        verified: true
      },
      {
        id: '3',
        quote: 'Un servicio excepcional con un equipo muy profesional siempre dispuesto a ayudar.',
        author: 'María López',
        role: 'Gerente de Operaciones, Corp 123',
        avatar: '',
        company: 'Corp 123',
        companyLogo: '',
        date: '05/03/2025',
        rating: { value: 5, maxValue: 5, showStars: true },
        highlighted: true,
        verified: true
      }
    ],
    layout = TestimonialLayout.GRID,
    cardStyle = TestimonialCardStyle.BASIC,
    showRatings = true,
    showVerified = true,
    showDates = false,
    animation = 'fade',
    autoplaySpeed = 5000,
    slidesToShow = 1,
    bgColor = '#f9fafb',
    textColor = '#111827',
    accentColor = '#4f46e5',
    borderRadius = '0.5rem',
    shadow = 'md',
    headerAlignment = 'center',
    itemsAlignment = 'center',
    quoteIcon = 'Quote',
    maxItems = 10
  } = block.content || {};

  // Efectos para autoplay de slider
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoplay && layout === TestimonialLayout.SLIDER) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => 
          prev === testimonials.length - 1 ? 0 : prev + 1
        );
      }, autoplaySpeed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoplay, testimonials.length, autoplaySpeed, layout]);

  // Estilos personalizados
  const style = {
    backgroundColor: bgColor,
    color: textColor,
    padding: '2rem 0'
  };

  const handleBlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  const getInitials = (name: string) => {
    if (!name) return 'UN'; // Usuario no definido
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };
  
  // Renderizar estrellas para calificación
  const renderRating = (rating?: Rating) => {
    if (!rating || !showRatings) return null;
    
    return (
      <div className="flex items-center mb-2">
        {rating.showStars && (
          <div className="flex text-yellow-400">
            {Array.from({ length: rating.maxValue }).map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                className={cn(
                  i < rating.value ? "fill-current" : "stroke-current text-gray-300"
                )} 
              />
            ))}
          </div>
        )}
        {!rating.showStars && (
          <span className="text-sm font-medium">
            {rating.value}/{rating.maxValue}
          </span>
        )}
      </div>
    );
  };
  
  // Navegar al slide anterior
  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };
  
  // Navegar al slide siguiente
  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };
  
  // Seleccionar icono según el tipo
  const renderQuoteIcon = () => {
    switch (quoteIcon) {
      case 'MessageSquare':
        return <MessageSquare size={32} className="text-primary" />;
      case 'ThumbsUp':
        return <ThumbsUp size={32} className="text-primary" />;
      case 'Award':
        return <Award size={32} className="text-primary" />;
      case 'Quote':
      default:
        return <Quote size={32} className="text-primary" />;
    }
  };

  return (
    <StyleTransition
      property="transform, border-color, box-shadow, background-color"
      duration="0.3s"
      timingFunction="ease"
      className={`page-builder-block relative mb-6 ${isHovered ? 'border border-dashed border-blue-500 bg-blue-50/20 shadow-md' : ''}`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleBlockClick}
    >
      <AnimateCss 
        animationName={isHovered ? "pulse" : ""}
        duration="0.5s"
      >
        <div className="container mx-auto px-4 py-12">
          {/* Encabezado de sección */}
          <div className={`text-${headerAlignment} mb-12`}>
            <h5 className="text-primary font-medium mb-2">{subtitle}</h5>
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <div className={`w-20 h-1 bg-primary ${headerAlignment === 'center' ? 'mx-auto' : headerAlignment === 'right' ? 'ml-auto' : ''}`}></div>
          </div>

          {/* Testimonios según el layout */}
          {layout === TestimonialLayout.GRID && (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.slice(0, maxItems).map((testimonial: Testimonial) => (
                <Card 
                  key={testimonial.id}
                  className={cn(
                    "overflow-hidden",
                    {
                      "shadow-lg": cardStyle === TestimonialCardStyle.SHADOWED || shadow === 'lg',
                      "shadow-md": cardStyle === TestimonialCardStyle.BASIC || shadow === 'md',
                      "shadow-sm": shadow === 'sm',
                      "shadow-none": shadow === 'none',
                      "border-2 border-primary": testimonial.highlighted,
                      "bg-primary/5": cardStyle === TestimonialCardStyle.HIGHLIGHTED && testimonial.highlighted,
                      "border": cardStyle === TestimonialCardStyle.BORDERED,
                      "rounded-none": borderRadius === '0',
                      "rounded-sm": borderRadius === '0.125rem',
                      "rounded": borderRadius === '0.25rem',
                      "rounded-md": borderRadius === '0.375rem',
                      "rounded-lg": borderRadius === '0.5rem',
                      "rounded-xl": borderRadius === '0.75rem',
                      "rounded-2xl": borderRadius === '1rem',
                    }
                  )}
                >
                  <CardContent className={cn("p-6 flex flex-col", cardStyle === TestimonialCardStyle.COMPACT ? "p-4" : "")}>
                    <div className="mb-4">
                      {renderQuoteIcon()}
                    </div>
                    {renderRating(testimonial.rating)}
                    <p className={cn(
                      "mb-6", 
                      cardStyle === TestimonialCardStyle.MODERN ? "text-lg" : "",
                      "italic text-gray-700"
                    )}>
                      "{testimonial.quote}"
                    </p>
                    <div className={cn(
                      "mt-auto flex", 
                      itemsAlignment === 'center' ? "items-center" : "",
                      cardStyle === TestimonialCardStyle.ELEVATED ? "bg-background p-4 -mx-4 -mb-4 mt-4 border-t" : ""
                    )}>
                      <Avatar className="h-12 w-12 mr-4">
                        {testimonial.avatar ? (
                          <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                        ) : (
                          <AvatarFallback>{getInitials(testimonial.author)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h4 className="font-bold">{testimonial.author}</h4>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                        {testimonial.company && (
                          <p className="text-xs text-gray-400">{testimonial.company}</p>
                        )}
                        {showVerified && testimonial.verified && (
                          <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                            <ThumbsUp size={12} className="mr-1" /> Opinión verificada
                          </p>
                        )}
                      </div>
                      {showDates && testimonial.date && (
                        <span className="text-xs text-gray-400 ml-auto">{testimonial.date}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {layout === TestimonialLayout.MASONRY && (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {testimonials.slice(0, maxItems).map((testimonial: Testimonial) => (
                <Card 
                  key={testimonial.id}
                  className={cn(
                    "mb-6 break-inside-avoid",
                    {
                      "shadow-lg": cardStyle === TestimonialCardStyle.SHADOWED || shadow === 'lg',
                      "shadow-md": cardStyle === TestimonialCardStyle.BASIC || shadow === 'md',
                      "shadow-sm": shadow === 'sm',
                      "shadow-none": shadow === 'none',
                      "border-2 border-primary": testimonial.highlighted,
                      "bg-primary/5": cardStyle === TestimonialCardStyle.HIGHLIGHTED && testimonial.highlighted,
                      "border": cardStyle === TestimonialCardStyle.BORDERED,
                      "rounded-none": borderRadius === '0',
                      "rounded-sm": borderRadius === '0.125rem',
                      "rounded": borderRadius === '0.25rem',
                      "rounded-md": borderRadius === '0.375rem',
                      "rounded-lg": borderRadius === '0.5rem',
                      "rounded-xl": borderRadius === '0.75rem',
                      "rounded-2xl": borderRadius === '1rem',
                    }
                  )}
                >
                  <CardContent className="p-6 flex flex-col">
                    <div className="mb-4">
                      {renderQuoteIcon()}
                    </div>
                    {renderRating(testimonial.rating)}
                    <p className="italic text-gray-700 mb-6">{testimonial.quote}</p>
                    <div className="mt-auto flex items-center">
                      <Avatar className="h-12 w-12 mr-4">
                        {testimonial.avatar ? (
                          <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                        ) : (
                          <AvatarFallback>{getInitials(testimonial.author)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h4 className="font-bold">{testimonial.author}</h4>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                        {testimonial.company && (
                          <p className="text-xs text-gray-400">{testimonial.company}</p>
                        )}
                        {showVerified && testimonial.verified && (
                          <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                            <ThumbsUp size={12} className="mr-1" /> Opinión verificada
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {layout === TestimonialLayout.SLIDER && (
            <div className="relative">
              <div className="overflow-hidden">
                <div className={cn("transition-transform duration-500 ease-in-out", animation === 'slide' ? 'flex' : 'block')}>
                  {testimonials.slice(0, maxItems).map((testimonial: Testimonial, index) => (
                    <div 
                      key={testimonial.id}
                      className={cn(
                        "w-full px-4",
                        animation === 'slide' ? `min-w-full transform transition-transform duration-500` : '',
                        animation === 'fade' ? `absolute top-0 left-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 -z-10'}` : '',
                        index === currentSlide || animation === 'slide' ? 'block' : 'hidden'
                      )}
                      style={animation === 'slide' ? { transform: `translateX(-${currentSlide * 100}%)` } : {}}
                    >
                      <Card className={cn(
                        "mx-auto max-w-3xl",
                        {
                          "shadow-lg": cardStyle === TestimonialCardStyle.SHADOWED || shadow === 'lg',
                          "shadow-md": cardStyle === TestimonialCardStyle.BASIC || shadow === 'md',
                          "shadow-sm": shadow === 'sm',
                          "shadow-none": shadow === 'none',
                          "border-2 border-primary": testimonial.highlighted,
                          "bg-primary/5": cardStyle === TestimonialCardStyle.HIGHLIGHTED && testimonial.highlighted,
                          "border": cardStyle === TestimonialCardStyle.BORDERED,
                        }
                      )}>
                        <CardContent className="p-8 flex flex-col items-center text-center">
                          <div className="mb-6 text-primary">
                            {renderQuoteIcon()}
                          </div>
                          {renderRating(testimonial.rating)}
                          <p className="text-xl italic text-gray-700 mb-8">{testimonial.quote}</p>
                          <Avatar className="h-16 w-16 mb-4">
                            {testimonial.avatar ? (
                              <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                            ) : (
                              <AvatarFallback>{getInitials(testimonial.author)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="text-center">
                            <h4 className="font-bold text-lg">{testimonial.author}</h4>
                            <p className="text-sm text-gray-500">{testimonial.role}</p>
                            {testimonial.company && (
                              <p className="text-xs text-gray-400">{testimonial.company}</p>
                            )}
                            {showVerified && testimonial.verified && (
                              <p className="text-xs text-emerald-600 font-medium flex items-center justify-center mt-1">
                                <ThumbsUp size={12} className="mr-1" /> Opinión verificada
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Controles de navegación del slider */}
              <Button 
                onClick={prevSlide} 
                variant="outline" 
                size="icon" 
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button 
                onClick={nextSlide} 
                variant="outline" 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              
              {/* Indicadores */}
              <div className="flex justify-center mt-6 gap-2">
                {testimonials.slice(0, maxItems).map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide ? 'w-6 bg-primary' : 'w-2 bg-gray-300'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {layout === TestimonialLayout.QUOTES && (
            <div className="grid grid-cols-1 gap-12">
              {testimonials.slice(0, maxItems).map((testimonial: Testimonial) => (
                <div 
                  key={testimonial.id}
                  className={cn(
                    "flex flex-col md:flex-row items-start gap-8 p-8",
                    {
                      "shadow-lg": cardStyle === TestimonialCardStyle.SHADOWED || shadow === 'lg',
                      "shadow-md": cardStyle === TestimonialCardStyle.BASIC || shadow === 'md',
                      "shadow-sm": shadow === 'sm',
                      "shadow-none": shadow === 'none',
                      "border-l-4 border-primary": true,
                      "bg-primary/5": testimonial.highlighted,
                      "rounded": borderRadius !== '0',
                    }
                  )}
                >
                  <div className="shrink-0">
                    <Avatar className="h-16 w-16">
                      {testimonial.avatar ? (
                        <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      ) : (
                        <AvatarFallback>{getInitials(testimonial.author)}</AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <h4 className="font-bold text-lg">{testimonial.author}</h4>
                      {showVerified && testimonial.verified && (
                        <span className="ml-2 text-xs text-emerald-600 font-medium flex items-center">
                          <ThumbsUp size={12} className="mr-1" /> Verificado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{testimonial.role}</p>
                    {renderRating(testimonial.rating)}
                    <p className="mt-4 text-lg italic">{testimonial.quote}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {layout === TestimonialLayout.MINIMAL && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {testimonials.slice(0, maxItems).map((testimonial: Testimonial) => (
                <div 
                  key={testimonial.id}
                  className={cn(
                    "flex flex-col",
                    {
                      "border-l-2 pl-6": cardStyle === TestimonialCardStyle.BORDERED,
                      "border-primary": testimonial.highlighted,
                      "border-gray-200": !testimonial.highlighted,
                    }
                  )}
                >
                  {renderRating(testimonial.rating)}
                  <p className="italic mb-4">{testimonial.quote}</p>
                  <div className="flex items-center mt-auto">
                    <div className="mr-2 text-primary">—</div>
                    <div>
                      <span className="font-medium">{testimonial.author}</span>
                      {testimonial.company && (
                        <span className="text-sm text-gray-500"> · {testimonial.company}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {layout === TestimonialLayout.CARDS && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.slice(0, maxItems).map((testimonial: Testimonial) => (
                <Card 
                  key={testimonial.id}
                  className={cn(
                    "h-full flex flex-col",
                    {
                      "shadow-lg": cardStyle === TestimonialCardStyle.SHADOWED || shadow === 'lg',
                      "shadow-md": cardStyle === TestimonialCardStyle.BASIC || shadow === 'md',
                      "shadow-sm": shadow === 'sm',
                      "shadow-none": shadow === 'none',
                      "border-2 border-primary": testimonial.highlighted,
                      "bg-primary/5": cardStyle === TestimonialCardStyle.HIGHLIGHTED && testimonial.highlighted,
                      "border": cardStyle === TestimonialCardStyle.BORDERED,
                      "rounded-none": borderRadius === '0',
                      "rounded-sm": borderRadius === '0.125rem',
                      "rounded": borderRadius === '0.25rem',
                      "rounded-md": borderRadius === '0.375rem',
                      "rounded-lg": borderRadius === '0.5rem',
                      "rounded-xl": borderRadius === '0.75rem',
                      "rounded-2xl": borderRadius === '1rem',
                    }
                  )}
                >
                  <div className="bg-primary text-white p-4 flex items-center">
                    <div className="mr-4">
                      {renderQuoteIcon()}
                    </div>
                    <div>
                      <h4 className="font-bold">{testimonial.author}</h4>
                      <p className="text-sm opacity-80">{testimonial.role}</p>
                    </div>
                    {showVerified && testimonial.verified && (
                      <span className="ml-auto bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                        Verificado
                      </span>
                    )}
                  </div>
                  <CardContent className="p-6 flex-grow flex flex-col">
                    {renderRating(testimonial.rating)}
                    <p className="italic text-gray-700 flex-grow">{testimonial.quote}</p>
                    {showDates && testimonial.date && (
                      <p className="text-xs text-gray-400 mt-4 text-right">{testimonial.date}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AnimateCss>
    </StyleTransition>
  );
};

export default TestimonialBlock;