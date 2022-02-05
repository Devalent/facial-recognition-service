import axios from 'axios';

export type FaceEncoding = {
  x:number;
  y:number;
  width:number;
  height:number;
  encodings:number[];
};

export const encodeFaces = async(image:string):Promise<FaceEncoding[]> => {
  const { data } = await axios({
    url: `http://${process.env.WORKER_HOST}/encode`,
    method: 'POST',
    data: { image },
  });

  return data;
};
