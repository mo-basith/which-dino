"""Serve the boards locally: python3 serve.py  ->  http://localhost:8000/
Like `python3 -m http.server`, but the images in _blob/ have no file extension,
so this sets their type from their first bytes (SVG logos won't show otherwise)."""
import http.server, os

class Handler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        if os.sep + '_blob' + os.sep in path or '/_blob/' in path:
            try:
                with open(path, 'rb') as f:
                    head = f.read(256).lstrip()
                if head.startswith(b'<svg') or head.startswith(b'<?xml'):
                    return 'image/svg+xml'
                if head.startswith(b'\x89PNG'):
                    return 'image/png'
                return 'image/jpeg'
            except OSError:
                pass
        return super().guess_type(path)

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print('Boards at http://localhost:8000/')
    http.server.ThreadingHTTPServer(('', 8000), Handler).serve_forever()
