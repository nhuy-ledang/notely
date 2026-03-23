<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class NoteSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->where('email', 'test@example.com')->first();

        if ($user === null) {
            return;
        }

        if ($user->notes()->exists()) {
            return;
        }

        $user->notes()->createMany([
            [
                'title' => 'The Minimalist Manifesto',
                'body' => 'Design is not just what it looks like and feels like. Design is how it works. Focus on utility and a calm editorial aesthetic.',
                'pinned' => true,
            ],
            [
                'title' => 'Architecture of the Soul',
                'body' => 'Notes on shaping a digital studio: light, glass, and minimal lines for deep work.',
                'pinned' => false,
            ],
            [
                'title' => 'Semantic Typography Systems',
                'body' => 'How font pairing affects cognitive load. Manrope and Inter stay readable at scale.',
                'pinned' => false,
            ],
            [
                'title' => 'Color Tonalities in UI',
                'body' => 'Background shifts and soft shadow instead of heavy borders—depth without noise.',
                'pinned' => false,
            ],
            [
                'title' => 'Project: Horizon Q4',
                'body' => 'Roadmap: archive notes, curated views, polish for daily use.',
                'pinned' => true,
            ],
        ]);
    }
}
