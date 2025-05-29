<?php

namespace Database\Seeders;

use App\Models\BookingManager;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run()
    {
        $totalRecords = 10000;
        $batchSize = 1000;

        for ($i = 0; $i < $totalRecords / $batchSize; $i++) {
            BookingManager::factory()->count($batchSize)->create();
        }

        $this->command->info("Seeded $totalRecords booking records successfully!");
    }
}