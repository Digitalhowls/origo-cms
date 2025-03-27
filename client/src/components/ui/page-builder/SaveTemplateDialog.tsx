import { useState } from 'react';
import { Block } from '@shared/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTemplates } from '@/hooks/use-templates';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const templateSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  description: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres' }),
  category: z.string().min(1, { message: 'La categoría es obligatoria' }),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: Block;
  organizationId: number;
  userId: number;
}

export function SaveTemplateDialog({ open, onOpenChange, block, organizationId, userId }: SaveTemplateDialogProps) {
  const { saveAsTemplate } = useTemplates();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
    },
  });
  
  const onSubmit = async (data: TemplateFormValues) => {
    setIsSubmitting(true);
    try {
      await saveAsTemplate(block, {
        ...data,
        organizationId,
        createdById: userId,
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error al guardar la plantilla',
        description: error instanceof Error ? error.message : 'Ha ocurrido un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const categories = [
    { value: 'header', label: 'Encabezados' },
    { value: 'content', label: 'Contenido' },
    { value: 'media', label: 'Medios' },
    { value: 'call-to-action', label: 'Llamadas a la acción' },
    { value: 'feature', label: 'Características' },
    { value: 'pricing', label: 'Precios' },
    { value: 'testimonial', label: 'Testimonios' },
    { value: 'layout', label: 'Disposición' },
    { value: 'interactive', label: 'Interactivos' },
    { value: 'form', label: 'Formularios' },
    { value: 'other', label: 'Otros' },
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Guardar como plantilla</DialogTitle>
          <DialogDescription>
            Guarda este bloque como una plantilla reutilizable. Las plantillas pueden ser usadas en cualquier página o post.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Encabezado principal con CTA" {...field} />
                  </FormControl>
                  <FormDescription>
                    Un nombre descriptivo para identificar la plantilla
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Un encabezado con título grande, subtítulo y un botón de llamada a la acción" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Describe brevemente el propósito y características de esta plantilla
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Clasifica tu plantilla para facilitar su búsqueda
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando
                  </>
                ) : (
                  'Guardar plantilla'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}