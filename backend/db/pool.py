from __future__ import annotations

import mysql.connector
from mysql.connector import pooling

from backend.config.settings import settings


class Database:
    _pool: pooling.MySQLConnectionPool | None = None

    @classmethod
    def get_connection(cls) -> mysql.connector.MySQLConnection:
        if cls._pool is None:
            cls._pool = pooling.MySQLConnectionPool(
                pool_name="sunbeam_pool",
                pool_size=5,
                pool_reset_session=True,
                host=settings.mysql_host,
                port=settings.mysql_port,
                user=settings.mysql_user,
                password=settings.mysql_password,
                database=settings.mysql_database,
            )
        return cls._pool.get_connection()


def execute_query(query: str, params: tuple | dict | None = None) -> list[dict]:
    connection = Database.get_connection()
    try:
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute(query, params or {})
            if cursor.with_rows:
                return cursor.fetchall()
            connection.commit()
            return []
    finally:
        connection.close()


def execute_single(query: str, params: tuple | dict | None = None) -> dict | None:
    results = execute_query(query, params)
    return results[0] if results else None


def execute_non_query(query: str, params: tuple | dict | None = None) -> None:
    execute_query(query, params)

