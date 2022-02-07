import base64
import face_recognition
import glob
import io
import json
from PIL import Image
import numpy as np

files = glob.glob("./data/*.jpg")

print(f'Found {len(files)} files')

results = []

for f in files:
  image = face_recognition.load_image_file(f)
  locations = face_recognition.face_locations(image)
  encodings = face_recognition.face_encodings(image, locations)

  for i in range(len(locations)):
    top, right, bottom, left = locations[i]

    image_arr = image[top:bottom, left:right]
    img = Image.fromarray(image_arr)
    data = io.BytesIO()
    img.save(data, "JPEG")
    data64 = base64.b64encode(data.getvalue())

    result = {
      'file': f,
      'x': left,
      'y': top,
      'width': right - left,
      'height': bottom - top,
      'encodings': encodings[i].tolist(),
      'image': u'data:image/jpeg;base64,'+data64.decode('utf-8')
    }

    results.append(result)

path = './data/data.json'

with open(path, 'w') as f:
  json.dump(results, f)

print(f'File saved to {path}')
