import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MoodService } from './mood.service';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

@Controller('moods')
export class MoodController {
  constructor(private readonly moods: MoodService) {}

  @Get()
  list() {
    return this.moods.list().map((m) => ({ ...m, stickers: m.stickers ? m.stickers.split(',') : [] }));
  }

  @Post()
  save(@Body() body: { date?: string; mood?: number; note?: string; stickers?: string[] }) {
    const mood = Number(body.mood);
    if (!Number.isInteger(mood) || mood < 1 || mood > 5) {
      throw new BadRequestException('기분은 1~5 사이여야 합니다');
    }
    const date = body.date ?? today();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today()) {
      throw new BadRequestException('날짜가 올바르지 않거나 미래입니다');
    }
    const note = String(body.note ?? '').slice(0, 200);
    const stickers = (Array.isArray(body.stickers) ? body.stickers : [])
      .map((s) => String(s).slice(0, 8))
      .filter((s) => s && !s.includes(','))
      .slice(0, 5);
    this.moods.save({ date, mood, note, stickers: stickers.join(',') });
    return { date, mood, note, stickers };
  }

  @Delete(':date')
  remove(@Param('date') date: string) {
    this.moods.remove(date);
    return { date };
  }
}