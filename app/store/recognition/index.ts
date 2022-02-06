import { createSlice } from '@reduxjs/toolkit';

export type Recognition = {
  image:string;
  encodings:number[];
};

export type RecognitionMatch = {
  id:number;
  created:number;
  image:string;
  name:string;
  encodings:number[];
};

type RecognitionCandidate = {
  match:RecognitionMatch;
  distance:number;
};

export const slice = createSlice({
  name: 'recognition', 
  initialState: {
    uniques: 0,
    lastId: 0,
    matches: [] as RecognitionMatch[],
  },
  reducers: {
    addRecognitions: (state, payload) => {
      const DISTANCE_THRESHOLD = 0.5;

      const existingItems = state.matches;
      const newItems = payload.payload as Recognition[];

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
  
          if (distance > 0 && distance < DISTANCE_THRESHOLD) {
            candidates.push({
              match,
              distance,
            });
          }
        }
  
        const candidate = candidates
          .sort((a, b) => a.distance - b.distance)[0];
  
        const addItem:RecognitionMatch = {
          id: ++state.lastId,
          created: Date.now(),
          encodings: newItem.encodings,
          image: newItem.image,
          name: candidate
            ? candidate.match.name
            : `Person #${++state.uniques}`,
        };

        addedItems.push(addItem);
      }

      state.matches = [
        ...existingItems,
        ...addedItems,
      ]
        .sort((a, b) => a.created - b.created)
        .filter((x, i) => i < 20);
    },
  },
})

export default slice.reducer;

export const { addRecognitions } = slice.actions;
