import React, { useState } from 'react';
import { StyleTransition } from '@/components/ui/transitions/StyleTransition';
import { AnimateCss } from '@/components/ui/transitions/AnimateCss';
import { Block } from '@shared/types';
import { Check, X, ChevronRight, Star, CreditCard, Sparkles, Shield, Zap, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Enumeración para los tipos de diseño de precios
enum PricingLayout {
  CARDS = 'cards',
  HORIZONTAL = 'horizontal',
  TABLE = 'table',
  TOGGLE = 'toggle',
  MINIMALIST = 'minimalist',
  FEATURED = 'featured'
}

// Enumeración para los estilos visuales
enum PricingStyle {
  BASIC = 'basic',
  BORDERED = 'bordered',
  SHADOWED = 'shadowed',
  GRADIENT = 'gradient',
  FLAT = 'flat',
  MODERN = 'modern',
  MINIMAL = 'minimal'
}

// Estructura para las características
interface PricingFeature {
  id: string;
  name: string;
  included: boolean | 'partial' | 'limited';
  infoText?: string;
  highlight?: boolean;
}

// Estructura para los planes
interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    annually: number;
    currency: string;
    suffix?: string;
  };
  features: PricingFeature[];
  cta: {
    text: string;
    url: string;
    variant: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  popular?: boolean;
  badge?: string;
  icon?: string;
  highlightColor?: string;
}

interface PricingBlockProps {
  block: Block;
  onClick?: () => void;
}

