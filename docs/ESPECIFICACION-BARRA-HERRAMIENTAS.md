# Especificación Técnica: Barra de Herramientas Contextual

## Descripción General
La barra de herramientas contextual es un componente de interfaz de usuario que aparece cerca del bloque seleccionado en el editor, proporcionando acceso rápido a las acciones más comunes y relevantes para ese bloque específico. Esta funcionalidad mejora significativamente la experiencia del usuario al reducir la distancia de movimiento del cursor y presentar solo las opciones pertinentes al contexto actual.

## Objetivos
1. Mejorar la eficiencia del proceso de edición
2. Reducir la complejidad visual de la interfaz
3. Proporcionar acceso rápido a las acciones más utilizadas
4. Crear una experiencia de edición más intuitiva y fluida

## Alcance Funcional

### Funcionalidades Principales
1. **Aparición Contextual**
   - Mostrar automáticamente al seleccionar un bloque
   - Posicionamiento inteligente cerca del bloque seleccionado
   - Desaparecer cuando se deselecciona el bloque
   - Transiciones suaves de aparición/desaparición

2. **Acciones Contextuales**
   - Mostrar acciones específicas según el tipo de bloque
   - Opciones comunes: editar, duplicar, eliminar, mover
   - Acciones avanzadas según el contexto (ej: cambiar alineación en bloques de texto)
   - Acceso a configuraciones rápidas sin abrir paneles completos

3. **Personalización y Adaptabilidad**
   - Ajuste inteligente para evitar salirse de los límites de la pantalla
   - Reposicionamiento según el scroll y posición de edición
   - Adaptación a diferentes tamaños de pantalla
   - Opciones de personalización para usuarios avanzados

4. **Extensibilidad para Desarrolladores**
   - API para que bloques personalizados añadan sus propias acciones
   - Sistema de priorización para determinar qué acciones mostrar primero
   - Documentación para desarrolladores de extensiones

## Arquitectura Técnica

### Componentes Principales

1. **ContextualToolbar**
   - Componente principal que renderiza la barra de herramientas
   - Gestiona la visibilidad y posicionamiento
   - Coordina las acciones disponibles según contexto

2. **ToolbarAction**
   - Componente para cada acción individual
   - Gestiona iconos, tooltips y comportamiento
   - Maneja estados (disabled, loading, etc.)

3. **ToolbarPositioner**
   - Servicio que calcula la posición óptima
   - Evita solapamientos y asegura visibilidad
   - Maneja comportamiento responsivo

4. **ToolbarRegistry**
   - Sistema para registrar acciones disponibles
   - Determina qué acciones mostrar según el contexto
   - Gestiona prioridades y agrupación de acciones

### Flujo de Datos

1. Usuario selecciona un bloque en el editor
2. El sistema identifica el tipo de bloque y su contexto
3. ToolbarRegistry determina las acciones relevantes
4. ToolbarPositioner calcula la ubicación óptima
5. ContextualToolbar renderiza la barra con las acciones correspondientes
6. Usuario interactúa con las acciones disponibles

### Integración con Componentes Existentes

1. **PageEditor**
   - Proporciona información sobre el bloque seleccionado
   - Gestiona la comunicación de cambios de selección
   - Integra la barra como elemento de la interfaz de edición

2. **SortableBlockWrapper**
   - Señaliza eventos de selección para activar la barra
   - Proporciona referencias de posición para ubicar la barra
   - Comunica cambios de posición durante el arrastre

3. **Bloques Individuales**
   - Registran sus acciones específicas
   - Proporcionan información de contexto para personalizar la barra
   - Implementan handlers para las acciones disponibles

## Interfaz de Usuario

### Diseño Visual
1. Barra compacta con iconos claros y reconocibles
2. Tooltips informativos al hacer hover sobre las acciones
3. Agrupación visual de acciones relacionadas
4. Indicadores visuales para acciones destacadas o peligrosas

