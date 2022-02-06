import face_recognition
import glob
import json

files = glob.glob("./data/*.jpg")

print(f'Found {len(files)} .jpg files')

results = []

for f in files:
  image = face_recognition.load_image_file(f)
  locations = face_recognition.face_locations(np_array)
  encodings = face_recognition.face_encodings(np_array, locations)

  for i in range(len(locations)):
    top, right, bottom, left = locations[i]

    result = {
      'x': left,
      'y': top,
      'width': right - left,
      'height': bottom - top,
      'encodings': encodings[i].tolist()
    }

    results.append(result)

path = './data/output.json'

with open(path, 'w') as f:
  json.dump(results, f)

print(f'File saved to {path}')
