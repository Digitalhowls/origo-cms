import React, { useEffect, useRef, ReactNode } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import gsap from 'gsap';
import 'animate.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Lottie from 'lottie-react';

// Inicializar AOS para animaciones de scroll
export const initializeAnimations = () => {
  AOS.init({
    duration: 800,
    once: false,
    mirror: true,
  });
};

// Hook para animar la entrada de un elemento usando React Spring
export const useEntranceAnimation = (delay = 0) => {
  const [props, api] = useSpring(() => ({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay,
    config: { tension: 280, friction: 20 },
  }));

  return { props, api };
};

// Componente animado para usar con React Spring
export const AnimatedElement = animated.div;

// Componente para animaciones de lista con React Transition Group
export interface FadeTransitionProps {
  children: ReactNode;
  classNames?: string;
  timeout?: number;
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  classNames = 'fade',
  timeout = 300,
}) => {
  return (
    <CSSTransition
      in={true}
      appear={true}
      timeout={timeout}
      classNames={classNames}
    >
      {children}
    </CSSTransition>
  );
};

// Componente para animaciones de lista con React Transition Group
export interface TransitionListProps {
  items: any[];
  keyExtractor: (item: any) => string;
  renderItem: (item: any) => ReactNode;
  classNames?: string;
  timeout?: number;
}

export const TransitionList: React.FC<TransitionListProps> = ({
  items,
  keyExtractor,
  renderItem,
  classNames = 'fade',
  timeout = 300,
}) => {
  return (
    <TransitionGroup component={null}>
      {items.map((item) => (
        <CSSTransition
          key={keyExtractor(item)}
          timeout={timeout}
          classNames={classNames}
        >
          {renderItem(item)}
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
};

// Hook para animar usando GSAP
export const useGsapAnimation = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  const animate = (animation: string) => {
    if (!elementRef.current) return;

    switch (animation) {
      case 'fadeIn':
        gsap.fromTo(
          elementRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5 }
        );
        break;
      case 'slideIn':
        gsap.fromTo(
          elementRef.current,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5 }
        );
        break;
      case 'pop':
        gsap.fromTo(
          elementRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );
        break;
      case 'shake':
        gsap.to(elementRef.current, {
          x: 10,
          duration: 0.1,
          repeat: 5,
          yoyo: true,
          ease: 'power1.inOut',
        });
        break;
      default:
        break;
    }
  };

  return { elementRef, animate };
};

// Componente para crear efectos de Animate.css
export interface AnimateCssProps {
  children: ReactNode;
  animationName: string;
  duration?: string;
  delay?: string;
  infinite?: boolean;
}

export const AnimateCss: React.FC<AnimateCssProps> = ({
  children,
  animationName,
  duration = '1s',
  delay = '0s',
  infinite = false,
}) => {
  const className = `animate__animated animate__${animationName} ${
    infinite ? 'animate__infinite' : ''
  }`;
  const style = {
    animationDuration: duration,
    animationDelay: delay,
  };

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};

// Componente para animaciones AOS (Animate On Scroll)
export interface AOSElementProps {
  children: ReactNode;
  animation:
    | 'fade-up'
    | 'fade-down'
    | 'fade-left'
    | 'fade-right'
    | 'flip-up'
    | 'flip-down'
    | 'zoom-in'
    | 'zoom-out'
    | string;
  duration?: number;
  delay?: number;
  once?: boolean;
  anchor?: string;
}

export const AOSElement: React.FC<AOSElementProps> = ({
  children,
  animation,
  duration,
  delay,
  once,
  anchor,
}) => {
  return (
    <div
      data-aos={animation}
      data-aos-duration={duration}
      data-aos-delay={delay}
      data-aos-once={once}
      data-aos-anchor={anchor}
    >
      {children}
    </div>
  );
};

// Componente para animaciones Lottie
export interface LottieAnimationProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  loop = true,
  autoplay = true,
  style,
  className,
}) => {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      style={style}
      className={className}
    />
  );
};

// Componente para crear transiciones personalizadas con propiedades CSS
export interface StyleTransitionProps {
  children: ReactNode;
  property: string;
  duration?: string;
  timingFunction?: string;
  delay?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const StyleTransition: React.FC<StyleTransitionProps> = ({
  children,
  property,
  duration = '0.3s',
  timingFunction = 'ease',
  delay = '0s',
  className = '',
  style = {},
}) => {
  const transitionStyle = {
    ...style,
    transition: `${property} ${duration} ${timingFunction} ${delay}`,
  };

  return (
    <div className={className} style={transitionStyle}>
      {children}
    </div>
  );
};