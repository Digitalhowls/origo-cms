import React from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlockType } from '@shared/types';
import { usePageStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';
import { TransitionList, AnimateCss, StyleTransition } from '@/lib/animation-service';

interface BlockTemplate {
  type: BlockType;
  title: string;
  description: string;
  icon: JSX.Element;
  defaultContent: any;
  defaultSettings: any;
  data?: any;
}

const blockTemplates: BlockTemplate[] = [
  {
    type: BlockType.ACCORDION,
    title: 'Acordeón',
    description: 'Secciones plegables para mostrar información organizada o FAQ',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ),
    defaultContent: {},
    defaultSettings: {
      spacing: {
        marginTop: 10,
        marginBottom: 10,
      },
      appearance: {
        textColor: '#1F2937',
        backgroundColor: 'white',
      },
    },
    data: {
      title: 'Preguntas Frecuentes',
      description: 'Respuestas a las dudas más comunes',
      items: [
        {
          id: uuidv4(),
          title: '¿Cómo funciona este servicio?',
          content: 'Nuestro servicio funciona de manera muy sencilla. Una vez que te registras, tendrás acceso completo a todas nuestras herramientas y recursos.',
          isOpen: true
        },
        {
          id: uuidv4(),
          title: '¿Cuál es el costo de la suscripción?',
          content: 'Ofrecemos diferentes planes de suscripción adaptados a tus necesidades. Puedes consultar los precios detallados en nuestra página de planes.',
          isOpen: false
        },
        {
          id: uuidv4(),
          title: '¿Puedo cancelar en cualquier momento?',
          content: 'Sí, puedes cancelar tu suscripción en cualquier momento sin ningún cargo adicional ni penalización.',
          isOpen: false
        }
      ],
      settings: {
        style: 'basic',
        allowMultiple: true,
        defaultValues: [],
        showControls: true,
        headerTag: 'h3'
      }
    },
  },
  {
    type: BlockType.HEADER,
    title: 'Encabezado',
    description: 'Título y subtítulo con diferentes tamaños y estilos',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
    defaultContent: {
      title: 'Título principal',
      subtitle: 'Subtítulo o descripción',
      alignment: 'center',
    },
    defaultSettings: {
      spacing: {
        marginTop: 10,
        marginBottom: 10,
      },
      appearance: {
        textColor: '#1F2937',
        subtitleColor: '#6B7280',
        backgroundColor: 'transparent',
      },
    },
  },
  {
    type: BlockType.PARAGRAPH,
    title: 'Párrafo',
    description: 'Bloque de texto con opciones de formato enriquecido',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
      </svg>
    ),
    defaultContent: {
      text: 'Este es un párrafo de ejemplo. Edítalo para añadir tu propio contenido.'
    },
    defaultSettings: {
      spacing: {
        marginTop: 10,
        marginBottom: 10,
      },
      appearance: {
        textColor: '#374151',
        backgroundColor: 'transparent',
      },
    },
  },
  {
    type: BlockType.IMAGE,
    title: 'Imagen',
    description: 'Inserta una imagen con opciones de alineación y tamaño',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    defaultContent: {
      imageUrl: '',
      alt: '',
      caption: '',
    },
    defaultSettings: {
      spacing: {
        marginTop: 10,
        marginBottom: 10,
      },
      appearance: {
        alignment: 'center',
        width: '100%',
        border: false,
        borderRadius: '4px',
      },
    },
  },
  {
    type: BlockType.FEATURES,
    title: 'Características',
    description: 'Muestra características con íconos en un grid',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    defaultContent: {
      title: 'Nuestras características principales',
      features: [
        {
          id: uuidv4(),
          title: 'Característica 1',
          description: 'Descripción de la característica',
          icon: 'zap',
          iconColor: '#3B82F6',
          iconBgColor: '#EFF6FF',
        },
        {
          id: uuidv4(),
          title: 'Característica 2',
          description: 'Descripción de la característica',
          icon: 'shield',
          iconColor: '#10B981',
          iconBgColor: '#ECFDF5',
        },
        {
          id: uuidv4(),
          title: 'Característica 3',
          description: 'Descripción de la característica',
          icon: 'bar-chart',
          iconColor: '#8B5CF6',
          iconBgColor: '#F5F3FF',
        },
      ],
    },
    defaultSettings: {
      spacing: {
        marginTop: 10,
        marginBottom: 10,
      },
      appearance: {
        columns: 3,
        backgroundColor: 'white',
        textColor: '#1F2937',
      },
    },
  },
  {
    type: BlockType.TEXT_MEDIA,
    title: 'Texto y Media',
    description: 'Combine texto con una imagen o video',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    defaultContent: {
      title: 'Título de la sección',
      text: 'Texto descriptivo de la sección. Añade aquí tu contenido.',
      mediaType: 'image',
      mediaUrl: '',
      ctaText: 'Más información',
      ctaUrl: '#',
    },
    defaultSettings: {
      spacing: {
        marginTop: 10,
        marginBottom: 10,
      },
      appearance: {
        layout: 'image-left',
        mediaWidth: '50%',
        backgroundColor: 'white',
        textColor: '#1F2937',
      },
    },
  },
  {
    type: BlockType.TESTIMONIAL,
    title: 'Testimonios',
    description: 'Muestra opiniones y valoraciones de clientes',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    defaultContent: {
      title: 'Lo que dicen nuestros clientes',
      subtitle: 'Testimonios',
      testimonials: [
        {
          id: uuidv4(),
          quote: 'El mejor servicio que he experimentado. Totalmente recomendado para cualquier empresa.',
          author: 'Ana García',
          role: 'CEO, Empresa ABC',
          avatar: ''
        },
        {
          id: uuidv4(),
          quote: 'Increíble plataforma, fácil de usar y muy potente. Ha transformado nuestro negocio.',
          author: 'Carlos Rodríguez',
          role: 'Director de Marketing, XYZ Inc',
          avatar: ''
        },
        {
          id: uuidv4(),
          quote: 'Un servicio excepcional con un equipo muy profesional siempre dispuesto a ayudar.',
          author: 'María López',
          role: 'Gerente de Operaciones, Corp 123',
          avatar: ''
        }
      ],
      layout: 'grid'
    },
    defaultSettings: {
      spacing: {
        marginTop: 10,
        marginBottom: 10,
      },
      appearance: {
        bgColor: '#f9fafb',
        textColor: '#111827',
      },
    },
  },
];

