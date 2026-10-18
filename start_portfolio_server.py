#!/usr/bin/env python3
"""Start the portfolio's local web server, then open the home page."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import time
import urllib.request
import webbrowser

SITE_DIR = Path(__file__).resolve().parent


def create_server():
    handler = partial(SimpleHTTPRequestHandler, directory=str(SITE_DIR))

    # Prefer easy-to-remember ports, but select another free port if one is busy.
    for port in range(8000, 8011):
        try:
            return ThreadingHTTPServer(("127.0.0.1", port), handler)
        except OSError:
            continue

    # Fall back to an operating-system-assigned free port.
    return ThreadingHTTPServer(("127.0.0.1", 0), handler)


def main():
    server = create_server()
    port = server.server_address[1]
    url = f"http://127.0.0.1:{port}/index.html"

    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()

    # Wait briefly for the server to respond before opening the browser.
    for _ in range(30):
        try:
            with urllib.request.urlopen(url, timeout=1):
                break
        except Exception:
            time.sleep(0.1)

    print("=" * 64)
    print("Student Portfolio local server is running.")
    print(f"Portfolio home page: {url}")
    print("Use the navigation links to open Projects & 3D Viewer.")
    print("Keep this window open while using the portfolio.")
    print("Press Ctrl+C here to stop the local server.")
    print("=" * 64)

    webbrowser.open(url)

    try:
        while server_thread.is_alive():
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nStopping the portfolio server...")
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
