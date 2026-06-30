import { createElement, Fragment, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

type MotionValue = string | number | Array<string | number>;
type MotionTarget = Partial<CSSProperties> & {
  x?: MotionValue;
  y?: MotionValue;
  scale?: MotionValue;
  rotateX?: MotionValue;
};

type MotionProps<T extends HTMLElement> = HTMLAttributes<T> & {
  initial?: MotionTarget | false;
  animate?: MotionTarget;
  exit?: MotionTarget;
  transition?: unknown;
  whileHover?: MotionTarget;
  layout?: boolean;
};

function latest(value: MotionValue | undefined) {
  return Array.isArray(value) ? value[value.length - 1] : value;
}

function toPx(value: string | number | undefined) {
  return typeof value === "number" ? `${value}px` : value;
}

function buildMotionStyle(base: CSSProperties | undefined, animate: MotionTarget | undefined) {
  if (!animate) return base;

  const style: CSSProperties = { ...base };
  const transforms: string[] = [];

  if (animate.width !== undefined && !Array.isArray(animate.width)) style.width = animate.width;
  if (animate.opacity !== undefined && !Array.isArray(animate.opacity)) style.opacity = animate.opacity;
  if (typeof animate.boxShadow === "string") style.boxShadow = animate.boxShadow;

  const x = latest(animate.x);
  const y = latest(animate.y);
  const scale = latest(animate.scale);
  const rotateX = latest(animate.rotateX);

  if (x !== undefined || y !== undefined) transforms.push(`translate(${toPx(x as string | number | undefined) ?? "0"}, ${toPx(y as string | number | undefined) ?? "0"})`);
  if (scale !== undefined) transforms.push(`scale(${scale})`);
  if (rotateX !== undefined) transforms.push(`rotateX(${typeof rotateX === "number" ? `${rotateX}deg` : rotateX})`);
  if (transforms.length) style.transform = [base?.transform, ...transforms].filter(Boolean).join(" ");

  return style;
}

function createMotionElement<T extends HTMLElement>(tag: string) {
  return function MotionElement({
    initial: _initial,
    animate,
    exit: _exit,
    transition: _transition,
    whileHover: _whileHover,
    layout: _layout,
    style,
    className,
    ...props
  }: MotionProps<T>) {
    return createElement(tag, {
      ...props,
      className: ["motion-safe:transition-all motion-safe:duration-300", className].filter(Boolean).join(" "),
      style: buildMotionStyle(style, animate),
    });
  };
}

export function AnimatePresence({ children }: { children: ReactNode; initial?: boolean }) {
  return <Fragment>{children}</Fragment>;
}

export const motion = {
  div: createMotionElement<HTMLDivElement>("div"),
  span: createMotionElement<HTMLSpanElement>("span"),
  li: createMotionElement<HTMLLIElement>("li"),
};