const BlockLibrary: React.FC = () => {
  const { addBlock } = usePageStore();
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleDragStart = (e: React.DragEvent, block: BlockTemplate) => {
    e.dataTransfer.setData('blockType', block.type);
  };

  const handleBlockClick = (block: BlockTemplate) => {
    const newBlock = {
      id: uuidv4(),
      type: block.type,
      content: { ...block.defaultContent },
      settings: { ...block.defaultSettings },
      data: block.data || undefined
    };
    
    addBlock(newBlock);
  };

  const filteredBlocks = searchTerm 
    ? blockTemplates.filter(block => 
        block.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        block.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : blockTemplates;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Bloques</h2>
        <p className="text-sm text-gray-500 mt-1">Arrastra elementos a tu página</p>
        
        <div className="mt-3 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Input
            type="text"
            className="pl-10"
            placeholder="Buscar bloques..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="basic" className="flex-1 flex flex-col">
        <div className="border-b border-gray-200">
          <TabsList className="flex w-full">
            <TabsTrigger value="basic" className="flex-1">Básicos</TabsTrigger>
            <TabsTrigger value="layout" className="flex-1">Layouts</TabsTrigger>
            <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="basic" className="flex-1 overflow-y-auto p-4 space-y-4">
          <TransitionList
            items={filteredBlocks}
            keyExtractor={(block) => block.type}
            renderItem={(block) => (
              <StyleTransition
                property="transform, border-color, box-shadow"
                duration="0.3s"
                timingFunction="cubic-bezier(0.4, 0, 0.2, 1)"
                className="block-template border border-gray-200 rounded-md p-3 cursor-move hover:border-primary hover:shadow-sm"
              >
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, block)}
                  onClick={() => handleBlockClick(block)}
                >
                  <div className="flex items-start">
                    <AnimateCss animationName="pulse" duration="0.5s" delay="0.1s">
                      <div className="flex-shrink-0 bg-gray-100 rounded-md p-2">
                        {block.icon}
                      </div>
                    </AnimateCss>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{block.title}</h3>
                      <p className="text-xs text-gray-500">{block.description}</p>
                    </div>
                  </div>
                </div>
              </StyleTransition>
            )}
            classNames="list-item"
            timeout={300}
          />
        </TabsContent>

        <TabsContent value="layout" className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-center h-full text-gray-500">
            Bloques de layout - Próximamente
          </div>
        </TabsContent>

        <TabsContent value="media" className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-center h-full text-gray-500">
            Bloques de media - Próximamente
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlockLibrary;
