import { createCanvas, loadImage } from 'canvas';

import { FaceEncoding } from './encoding';

export const cropFaces = async (image:string, faces:FaceEncoding[]):Promise<string[]> => {
  const img = await loadImage(Buffer.from(image.split(',')[1], 'base64'));

  return faces.map((face) => {
    const canvas = createCanvas(face.width, face.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(img, -face.x, -face.y, img.width, img.height);

    return canvas.toDataURL('image/jpeg');
  });
};
