from aiohttp import web
import base64
import io
import face_recognition

async def encode(request):
    request_data = await request.json()

    # Read base64 encoded image
    url = request_data['image'].split(',')[1]
    image = io.BytesIO(base64.b64decode(url))

    # Load image data
    np_array = face_recognition.load_image_file(image)

    # Find face locations
    locations = face_recognition.face_locations(np_array)

    # Create face encodings
    encodings = face_recognition.face_encodings(np_array, locations)

    results = []

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

    return web.json_response(results)

def main():
    app = web.Application()
    app.router.add_post('/encode', encode)

    web.run_app(app, host='0.0.0.0', port='3000')

main()
