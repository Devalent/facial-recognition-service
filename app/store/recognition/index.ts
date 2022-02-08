import { createSlice } from '@reduxjs/toolkit';
import randomColor from 'randomcolor';

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
  probability?:number;
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
    uniques: 0,
    lastId: 0,
    matches: [] as RecognitionMatch[],
  },
  reducers: {
    addRecognitions: (state, action) => {
      const DISTANCE_THRESHOLD = 0.5;

      const existingItems = state.matches;
      const newItems = action.payload as Recognition[];

      const addedItems = [] as RecognitionMatch[];
  
      for (let i = 0; i < newItems.length; i++) {
        const newItem = newItems[i];
  
        const candidates:RecognitionCandidate[] = [];
  
        for (let j = 0; j < existingItems.length; j++) {
          const match = existingItems[j];
  
          let sum = 0;
          for (let k = 0; k < match.encodings.length; k++) {
            const x1 = match.encodings[k];
            const x2 = newItem.encodings[k];
  
            sum += (x1 - x2) ** 2;
          }
  
          const distance = Math.sqrt(sum);
  
          if (distance >= 0 && distance < DISTANCE_THRESHOLD) {
            candidates.push({
              match,
              distance,
            });
          }
        }
  
        const candidate = candidates
          .sort((a, b) => a.distance - b.distance)[0];
  
        const personId = candidate
          ? candidate.match.personId
          : ++state.uniques;

        const addItem:RecognitionMatch = {
          personId,
          id: ++state.lastId,
          created: Date.now(),
          encodings: newItem.encodings,
          image: newItem.image,
          name: `Person #${personId}`,
          color: state.colors[personId % state.colors.length],
          distance: candidate?.distance,
          probability: candidate
            ? Math.round((1 - (candidate.distance || 0)) / (1 / 100))
            : undefined,
        };

        addedItems.push(addItem);
      }

      state.matches = [
        ...existingItems,
        ...addedItems,
      ]
        .sort((a, b) => a.created - b.created)
        // .filter((x, i) => i < 20);
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
