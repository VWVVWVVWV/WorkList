import asyncio
import re
from flask import Flask, request
from flask_cors import CORS

from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.future import select
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.sql import text as sqltxt



app = Flask(__name__)
CORS(app)

engine = create_async_engine('sqlite+aiosqlite:///./tasks.db')
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

Base = declarative_base()


def check_empty_string(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        for arg in args:
            if type(arg) is str:
                if arg == '':
                    raise Exception("Empty string found")
        return result
    return wrapper


class Task(Base):
    __tablename__ = 'tasks'
    task_id = Column(Integer, primary_key=True)
    user = Column(String)
    email = Column(String)
    text = Column(String)
    edited = Column(Boolean)
    finished = Column(Boolean)

    @check_empty_string
    def __init__(self, user: str, email: str, text: str, edited: bool = False, finished: bool = False):
        self.user = user
        self.email = self.checkemail(email)
        self.text = text
        self.edited = edited
        self.finished = finished

    @staticmethod
    def checkemail(test_email: str, variant: str = 'simple') -> str:
        regexps = {
            'simple': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b',
            'rfc5322': "(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])"
        }
        regex = regexps[variant] if variant in regexps else regexps['simple']
        if not re.fullmatch(regex, test_email):
            raise Exception("InValid Email")
        return test_email


async def init_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Task.metadata.drop_all)
        await conn.run_sync(Task.metadata.create_all)


@app.async_to_sync
async def on_startup():
    await init_tables()
on_startup()


@app.route('/')
async def index():
    await asyncio.sleep(2)
    return 'Web App with Python Flask!'


@app.route('/tasks', methods=['POST'])
async def tasks() -> list:
    sort_type = "desc"
    task_page = 1
    if request.method == 'POST':
        task_page = request.get_json().get('page', 1)
        sort_type = request.get_json().get('sort_type', "asc")
        sort_field = request.get_json().get('sort_field', "task_id")
    if type(task_page) is not int:
        task_page = 1
    elif task_page < 1:
        task_page = 1
    fields=['task_id', 'user', 'email', 'text', 'edited', 'finished']
    offset = (task_page-1)*3
    if sort_field not in fields:
        sort_field="task_id"
    async with async_session() as session:
        if sort_type == 'desc':
            #query = await session.execute(select(Task).order_by(Task.task_id.desc()).limit(3).offset(offset))
            query = await session.execute(select(Task).order_by(sqltxt( sort_field + ' desc')).limit(3).offset(offset))
        else:
            #query = await session.execute(select(Task).order_by(Task.task_id.asc()).limit(3).offset(offset))
            query = await session.execute(select(Task).order_by(sqltxt( sort_field + ' asc')).limit(3).offset(offset))
        result = query.scalars().all()

    return [{'task_id': str(record.task_id), 'user': record.user,
            'email': record.email, 'text': record.text, 'edited': str(record.edited), 'finished': str(record.finished)
             } for record in result]


@app.route('/new', methods=['POST'])
async def new() -> dict[str, str]:
    resp = 'err'
    try:
        if request.method == 'POST':
            user = request.get_json().get('user', "")
            email = request.get_json().get('email', "")
            text = request.get_json().get('text',  "")
            task = Task(user, email, text)
            async with async_session() as session:
                session.add(task)
                await session.commit()
            resp = ''
    except Exception as e:
        resp ='Error: '+ str(e)
    return resp


@app.route('/edit_task', methods=['POST'])
async def edit_task() -> dict[str, str]:
    resp = 'err'
    try:
        if request.method == 'POST':
            task_id = request.get_json().get('task_id', "")
            text = request.get_json().get('text', "")
            edited = True

            async with async_session() as session:
                query = await session.execute(select(Task).where(Task.task_id == int(task_id)))
                task = query.scalars().first()
                task.text = text
                task.edited = edited
                await session.commit()
            resp = 'ok'
    except Exception as e:
        resp ='Error: '+ str(e)
    return resp

@app.route('/finish', methods=['POST'])
async def finish() -> dict[str, str]:
    resp = 'err'
    try:
        if request.method == 'POST':
            task_id = request.get_json().get('task_id', "")
            finished = True

            async with async_session() as session:
                query = await session.execute(select(Task).where(Task.task_id == int(task_id)))
                task = query.scalars().first()
                task.finished = finished
                await session.commit()
            resp = 'ok'
    except Exception as e:
        resp ='Error: '+ str(e)
    return resp

@app.route('/login', methods=['POST'])
async def login() -> str:
    users = {'admin': '123'}
    token = ''
    if request.method == 'POST':
        user = request.get_json().get('login', "")
        user = re.sub("[^A-Za-z0123456789]", "", user)
        password = request.get_json().get('password', "")
        if users.get(user, "") == password:
            token = 'a23f51237579072357vc235928dd359872357fg7t7g'
        else:
            token = ''
    return token
app.run(host='0.0.0.0', port=82, debug=True)
