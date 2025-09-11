try:
    from app.main import app
    print('Main import OK')
    print('Auth router registered:', any('/auth' in str(route.path) for route in app.routes))
except Exception as e:
    print(f'Error importing main: {e}')
    import traceback
    traceback.print_exc()