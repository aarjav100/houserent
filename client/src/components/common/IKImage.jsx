import React from 'react';
import { IKImage as Image } from '@imagekit/react';

/**
 * Reusable ImageKit component
 * @param {string} path - The path to the image in ImageKit
 * @param {string} src - Full URL of the image
 * @param {object} transformation - Array of transformation objects
 * @param {number} width - Width of the image
 * @param {number} height - Height of the image
 * @param {string} alt - Alt text
 */
const IKImage = ({ path, src, transformation = [], width, height, alt = 'Image', className = '', ...props }) => {
  return (
    <Image
      path={path}
      urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}
      src={src}
      transformation={transformation}
      width={width}
      height={height}
      alt={alt}
      className={className}
      loading="lazy"
      lqip={{ active: true }}
      {...props}
    />
  );
};

export default IKImage;