### Comportamiento de Interacción
1. Aparición con animación sutil al seleccionar un bloque
2. Permanecer visible mientras el bloque esté seleccionado
3. Seguir al bloque durante operaciones de arrastrar y soltar
4. Desaparecer gradualmente al deseleccionar

### Acciones Comunes por Tipo de Bloque

1. **Todos los Bloques**
   - Mover arriba/abajo
   - Duplicar
   - Eliminar
   - Configuración general

2. **Bloques de Texto**
   - Cambiar alineación
   - Ajustar tamaño/estilo
   - Opciones de formato básicas

3. **Bloques de Media**
   - Cambiar fuente de imagen/video
   - Ajustar tamaño/proporción
   - Opciones de visualización (lightbox, autoplay)

4. **Bloques Compuestos**
   - Añadir/eliminar elementos internos
   - Cambiar layout
   - Configurar comportamiento específico

## Consideraciones Técnicas

### Rendimiento
1. Minimizar recálculos de posición durante el scroll
2. Optimizar renderizado condicional de acciones
3. Implementar throttling para eventos frecuentes
4. Considerar técnicas de memoización para componentes

### Accesibilidad
1. Asegurar operabilidad completa por teclado
2. Implementar etiquetas y descripciones adecuadas
3. Mantener suficiente contraste visual
4. Proporcionar métodos alternativos para todas las acciones

### Compatibilidad
1. Comportamiento consistente en diferentes navegadores
2. Adaptación a pantallas táctiles y dispositivos móviles
3. Degradación elegante en entornos limitados
4. Considerar implicaciones de RTL y localización

## Plan de Implementación

### Fase 1: Estructura Base
1. Desarrollar componente ContextualToolbar básico
2. Implementar posicionamiento simple junto al bloque
3. Añadir acciones básicas comunes a todos los bloques
4. Integrar con sistema de selección existente

### Fase 2: Posicionamiento Inteligente
1. Desarrollar algoritmo de posicionamiento avanzado
2. Implementar ajustes para evitar límites de pantalla
3. Añadir comportamiento responsivo
4. Mejorar transiciones y animaciones

### Fase 3: Acciones Específicas de Bloques
1. Crear sistema de registro de acciones por tipo de bloque
2. Implementar acciones específicas para bloques existentes
3. Desarrollar sistema de priorización y agrupación
4. Añadir soporte para acciones avanzadas

### Fase 4: Refinamiento y Extensibilidad
1. Pulir interacciones y comportamiento
2. Documentar API para desarrolladores de bloques
3. Implementar sistema de personalización para usuarios
4. Realizar pruebas de usabilidad y ajustes finales

## Consideraciones Adicionales

### Modos de Visualización
1. Considerar variaciones para diferentes modos de edición
2. Versión compacta para espacios reducidos
3. Posible expansión a barra completa para edición intensiva
4. Integración con futuros modos de edición (ej: modo enfoque)

### Posibles Mejoras Futuras
1. Acciones arrastrar y soltar desde la barra (ej: duplicar arrastrando)
2. Historial visual de acciones recientes
3. Personalización del usuario para acciones favoritas
4. Integración con atajos de teclado personalizables

## Conclusión
La implementación de una barra de herramientas contextual representará una mejora significativa en la usabilidad del editor de páginas de Origo CMS, haciendo la edición más eficiente, intuitiva y agradable. Este componente encarna los principios de diseño centrado en el usuario al proporcionar las herramientas adecuadas en el momento y lugar precisos donde se necesitan.

## Anexo: Referencias y Ejemplos
- Considerar implementaciones exitosas en editores como Figma, Adobe XD, y WordPress Gutenberg
- Revisar guías de Material Design y Apple Human Interface Guidelines sobre barras de herramientas contextuales
- Estudiar patrones de UX para reducir la carga cognitiva durante tareas complejas de edición