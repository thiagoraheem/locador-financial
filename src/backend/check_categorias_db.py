from app.core.database import get_db
from app.models.categoria import Categoria

db = next(get_db())
count = db.query(Categoria).count()
print(f'Total de categorias no banco: {count}')

if count > 0:
    cats = db.query(Categoria).limit(5).all()
    for c in cats:
        print(f'ID: {c.CodCategoria}, Nome: {c.DesCategoria}, Ativo: {c.FlgAtivo}, Pai: {c.CodPai}')
else:
    print('Nenhuma categoria encontrada no banco de dados')

db.close()