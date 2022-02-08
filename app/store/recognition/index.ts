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
          const sum = existing.encodings.reduce((res, x1, i) => {
            const x2 = newFace.encodings[i];
  
            return res + ((x1 - x2) ** 2);
          }, 0)

          const distance = Math.sqrt(sum);
  
          // Only consider faces that are close enough
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

        const addItem:RecognitionMatch = {
          personId,
          id: ++state.lastId,
          created: Date.now(),
          encodings: newFace.encodings,
          image: newFace.image,
          name: `Person #${personId}`,
          color: state.colors[personId % state.colors.length],
          distance: candidate?.distance,
          similarity: candidate
            ? Math.round((1 - (candidate.distance || 0)) * 100)
            : undefined,
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