const PricingBlock: React.FC<PricingBlockProps> = ({ block, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');
  
  // Extraer propiedades del contenido del bloque
  const { 
    title = 'Planes y precios', 
    subtitle = 'Elige el plan que mejor se adapte a tus necesidades',
    description = 'Todos los planes incluyen una prueba gratuita de 14 días. No se requiere tarjeta de crédito.',
    plans = [
      {
        id: '1',
        name: 'Básico',
        description: 'Todo lo que necesitas para empezar',
        price: {
          monthly: 9.99,
          annually: 7.99,
          currency: '€',
          suffix: '/mes'
        },
        features: [
          { id: '1-1', name: '5 páginas', included: true },
          { id: '1-2', name: '10 GB de almacenamiento', included: true },
          { id: '1-3', name: 'Dominio personalizado', included: false },
          { id: '1-4', name: 'Soporte por email', included: true },
          { id: '1-5', name: 'Análisis básicos', included: true },
          { id: '1-6', name: 'Exportación de datos', included: false }
        ],
        cta: {
          text: 'Empezar ahora',
          url: '/signup?plan=basic',
          variant: 'default'
        },
        icon: 'CreditCard'
      },
      {
        id: '2',
        name: 'Pro',
        description: 'Perfecto para profesionales',
        price: {
          monthly: 19.99,
          annually: 15.99,
          currency: '€',
          suffix: '/mes'
        },
        features: [
          { id: '2-1', name: '25 páginas', included: true },
          { id: '2-2', name: '50 GB de almacenamiento', included: true },
          { id: '2-3', name: 'Dominio personalizado', included: true },
          { id: '2-4', name: 'Soporte prioritario', included: true },
          { id: '2-5', name: 'Análisis avanzados', included: true },
          { id: '2-6', name: 'Exportación de datos', included: true }
        ],
        cta: {
          text: 'Prueba Pro',
          url: '/signup?plan=pro',
          variant: 'default'
        },
        popular: true,
        badge: 'Popular',
        icon: 'Sparkles'
      },
      {
        id: '3',
        name: 'Empresa',
        description: 'Para equipos y compañías',
        price: {
          monthly: 49.99,
          annually: 39.99,
          currency: '€',
          suffix: '/mes'
        },
        features: [
          { id: '3-1', name: 'Páginas ilimitadas', included: true, highlight: true },
          { id: '3-2', name: '250 GB de almacenamiento', included: true },
          { id: '3-3', name: 'Dominios múltiples', included: true },
          { id: '3-4', name: 'Soporte 24/7', included: true, highlight: true },
          { id: '3-5', name: 'Análisis personalizados', included: true },
          { id: '3-6', name: 'API completa', included: true }
        ],
        cta: {
          text: 'Contactar ventas',
          url: '/contact-sales',
          variant: 'outline'
        },
        icon: 'Building'
      }
    ],
    layout = PricingLayout.CARDS,
    style = PricingStyle.SHADOWED,
    showToggle = true,
    annualDiscount = '20% de descuento',
    highlightPopular = true,
    colorScheme = 'primary',
    bgColor = '#ffffff',
    textColor = '#111827',
    accentColor = '#4f46e5',
    borderRadius = '0.5rem',
    shadow = 'md',
    spacing = 'normal',
    showIcons = true,
    showBadges = true,
    alignment = 'center',
    maxWidth = '1200px',
    comparisonTitle = 'Comparación de características',
    ctaAlignment = 'center',
    featureHighlightColor = '#dcfce7'
  } = block.content || {};

  // Estilos personalizados
  const style = {
    backgroundColor: bgColor,
    color: textColor,
    padding: '4rem 0',
    '--accent-color': accentColor,
  } as React.CSSProperties;

  const handleBlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  // Renderizar icono según el nombre
  const renderIcon = (iconName?: string) => {
    if (!showIcons || !iconName) return null;
    
    switch (iconName) {
      case 'CreditCard':
        return <CreditCard size={24} className="text-primary" />;
      case 'Sparkles':
        return <Sparkles size={24} className="text-primary" />;
      case 'Shield':
        return <Shield size={24} className="text-primary" />;
      case 'Zap':
        return <Zap size={24} className="text-primary" />;
      case 'Clock':
        return <Clock size={24} className="text-primary" />;
      case 'Award':
        return <Award size={24} className="text-primary" />;
      default:
        return <CreditCard size={24} className="text-primary" />;
    }
  };

  // Renderizar indicador de características (check, x, parcial)
  const renderFeatureIndicator = (feature: PricingFeature) => {
    if (feature.included === true) {
      return <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />;
    } else if (feature.included === false) {
      return <X className="h-5 w-5 flex-shrink-0 text-gray-300" />;
    } else if (feature.included === 'partial' || feature.included === 'limited') {
      return <Check className="h-5 w-5 flex-shrink-0 text-yellow-500" />;
    }
  };

  // Renderizar plan como tarjeta
  const renderPlanCard = (plan: PricingPlan) => {
    return (
      <Card 
        key={plan.id}
        className={cn(
          "relative overflow-hidden flex flex-col h-full",
          {
            "border-2 border-primary shadow-lg transform scale-105": highlightPopular && plan.popular,
            "border": style === PricingStyle.BORDERED,
            "shadow-lg": style === PricingStyle.SHADOWED || shadow === 'lg',
            "shadow-md": style === PricingStyle.BASIC || shadow === 'md',
            "shadow-sm": shadow === 'sm',
            "shadow-none": shadow === 'none',
            "rounded-none": borderRadius === '0',
            "rounded-sm": borderRadius === '0.125rem',
            "rounded": borderRadius === '0.25rem',
            "rounded-md": borderRadius === '0.375rem',
            "rounded-lg": borderRadius === '0.5rem',
            "rounded-xl": borderRadius === '0.75rem',
            "bg-gradient-to-br from-primary/10 to-primary/5": style === PricingStyle.GRADIENT && plan.popular,
          }
        )}
      >
        {showBadges && plan.badge && (
          <span 
            className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1.5 font-medium rounded-bl-lg"
          >
            {plan.badge}
          </span>
        )}

        <CardHeader className={cn(style === PricingStyle.MODERN ? "bg-muted/50 pb-6" : "")}>
          {showIcons && plan.icon && (
            <div className="mb-3">
              {renderIcon(plan.icon)}
            </div>
          )}
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">
                {plan.price.currency}{billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annually}
              </span>
              {plan.price.suffix && (
                <span className="ml-1 text-sm text-muted-foreground">{plan.price.suffix}</span>
              )}
            </div>
            {billingPeriod === 'annually' && annualDiscount && (
              <p className="text-xs text-emerald-600 mt-1">{annualDiscount}</p>
            )}
          </div>

          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li 
                key={feature.id}
                className={cn(
                  "flex items-start",
                  {
                    "bg-emerald-50 p-1 rounded-md -mx-1": feature.highlight,
                  }
                )}
              >
                <span className="mr-2 mt-0.5">
                  {renderFeatureIndicator(feature)}
                </span>
                <span className={feature.included === false ? "text-gray-500" : ""}>
                  {feature.name}
                  {feature.infoText && (
                    <span className="text-xs text-gray-500 block">{feature.infoText}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className={ctaAlignment === 'center' ? "flex justify-center" : ""}>
          <Button 
            variant={plan.cta.variant} 
            className={cn(
              "w-full",
              {
                "bg-primary hover:bg-primary/90": plan.cta.variant === 'default' && plan.popular,
              }
            )}
          >
            {plan.cta.text}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Renderizar plan en formato horizontal
  const renderHorizontalPlan = (plan: PricingPlan) => {
    return (
      <Card 
        key={plan.id}
        className={cn(
          "relative overflow-hidden",
          {
            "border-2 border-primary": highlightPopular && plan.popular,
            "border": style === PricingStyle.BORDERED,
            "shadow-lg": style === PricingStyle.SHADOWED || shadow === 'lg',
            "shadow-md": style === PricingStyle.BASIC || shadow === 'md',
            "shadow-sm": shadow === 'sm',
            "shadow-none": shadow === 'none',
            "rounded-none": borderRadius === '0',
            "rounded-sm": borderRadius === '0.125rem',
            "rounded": borderRadius === '0.25rem',
            "rounded-md": borderRadius === '0.375rem',
            "rounded-lg": borderRadius === '0.5rem',
            "rounded-xl": borderRadius === '0.75rem',
          }
        )}
      >
        {showBadges && plan.badge && (
          <span 
            className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1.5 font-medium rounded-bl-lg"
          >
            {plan.badge}
          </span>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-3 flex flex-col">
            {showIcons && plan.icon && (
              <div className="mb-2">
                {renderIcon(plan.icon)}
              </div>
            )}
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </div>

          <div className="md:col-span-2 flex flex-col">
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">
                {plan.price.currency}{billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annually}
              </span>
              {plan.price.suffix && (
                <span className="ml-1 text-sm text-muted-foreground">{plan.price.suffix}</span>
              )}
            </div>
            {billingPeriod === 'annually' && annualDiscount && (
              <p className="text-xs text-emerald-600 mt-1">{annualDiscount}</p>
            )}
          </div>

          <div className="md:col-span-5">
            <div className="grid grid-cols-2 gap-2">
              {plan.features.slice(0, 4).map((feature) => (
                <div 
                  key={feature.id}
                  className={cn(
                    "flex items-start text-sm",
                    {
                      "bg-emerald-50 p-1 rounded-md": feature.highlight,
                    }
                  )}
                >
                  <span className="mr-2 mt-0.5">
                    {renderFeatureIndicator(feature)}
                  </span>
                  <span className={feature.included === false ? "text-gray-500" : ""}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button 
              variant={plan.cta.variant} 
              className={cn(
                {
                  "bg-primary hover:bg-primary/90": plan.cta.variant === 'default' && plan.popular,
                }
              )}
            >
              {plan.cta.text}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Renderizar planes en formato tabla
  const renderTablePlans = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium text-muted-foreground"></th>
              {plans.map((plan) => (
                <th 
                  key={plan.id} 
                  className={cn(
                    "p-4 text-center",
                    {
                      "bg-primary/5 border-t-2 border-x-2 border-primary": highlightPopular && plan.popular,
                    }
                  )}
                >
                  <div className="flex flex-col items-center">
                    {showIcons && plan.icon && (
                      <div className="mb-2">
                        {renderIcon(plan.icon)}
                      </div>
                    )}
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    {showBadges && plan.badge && (
                      <Badge variant="secondary" className="mt-1">
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="flex items-baseline justify-center">
                      <span className="text-2xl font-bold">
                        {plan.price.currency}{billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annually}
                      </span>
                      {plan.price.suffix && (
                        <span className="ml-1 text-sm text-muted-foreground">{plan.price.suffix}</span>
                      )}
                    </div>
                    {billingPeriod === 'annually' && annualDiscount && (
                      <p className="text-xs text-emerald-600 mt-1">{annualDiscount}</p>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Consolidar todas las características posibles */}
            {plans.flatMap(plan => plan.features)
              .filter((feature, index, self) => 
                index === self.findIndex((f) => f.name === feature.name)
              )
              .map((feature) => (
                <tr key={feature.id} className="border-b">
                  <td className="p-4 text-sm font-medium">{feature.name}</td>
                  {plans.map((plan) => {
                    const planFeature = plan.features.find(f => f.name === feature.name);
                    return (
                      <td 
                        key={`${plan.id}-${feature.id}`} 
                        className={cn(
                          "p-4 text-center",
                          {
                            "bg-primary/5 border-x-2 border-primary": highlightPopular && plan.popular,
                          }
                        )}
                      >
                        <div className="flex justify-center">
                          {planFeature ? renderFeatureIndicator(planFeature) : <X className="h-5 w-5 text-gray-300" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            }
            <tr>
              <td className="p-4"></td>
              {plans.map((plan) => (
                <td 
                  key={`${plan.id}-cta`} 
                  className={cn(
                    "p-4 text-center",
                    {
                      "bg-primary/5 border-b-2 border-x-2 border-primary": highlightPopular && plan.popular,
                    }
                  )}
                >
                  <Button 
                    variant={plan.cta.variant} 
                    className={cn(
                      "w-full",
                      {
                        "bg-primary hover:bg-primary/90": plan.cta.variant === 'default' && plan.popular,
                      }
                    )}
                  >
                    {plan.cta.text}
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Renderizar planes con toggle anual/mensual
  const renderToggleView = () => {
    return (
      <>
        {showToggle && (
          <div className="flex justify-center items-center space-x-3 mb-10">
            <span className={billingPeriod === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>Mensual</span>
            <Switch
              checked={billingPeriod === 'annually'}
              onCheckedChange={(checked) => setBillingPeriod(checked ? 'annually' : 'monthly')}
            />
            <div className="flex items-center">
              <span className={billingPeriod === 'annually' ? 'font-semibold' : 'text-muted-foreground'}>Anual</span>
              {annualDiscount && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                  {annualDiscount}
                </Badge>
              )}
            </div>
          </div>
        )}

        <div 
          className={cn(
            "grid gap-8",
            {
              "grid-cols-1 md:grid-cols-3": layout === PricingLayout.CARDS,
              "grid-cols-1": layout === PricingLayout.HORIZONTAL || layout === PricingLayout.TABLE,
              "grid-cols-1 lg:grid-cols-4": layout === PricingLayout.MINIMALIST,
              "grid-cols-1 md:grid-cols-3 lg:grid-cols-5": layout === PricingLayout.FEATURED,
            }
          )}
        >
          {layout === PricingLayout.CARDS && plans.map(renderPlanCard)}
          {layout === PricingLayout.HORIZONTAL && plans.map(renderHorizontalPlan)}
          {layout === PricingLayout.TABLE && renderTablePlans()}
          {layout === PricingLayout.MINIMALIST && plans.map((plan) => (
            <Card 
              key={plan.id}
              className={cn(
                "flex flex-col h-full",
                {
                  "border-2 border-primary": highlightPopular && plan.popular,
                  "col-span-2": layout === PricingLayout.FEATURED && plan.popular,
                }
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-grow">
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">
                      {plan.price.currency}{billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annually}
                    </span>
                    {plan.price.suffix && (
                      <span className="ml-1 text-sm text-muted-foreground">{plan.price.suffix}</span>
                    )}
                  </div>
                </div>
                <div className="border-t pt-4 mt-2">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature.id} className={cn("flex items-center", { "text-muted-foreground": !feature.included })}>
                        {feature.included ? (
                          <Check className="h-4 w-4 mr-2 text-emerald-500" />
                        ) : (
                          <X className="h-4 w-4 mr-2 text-gray-300" />
                        )}
                        {feature.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={plan.popular ? 'default' : 'outline'} 
                  className="w-full"
                >
                  {plan.cta.text}
                </Button>
              </CardFooter>
            </Card>
          ))}
          {layout === PricingLayout.FEATURED && (
            <>
              <div className="col-span-1 md:col-span-3 lg:col-span-1 flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-2">Elige tu plan</h3>
                <p className="text-muted-foreground">
                  Todos los planes incluyen acceso completo a nuestras características principales.
                </p>
              </div>
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={cn(
                    "flex flex-col h-full",
                    {
                      "border-2 border-primary shadow-md lg:col-span-2 lg:scale-105 z-10": plan.popular,
                    }
                  )}
                >
                  <CardHeader>
                    {showBadges && plan.badge && (
                      <Badge className="mb-2 self-start">{plan.badge}</Badge>
                    )}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold">
                          {plan.price.currency}{billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annually}
                        </span>
                        {plan.price.suffix && (
                          <span className="ml-1 text-sm text-muted-foreground">{plan.price.suffix}</span>
                        )}
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li 
                          key={feature.id}
                          className={cn(
                            "flex items-start",
                            {
                              "bg-emerald-50 p-1 px-2 rounded-md": feature.highlight,
                            }
                          )}
                        >
                          <Check className={cn(
                            "h-5 w-5 mr-2 flex-shrink-0",
                            feature.highlight ? "text-emerald-600" : "text-emerald-500"
                          )} />
                          <span>{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="default" 
                      className="w-full"
                    >
                      {plan.cta.text}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </>
          )}
        </div>
      </>
    );
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
        <div 
          className={cn(
            "container mx-auto px-4 py-12",
            {
              "max-w-5xl": maxWidth === '1024px',
              "max-w-6xl": maxWidth === '1200px',
              "max-w-7xl": maxWidth === '1400px',
              "py-8": spacing === 'compact',
              "py-16": spacing === 'loose',
            }
          )}
        >
          {/* Encabezado de sección */}
          <div className={cn("mb-12 space-y-4", `text-${alignment}`)}>
            {subtitle && <p className="text-primary font-medium">{subtitle}</p>}
            <h2 className="text-3xl font-bold">{title}</h2>
            {description && <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{description}</p>}
          </div>

          {/* Planes de precios */}
          {renderToggleView()}
        </div>
      </AnimateCss>
    </StyleTransition>
  );
};

export default PricingBlock;