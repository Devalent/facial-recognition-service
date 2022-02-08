import { createSlice } from '@reduxjs/toolkit';
import randomColor from 'randomcolor';

import config from '../../config';

import { changeState } from '../demo';

export type Room = {
  id:string;
  connection:string;
};

export type Recognition = {
  x:number;
  y:number;
  width:number;
  height:number;
  image:string;
  encodings:number[];
};

export type RecognitionMatch = {
  id:number;
  personId:number;
  created:number;
  image:string;
  name:string;
  color:string;
  encodings:number[];
  distance?:number;
  similarity?:number;
};

type RecognitionCandidate = {
  match:RecognitionMatch;
  distance:number;
};

const colors = Array.from(Array(100)).map(() => randomColor({ luminosity: 'dark' }));

export const slice = createSlice({
  name: 'recognition', 
  initialState: {
    colors,
    threshold: config.recognition_threshold,
    uniques: 0,
    lastId: 0,
    matches: [] as RecognitionMatch[],
  },
  reducers: {
    addRecognitions: (state, action) => {
      const existingFaces = state.matches;
      const newFaces:Recognition[] = action.payload;
      const facesToAdd:RecognitionMatch[] = [];
  
      for (const newFace of newFaces) {
        const candidates:RecognitionCandidate[] = [];
  
        // Compare each new face with all existing faces
        for (const existing of existingFaces) { 
          // Calculate the Euclidean distance, which is a measure
          // of how two faces are similar to each other.
          // The lower the distance, the more similarity they share.
          // See https://en.wikipedia.org/wiki/Euclidean_distance
          const sum = existing.encodings.reduce((res, x1, i) => {
            const x2 = newFace.encodings[i];
  
            return res + ((x1 - x2) ** 2);
          }, 0)

          const distance = Math.sqrt(sum);
  
          // Only consider faces that are similar enough (distance < 0.6)
          if (distance >= 0 && distance < state.threshold) {
            candidates.push({
              match: existing,
              distance,
            });
          }
        }
  
        // Find a face with the shortest euclidean distance 
        const candidate = candidates
          .sort((a, b) => a.distance - b.distance)[0];
  
        const personId = candidate
          ? candidate.match.personId
          : ++state.uniques;

        let similarity = undefined;

        // Calculate the similarity percentage
        // See https://github.com/ageitgey/face_recognition/wiki/Calculating-Accuracy-as-a-Percentage
        if (candidate) {
          const linear = 1.0 - (candidate.distance / (state.threshold * 2.0));
          const score = linear + ((1.0 - linear) * Math.pow((linear - 0.5) * 2, 0.2));
          similarity = Math.round(score * 100);
        }

        const addItem:RecognitionMatch = {
          personId,
          similarity,
          id: ++state.lastId,
          created: Date.now(),
          encodings: newFace.encodings,
          image: newFace.image,
          name: `Person #${personId}`,
          color: state.colors[personId % state.colors.length],
          distance: candidate?.distance,
        };

        facesToAdd.push(addItem);
      }

      state.matches = [
        ...existingFaces,
        ...facesToAdd,
      ]
        .sort((a, b) => a.created - b.created)
        .filter((x, i) => i < 100);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(changeState, (state, action) => {
      state.matches = [];
      state.uniques = 0;
      state.lastId = 0;
    });
  },
})

export default slice.reducer;

export const { addRecognitions } = slice.actions;
