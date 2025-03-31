from .thread_local import set_request

class ThreadLocalMiddleware:
    """ Middleware to store request in thread-local storage """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        set_request(request)  # Store the request in thread-local storage
        response = self.get_response(request)
        return response
