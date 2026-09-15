import { preload } from "react-dom";
import { getImageProps } from "next/image";

type CoverImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export function CoverImage({
  src,
  alt,
  sizes,
  className,
  priority,
}: CoverImageProps) {
  const { props } = getImageProps({
    src,
    alt,
    sizes,
    fill: true,
    className,
    ...(priority === true ? { priority: true } : {}),
  });
  const { style: _style, ...imgProps } = props;

  if (priority === true) {
    preload(imgProps.src, {
      as: "image",
      imageSrcSet: imgProps.srcSet,
      imageSizes: imgProps.sizes,
    });
  }

  return <img {...imgProps} alt={alt} data-nimg="fill" />;
}
