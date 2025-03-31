import threading

# Thread-local storage for request
_thread_local = threading.local()

def set_request(request):
    _thread_local.request = request

def get_request():
    return getattr(_thread_local, "request", None)
