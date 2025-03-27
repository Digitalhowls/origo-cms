# Especificación Técnica: Vista Previa en Tiempo Real

## Descripción General
La funcionalidad de vista previa en tiempo real permitirá a los usuarios ver los cambios en sus páginas mientras las editan, sin necesidad de guardar o publicar. Esto mejorará significativamente la experiencia de edición y reducirá el tiempo necesario para crear y ajustar páginas.

## Objetivos
1. Proporcionar una vista previa instantánea de los cambios realizados en el editor
2. Permitir la visualización en diferentes tamaños de pantalla (responsive)
3. Mostrar la página exactamente como se vería para el visitante final
4. Minimizar la latencia entre cambios y actualización de la vista previa

## Alcance Funcional

### Funcionalidades Principales
1. **Vista previa en tiempo real**
   - Actualización automática al modificar propiedades de bloques
   - Representación precisa de todos los tipos de bloques existentes
   - Soporte para arrastrar y soltar de elementos

2. **Modos de visualización responsiva**
   - Previsualización en diferentes tamaños de pantalla (móvil, tablet, escritorio)
   - Cambio entre modos mediante botones dedicados
   - Visualización correcta de comportamiento responsivo de los bloques

3. **Sincronización bidireccional**
   - Navegación sincronizada entre editor y vista previa
   - Resaltado de bloques en la vista previa al seleccionarlos en el editor
   - Opcionalmente, permitir la edición directa desde la vista previa

4. **Opciones de visualización**
   - Vista previa a pantalla completa
   - Vista previa lateral/dividida (editor y vista previa juntos)
   - Opción para abrir en ventana separada

## Arquitectura Técnica

### Componentes Principales

1. **PreviewRenderer**
   - Componente React que renderiza la vista previa
   - Mantiene sincronización con el estado actual del editor
   - Implementa lógica de escalado y visualización responsiva

2. **PreviewControls**
   - Componente de interfaz para controlar la vista previa
   - Botones para cambiar entre modos (móvil, tablet, escritorio)
   - Opciones para pantalla completa, vista dividida, etc.

3. **PreviewSynchronizer**
   - Servicio para mantener sincronización entre editor y vista previa
   - Manejo de eventos de selección bidireccional
   - Gestión de estado compartido

4. **ResponsiveEmulator**
   - Gestiona la emulación de diferentes tamaños de pantalla
   - Aplica transformaciones CSS necesarias
   - Simula comportamiento de dispositivos específicos

### Flujo de Datos

1. El usuario modifica un bloque en el editor
2. El estado actualizado se envía al PreviewRenderer
3. PreviewRenderer actualiza la vista en tiempo real
4. Opcionalmente, las interacciones en la vista previa se sincronizan de vuelta al editor

### Integración con Componentes Existentes

1. **PageEditor**
   - Añadir soporte para mantener y propagar estado de edición en tiempo real
   - Integrar controles de vista previa en la interfaz

2. **Bloques**
   - Asegurar que todos los bloques puedan renderizarse correctamente en la vista previa
   - Implementar eventos necesarios para sincronización bidireccional

3. **SortableBlockWrapper**
   - Extender para soportar resaltado visual en vista previa
   - Sincronizar eventos de arrastrar y soltar con el estado de la vista previa

## Interfaz de Usuario

### Diseño de Controles de Vista Previa
1. Barra de herramientas en la parte superior de la vista previa con:
   - Iconos para dispositivos (móvil, tablet, escritorio)
   - Botón de pantalla completa
   - Botón para abrir en ventana separada
   - Indicador de estado de sincronización

2. Estilos visuales para vista previa:
   - Marco de dispositivo para móvil y tablet
   - Indicadores de tamaño de pantalla
   - Animaciones sutiles para transiciones entre modos

### Modos de Visualización

1. **Modo Dividido**
   - Editor a la izquierda, vista previa a la derecha
   - División ajustable mediante control deslizante
   - Opción para cambiar orientación (horizontal/vertical)

2. **Modo Pantalla Completa**
   - Vista previa ocupa toda el área de trabajo
   - Botón flotante para volver al editor
   - Controles de dispositivo accesibles en overlay

3. **Modo Ventana Separada**
   - Vista previa se abre en ventana nueva del navegador
   - Comunicación mediante localStorage o postMessage
   - Opción para sincronización en tiempo real o manual

## Consideraciones Técnicas

### Rendimiento
1. Implementar throttling para actualizaciones frecuentes
2. Considerar renderizado selectivo (solo actualizar bloques modificados)
3. Optimizar renderizado de bloques complejos
4. Implementar carga diferida para recursos pesados en la vista previa

### Compatibilidad
1. Asegurar funcionamiento en navegadores modernos
2. Manejar graciosamente limitaciones en navegadores más antiguos
3. Considerar implicaciones para accesibilidad

### Extensibilidad
1. Diseñar sistema modular para facilitar adición de nuevos tipos de bloques
2. Crear API clara para que bloques personalizados puedan integrarse con la vista previa
3. Documentar interfaces para desarrolladores de extensiones

## Plan de Implementación

### Fase 1: Implementación Básica
1. Crear componente PreviewRenderer básico
2. Implementar vista dividida editor/vista previa
3. Asegurar sincronización básica de estado
4. Probar con bloques existentes

### Fase 2: Modos Responsivos
1. Implementar controles de dispositivos
2. Crear estilos y lógica para emulación responsiva
3. Asegurar renderizado correcto en diferentes tamaños

### Fase 3: Sincronización Avanzada
1. Implementar resaltado bidireccional
2. Añadir soporte para edición desde vista previa
3. Mejorar rendimiento y optimizaciones

### Fase 4: Refinamiento y Documentación
1. Pulir interacciones y UI
2. Escribir documentación para desarrolladores
3. Implementar ajustes finales basados en feedback

## Consideraciones Adicionales

### Analíticas y Datos
1. Considerar la recopilación de métricas de uso para mejorar la funcionalidad
2. Agregar eventos para analizar qué modos de vista previa son más utilizados

### Posibles Mejoras Futuras
1. Grabación de sesiones de edición para revisión posterior
2. Comparación visual entre versiones publicadas y borrador
3. Previsualización en dispositivos reales mediante QR code
4. Modo colaborativo para edición en tiempo real

## Conclusión
La implementación de vista previa en tiempo real representará una mejora significativa en la experiencia de edición de Origo CMS, permitiendo a los usuarios crear y ajustar páginas con mayor eficiencia y precisión. Este documento proporciona una guía para su implementación técnica, asegurando una integración efectiva con el sistema existente.