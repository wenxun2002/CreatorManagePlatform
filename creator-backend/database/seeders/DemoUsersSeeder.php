<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DemoUsersSeeder extends Seeder
{
    /**
     * Seed demo manager + creator accounts for local API testing.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'manager@example.com'],
            [
                'name' => 'Demo Manager',
                'password' => 'password',
                'role' => 'manager',
                'email_verified_at' => now(),
            ],
        );

        $creators = [
            ['email' => 'creator@example.com', 'name' => 'Demo Creator'],
            ['email' => 'creator1@example.com', 'name' => 'Creator One'],
            ['email' => 'creator2@example.com', 'name' => 'Creator Two'],
            ['email' => 'creator3@example.com', 'name' => 'Creator Three'],
        ];

        foreach ($creators as $creator) {
            User::query()->updateOrCreate(
                ['email' => $creator['email']],
                [
                    'name' => $creator['name'],
                    'password' => 'password',
                    'role' => 'creator',
                    'email_verified_at' => now(),
                ],
            );
        }
    }
}
