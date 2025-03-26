import React, { useState } from 'react';
import { StyleTransition } from '@/components/ui/transitions/StyleTransition';
import { AnimateCss } from '@/components/ui/transitions/AnimateCss';
import { Block } from '@shared/types';
import { Edit, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TestimonialBlockProps {
  block: Block;
  onClick?: () => void;
}

const TestimonialBlock: React.FC<TestimonialBlockProps> = ({ block, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
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
        avatar: ''
      },
      {
        id: '2',
        quote: 'Increíble plataforma, fácil de usar y muy potente. Ha transformado nuestro negocio.',
        author: 'Carlos Rodríguez',
        role: 'Director de Marketing, XYZ Inc',
        avatar: ''
      },
      {
        id: '3',
        quote: 'Un servicio excepcional con un equipo muy profesional siempre dispuesto a ayudar.',
        author: 'María López',
        role: 'Gerente de Operaciones, Corp 123',
        avatar: ''
      }
    ],
    layout = 'grid',
    bgColor = '#f9fafb',
    textColor = '#111827'
  } = block.content || {};

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
          <div className="text-center mb-12">
            <h5 className="text-primary font-medium mb-2">{subtitle}</h5>
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <div className="w-20 h-1 bg-primary mx-auto"></div>
          </div>

          {/* Grid de testimonios */}
          <div className={`grid ${layout === 'grid' ? 'md:grid-cols-3 gap-8' : 'grid-cols-1 gap-6'}`}>
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="bg-white p-6 rounded-lg shadow-md flex flex-col"
              >
                <div className="mb-4 text-primary">
                  <Quote size={32} />
                </div>
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimateCss>
    </StyleTransition>
  );
};

export default TestimonialBlock;