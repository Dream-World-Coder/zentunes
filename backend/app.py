import os
import base64
from flask import Flask, send_from_directory, jsonify, abort, request, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from utils import make_title_from_filename, get_mediatype_from_filename, list_all_files_lv1, get_directory_size

# ------------- * globals * ------
load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')

AUDIO_DIR:str = os.path.join(os.path.dirname(__file__), 'static', 'audios')
os.makedirs(AUDIO_DIR, exist_ok=True)

VALID_EXTENSIONS:set = {'.mp3', '.m4a', '.wav', '.ogg'}

BACKEND_URL:str = 'https://subhajit3498.pythonanywhere.com'
# BACKEND_URL: str = 'http://127.0.0.1:3000'

MAX_AUDIO_DIR_SIZE:int = 300 * 1024 * 1024  # 300MB

VALID_CATEGORIES:list = [
    "home",
    "nature",
    "classical",
    "bangla_retro",
    "bangla_new",
    "rabindra_sangeet",
    "hindi_retro",
    "hindi_new",
    "religious",
    "miscellaneous",
];
# --------------------

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "https://zentunes.netlify.app",
    "https://zentunes.vercel.app",
    "https://opencanvas.blog",
    "https://myopencanvas.in",
    "https://subhajit.pages.dev"
]}})


# ------------- * routes * ------
# serve a specific audio file from a subdir under audios
@app.route('/audios/<path:subdir>/<path:filename>')
def serve_audio(subdir, filename):
    safe_subdir = secure_filename(subdir)
    safe_filename = secure_filename(filename)

    dir_path = os.path.join(AUDIO_DIR, safe_subdir)
    file_path = os.path.join(dir_path, safe_filename)

    if os.path.isfile(file_path):
        mimetype = get_mediatype_from_filename(safe_filename)
        return send_from_directory(dir_path, safe_filename, mimetype=mimetype)
    else:
        abort(404, description="File not found")

# take security_key, subdir_path, filename & audio_file(mp3, m4a, wav, ogg) & save in /audios/{subdir_path} dir
@app.route('/add-audio', methods=['POST'])
def add_audio():
    if SECRET_KEY is None:
        return jsonify({'error':'SECRET_KEY is None'}), 500

    data = request.json or {}
    security_key = data.get('security_key', None)
    filename = data.get('filename', None)
    subdir_path = data.get('subdir_path', None)

    if not all([security_key, filename, subdir_path]):
        return jsonify({'error':'data attributes missing'}), 400

    if security_key != SECRET_KEY:
        return jsonify({'error':'security key is wrong'}), 401

    # get the audio file & handle related errors
    audio_file_b64 = data.get('audio_file', None)
    if not audio_file_b64:
        return jsonify({'error':'audio file is not provided'}), 400

    # Validate file extension from filename
    file_ext = os.path.splitext(filename)[1].lower()
    if file_ext not in VALID_EXTENSIONS:
        return jsonify({'error':f'Invalid file extension. Allowed: {", ".join(VALID_EXTENSIONS)}'}), 400

    try:

        # Decode base64 audio file
        audio_data = base64.b64decode(audio_file_b64)
    except Exception:
        return jsonify({'error':'Invalid base64 audio data'}), 400

    # Check the size of AUDIO_DIR, max permitted size = 256mb
    current_size = get_directory_size(AUDIO_DIR)
    if current_size + len(audio_data) > MAX_AUDIO_DIR_SIZE:
        return jsonify({'error':'Audio directory size limit exceeded (256MB)'}), 413

    # Get the location of the file
    subdir_path = subdir_path.lower().replace('-', '_')
    if subdir_path not in VALID_CATEGORIES: # only 10 categories as of now
        return jsonify({
            'success': False,
            'error': 'Invalid Category',
        }), 400

    subdir = secure_filename(subdir_path)
    safe_filename = secure_filename(filename)

    # Check if /audios/{subdir} exists or not, if not then make it
    target_dir = os.path.join(AUDIO_DIR, subdir)
    os.makedirs(target_dir, exist_ok=True)

    # Save the audio inside
    file_path = os.path.join(target_dir, safe_filename)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return jsonify({
            'success': False,
            'error': 'Audio file already exists',
        }), 400

    try:
        with open(file_path, 'wb') as f:
            f.write(audio_data)

        return jsonify({
            'success': True,
            'message': 'Audio file saved successfully',
            'path': f'/audios/{subdir}/{safe_filename}'
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to save file: {str(e)}'}), 500

# list all audio files
@app.route('/audio/list')
def list_audio_files():
    try:
        all_files_dict = list_all_files_lv1(AUDIO_DIR)
        return jsonify({'list': all_files_dict}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# list a category of audio files
@app.route('/audio/list/<category>')
def list_audio_data(category):
    try:
        if category.lower() == 'home':
            audio_data=[
                {"mediaType":"audio/mpeg","src":"https://subhajit3498.pythonanywhere.com/audios/nature/deep_forest.mp3","title":"Deep Forest"},
                {"mediaType":"audio/mpeg","src":"https://subhajit3498.pythonanywhere.com/audios/classical/alla-turka-mozrat.mp3","title":"Alla Turka Mozrat"},
                {"mediaType":"audio/mpeg","src":"https://subhajit3498.pythonanywhere.com/audios/bangla_retro/aguner-poroshmoni.mp3","title":"Aguner Poroshmoni"},
                {"mediaType":"audio/mpeg","src":"https://subhajit3498.pythonanywhere.com/audios/rabindra_sangeet/majhe-majhe-tobo-dekha-pai-chirodin-keno-pai-na.mp3","title":"Majhe Majhe Tobo Dekha Pai Chirodin Keno Pai Na"},
                {"mediaType":"audio/mpeg","src":"https://subhajit3498.pythonanywhere.com/audios/bangla_new/bojhena-se-bojhena.mp3","title":"Bojhena Se Bojhena"},
                {"mediaType":"audio/mpeg","src":"https://subhajit3498.pythonanywhere.com/audios/religious/ek-radha-ek-mira.mp3","title":"Ek Radha Ek Mira"},
                {"mediaType":"audio/mpeg","src":"https://subhajit3498.pythonanywhere.com/audios/miscellaneous/agnipath.mp3","title":"Agnipath"}
            ]

        else:
            all_files_dict = list_all_files_lv1(AUDIO_DIR)
            if category not in all_files_dict:
                return jsonify({'error': f'Category "{category}" not found'}), 404

            audios = all_files_dict[category]

            audio_data = []
            for audio in audios:
                src = f'{BACKEND_URL}/audios/{category}/{audio}'
                title = make_title_from_filename(audio)
                mediaType = get_mediatype_from_filename(audio)
                item = {
                    'src':src,
                    'title':title,
                    'mediaType':mediaType
                }
                audio_data.append(item)

        return jsonify({'audio_data':audio_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/storage-details')
def storage_calc():
    current_size = get_directory_size(AUDIO_DIR)
    left = MAX_AUDIO_DIR_SIZE - current_size;
    return jsonify({'current_size':current_size//(1024*1024), 'left':left//(1024*1024)})

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=False, port=3000)
