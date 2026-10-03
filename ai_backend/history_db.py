import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = 'sovereign_history.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            title TEXT,
            messages TEXT,
            updated_at DATETIME
        )
    ''')
    conn.commit()
    conn.close()

def save_session(session_id: str, title: str, messages: List[Dict[str, Any]]):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute('''
        INSERT INTO sessions (session_id, title, messages, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(session_id) DO UPDATE SET
            title = excluded.title,
            messages = excluded.messages,
            updated_at = excluded.updated_at
    ''', (session_id, title, json.dumps(messages), now))
    conn.commit()
    conn.close()

def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT title, messages, updated_at FROM sessions WHERE session_id = ?', (session_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            'session_id': session_id,
            'title': row[0],
            'messages': json.loads(row[1]),
            'updated_at': row[2]
        }
    return None

def list_sessions() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT session_id, title, updated_at FROM sessions ORDER BY updated_at DESC')
    rows = cursor.fetchall()
    conn.close()
    return [{'session_id': row[0], 'title': row[1], 'updated_at': row[2]} for row in rows]

def update_session_title(session_id: str, title: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('UPDATE sessions SET title = ? WHERE session_id = ?', (title, session_id))
    conn.commit()
    conn.close()

def delete_session(session_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM sessions WHERE session_id = ?', (session_id,))
    conn.commit()
    conn.close()

init_db()
