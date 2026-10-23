import { Injectable } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';

export interface Mood {
  date: string;
  mood: number;
  note: string;
  stickers: string; // 쉼표로 이어 붙인 이모지 (예: "⭐,🎉")
}

// SQLite 파일 하나(mood.db)에 저장. Node 내장 기능이라 따로 설치할 DB 프로그램이 없다.
@Injectable()
export class MoodService {
  private db = new DatabaseSync('mood.db');

  constructor() {
    this.db.exec(
      'CREATE TABLE IF NOT EXISTS moods (date TEXT PRIMARY KEY, mood INTEGER NOT NULL, note TEXT NOT NULL DEFAULT "", stickers TEXT NOT NULL DEFAULT "")',
    );
    // 스티커 기능 이전에 만든 DB에는 stickers 칸이 없어서 채워 넣는다.
    const cols = this.db.prepare('PRAGMA table_info(moods)').all() as unknown as { name: string }[];
    if (!cols.some((c) => c.name === 'stickers')) {
      this.db.exec('ALTER TABLE moods ADD COLUMN stickers TEXT NOT NULL DEFAULT ""');
    }
  }

  list(): Mood[] {
    return this.db
      .prepare('SELECT date, mood, note, stickers FROM moods ORDER BY date DESC LIMIT 400')
      .all() as unknown as Mood[];
  }

  // 하루에 하나만 저장. 같은 날 다시 기록하면 덮어쓴다.
  save(m: Mood) {
    this.db
      .prepare(
        'INSERT INTO moods (date, mood, note, stickers) VALUES (?, ?, ?, ?) ON CONFLICT(date) DO UPDATE SET mood = excluded.mood, note = excluded.note, stickers = excluded.stickers',
      )
      .run(m.date, m.mood, m.note, m.stickers);
  }

  remove(date: string) {
    this.db.prepare('DELETE FROM moods WHERE date = ?').run(date);
  }
}