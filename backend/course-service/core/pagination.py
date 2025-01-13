from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):

    def get_page_size(self, request):
        page_size_query_param = 'page_size' # Name of the query parameter
        default_size = 20 # Default page size defined in the class
        max_size = 100 # Maximum page size allowed

        try:
            # Try to get the page_size parameter from the request query parameters
            page_size = int(request.query_params.get(page_size_query_param, default_size))
            # Ensure page_size is within a reasonable range to prevent abuse
            page_size = max(1, min(page_size, max_size))
        except (TypeError, ValueError):
            # If there's any error (e.g., page_size is not an integer), use the default
            page_size = default_size

        return page_size