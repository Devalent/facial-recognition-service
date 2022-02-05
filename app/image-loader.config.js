import { imageLoader } from 'next-image-loader/build/image-loader';

imageLoader.loader = ({ src }) => src;
