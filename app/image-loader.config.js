import { imageLoader } from 'next-image-loader/build/image-loader';

imageLoader.loader = ({ src }) => {
  if (src.startsWith('/')) {
    return '.' + src;
  }

  return src;
};
