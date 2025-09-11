from app.main import app

print('Routes registered:')
for route in app.routes:
    if hasattr(route, 'methods'):
        print(f'  {route.methods} {route.path}')
    else:
        print(f'  N/A {route.path}')